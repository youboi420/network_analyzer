#include "../includes/ddos.h"

#include <arpa/inet.h>
#include <json-c/json_object.h>
#include <netinet/ip.h>
#include <stdio.h>
#include <stdlib.h>
#include <json-c/json.h>

void analyze_ddos(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename, uint32_t conv_count)
{
    int count_flood = 0, index, write_flag = 0;
    double a = 2.0, b = 10.0, ema = 0.0;
    double ema_threshold = 50.0;
    double * exma_ptr = NULL;
    packet_node_s *temp;
    search_ret_e ret;
    ddos_info info;
    ddos_addr_ll *temp_ddos;
    json_object *root, *attacks_arr, *attack_obj, *atkrs_arr, *atkr_obj;
    FILE *fp;
    
    info.victim.s_addr = 0;
    info.dst_port = 0;
    info.attackers = NULL;

    root = json_object_new_object();
    attacks_arr = json_object_new_array();
    json_object_object_add(root, "attacks", attacks_arr);

    for(index = 0; index < MAX_L4_CONVERSATIONS; index++)
    {
        if (conversations[index].src_ip.s_addr != 0)
        {
            if (DEBUG) info("-------------------------------------");
            if (DEBUG) info("index: %i|conv id: %i| type: %i", index, conversations[index].conv_id, conversations[index].proto_type);
            if (detect_flood(conversations[index]))
            {
                if (DEBUG) okay("flaged conv [%i] as possible flood", conversations[index].conv_id);
                if (DEBUG) info("flood flaged\tATTACKER: [%s:%i]", inet_ntoa(conversations[index].src_ip), ntohs(conversations[index].src_port));
                if (DEBUG) info("flood flaged\tvictim: [%s:%i]", inet_ntoa(conversations[index].dest_ip), ntohs(conversations[index].dest_port));
                if (info.victim.s_addr == 0)
                {
                    info.victim.s_addr = conversations[index].dest_ip.s_addr;
                    info.dst_port = conversations[index].dest_port;
                }
                add_to_ddos_ll(&(info.attackers), conversations[index].src_ip, conversations[index].src_port);
                count_flood++;
            }
            /* dont forget to get the first and last time for each coversation */
            if (conversations[index].packet_list != NULL)
            {
                temp = get_first_packet_bt(conversations[index].packet_list, DDOS_MIN_TIME);
                if (temp)
                {
                    a = temp->time_stamp_rltv;
                    temp = NULL;
                }
                temp = get_last_packet_bt(conversations[index].packet_list, DDOS_MAX_TIME);
                if (temp)
                {
                    b = temp->time_stamp_rltv;
                    temp = NULL;
                }
                if (DEBUG) info("start: %f | end: %f", a, b);
                exma_ptr = search_params(conversations[index], search_e_exma, &ret, &a, &b, &ema);
                if (DEBUG) info("called exma");
                if (exma_ptr && ret == search_ret_e_exma)
                {
                    if (DEBUG) okay("%f exma value", *exma_ptr);
                    if (*exma_ptr  > ema_threshold && conversations[index].num_packets > DDOS_PACKET_LIMIT)
                    {
                        info("!!! need to write to ddos report json file !!!");
                        error("potential ddos detected conv: %i | ema: %f", index, *exma_ptr);
                    }
                    free(exma_ptr);
                }
            }
            if (DEBUG) info("-------------------------------------");
        }
    }
    if ((count_flood >= conv_count/2) && (conv_count != 1) )
    {
        if (!filename) error("given file name is null");
        else
        {
            /* write to json file if there are attackers... */
            temp_ddos = info.attackers;
            if (temp_ddos != NULL)
            {
                /* otherwise there no need to */
                attack_obj = json_object_new_object();
                write_flag = 1;
                json_object_object_add(attack_obj, "victim", json_object_new_string(inet_ntoa(info.victim)));
                json_object_object_add(attack_obj, "dest_port", json_object_new_int(ntohs(info.dst_port)));
                atkrs_arr = json_object_new_array();
                while(temp_ddos != NULL)
                {
                    atkr_obj = json_object_new_object();
                    json_object_object_add(atkr_obj, "id", json_object_new_int(temp_ddos->id));
                    json_object_object_add(atkr_obj, "attacker_ip", json_object_new_string(inet_ntoa(temp_ddos->addr)));
                    json_object_object_add(atkr_obj, "src_port", json_object_new_int(ntohs(temp_ddos->src_port)));
                    json_object_array_add(atkrs_arr, atkr_obj);
                    temp_ddos = temp_ddos->next;
                }
                json_object_object_add(attack_obj, "attackers", atkrs_arr);
                json_object_array_add(attacks_arr, attack_obj);
                if (filename != NULL)
                {
                    fp = fopen(filename, "w"); /* dump the JSON to a file */
                    if (fp != NULL && write_flag)
                    {
                        fprintf(fp, "%s\n", json_object_to_json_string_ext(root, JSON_C_TO_STRING_PRETTY));
                        fclose(fp);
                    }
                    else
                    {
                        error("analyze_ddos: given file pointer is null");
                    }
                }
                else
                {
                    error("analyze_ddos: given file name is null");
                }
                json_object_put(root);
            }
        }
        error("%s%sPOSSIBLE DDOS (TCP/UDP) BY FLOOD FLOOD [flood: %i|convc: %i]%s", RED_FG, BLACK_BG, count_flood, conv_count,RESET_FG);
    }
    free_ddos_list(&(info.attackers));
}

