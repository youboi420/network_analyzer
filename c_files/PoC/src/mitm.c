#include "../includes/mitm.h"
#include "../includes/general_info.h"
#include "../includes/utils.h"
#include <json-c/json_object.h>
#include <netinet/ether.h>
#include <arpa/inet.h>
#include <json-c/json.h>
#include <string.h>

/* GLOBALS AND DEFINES*/
#define MAC_OCTET_SIZE 6
unsigned int arp_conv_hash_g;

int add_packet_to_arp_list(arp_packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, struct in_addr src_ip, struct in_addr dest_ip, struct ether_addr src_mac, struct ether_addr dest_mac ,struct timeval timestamp, double relative_time, arp_type op)
{
    int flag = 1, index;
    arp_packet_node_s * node = malloc(sizeof(arp_packet_node_s)), *temp = *root;
    struct tcphdr *tcp_header;
    struct ip *ip_header;
    
    if (!node)
    {
        error("failed to alloc a packet_node.");
        flag = -1;
    }
    else
    {
        /* set general data */
        node->p_id = id;
        node->p_size = packet_size;
        node->time_stamp = timestamp;
        node->time_stamp_rltv = relative_time;
        node->p_type = op;
        /* set source */
        node->src_ip = src_ip;
        /* set destenation */
        node->dest_ip = dest_ip;
        // node->src_mac = src_mac;
        // node->dest_mac = dest_mac;

        node->src_mac = src_mac;
        node->dest_mac = dest_mac;
        
        node->arp_packet_data = (u_char *)malloc(packet_size);
        node->next = NULL;
        for(index = 0; index < packet_size; index++)
        {
            node->arp_packet_data[index] = original_packet[index];
        }
        if (temp != NULL)
        {
            while(temp->next != NULL)
            {
                temp = temp->next;
            }
            temp->next = node;
        }
        else
            *root = node;
    }
    return flag;
}

void init_arp_list(arp_packet_node_s ** root)
{
    *root = NULL;
}

void free_all_l2_convs(arp_conv l2_convs[MAX_L2_CONVERSATIONS])
{
    int i;
    if (l2_convs == NULL)
    {
        error("l2_convs is NULL");
        return;
    }
    for(i = 0; i < MAX_L2_CONVERSATIONS; i++)
    {
        if (l2_convs[i].src_ip.s_addr != 0)
            free_l2_list(&l2_convs[i].p_list);
    }
}

void free_l2_list(arp_packet_node_s **root)
{
    arp_packet_node_s *temp = *root, *next;
    while (temp != NULL) {
        next = temp->next;
        free(temp->arp_packet_data); /* the alloc for the u_char packet */
        free(temp);
        temp = next;
    }
}

unsigned int get_arp_hash(struct ether_addr mac_a, struct ether_addr mac_b)
{
    unsigned int arp_hash = HASH_L2_CONST;
    arp_hash ^= mac_a.ether_addr_octet[0];
    arp_hash ^= mac_b.ether_addr_octet[0];
    arp_hash ^= mac_a.ether_addr_octet[1];
    arp_hash ^= mac_b.ether_addr_octet[1];
    arp_hash ^= mac_a.ether_addr_octet[4];
    arp_hash ^= mac_b.ether_addr_octet[4];
    return arp_hash % MAX_L2_CONVERSATIONS;
}

int compare_macs(struct ether_addr a, struct ether_addr b)
{
    int i, sum = 0;
    for (i = 0; i < MAC_OCTET_SIZE; i++)
    {
        sum += a.ether_addr_octet[i] - b.ether_addr_octet[i];
    }
    return sum;
}

