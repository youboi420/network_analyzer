#include "../includes/conv.h"
#include <netinet/tcp.h>
/* GLOBALS */
conv_s conversations_arr[MAX_CONVERSATIONS];
unsigned int conv_hash_g;
uint16_t conv_id_tcp_g = 0, conv_id_udp_g = 0;

int main(int argc, char *argv[])
{
    char errbuf[PCAP_ERRBUF_SIZE];
    pcap_t *handle;

    if (argc != 3) {
        printf("Usage: %s <pcap file> <output json file>\n", argv[0]);
        return 1;
    }
    handle = pcap_open_offline(argv[1], errbuf);
    if (handle == NULL) {
        fprintf(stderr, "Error opening pcap file: %s\n", errbuf);
        return 1;
    }
    memset(conversations_arr, 0, (sizeof(conv_s) * MAX_CONVERSATIONS));
    for (int i = 0; i < MAX_CONVERSATIONS; i++) {
        init_list(&(conversations_arr[i].packet_list));
    }
    pcap_loop(handle, 0, packet_handler, NULL);
    pcap_close(handle);
    
    /* sorts the hash table of conversations by id. e.g. 0->N */
    qsort(conversations_arr, MAX_CONVERSATIONS, sizeof(conv_s), compare_conversations);
    if (DEBUG)
    {
        print_packets(conversations_arr);
        print_output_to_file(conversations_arr, argv[1]);
    }
    // print_packets(conversations_arr);
    analyze_conversations(conversations_arr);
    save_to_json(argv[2]);
    free_all(conversations_arr);
    return 0;
}
void init_list(packet_node_s ** root)
{
    *root = NULL;
}
void print_output_to_file(conv_s conversations[MAX_CONVERSATIONS], char * filename)
{
    FILE * tcp_file, *udp_file;
    char * out_filename = malloc(strlen(filename) + 4), src_ip[INET_ADDRSTRLEN], dst_ip[INET_ADDRSTRLEN];
    char p_type[4];
    int i;
    /* beggining of string or first ever / */
    strcpy(out_filename, "tcp_");
    strcat(out_filename, filename);
    out_filename[strlen(out_filename) - 4] = 't';
    out_filename[strlen(out_filename) - 3] = 'x';
    out_filename[strlen(out_filename) - 2] = 't';
    out_filename[strlen(out_filename) - 1] = '\0';
    tcp_file = fopen(out_filename, "w");
    strcpy(out_filename, "udp_");
    strcat(out_filename, filename);
    out_filename[strlen(out_filename) - 4] = 't';
    out_filename[strlen(out_filename) - 3] = 'x';
    out_filename[strlen(out_filename) - 2] = 't';
    out_filename[strlen(out_filename) - 1] = '\0';
    udp_file = fopen(out_filename, "w");
    if (!tcp_file || !udp_file)
    {
        error("error opening the file %s", out_filename);
        free(out_filename);
        return;
    }
    /* SOF TCP FILE */
    fprintf(tcp_file, "+---------------------------------------------------------------------------------------------------------------------------------------+\n");
    fprintf(tcp_file, "|\tID\t|\tAddress A\t|\tAddress B\t|\tPort A\t\t|\tPort B\t\t|\tPROTCOL\t\t|\n");
    /* SOF UDP FILE */
    fprintf(udp_file, "+---------------------------------------------------------------------------------------------------------------------------------------+\n");
    fprintf(udp_file, "|\tID\t|\tAddress A\t|\tAddress B\t|\tPort A\t\t|\tPort B\t\t|\tPROTCOL\t\t|\n");
    for(i = 0; i < MAX_CONVERSATIONS; i++){
        if (conversations_arr[i].src_ip.s_addr != 0)
        {
            strcpy(src_ip, inet_ntoa(conversations_arr[i].src_ip));
            strcpy(dst_ip, inet_ntoa(conversations_arr[i].dest_ip));            
            if (conversations_arr[i].proto_type == IPPROTO_TCP)
            {
                fprintf(tcp_file, "|---------------------------------------------------------------------------------------------------------------------------------------|\n");
                strncpy(p_type, "TCP", 4);
            fprintf(tcp_file, "|\t%i\t|\t%s\t|\t%s\t|\t%i\t\t|\t%i\t\t|\t%s\t\t|\n", conversations_arr[i].conv_id, src_ip, dst_ip, conversations_arr[i].src_port, conversations_arr[i].dest_port, p_type);

            }
            else if(conversations_arr[i].proto_type == IPPROTO_UDP)
            {
                fprintf(udp_file, "|---------------------------------------------------------------------------------------------------------------------------------------|\n");
                strncpy(p_type, "UDP", 4);
                fprintf(udp_file, "|\t%i\t|\t%s\t|\t%s\t|\t%i\t\t|\t%i\t\t|\t%s\t\t|\n", conversations_arr[i].conv_id, src_ip, dst_ip, conversations_arr[i].src_port, conversations_arr[i].dest_port, p_type);
            }
        }
    }
    /* EOF TCP FILE */
    fprintf(tcp_file, "+---------------------------------------------------------------------------------------------------------------------------------------+\n");
    /* EOF UDP FILE */
    fprintf(udp_file, "+---------------------------------------------------------------------------------------------------------------------------------------+\n");

    fclose(tcp_file);
    fclose(udp_file);
    free(out_filename);
}
int add_packet_to_list(packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, uint32_t seq, uint32_t ack, struct in_addr src_ip, struct in_addr dest_ip)
{
    int flag = 1, index;
    packet_node_s * node = malloc(sizeof(packet_node_s)), *temp = *root;
    struct tcphdr *tcp_header;
    struct ip *ip_header;
    
    if (!node)
    {
        error("failed to alloc a packet_node.");
        flag = -1;
    }
    else
    {
        ip_header = (struct ip *)(original_packet + ETH_HEADER_SIZE); // Skip Ethernet header
        tcp_header = (struct tcphdr *) (original_packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
        node->src_ip = src_ip;
        node->dest_ip = dest_ip;
        node->num_seq = tcp_header->th_seq;
        node->num_ack = tcp_header->th_ack;
        node->p_id = id;
        node->next = NULL;
        node->packet_data = malloc(packet_size);
        node->packet_length = packet_size;
        for(index = 0; index < packet_size; index++)
        {
            node->packet_data[index] = original_packet[index];
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
void print_packet_list(packet_node_s ** root, int max)
{
    packet_node_s * temp = *root;
    int i, index;
    struct ip * ip_header;
    struct tcphdr * tcp_header;
    while(temp != NULL)
    {
        index = temp->p_id + 1;
        ip_header = (struct ip *) temp->packet_data + ETH_HEADER_SIZE;
        tcp_header = (struct tcphdr *) (temp->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
        printf("----------[%05i/%05i]-----------\n", index, max);
        info("from %s", inet_ntoa(temp->src_ip));
        info("to %s", inet_ntoa(temp->dest_ip));
        info("th_window %hu", tcp_header->th_win);
        info("th_seq %hu", tcp_header->th_seq);
        info("th_ack %hu", tcp_header->th_ack);
        info("th_flags %hu", tcp_header->th_flags);
        info("struct seq %hu", temp->num_seq);
        info("struct ack %hu", temp->num_ack);
        
        // for(i=0;i<temp->packet_length;i++)
        //     printf("%c", temp->packet_data[i]);
        printf("\n----------------------------------\n");
        temp = temp->next;
    }
}
void print_packets(conv_s conversations[MAX_CONVERSATIONS])
{
    int i;
    for(i = 0; i < MAX_CONVERSATIONS; i++)
    {
        if (conversations_arr[i].src_ip.s_addr != 0 && conversations_arr[i].proto_type == IPPROTO_TCP)
        {
            info("Conversation ID: %i", conversations_arr[i].conv_id);
            print_packet_list(&(conversations_arr[i].packet_list), conversations_arr[i].packets_from_a_to_b+conversations_arr[i].packets_from_b_to_a);
            printf("--------------------------------------------\n");
        }
    }
}
void free_list(packet_node_s **root)
{
    packet_node_s *temp = *root, *next;
    while (temp != NULL) {
        next = temp->next;
        free(temp->packet_data); /* the alloc for the u_char packet */
        free(temp);
        temp = next;
    }
}
void free_all(conv_s conversations[MAX_CONVERSATIONS])
{
    int i;
    for(i = 0; i < MAX_CONVERSATIONS; i++){
        if (conversations_arr[i].src_ip.s_addr != 0)
            free_list(&conversations[i].packet_list);
    }
}
int conversation_hash(const conv_s *conversation)
{
    conv_hash_g = HASH_CONST;
    conv_hash_g ^= conversation->src_ip.s_addr; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->src_ip.s_addr);
    conv_hash_g ^= conversation->dest_ip.s_addr; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->dest_ip.s_addr);
    conv_hash_g ^= conversation->src_port; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->src_port);
    conv_hash_g ^= conversation->dest_port; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->dest_port);
    conv_hash_g ^= conversation->proto_type;
    return conv_hash_g % MAX_CONVERSATIONS;
}
void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
    char ip_src_str[INET_ADDRSTRLEN], ip_dst_str[INET_ADDRSTRLEN];
    struct tcphdr *tcp_header;
    struct udphdr *udp_header;
    struct ip *ip_header;
    conv_s conversation;
    int hash, i;
    ip_header = (struct ip *)(packet + ETH_HEADER_SIZE); // Skip Ethernet header
    conversation.src_ip = ip_header->ip_src;
    conversation.dest_ip = ip_header->ip_dst;
    strncpy(ip_src_str, inet_ntoa(conversation.src_ip), INET_ADDRSTRLEN);
    strncpy(ip_dst_str, inet_ntoa(conversation.dest_ip), INET_ADDRSTRLEN);
    if (DEBUG)
    {    info("packet[%s | %04i | %hhu] (%s)->(%s)", packet, pkthdr->caplen, ip_header->ip_p, ip_src_str, ip_dst_str);
        printf("------------\n");
        for(i=0; i<pkthdr->caplen; i++)
        {
            /* printf("%c", packet[i]); */
        }
        printf("\n------------\n");
    }
    if (ip_header->ip_p == IPPROTO_TCP || ip_header->ip_p == IPPROTO_IP) {
        tcp_header = (struct tcphdr *)(packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
        conversation.src_port = ntohs(tcp_header->th_sport);
        conversation.dest_port = ntohs(tcp_header->th_dport);
        hash = conversation_hash(&conversation);
        // okay("Processing packet: Source IP: %s, Destination IP: %s, Source Port: %u, Destination Port: %u", ip_src_str, ip_dst_str, conversation.src_port, conversation.dest_port);
        // okay("[%i]\t[%s]->[%s]:%i\t[%s]->[%s]:%i", hash, ip_src_str, ip_dst_str,(conversations[hash].src_ip.s_addr == conversation.src_ip.s_addr && conversations[hash].dest_ip.s_addr == conversation.dest_ip.s_addr), ip_src_str, ip_dst_str, (conversations[hash].src_ip.s_addr == conversation.dest_ip.s_addr && conversations[hash].dest_ip.s_addr == conversation.src_ip.s_addr));
        if ( (conversations_arr[hash].src_ip.s_addr == conversation.src_ip.s_addr && conversations_arr[hash].dest_ip.s_addr == conversation.dest_ip.s_addr) || (conversations_arr[hash].src_ip.s_addr == conversation.dest_ip.s_addr && conversations_arr[hash].dest_ip.s_addr == conversation.src_ip.s_addr) ){
            if (conversations_arr[hash].src_ip.s_addr == conversation.src_ip.s_addr) { /* if source sent it  */
                conversations_arr[hash].packets_from_a_to_b++;
            } else { /* if dest  sent it (aka dest is now source)  */
                conversations_arr[hash].packets_from_b_to_a++;
            }
            conversations_arr[hash].num_packets++;
            add_packet_to_list(&(conversations_arr[hash].packet_list),packet, pkthdr->caplen, conversations_arr[hash].num_packets - 1, ntohs(tcp_header->th_seq), ntohs(tcp_header->th_ack), ip_header->ip_src, ip_header->ip_dst);
        } else {
            conversation.conv_id = conv_id_tcp_g++;
            conversations_arr[hash] = conversation;
            conversations_arr[hash].packets_from_a_to_b = 1;
            conversations_arr[hash].num_packets = 1;
            conversations_arr[hash].num_exep = 0;
            conversations_arr[hash].packets_from_b_to_a = 0;
            conversations_arr[hash].proto_type = IPPROTO_TCP;
            init_list(&(conversations_arr[hash].packet_list));
            add_packet_to_list(&(conversations_arr[hash].packet_list), packet, pkthdr->caplen, conversations_arr[hash].num_packets - 1, ntohs(tcp_header->th_seq), ntohs(tcp_header->th_ack), ip_header->ip_src, ip_header->ip_dst);
            // okay("New Conversation: Source IP: %s, Destination IP: %s, Source Port: %u, Destination Port: %u", ip_src_str, ip_dst_str, conversation.src_port, conversation.dest_port);
        }
        if (DEBUG) info("[HEADER|HASH:%i|ID: %i] %i\n", hash, conversations_arr[hash].conv_id, tcp_header->th_win);
    }
    else if (ip_header->ip_p == IPPROTO_UDP)
    {
        udp_header = (struct udphdr *)(packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
        conversation.src_port = ntohs(udp_header->uh_sport);
        conversation.dest_port = ntohs(udp_header->uh_dport);
        hash = conversation_hash(&conversation);
        if ((conversations_arr[hash].src_ip.s_addr == conversation.src_ip.s_addr && conversations_arr[hash].dest_ip.s_addr == conversation.dest_ip.s_addr) ||
            (conversations_arr[hash].src_ip.s_addr == conversation.dest_ip.s_addr && conversations_arr[hash].dest_ip.s_addr == conversation.src_ip.s_addr)) {
            if (conversations_arr[hash].src_ip.s_addr == conversation.src_ip.s_addr) { /* if source sent it  */
                conversations_arr[hash].packets_from_a_to_b++;
            } else { /* if dest sent it (aka dest is now source)  */
                conversations_arr[hash].packets_from_b_to_a++;
            }
            conversations_arr[hash].num_packets++;
            // add_packet_to_list(&(conversations_arr[hash].packet_list), packet, pkthdr->caplen, conversations_arr[hash].num_packets - 1, -1, -1, -1, -1);
        } else {
            conversation.conv_id = conv_id_udp_g++;
            conversations_arr[hash] = conversation;
            conversations_arr[hash].packets_from_a_to_b = 1;
            conversations_arr[hash].num_packets = 1;
            conversations_arr[hash].num_exep = 0;
            conversations_arr[hash].packets_from_b_to_a = 0;
            conversations_arr[hash].proto_type = IPPROTO_UDP;
            init_list(&(conversations_arr[hash].packet_list));
            // add_packet_to_list(&(conversations_arr[hash].packet_list), packet, pkthdr->caplen, conversations_arr[hash].num_packets - 1, -1, -1, -1, -1);
        }
    }
}
int compare_conversations(const void *a, const void *b)
{
    const conv_s *conv_a = (const conv_s *)a;
    const conv_s *conv_b = (const conv_s *)b;
    return conv_a->conv_id - conv_b->conv_id;
}
void save_to_json(const char *filename)
{
    json_object *root, *conversations_array, *conversation_object, *exeption_arr, *exception;
    size_t i, exep_index; FILE * fp;
    int exep_type_switch;
    char prot_type[4] = "\0";
    char * exep_type = NULL;
    root = json_object_new_object();
    conversations_array = json_object_new_array();
    json_object_object_add(root, "conversations", conversations_array);
    for (i = 0; i < MAX_CONVERSATIONS; i++) {
        if (conversations_arr[i].src_ip.s_addr != 0) {
            if (conversations_arr[i].proto_type == IPPROTO_TCP)
                strncpy(prot_type, "TCP", 4);
            else if (conversations_arr[i].proto_type == IPPROTO_UDP)
                strncpy(prot_type, "UDP", 4);
            // okay("%zu is not empty.", i);
            conversation_object = json_object_new_object();
            json_object_object_add(conversation_object, "conv_id", json_object_new_int(conversations_arr[i].conv_id));
            json_object_object_add(conversation_object, "conv_type", json_object_new_string(prot_type));
            json_object_object_add(conversation_object, "source_ip", json_object_new_string(inet_ntoa(conversations_arr[i].src_ip)));
            json_object_object_add(conversation_object, "destination_ip", json_object_new_string(inet_ntoa(conversations_arr[i].dest_ip)));
            json_object_object_add(conversation_object, "source_port", json_object_new_int(conversations_arr[i].src_port));
            json_object_object_add(conversation_object, "destination_port", json_object_new_int(conversations_arr[i].dest_port));
            json_object_object_add(conversation_object, "packets", json_object_new_int(conversations_arr[i].num_packets));
            json_object_object_add(conversation_object, "packets_from_a_to_b", json_object_new_int(conversations_arr[i].packets_from_a_to_b));
            json_object_object_add(conversation_object, "packets_from_b_to_a", json_object_new_int(conversations_arr[i].packets_from_b_to_a));
            if (conversations_arr[i].num_exep > 0) /* if exceptions exist then add all of them to the conv json obj inside an array  */
            {
                printf("\n\t\tconv %i has %i exceptions\n", conversations_arr[i].conv_id, conversations_arr[i].num_exep);
                exeption_arr = json_object_new_array();
                for(exep_index = 0; exep_index < conversations_arr[i].num_exep; exep_index++)
                {
                    exception = json_object_new_object();
                    json_object_object_add(exception, "exep_id", json_object_new_int(exep_index));
                    exep_type_switch = conversations_arr[i].exep_packet_id[exep_index].exep; 
                    switch (exep_type_switch) {
                        case ZERO_WINDOW_EXEP:
                        {
                            json_object_object_add(exception, "exep_type", json_object_new_string(ZERO_WINDOW_STR));
                            break;
                        }
                        case DUP_ACK_ATOB_EXEP:
                        {
                            json_object_object_add(exception, "exep_type", json_object_new_string(DUP_ACK_ATOB_STR));
                            break;
                        }
                        case DUP_ACK_BTOA_EXEP:
                        {
                            json_object_object_add(exception, "exep_type", json_object_new_string(DUP_ACK_BTOA_STR  ));
                            break;
                        }
                        case RESET_EXEP:
                        {
                            json_object_object_add(exception, "exep_type", json_object_new_string(RESET_STR));
                            break;
                        }
                        case RETRANS_EXEP:
                            json_object_object_add(exception, "exep_type", json_object_new_string(RETRANS_STR));
                            break;
                        default:
                        {
                            break;
                        }
                    }
                    json_object_object_add(exception, "packet_index", json_object_new_int(conversations_arr[i].exep_packet_id[exep_index].packet_location)); /* type cause */
                    json_object_array_add(exeption_arr, exception);
                }
                json_object_object_add(conversation_object, "exceptions",exeption_arr);
            }
            /* add to main array object */
            json_object_array_add(conversations_array, conversation_object);
            strncpy(prot_type, "", 4);
        }
    }
    fp = fopen(filename, "w"); /* dump the JSON to a file */
    fprintf(fp, "%s\n", json_object_to_json_string_ext(root, JSON_C_TO_STRING_PRETTY));
    fclose(fp);
    json_object_put(root);
}
void analyze_conversations(conv_s conversations_arr[MAX_CONVERSATIONS])
{
    int i, exception_index;
    packet_node_s * temp = NULL, *last = NULL, *lastAtoB, *lastBtoA;
    packet_flags p_type;
    int tcp_segment_length;
    struct ip * ip_header;
    struct tcphdr * tcp_header;
    for (i = 0; i < MAX_CONVERSATIONS; i++)
    {
        if (conversations_arr[i].src_ip.s_addr!= 0 && conversations_arr[i].proto_type == IPPROTO_TCP)
        {
            if (DEBUG)
            {
                okay(" --------- Conversation (%i) ---------", conversations_arr[i].conv_id);
                printf("(%s->", inet_ntoa(conversations_arr[i].src_ip));
                printf("%s)\n", inet_ntoa(conversations_arr[i].dest_ip));
            }
            printf("(%s->", inet_ntoa(conversations_arr[i].src_ip));
            printf("%s)\n", inet_ntoa(conversations_arr[i].dest_ip));
            temp = conversations_arr[i].packet_list;
            exception_index = 0;
            while(temp != NULL) 
            {
                ip_header = (struct ip *)(temp->packet_data + ETH_HEADER_SIZE);
                tcp_header = (struct tcphdr *)(temp->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
                p_type = analyze_packet(temp->packet_data);
                if (DEBUG)
                {
                    printf("================================================================\n\t\t");
                    okay("packet[%i/%i] of conversation(%i)", temp->p_id + 1, conversations_arr[i].num_packets, conversations_arr[i].conv_id);
                    if (DEBUG)
                    {
                        if (last != NULL) info("(%u <> %u)", temp->num_ack, last->num_ack);
                        else  info("(%u)", temp->num_ack);
                    }
                }
                // if (check_keep_alive(temp) == 1)
                // {
                //     info("%s%sKEEP ALIVE PACKET%s", BLACK_BG, GREEN_BG, RESET_FG);
                //     if (temp->src_ip.s_addr == conversations_arr[i].src_ip.s_addr)
                //         lastAtoB = temp;
                //     else
                //         lastBtoA = temp;
                //     last = temp;
                //     temp = temp->next;
                //     continue;
                // }
                if (p_type & ACK_FLAG) {
                    if (DEBUG) info("%s%sACK Packet%s", YELLOW_FG, BLACK_BG, RESET_FG);
                    tcp_segment_length = ntohs(ip_header->ip_len) - (ip_header->ip_hl << 2) - (tcp_header->th_off << 2);
                    /* SYN, FIN, and RST are not set. */
                    if (tcp_segment_length == 0 && !(p_type & (SYN_FLAG | FIN_FLAG | RST_FLAG))) 
                    {
                        if (DEBUG) info("!(p_type & (SYN_FLAG | FIN_FLAG | RST_FLAG) = %i\tLen: %i", !(p_type & (SYN_FLAG | FIN_FLAG | RST_FLAG)), tcp_segment_length);
                        if (lastAtoB != NULL)
                        {
                            if (temp->src_ip.s_addr == lastAtoB->src_ip.s_addr)
                            {
                                if (check_dup_ack(temp, lastAtoB) && check_keep_alive(lastBtoA) == 0)
                                {
                                    info("%s%sDUPACK PACKET A->B{CURRENT: %i|LAST: %i}%s", RED_FG, BLACK_BG, temp->p_id, lastAtoB->p_id, RESET_FG);
                                    conversations_arr[i].exep_packet_id[exception_index].exep = DUP_ACK_ATOB_EXEP;   
                                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;   
                                    conversations_arr[i].num_exep++;
                                    exception_index++;
                                }
                            }
                        }    
                        if (lastBtoA!= NULL)
                        {
                            if (temp->src_ip.s_addr == lastBtoA->src_ip.s_addr)
                            {
                                if (check_dup_ack(temp, lastBtoA) && check_keep_alive(lastAtoB) == 0)
                                {
                                    info("%s%sDUPACK PACKET B->A {CURRENT: %i|LAST: %i}%s", RED_FG, BLACK_BG, temp->p_id, lastBtoA->p_id, RESET_FG);
                                    conversations_arr[i].exep_packet_id[exception_index].exep = DUP_ACK_BTOA_EXEP;   
                                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;   
                                    conversations_arr[i].num_exep++;
                                    exception_index++;
                                }
                            }
                        }
                    } else if (check_retransmission(temp,lastAtoB, lastBtoA)) {
                        info("%s%sRETRANSMISSION%s", RED_FG, BLACK_BG, RESET_FG);
                        conversations_arr[i].exep_packet_id[exception_index].exep = RETRANS_EXEP;   
                        conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;   
                        conversations_arr[i].num_exep++;
                        exception_index++;
                    }
                }
                if (p_type & SYN_FLAG) {
                    if (DEBUG) info("SYN Packet");
                }
                if (p_type & FIN_FLAG) {
                    if (DEBUG) info("FIN Packet");
                }
                if (p_type & PSH_FLAG) {
                    if (DEBUG) info("PSH Packet");
                }
                if (p_type & RST_FLAG) {
                    info("%s%sRESET PACKET%s", YELLOW_FG, RED_BG, RESET_FG);
                    conversations_arr[i].exep_packet_id[exception_index].exep = RESET_EXEP;
                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;   
                    conversations_arr[i].num_exep++;
                    exception_index++;
                    /* check inside last->packet_data something... */
                }
                if (p_type & RETRANS_FLAG) {
                    if (DEBUG) info("%s%sRETRANSMISSION PACKET [%i]%s", RED_FG, BLACK_BG, p_type, RESET_FG);
                    conversations_arr[i].exep_packet_id[exception_index].exep = RETRANS_EXEP;
                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;   
                    conversations_arr[i].num_exep++;
                    exception_index++;
                }
                if (p_type & URG_FLAG) {
                    if (DEBUG) info("URG Packet");
                }
                if (p_type & ZERO_WINDOW_FLAG) {
                    info("%s%sZERO WINDOW Packet%s", WHITE_FG, RED_BG, RESET_FG);
                    conversations_arr[i].exep_packet_id[exception_index].exep = ZERO_WINDOW_EXEP;
                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;
                    conversations_arr[i].num_exep++;
                    exception_index++;
                }
                if (temp->src_ip.s_addr == conversations_arr[i].src_ip.s_addr)
                    lastAtoB = temp;
                else
                    lastBtoA = temp;
                last = temp;
                temp = temp->next;
            }
            if (DEBUG) okay(" --------- End Of Conversation (%i) ---------\n", conversations_arr[i].conv_id);
        }
    }
}
int check_dup_ack(packet_node_s *crnt, packet_node_s * comp)
{
    int ret_val = 0;
    struct ip * crntip = (struct ip *) crnt->packet_data + ETH_HEADER_SIZE;
    struct ip * compip = (struct ip *) comp->packet_data + ETH_HEADER_SIZE;
    struct tcphdr * crnt_tcph = (struct tcphdr *) crnt->packet_data + (crntip->ip_hl << 2);
    struct tcphdr * comp_tcph = (struct tcphdr *) comp->packet_data + (crntip->ip_hl << 2);
    if (crnt != NULL && comp != NULL)
    {
        if (crnt->num_seq != comp->num_seq && crnt->num_ack == comp->num_ack /* && (crnt_tcph->th_win == comp_tcph->th_win) */) ret_val = 1;
    }
    return ret_val;
}
int check_keep_alive(packet_node_s *p)
{
    if (p == NULL) return -1;
    int ret_val = 0;
    struct ip *ip_header = (struct ip *)(p->packet_data + ETH_HEADER_SIZE);
    struct tcphdr *tcp_header = (struct tcphdr *)(p->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
    int tcp_segment_length = ntohs(ip_header->ip_len) - (ip_header->ip_hl << 2) - (tcp_header->th_off << 2);
    if (tcp_segment_length <= 1)
    {
        if (tcp_header->th_seq + 1 == tcp_header->th_ack) /* check if current sequence number is one byte less than the next expected sequence number */
        {
            if ((tcp_header->th_flags & (TH_SYN | TH_FIN | TH_RST)) == 0) /* check for valid flags */
            {
                ret_val = 1;
            }
        }
    }
    return ret_val;
}
int check_retransmission(packet_node_s *p, packet_node_s *atob, packet_node_s *btoa)
{
    int ret_val = 0;
    struct ip *iphdr_p;
    struct ip *iphdr_comp;
    struct tcphdr *tcphdr_p;
    struct tcphdr *tcphdr_comp;
    int tcp_segment_length_p, tcp_segment_length_comp;
    
    if ((check_keep_alive(p) == 0) && (atob != NULL || btoa!= NULL)) 
    {
        /*
            [+] This is not a keepalive packet.
            [+] In the forward direction, the segment length is greater than zero or the SYN or FIN flag is set.
            [+] The next expected sequence number is greater than the current sequence number.
        */
        iphdr_p = (struct ip *) (p->packet_data + ETH_HEADER_SIZE);
        tcphdr_p = (struct tcphdr *) (p->packet_data + ETH_HEADER_SIZE + (iphdr_p->ip_hl << 2));
        if (tcphdr_p->th_ack > tcphdr_p->th_seq)
        {
            iphdr_comp = (struct ip *) (atob->packet_data + ETH_HEADER_SIZE);
            tcphdr_comp = (struct tcphdr *) (atob->packet_data + ETH_HEADER_SIZE + (iphdr_comp->ip_hl << 2));
            if ( iphdr_p->ip_src.s_addr == iphdr_comp->ip_src.s_addr)
            {
                tcp_segment_length_p = ntohs(iphdr_p->ip_len) - (iphdr_p->ip_hl << 2) - (tcphdr_p->th_off << 2);
                if (tcp_segment_length_p > 0 || (tcphdr_p->th_flags & (TH_SYN | TH_FIN)))
                {
                    info("RETRANS A->B [pid:%i]", atob->p_id);
                    ret_val = 1;
                }
            } else {
                iphdr_comp = (struct ip *) (btoa->packet_data + ETH_HEADER_SIZE);
                tcphdr_comp = (struct tcphdr *) (btoa->packet_data + ETH_HEADER_SIZE + (iphdr_comp->ip_hl << 2));
                tcp_segment_length_comp = ntohs(iphdr_comp->ip_len) - (iphdr_comp->ip_hl << 2) - (tcphdr_comp->th_off << 2);
                if (tcp_segment_length_p > 0 || (tcphdr_p->th_flags & (TH_SYN | TH_FIN)))
                {
                    info("RETRANS B->A [pid:%i]", btoa->p_id);
                    ret_val = 1;
                }
            }
        }
    }
    return ret_val;
}