int detect_flood(conv_s convo)
{
    /*
     * syn flood will hopfully be detected by these regards
     * a convo will flag as mallicius if
        * 1) the dest is the same for more then a specified capacity
        * 2) check for low packet number like 1 to 3 (likely 2 being retrans and 3 being rst)
     */
    int ret_val = 1, index = 0;
    struct ip *ip_header;
    struct udphdr *udp_header;
    struct tcphdr *tcp_header;
    packet_node_s *temp;
    
    if (convo.num_packets > DDOS_PACKET_LIMIT)
    {
        ret_val = 0;
    }

    else if (convo.num_packets <= DDOS_PACKET_LIMIT)
    {
        if (convo.proto_type == IPPROTO_TCP)
        {
            temp = convo.packet_list;
            index = 0;
            while(temp != NULL)
            {
                if  (DEBUG) info("index: %i", index);
                ip_header = (struct ip*)(temp->packet_data + ETH_HEADER_SIZE);
                tcp_header = (struct tcphdr *) (temp->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
                if (DEBUG) okay("ip: [%s]", inet_ntoa(ip_header->ip_src));
                if (index == 0 && tcp_header->th_flags & TH_SYN) index++;
                else if (index == 1 && tcp_header->th_flags & (TH_SYN | TH_ACK)) index++;
                else if (index == 2 && tcp_header->th_flags & TH_ACK) index++;
                temp = temp->next;
            }
            if  (DEBUG) info("index: %i", index);
            if ((convo.num_packets == 3 && index == 3) || !(convo.num_packets == 1 && index == 1)) ret_val = 0;
        }
    }

    if (convo.proto_type == IPPROTO_UDP)
        {
            /* if over the limit or b to a is smaller it be flaged as mallicus */
            if ( !( (convo.packets_from_a_to_b > convo.packets_from_b_to_a) && (convo.packets_from_a_to_b >=   (convo.packets_from_b_to_a * DDOS_UDP_LIMIT_MULT)) ) )
            {
                ret_val = 0;
            }
        }
    return ret_val;
}

packet_node_s * get_first_packet_bt(packet_node_s * p_list, double start_time)
{
    packet_node_s * first = NULL;
    if (p_list)
    {
        first = p_list;
        while(first != NULL && first->time_stamp_rltv < start_time)
        {
            first = first->next;
        }
    }
    return first;
}

packet_node_s * get_last_packet_bt(packet_node_s * p_list, double end_time)
{
    packet_node_s * temp = NULL, *last = NULL;
    if (p_list)
    {
        temp = p_list;
        while(temp != NULL && temp->time_stamp_rltv <= end_time)
        {
            last = temp;
            temp = temp->next;
        }
    }
    return last;
}
double calculate_ema(double current_value, double previous_ema, double alpha)
{
    double ema = alpha * current_value + (1 - alpha) * previous_ema;
    return ema;
}

double calculate_avg_packets_per_time(conv_s conv, double start_time, double end_time)
{
    int num_packets = conv.num_packets;
    double time_range = end_time - start_time;
    return (num_packets / time_range);
}

int add_to_ddos_ll(ddos_addr_ll **root, struct in_addr atkr_addr, uint32_t src_port)
{
    ddos_addr_ll *temp = *root, *node, *prev = NULL;
    int flag = 0;
    static int id = 0;

    while (temp != NULL)
    {
        if (temp->addr.s_addr == atkr_addr.s_addr)
        {
            flag = 1;
            break;
        }
        prev = temp;
        temp = temp->next;
    }

    if (!flag)
    {
        node = (ddos_addr_ll *)malloc(sizeof(ddos_addr_ll));
        if (node == NULL)
        {
            return -1;
        }
        node->next = NULL;
        node->addr.s_addr = atkr_addr.s_addr;
        node->id = id;
        node->src_port = src_port;
        if (prev != NULL)
        {
            prev->next = node;
        }
        else
        {
            *root = node;
        }
        flag = 1;
    }
    return flag;
}

void free_ddos_list(ddos_addr_ll **root)
{
    /* free the list of attackers... */
    ddos_addr_ll *ddos_ll_temp, *ddos_ll_temp_next;
    ddos_ll_temp = *root;
    while(ddos_ll_temp != NULL)
    {
        ddos_ll_temp_next = ddos_ll_temp->next;
        free(ddos_ll_temp);
        ddos_ll_temp = ddos_ll_temp_next;
    }
}