void save_L2_convs_to_json(arp_conv convs[MAX_L2_CONVERSATIONS], const char *filename)
{
    json_object *root, *conversations_array, *conversation_object, *packets_arr, *packet_info, *conv_count_json;
    arp_packet_node_s *temp;
    size_t i;
    FILE *fp;
    const char ARP_REQ[] = "ARP REQUEST";
    const char ARP_RES[] = "ARP RESPONSE";
    char *ts_date;

    if (convs == NULL)
    {
        error("l2_convs is NULL");
        return;
    }

    root = json_object_new_object();
    conversations_array = json_object_new_array();
    
    json_object_object_add(root, "L2_coversations", conversations_array);
    for(i = 0; i < MAX_L2_CONVERSATIONS; i++)
    {
        if (convs[i].src_ip.s_addr != 0)
        {
            conversation_object = json_object_new_object();
            json_object_object_add(conversation_object, "conv_id", json_object_new_int(convs[i].cid));
            json_object_object_add(conversation_object, "src_mac", json_object_new_string(ether_ntoa(&convs[i].src_mac)));
            json_object_object_add(conversation_object, "dest_mac", json_object_new_string(ether_ntoa(&convs[i].dest_mac)));
            json_object_object_add(conversation_object, "packets", json_object_new_int(convs[i].num_p));
            json_object_object_add(conversation_object, "packets_from_a_to_b", json_object_new_int(convs[i].num_atob));
            json_object_object_add(conversation_object, "packets_from_b_to_a", json_object_new_int(convs[i].num_btoa));
            temp = convs[i].p_list;
            packets_arr = json_object_new_array();
            while(temp != NULL)
            {
                if (temp->time_stamp.tv_sec != 0 && temp->time_stamp.tv_usec != 0)
                {
                    packet_info = json_object_new_object();
                    ts_date = get_packet_time_stamp_mt(&(temp->time_stamp));
                    if (ts_date != NULL)
                    {
                        json_object_object_add(packet_info, "time_stamp_date", json_object_new_string(ts_date));
                        free(ts_date);
                        ts_date = get_packet_time_stamp_js(&(temp->time_stamp));
                        if (ts_date)
                        {
                            json_object_object_add(packet_info, "time_stamp_date_js", json_object_new_string(ts_date));
                            free(ts_date);
                        }
                    }
                    else
                    {
                        json_object_object_add(packet_info, "time_stamp_date", json_object_new_string("ts_date convert failed"));
                    }
                    json_object_object_add(packet_info, "time_stamp_raw_sec", json_object_new_uint64(temp->time_stamp.tv_sec));
                    json_object_object_add(packet_info, "time_stamp_raw_usec", json_object_new_uint64(temp->time_stamp.tv_usec));
                    json_object_object_add(packet_info, "time_stamp_rltv", json_object_new_double((temp->time_stamp_rltv)));
                    json_object_object_add(packet_info, "type", json_object_new_string(temp->p_type == ARP_TYPE_REPLAY ? ARP_RES : ARP_REQ));
                    json_object_array_add(packets_arr, packet_info);
                }
                temp = temp->next;
            }
            json_object_object_add(conversation_object, "packets_data", packets_arr);
            json_object_array_add(conversations_array, conversation_object);
        }
    }
    if (filename != NULL)
    {
        fp = fopen(filename, "w"); /* dump the JSON to a file */
        if (fp != NULL)
        {
            fprintf(fp, "%s\n", json_object_to_json_string_ext(root, JSON_C_TO_STRING_PRETTY));
            fclose(fp);
        }
        else
        {
            error("save_L2_convs_to_json: given file pointer is null");
        }
    }
    else
    {
        error("given file name is null");
    }
    json_object_put(root);
}

// Function to check if the destination MAC is broadcast
int is_broadcast(const struct ether_addr *mac) {
    const uint8_t *mac_octets = mac->ether_addr_octet;
    return (mac_octets[0] & mac_octets[1] & mac_octets[2] & mac_octets[3] & mac_octets[4] & mac_octets[5]) == 0xFF;
}

// Function to check if the destination IPs are different
int are_different_ips(const struct in_addr *ip1, const struct in_addr *ip2) {
    return ip1->s_addr != ip2->s_addr;
}

void free_mitm_list(mitm_node_s **root)
{
    /* free the list of victims... */
    mitm_node_s *mitm_temp, *mitm_temp_next;
    mitm_temp = *root;
    while(mitm_temp != NULL)
    {
        mitm_temp_next = mitm_temp->next;
        free(mitm_temp);
        mitm_temp = mitm_temp_next;
    }
}

void analyze_mitm(arp_conv l2_convs[MAX_L2_CONVERSATIONS], char * filename, uint32_t conv_count)
{
    // דני טאובר
    json_object *root, *attacks_arr, *attack_obj, *vict_arr, *vict_obj;
    int replay_count, replay_count_inner, index, index_inner, v_c, flag, write_flag = 0;
    arp_packet_node_s *temp = NULL, *temp_inner = NULL;
    struct ether_addr attacker = {0}, attacker_inner = {0}, vict_a = {0}, vict_b = {0};
    struct in_addr vict_a_ip, temp_vict;
    mitm_ll_s arp_pois;
    struct ether_arp *arp_header;
    mitm_node_s *mitm_temp;
    FILE *fp;
    
    if (l2_convs == NULL)
    {
        error("l2_convs is NULL");
        return;
    }

    root = json_object_new_object();
    attacks_arr = json_object_new_array();
    json_object_object_add(root, "attacks", attacks_arr);
    
    if (DEBUG) info("Called mitm detection convs: %i", conv_count);
    for(replay_count = 0, index = 0; index < MAX_L2_CONVERSATIONS; index++)
    {
        /* check for conv */
        if (l2_convs[index].src_ip.s_addr != 0)
        {
            attacker = l2_convs[index].src_mac;
            vict_a = l2_convs[index].dest_mac;
            temp = l2_convs[index].p_list;
            
            arp_pois.attacker = l2_convs[index].src_mac;
            arp_pois.list = NULL;
            while(temp != NULL)
            {
                if (is_broadcast(&temp->dest_mac) && temp->p_type == ARP_TYPE_REPLAY) {
                    arp_header = (struct ether_arp*)temp->arp_packet_data;
                    memcpy(&temp_vict, arp_header->arp_tpa + sizeof(struct in_addr), sizeof(struct in_addr));
                    if (vict_a_ip.s_addr != temp_vict.s_addr)
                    {
                        /* check if the temp_vict is already in the list... if so continue. else insert it to the list */
                        vict_a_ip = temp_vict;
                        flag = add_to_mitm(&(arp_pois.list), &vict_a_ip);
                        switch (flag)
                        {
                            case 1:
                                if (DEBUG) info("added victim ip to list of victims");
                                break;
                            case 0:
                                if (DEBUG) error("adding victim'snode failed");
                                break;
                            case -1:
                                if (DEBUG) error("allocating memory failed");
                                break;
                            default:
                                break;
                        }
                    }
                }
                if (temp->p_type == ARP_TYPE_REPLAY) replay_count++;
                temp = temp->next;
            }
            if (replay_count >= (l2_convs[index].num_p/2))
            {
                if (DEBUG) info("conv: %i", l2_convs[index].cid);
                if (arp_pois.list != NULL) /* to check if there's an acctuall attack... */
                {
                    write_flag = 1;
                    attack_obj = json_object_new_object();
                    vict_arr = json_object_new_array();
                    json_object_object_add(attack_obj, "attacker", json_object_new_string(ether_ntoa(&attacker)));
                    mitm_temp = arp_pois.list;
                    while(mitm_temp != NULL)
                    {
                        // if 
                        vict_obj = json_object_new_object();
                        json_object_object_add(vict_obj, "ip", json_object_new_string(inet_ntoa(mitm_temp->vict_ip_addr)));
                        json_object_array_add(vict_arr, vict_obj);
                        mitm_temp = mitm_temp->next;
                    }
                    json_object_object_add(attack_obj, "victims", vict_arr);
                    json_object_array_add(attacks_arr, attack_obj);
                }
                for(replay_count_inner = 0, index_inner = index + 1; index_inner < MAX_L2_CONVERSATIONS; index_inner++)
                {
                    attacker_inner = l2_convs[index_inner].src_mac;
                    vict_b = l2_convs[index_inner].dest_mac;
                    if (compare_macs(attacker, attacker_inner) == 0)
                    {
                        if (DEBUG) info("%4i) potential...[%4i]\t\tchecking this convo", l2_convs[index].cid, l2_convs[index].num_p);
                        temp_inner = l2_convs[index_inner].p_list;
                        while(temp_inner != NULL)
                        {
                            if (temp_inner->p_type == ARP_TYPE_REPLAY) replay_count_inner++;
                            temp_inner = temp_inner->next;
                        }
                        if (replay_count_inner >= (l2_convs[index_inner].num_p / 2))
                        {
                            /* 
                                ? add to json
                            */
                            // error("more sure... sending to json[%s]", filename);
                            // printf("---> attacker: %s\t", ether_ntoa(&attacker));
                            // printf("|\tvictim a: %s\t", ether_ntoa(&vict_a));
                            // printf("|\tvictim b: %s\n", ether_ntoa(&vict_b));
                        }
                    }
                    else continue;
                }
            }
            free_mitm_list(&(arp_pois.list));
        }
    }
    if (filename != NULL)
    {
        if (write_flag)
            fp = fopen(filename, "w"); /* dump the JSON to a file */
        if (fp != NULL && write_flag)
        {
            fprintf(fp, "%s\n", json_object_to_json_string_ext(root, JSON_C_TO_STRING_PRETTY));
            fclose(fp);
        }
        else
        {
            if (write_flag) /* supposed to write but fp is null... */
                error("analyze_mitm: given file pointer is null");
        }
    }
    else
    {
        error("given file name is null");
    }
    json_object_put(root);
}

int  compare_L2_conversations(const void *a, const void *b)
{
    const arp_conv *conv_a = (const arp_conv *)a;
    const arp_conv *conv_b = (const arp_conv *)b;
    return conv_a->cid - conv_b->cid;
}

int add_to_mitm(mitm_node_s **root, struct in_addr *vict)
{
    mitm_node_s *temp = *root, *node, *prev = NULL;
    int flag = 0;

    while (temp != NULL)
    {
        if (temp->vict_ip_addr.s_addr == (*vict).s_addr)
        {
            if (DEBUG) info("ip [%s] already exists in the list.", inet_ntoa(temp->vict_ip_addr));
            flag = 1;
            break;
        }
        prev = temp;
        temp = temp->next;
    }

    if (!flag)
    {
        node = (mitm_node_s *)malloc(sizeof(mitm_node_s));
        if (node == NULL)
        {
            if (DEBUG) error("failed to allocate memory for the new node.");
            return -1;
        }
        node->next = NULL;
        node->vict_ip_addr.s_addr = (*vict).s_addr;
        if (prev != NULL)
        {
            prev->next = node;
        }
        else
        {
            *root = node;
        }
        if (DEBUG) info("inserted ip [%s] into the list.", inet_ntoa(*vict));
        flag = 1;
    }
    return flag;
}