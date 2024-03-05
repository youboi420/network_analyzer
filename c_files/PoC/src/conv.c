/*-------------------------INCLUDES---------------------- */
#include "../includes/conv.h"
#include "../includes/ddos.h"
#include "../includes/mitm.h"
#include "../includes/general_info.h"
#include <json-c/json_object.h>
/*-------------------------GLOBALS---------------------- */
                    /* GLOBAL TABELS */
arp_conv arp_conversations_table_g[MAX_L2_CONVERSATIONS];
conv_s conversations_table_g[MAX_L4_CONVERSATIONS];
gen_inf_s general_info_g;
                    /* GLOBAL VARIABLES */
uint16_t conv_id_tcp_g = 0, conv_id_udp_g = 0, arp_id = 0;
uint32_t conv_hash_g, host_hash_g, port_hash_g, num_hosts_g = 0, num_ports_g, num_packets_g = 0;
const double ex_ma_alpha = 0.2; /* exp weight */
double record_time_duration_g;
time_t start_time_s_g = 0, end_time_s_g = 0;
suseconds_t start_usec_g = 0, end_usec_g = 0;

ret_val MAIN_RETURN_VALUE = FAILED;

int main(int argc, char *argv[])
{
    char errbuf[PCAP_ERRBUF_SIZE], *pcap_record_file,* main_output_file;
    pcap_t *handle;
    char * filename = NULL;
    int i;

    if (argc != 3)
    {
        printf("Usage: %s <pcap file> <output json file>\n", argv[0]);
        return 1;
    }

    pcap_record_file = argv[1];
    main_output_file = argv[2];

    filename = get_file_name(main_output_file, GLOBAL_L4_EXT);
    if (invalid_files(pcap_record_file, filename))
    {
        error("input files are invalid");
        exit(MAIN_RETURN_VALUE);
    }
    
    /* get file size -  prepare and init the tables/datastructures */
    general_info_g.filesize = get_file_size(pcap_record_file);
    memset(conversations_table_g,      0, (sizeof(conv_s) * MAX_L4_CONVERSATIONS));
    memset(arp_conversations_table_g, 0, (sizeof(arp_conv) * MAX_L2_CONVERSATIONS));
    memset(general_info_g.hosts_table, 0, (sizeof(host_s) * MAX_HOSTS));
    memset(general_info_g.ports_table, 0, (sizeof(port_s) * MAX_PORTS));
    for (i = 0; i < MAX_L4_CONVERSATIONS; i++)
    {
        init_list(&(conversations_table_g[i].packet_list));
    }
    
    handle = pcap_open_offline(pcap_record_file, errbuf);
    if (handle == NULL)
    {
        fprintf(stderr, "Error opening pcap file: %s\n", errbuf);
        return MAIN_RETURN_VALUE;
    }
    /* because it didnt exit untill here... */
    MAIN_RETURN_VALUE = with_l2l4;
    pcap_loop(handle, 0, packet_handler, NULL);
    pcap_close(handle);
    general_info_g.num_packets = num_packets_g;

    record_time_duration_g = (end_time_s_g + (double)end_usec_g / 1000000) - (start_time_s_g + (double)start_usec_g / 1000000);
    /* sorts the hash table of conversations by id. e.g. (key = table[i].conv_id) (ascending) from 0 -> N */
    qsort(conversations_table_g, MAX_L4_CONVERSATIONS, sizeof(conv_s), compare_L4_conversations);
    qsort(arp_conversations_table_g, MAX_L2_CONVERSATIONS, sizeof(arp_conv), compare_L2_conversations);
    if (DEBUG)
    {
        print_packets(conversations_table_g);
        print_output_to_file(conversations_table_g, pcap_record_file);
    }
    
    analyze_conversations(conversations_table_g);
    
    free(filename);
    filename = get_file_name(main_output_file, GLOBAL_L4_EXT);
    save_L4_convs_to_json(filename);

    free(filename);
    filename = get_file_name(main_output_file, GLOBAL_L2_EXT);
    save_L2_convs_to_json(arp_conversations_table_g, filename);
    // print_general_info(general_info_g);

    free(filename);
    filename = get_file_name(main_output_file, GLOBAL_INFO_EXT);
    save_gis_to_json(general_info_g, filename, num_ports_g, num_hosts_g, record_time_duration_g);

    free(filename);
    filename = get_file_name(main_output_file, GLOBAL_DDOS_EXT);
    analyze_ddos(conversations_table_g, filename, conv_id_tcp_g + conv_id_udp_g, &MAIN_RETURN_VALUE);

    free(filename);
    filename = get_file_name(main_output_file, GLOBAL_MITM_EXT);
    analyze_mitm(arp_conversations_table_g, filename, arp_id, &MAIN_RETURN_VALUE);
    free_all_lists();
    
    if (filename) free(filename);
    return MAIN_RETURN_VALUE;
}
void init_list(packet_node_s ** root)
{
    *root = NULL;
}
void print_output_to_file(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename)
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
    for(i = 0; i < MAX_L4_CONVERSATIONS; i++){
        if (conversations_table_g[i].src_ip.s_addr != 0)
        {
            strcpy(src_ip, inet_ntoa(conversations_table_g[i].src_ip));
            strcpy(dst_ip, inet_ntoa(conversations_table_g[i].dest_ip));            
            if (conversations_table_g[i].proto_type == IPPROTO_TCP)
            {
                fprintf(tcp_file, "|---------------------------------------------------------------------------------------------------------------------------------------|\n");
                strncpy(p_type, "TCP", 4);
            fprintf(tcp_file, "|\t%i\t|\t%s\t|\t%s\t|\t%i\t\t|\t%i\t\t|\t%s\t\t|\n", conversations_table_g[i].conv_id, src_ip, dst_ip, conversations_table_g[i].src_port, conversations_table_g[i].dest_port, p_type);

            }
            else if(conversations_table_g[i].proto_type == IPPROTO_UDP)
            {
                fprintf(udp_file, "|---------------------------------------------------------------------------------------------------------------------------------------|\n");
                strncpy(p_type, "UDP", 4);
                fprintf(udp_file, "|\t%i\t|\t%s\t|\t%s\t|\t%i\t\t|\t%i\t\t|\t%s\t\t|\n", conversations_table_g[i].conv_id, src_ip, dst_ip, conversations_table_g[i].src_port, conversations_table_g[i].dest_port, p_type);
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
int add_packet_to_list(packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, uint32_t seq, uint32_t ack, struct in_addr src_ip, struct in_addr dest_ip, struct timeval timestamp, double relative_time)
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
        node->src_ip = src_ip;
        node->dest_ip = dest_ip;
        node->num_seq = seq;
        node->num_ack = ack;
        if (ip_header->ip_p == IPPROTO_TCP)
        {
            tcp_header = (struct tcphdr *) (original_packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
            node->num_seq = tcp_header->th_seq;
            node->num_ack = tcp_header->th_ack;
        } else {
            node->num_seq = -1;
            node->num_ack = -1;
        }
        if (DEBUG) printf("------------------------\n");
        if (DEBUG) info("(seq)\tnode: %u | param: %u", node->num_seq, seq);
        if (DEBUG) info("(ack)\tnode: %u | param: %u", node->num_ack, ack);
        if (DEBUG) printf("------------------------\n"); 
        node->p_id = id;
        node->time_stamp_rltv = relative_time;
        node->next = NULL;
        node->packet_data = (u_char *)malloc(packet_size);
        node->packet_size = packet_size;
        node->time_stamp = timestamp;
        
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
void print_packet_list(packet_node_s ** root, int packet_count)
{
    packet_node_s * temp = *root;
    int i, index;
    struct ip * ip_header;
    struct tcphdr * tcp_header;
    struct udphdr * udp_header;
    while(temp != NULL)
    {
        if (temp->packet_data == NULL){
            info("problem at packet %i", temp->p_id);
            return;
        }
        index = temp->p_id + 1;
        ip_header = (struct ip *) temp->packet_data + ETH_HEADER_SIZE;
        printf("----------[%05i/%05i]-----------\n", index, packet_count);
        okay("seconds: %li| nano seconds: %li", temp->time_stamp.tv_sec, temp->time_stamp.tv_usec);
        if (ip_header->ip_p == IPPROTO_TCP || ip_header->ip_p == IPPROTO_IP){
            tcp_header = (struct tcphdr *) (temp->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
            info("from %s", inet_ntoa(temp->src_ip));
            info("to %s", inet_ntoa(temp->dest_ip));
            info("th_window %hu", tcp_header->th_win);
            info("th_seq %hu", tcp_header->th_seq);
            info("th_ack %hu", tcp_header->th_ack);
            info("th_flags %hu", tcp_header->th_flags);
            info("struct seq %hu", temp->num_seq);
            info("struct ack %hu", temp->num_ack);
            printf("\t-----------------\n");
            for(i=0;i<temp->packet_size;i++)
                printf("%c", temp->packet_data[i]);
            printf("\t-----------------\n");
        }
        else if (ip_header->ip_p == IPPROTO_UDP){
            udp_header = (struct udphdr *)(temp->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
            info("!!!!!!!!!! udp info is not neccesry here !!!!!!!!!!");
        } else {
            info("unknown!!! [%i]", ip_header->ip_p);
        }
        printf("\n----------------------------------\n");
        temp = temp->next;
    }
}
void print_packets(conv_s conversations[MAX_L4_CONVERSATIONS])
{
    int i;
    for(i = 0; i < MAX_L4_CONVERSATIONS; i++)
    {
        if (conversations_table_g[i].src_ip.s_addr != 0)
        {
            info("Conversation ID: %i", conversations_table_g[i].conv_id);
            print_packet_list(&(conversations_table_g[i].packet_list), conversations_table_g[i].packets_from_a_to_b+conversations_table_g[i].packets_from_b_to_a);
            printf("--------------------------------------------\n");
        }
    }
}
void free_l4_list(packet_node_s **root)
{
    packet_node_s *temp = *root, *next;
    while (temp != NULL) {
        next = temp->next;
        free(temp->packet_data); /* the alloc for the u_char packet */
        free(temp);
        temp = next;
    }
}

void free_all_lists(void)
{
    free_all_l4_convs(conversations_table_g);
    free_all_l2_convs(arp_conversations_table_g);
}
void free_all_l4_convs(conv_s l4_convs[MAX_L4_CONVERSATIONS])
{
    int i;
    for(i = 0; i < MAX_L4_CONVERSATIONS; i++)
    {
        if (conversations_table_g[i].src_ip.s_addr != 0)
            free_l4_list(&l4_convs[i].packet_list);
    }
    
}
unsigned int conversation_hash(const conv_s *conversation)
{
    conv_hash_g = HASH_L4_CONST;
    conv_hash_g ^= conversation->src_ip.s_addr; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->src_ip.s_addr);
    conv_hash_g ^= conversation->dest_ip.s_addr; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->dest_ip.s_addr);
    conv_hash_g ^= conversation->src_port; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->src_port);
    conv_hash_g ^= conversation->dest_port; // conv_hash_g = ((conv_hash_g << 5) + conv_hash_g) ^ (conversation->dest_port);
    conv_hash_g ^= conversation->proto_type;
    return conv_hash_g % MAX_L4_CONVERSATIONS;
}
void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
    char ip_src_str[INET_ADDRSTRLEN], ip_dst_str[INET_ADDRSTRLEN];
    struct ip *ip_header;
    struct ether_header *eth_header = (struct ether_header *)packet;;
    struct tcphdr *tcp_header;
    struct udphdr *udp_header;
    conv_s conversation;
    int conv_hash, host_hash, port_hash, i, arp_hash;
    static struct timeval start_time;
    double relative_time;
    struct ether_addr *src_mac, *dest_mac;
    const unsigned char *arp_packet = packet + ETH_HEADER_SIZE;
    struct in_addr src_ip, dest_ip;
    arp_type type_arp_op;
    
    /* handling time calculation... */
    if (start_time_s_g == 0) {
        start_time_s_g = pkthdr->ts.tv_sec;
        start_usec_g = pkthdr->ts.tv_usec;
    }
    end_time_s_g = pkthdr->ts.tv_sec;
    end_usec_g = pkthdr->ts.tv_usec;
    
    num_packets_g++;
    /* check for type of packet... */
    if (ntohs(eth_header->ether_type) == ETHERTYPE_ARP) {
        src_mac = (struct ether_addr *)eth_header->ether_shost;
        dest_mac = (struct ether_addr *)eth_header->ether_dhost;
        arp_hash = get_arp_hash(*src_mac, *dest_mac);
        type_arp_op = ((arp_packet[6] << 8) | arp_packet[7]) == 1 ? ARP_TYPE_REQUEST : ARP_TYPE_REPLAY;
        memcpy(&src_ip, arp_packet + 14, sizeof(struct in_addr));
        memcpy(&dest_ip, arp_packet + 24, sizeof(struct in_addr));

        if ((memcmp(&arp_conversations_table_g[arp_hash].src_mac, src_mac, sizeof(struct ether_addr)) == 0 && memcmp(&arp_conversations_table_g[arp_hash].dest_mac, dest_mac, sizeof(struct ether_addr)) == 0) || 
            (memcmp(&arp_conversations_table_g[arp_hash].src_mac, dest_mac, sizeof(struct ether_addr)) == 0 && memcmp(&arp_conversations_table_g[arp_hash].dest_mac, src_mac, sizeof(struct ether_addr)) == 0)
        )
        
        {   /* conv exist's, enter the packet here */
            /* 
                ! the add to arp list causes a somewhat constant size of 114 bytes (2 records...) leak please fix :|
            */
            add_packet_to_arp_list(&arp_conversations_table_g[arp_hash].p_list, packet, pkthdr->caplen,arp_conversations_table_g[arp_hash].num_p, src_ip, dest_ip, *src_mac, *dest_mac,pkthdr->ts, relative_time, type_arp_op);
            arp_conversations_table_g[arp_hash].num_p++;
            if ((memcmp(&arp_conversations_table_g[arp_hash].src_mac, src_mac, sizeof(struct ether_addr)) == 0)) arp_conversations_table_g[arp_hash].num_atob++;
            else arp_conversations_table_g[arp_hash].num_btoa++;
        }
        else
        {   /* conv doesnt exist. create it */
            arp_conversations_table_g[arp_hash].cid = arp_id++;
            arp_conversations_table_g[arp_hash].src_ip = src_ip;
            arp_conversations_table_g[arp_hash].dest_ip = dest_ip;
            arp_conversations_table_g[arp_hash].src_mac = *src_mac;
            arp_conversations_table_g[arp_hash].dest_mac = *dest_mac;
            arp_conversations_table_g[arp_hash].num_atob++;
            init_arp_list(&arp_conversations_table_g[arp_hash].p_list);
            /* 
                ! the add to arp list causes a somewhat constant size of 114 bytes (2 records...) leak please fix :|
            */
            add_packet_to_arp_list(&arp_conversations_table_g[arp_hash].p_list, packet, pkthdr->caplen,arp_conversations_table_g[arp_hash].num_p, src_ip, dest_ip, *src_mac, *dest_mac, pkthdr->ts, relative_time, type_arp_op);
            arp_conversations_table_g[arp_hash].num_p++;
        }
    }
    else if (ntohs(eth_header->ether_type) == ETHERTYPE_IP)
    {
        ip_header = (struct ip *)(packet + ETH_HEADER_SIZE); // Skip Ethernet header
        conversation.src_ip = ip_header->ip_src;
        conversation.dest_ip = ip_header->ip_dst;
        
        /* src ip */
        host_hash = host_hash_func(host_hash_g,ip_header->ip_src);
        if (general_info_g.hosts_table[host_hash].raw_addr.s_addr == 0)
        {
            general_info_g.hosts_table[host_hash].raw_addr = ip_header->ip_src;
            num_hosts_g++;
        }
        general_info_g.hosts_table[host_hash].count++;

        /* dst ip */
        host_hash = host_hash_func(host_hash_g,ip_header->ip_dst);
        if (general_info_g.hosts_table[host_hash].raw_addr.s_addr == 0)
        {
            general_info_g.hosts_table[host_hash].raw_addr = ip_header->ip_dst;
            num_hosts_g++;
        }
        general_info_g.hosts_table[host_hash].count++;

        strncpy(ip_src_str, inet_ntoa(conversation.src_ip), INET_ADDRSTRLEN);
        strncpy(ip_dst_str, inet_ntoa(conversation.dest_ip), INET_ADDRSTRLEN);
        if (DEBUG)
        {   
            info("packet[%04i | %hhu] (%s)->(%s)", pkthdr->caplen, ip_header->ip_p, ip_src_str, ip_dst_str);
            printf("------------\n");
            for(i=0; i<pkthdr->caplen; i++)
            {
                printf("%c", packet[i]);
            }
            printf("\n------------\n");
        }

        /* calc relative time */
        if (start_time.tv_sec == 0 && start_time.tv_usec == 0) {
            start_time = pkthdr->ts;
        }
        relative_time = (pkthdr->ts.tv_sec - start_time.tv_sec) + (pkthdr->ts.tv_usec - start_time.tv_usec) / 1000000.0;

        
        if (ip_header->ip_p == IPPROTO_TCP || ip_header->ip_p == IPPROTO_IP) {
            tcp_header = (struct tcphdr *)(packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
            /* src port */
            port_hash = port_hash_func(port_hash_g, tcp_header->th_sport);
            if (general_info_g.ports_table[port_hash].nthos_port == 0)
            {
                general_info_g.ports_table[port_hash].nthos_port = ntohs(tcp_header->th_sport);
                general_info_g.ports_table[port_hash].count++;
                num_ports_g++;
            } else {
                general_info_g.ports_table[port_hash].count++;
            }

            /* dst port */
            port_hash = port_hash_func(port_hash_g,tcp_header->th_dport);
            if (general_info_g.ports_table[port_hash].nthos_port == 0)
            {
                general_info_g.ports_table[port_hash].nthos_port = ntohs(tcp_header->th_dport);
                general_info_g.ports_table[port_hash].count++;
                num_ports_g++;
            }
            else
            {
                general_info_g.ports_table[port_hash].count++;
            }

            conversation.src_port = ntohs(tcp_header->th_sport);
            conversation.dest_port = ntohs(tcp_header->th_dport);
            conv_hash = conversation_hash(&conversation);
            /* okay("[%i]\t[%s]->[%s]:%i\t[%s]->[%s]:%i", hash, ip_src_str, ip_dst_str,(conversations[hash].src_ip.s_addr == conversation.src_ip.s_addr && conversations[hash].dest_ip.s_addr == conversation.dest_ip.s_addr), ip_src_str, ip_dst_str, (conversations[hash].src_ip.s_addr == conversation.dest_ip.s_addr && conversations[hash].dest_ip.s_addr == conversation.src_ip.s_addr)); */
            if ( /* check if not populated */(conversations_table_g[conv_hash].src_ip.s_addr == conversation.src_ip.s_addr && conversations_table_g[conv_hash].dest_ip.s_addr == conversation.dest_ip.s_addr) || (conversations_table_g[conv_hash].src_ip.s_addr == conversation.dest_ip.s_addr && conversations_table_g[conv_hash].dest_ip.s_addr == conversation.src_ip.s_addr) ){
                if (conversations_table_g[conv_hash].src_ip.s_addr == conversation.src_ip.s_addr) { /* if source sent it  */
                    conversations_table_g[conv_hash].packets_from_a_to_b++;
                } else { /* if dest  sent it (aka dest is now source)  */
                    conversations_table_g[conv_hash].packets_from_b_to_a++;
                }
                conversations_table_g[conv_hash].num_packets++;
                /* handle not inserted... */add_packet_to_list(&(conversations_table_g[conv_hash].packet_list),packet, pkthdr->caplen, conversations_table_g[conv_hash].num_packets - 1, ntohs(tcp_header->th_seq), ntohs(tcp_header->th_ack), ip_header->ip_src, ip_header->ip_dst, pkthdr->ts, relative_time);
            } else {
                if (conversations_table_g[conv_hash].num_packets != 0)
                {
                    if (DEBUG) info("cell %i is not available|conversations_arr[hash].num_packets = %i", conv_hash, conversations_table_g[conv_hash].num_packets);
                    free_l4_list(&conversations_table_g[conv_hash].packet_list);
                }
                conversation.conv_id = conv_id_tcp_g++;
                conversations_table_g[conv_hash] = conversation;
                conversations_table_g[conv_hash].packets_from_a_to_b = 1;
                conversations_table_g[conv_hash].num_packets = 1;
                conversations_table_g[conv_hash].num_exep = 0;
                conversations_table_g[conv_hash].packets_from_b_to_a = 0;
                conversations_table_g[conv_hash].proto_type = IPPROTO_TCP;
                init_list(&(conversations_table_g[conv_hash].packet_list));
                /* handle not inserted... */add_packet_to_list(&(conversations_table_g[conv_hash].packet_list), packet, pkthdr->caplen, conversations_table_g[conv_hash].num_packets - 1, ntohs(tcp_header->th_seq), ntohs(tcp_header->th_ack), ip_header->ip_src, ip_header->ip_dst, pkthdr->ts, relative_time);
                // okay("New Conversation: Source IP: %s, Destination IP: %s, Source Port: %u, Destination Port: %u", ip_src_str, ip_dst_str, conversation.src_port, conversation.dest_port);
            }
            if (DEBUG) info("[HEADER|HASH:%i|ID: %i] %i\n", conv_hash, conversations_table_g[conv_hash].conv_id, tcp_header->th_win);
        }
        else if (ip_header->ip_p == IPPROTO_UDP)
        {
            udp_header = (struct udphdr *)(packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
            /* src port */
            port_hash = port_hash_func(port_hash_g, udp_header->uh_sport);
            if (general_info_g.ports_table[port_hash].nthos_port == 0)
            {
                general_info_g.ports_table[port_hash].nthos_port = ntohs(udp_header->uh_sport);
                general_info_g.ports_table[port_hash].count++;
                num_ports_g++;
            }
            else
            {
                general_info_g.ports_table[port_hash].count++;
            }

            /* dst port */
            port_hash = port_hash_func(port_hash_g,udp_header->uh_dport);
            if (general_info_g.ports_table[port_hash].nthos_port == 0)
            {
                general_info_g.ports_table[port_hash].nthos_port = ntohs(udp_header->uh_dport);
                general_info_g.ports_table[port_hash].count++;
                num_ports_g++;
            }
            else
            {
                general_info_g.ports_table[port_hash].count++;
            }
            
            conversation.src_port = ntohs(udp_header->uh_sport);
            conversation.dest_port = ntohs(udp_header->uh_dport);
            conv_hash = conversation_hash(&conversation);
            if ((conversations_table_g[conv_hash].src_ip.s_addr == conversation.src_ip.s_addr && conversations_table_g[conv_hash].dest_ip.s_addr == conversation.dest_ip.s_addr) ||
                (conversations_table_g[conv_hash].src_ip.s_addr == conversation.dest_ip.s_addr && conversations_table_g[conv_hash].dest_ip.s_addr == conversation.src_ip.s_addr)) {
                if (conversations_table_g[conv_hash].src_ip.s_addr == conversation.src_ip.s_addr) { /* if source sent it  */
                    conversations_table_g[conv_hash].packets_from_a_to_b++;
                } else { /* if dest sent it (aka dest is now source)  */
                    conversations_table_g[conv_hash].packets_from_b_to_a++;
                }
                conversations_table_g[conv_hash].num_packets++;
                /* handle not inserted... */add_packet_to_list(&(conversations_table_g[conv_hash].packet_list),packet, pkthdr->caplen, conversations_table_g[conv_hash].num_packets - 1, -1, -1, ip_header->ip_src, ip_header->ip_dst, pkthdr->ts, relative_time);
            } else {
                if (conversations_table_g[conv_hash].num_packets != 0)
                {
                    if (DEBUG) info("cell %i is not available|conversations_arr[hash].num_packets = %i", conv_hash, conversations_table_g[conv_hash].num_packets);
                    free_l4_list(&conversations_table_g[conv_hash].packet_list);
                }
                conversation.conv_id = conv_id_udp_g++;
                conversations_table_g[conv_hash] = conversation;
                conversations_table_g[conv_hash].packets_from_a_to_b = 1;
                conversations_table_g[conv_hash].num_packets = 1;
                conversations_table_g[conv_hash].num_exep = 0;
                conversations_table_g[conv_hash].packets_from_b_to_a = 0;
                conversations_table_g[conv_hash].proto_type = IPPROTO_UDP;
                init_list(&(conversations_table_g[conv_hash].packet_list));
                /* handle not inserted... */add_packet_to_list(&(conversations_table_g[conv_hash].packet_list),packet, pkthdr->caplen, conversations_table_g[conv_hash].num_packets - 1, -1, -1, ip_header->ip_src, ip_header->ip_dst, pkthdr->ts, relative_time);
            }
        }
    }
}
int compare_L4_conversations(const void *a, const void *b)
{
    const conv_s *conv_a = (const conv_s *)a;
    const conv_s *conv_b = (const conv_s *)b;
    return conv_a->conv_id - conv_b->conv_id;
}
void save_L4_convs_to_json(const char *filename)
{
    json_object *root, *conversations_array, *conversation_object, *exeption_arr, *exception, *packets_arr, *packet_info, *conv_count_json;
    packet_node_s *temp;
    size_t i, exep_index; FILE * fp;
    int exep_type_switch;
    char prot_type[4] = "\0";
    char * exep_type = NULL, *ts_date;
    
    root = json_object_new_object();
    conversations_array = json_object_new_array();
    json_object_object_add(root, "conv_count",json_object_new_int(conv_id_tcp_g+conv_id_udp_g));
    json_object_object_add(root, "l4_conversations", conversations_array);
    for (i = 0; i < MAX_L4_CONVERSATIONS; i++) {
        if (conversations_table_g[i].src_ip.s_addr != 0) {
            if (conversations_table_g[i].proto_type == IPPROTO_TCP)
                strncpy(prot_type, "TCP", 4);
            else if (conversations_table_g[i].proto_type == IPPROTO_UDP)
                strncpy(prot_type, "UDP", 4);
            conversation_object = json_object_new_object();
            packets_arr = json_object_new_array();
            json_object_object_add(conversation_object, "conv_id", json_object_new_int(conversations_table_g[i].conv_id));
            json_object_object_add(conversation_object, "conv_type", json_object_new_string(prot_type));
            json_object_object_add(conversation_object, "source_ip", json_object_new_string(inet_ntoa(conversations_table_g[i].src_ip)));
            json_object_object_add(conversation_object, "destination_ip", json_object_new_string(inet_ntoa(conversations_table_g[i].dest_ip)));
            json_object_object_add(conversation_object, "source_port", json_object_new_int(conversations_table_g[i].src_port));
            json_object_object_add(conversation_object, "destination_port", json_object_new_int(conversations_table_g[i].dest_port));
            json_object_object_add(conversation_object, "packets", json_object_new_int(conversations_table_g[i].num_packets));
            json_object_object_add(conversation_object, "packets_from_a_to_b", json_object_new_int(conversations_table_g[i].packets_from_a_to_b));
            json_object_object_add(conversation_object, "packets_from_b_to_a", json_object_new_int(conversations_table_g[i].packets_from_b_to_a));
            temp = conversations_table_g[i].packet_list;
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
                    json_object_object_add(packet_info, "size_in_bytes", json_object_new_uint64(temp->packet_size));
                    json_object_object_add(packet_info, "from", json_object_new_string(inet_ntoa(temp->src_ip)));
                    json_object_object_add(packet_info, "to", json_object_new_string(inet_ntoa(temp->dest_ip)));
                    json_object_array_add(packets_arr, packet_info);
                }
                temp = temp->next;
            }
            json_object_object_add(conversation_object, "packets_data", packets_arr);
            if (conversations_table_g[i].num_exep > 0) /* if exceptions exist then add all of them to the conv json obj inside an array  */
            {
                if (DEBUG) printf("\n\t\tconv %i has %i exceptions\n", conversations_table_g[i].conv_id, conversations_table_g[i].num_exep);
                exeption_arr = json_object_new_array();
                for(exep_index = 0; exep_index < conversations_table_g[i].num_exep; exep_index++)
                {
                    exception = json_object_new_object();
                    json_object_object_add(exception, "exep_id", json_object_new_int(exep_index));
                    exep_type_switch = conversations_table_g[i].exep_packet_id[exep_index].exep; 
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
                            json_object_object_add(exception, "exep_type", json_object_new_string(DUP_ACK_BTOA_STR));
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
                    json_object_object_add(exception, "packet_index", json_object_new_int(conversations_table_g[i].exep_packet_id[exep_index].packet_location)); /* type cause */
                    json_object_object_add(exception, "from", json_object_new_string(inet_ntoa(conversations_table_g[i].exep_packet_id[exep_index].src_ip)));
                    json_object_object_add(exception, "to", json_object_new_string(inet_ntoa(conversations_table_g[i].exep_packet_id[exep_index].dest_ip)));
                    json_object_array_add(exeption_arr, exception);
                }
                json_object_object_add(conversation_object, "exceptions",exeption_arr);
            }
            /* add to main array object */
            json_object_array_add(conversations_array, conversation_object);
            strncpy(prot_type, "", 4);
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
            error("save_L4_convs_to_json: given file pointer is null");
        }
    }
    else
    {
        error("given file name is null");
    }
    json_object_put(root);
}
void analyze_conversations(conv_s conversations_arr[MAX_L4_CONVERSATIONS])
{
    int i, exception_index;
    packet_node_s * temp = NULL, *last = NULL, *lastAtoB, *lastBtoA;
    packet_flags p_type;
    int tcp_segment_length;
    struct ip * ip_header;
    struct tcphdr * tcp_header;
    for (i = 0; i < MAX_L4_CONVERSATIONS; i++)
    {
        if (conversations_arr[i].src_ip.s_addr!= 0 && conversations_arr[i].proto_type == IPPROTO_TCP)
        {
            if (DEBUG)
            {
                okay(" --------- Conversation (%i) ---------", conversations_arr[i].conv_id);
                printf("(%s->", inet_ntoa(conversations_arr[i].src_ip));
                printf("%s)\n", inet_ntoa(conversations_arr[i].dest_ip));
            }
            /* printf("(%s->", inet_ntoa(conversations_arr[i].src_ip));
            printf("%s)\n", inet_ntoa(conversations_arr[i].dest_ip)); */
            temp = conversations_arr[i].packet_list;
            exception_index = 0;
            while(temp != NULL) 
            {
                ip_header = (struct ip *)(temp->packet_data + ETH_HEADER_SIZE);
                tcp_header = (struct tcphdr *)(temp->packet_data + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
                p_type = analyze_packet(temp->packet_data);
                if (DEBUG) info("FLAGS: %i", p_type);
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
                if (p_type & ACK_FLAG) {
                    if (DEBUG) info("%s%sACK Packet%s", YELLOW_FG, BLACK_BG, RESET_FG);
                    tcp_segment_length = ntohs(ip_header->ip_len) - (ip_header->ip_hl << 2) - (tcp_header->th_off << 2);
                    /* SYN, FIN, and RST are not set. */
                    if (tcp_segment_length == 0 && !(p_type & (SYN_FLAG | FIN_FLAG | RST_FLAG))) 
                    {
                        // if (DEBUG) info("!(p_type & (SYN_FLAG | FIN_FLAG | RST_FLAG) = %i\tLen: %i", !(p_type & (SYN_FLAG | FIN_FLAG | RST_FLAG)), tcp_segment_length);
                        if (lastAtoB != NULL)
                        {
                            if (temp->src_ip.s_addr == lastAtoB->src_ip.s_addr)
                            {
                                if (check_dup_ack(temp, lastAtoB) && check_keep_alive(lastBtoA) != 1)
                                {
                                    if (DEBUG) info("%s%sDUPACK PACKET A->B{CURRENT: %i|LAST: %i}%s", RED_FG, BLACK_BG, temp->p_id, lastAtoB->p_id, RESET_FG);
                                    conversations_arr[i].exep_packet_id[exception_index].exep = DUP_ACK_ATOB_EXEP;
                                    conversations_arr[i].exep_packet_id[exception_index].src_ip = temp->src_ip;
                                    conversations_arr[i].exep_packet_id[exception_index].dest_ip = temp->dest_ip;
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
                                if (check_dup_ack(temp, lastBtoA) && check_keep_alive(lastAtoB) != 1)
                                {
                                    if (DEBUG) info("%s%sDUPACK PACKET B->A {CURRENT: %i|LAST: %i}%s", RED_FG, BLACK_BG, temp->p_id, lastBtoA->p_id, RESET_FG);
                                    conversations_arr[i].exep_packet_id[exception_index].exep = DUP_ACK_BTOA_EXEP;
                                    conversations_arr[i].exep_packet_id[exception_index].src_ip = temp->src_ip;
                                    conversations_arr[i].exep_packet_id[exception_index].dest_ip = temp->dest_ip;
                                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;
                                    conversations_arr[i].num_exep++;
                                    exception_index++;
                                }
                            }
                        }
                    } else if (check_retransmission(temp,lastAtoB, lastBtoA)) {
                        if (DEBUG) info("%s%sRETRANSMISSION%s", RED_FG, BLACK_BG, RESET_FG);
                        conversations_arr[i].exep_packet_id[exception_index].exep = RETRANS_EXEP;
                        conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;
                        conversations_arr[i].exep_packet_id[exception_index].src_ip = temp->src_ip;
                        conversations_arr[i].exep_packet_id[exception_index].dest_ip = temp->dest_ip;
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
                    if (DEBUG) info("%s%sRESET PACKET [conv:%i|p_id:%i]%s", YELLOW_FG, RED_BG, conversations_arr[i].conv_id, temp->p_id, RESET_FG);
                    conversations_arr[i].exep_packet_id[exception_index].exep = RESET_EXEP;
                    conversations_arr[i].exep_packet_id[exception_index].src_ip = temp->src_ip;
                    conversations_arr[i].exep_packet_id[exception_index].dest_ip = temp->dest_ip;
                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;
                    conversations_arr[i].num_exep++;
                    exception_index++;
                    /* check inside last->packet_data something... */
                }
                if (p_type & RETRANS_FLAG) {
                    if (DEBUG) info("%s%sRETRANSMISSION PACKET [%i]%s", RED_FG, BLACK_BG, p_type, RESET_FG);
                    conversations_arr[i].exep_packet_id[exception_index].exep = RETRANS_EXEP;
                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;
                    conversations_arr[i].exep_packet_id[exception_index].src_ip = temp->src_ip;
                    conversations_arr[i].exep_packet_id[exception_index].dest_ip = temp->dest_ip;
                    conversations_arr[i].num_exep++;
                    exception_index++;
                }
                if (p_type & URG_FLAG) {
                    if (DEBUG) info("URG Packet");
                }
                if (p_type & ZERO_WINDOW_FLAG) {
                    if (DEBUG) info("%s%sZERO WINDOW Packet%s", WHITE_FG, RED_BG, RESET_FG);
                    conversations_arr[i].exep_packet_id[exception_index].exep = ZERO_WINDOW_EXEP;
                    conversations_arr[i].exep_packet_id[exception_index].packet_location = temp->p_id;
                    conversations_arr[i].exep_packet_id[exception_index].src_ip = temp->src_ip;
                    conversations_arr[i].exep_packet_id[exception_index].dest_ip = temp->dest_ip;
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
        if ((crnt->num_seq != comp->num_seq) && (crnt->num_ack == comp->num_ack) && (crnt_tcph->th_win == comp_tcph->th_win)) ret_val = 1;
    }
    return ret_val;
}
int check_keep_alive(packet_node_s *p)
{
    if (p == NULL || p->packet_data) return -1;
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
    int ka = check_keep_alive(p);
    if ((ka != 1) && (atob != NULL && btoa != NULL) /* && (atob->packet_data != NULL || btoa->packet_data != NULL) */) 
    {
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
                    if (DEBUG) info("RETRANS A->B [pid:%i]", atob->p_id);
                    ret_val = 1;
                }
            } else {
                iphdr_comp = (struct ip *) (btoa->packet_data + ETH_HEADER_SIZE);
                tcphdr_comp = (struct tcphdr *) (btoa->packet_data + ETH_HEADER_SIZE + (iphdr_comp->ip_hl << 2));
                tcp_segment_length_comp = ntohs(iphdr_comp->ip_len) - (iphdr_comp->ip_hl << 2) - (tcphdr_comp->th_off << 2);
                if (tcp_segment_length_p > 0 || (tcphdr_p->th_flags & (TH_SYN | TH_FIN)))
                {
                    if (DEBUG) info("RETRANS B->A [pid:%i]", btoa->p_id);
                    ret_val = 1;
                }
            }
        }
    }
    return ret_val;
}

int invalid_files(char * pcap_file, char * output_file)
{
    FILE *f_ptr;
    int ret_val = 1;
    f_ptr = fopen(pcap_file, "rb");
    if (f_ptr)
    {
        fclose(f_ptr);
        f_ptr = fopen(output_file, "w");
        if (f_ptr)
        {
            fclose(f_ptr);
            ret_val = 0;
        }
    }
    return ret_val;
}

packet_node_s * copy_packet(packet_node_s *p)
{
    packet_node_s * ret_val = NULL;
    if (p)
    {
        ret_val = (packet_node_s *)malloc(sizeof(packet_node_s));
        ret_val->packet_data = p->packet_data;
        ret_val->p_id = p->p_id;
        ret_val->packet_size = p->packet_size;
        ret_val->packet_type = p->packet_type;
        ret_val->packet_exep = p->packet_exep;
        ret_val->num_ack = p->num_ack;
        ret_val->num_seq = p->num_seq;
        ret_val->src_ip = p->src_ip;
        ret_val->dest_ip = p->dest_ip;
        ret_val->time_stamp = p->time_stamp;
        ret_val->time_stamp_rltv = p->time_stamp_rltv;
    }
    return ret_val;
}

void * search_params(conv_s conv, search_e search , search_ret_e * ret_type, void * optional_a, void * optional_b, void * optional_c)
{
    void * void_ret_val = NULL;
    double start_time, end_time, ex_ma, avg_packets_per_time, prev_ema, *ema_value;
    packet_node_s *temp, *p;
    int counter = 0, max_size = INT_MIN, min_size = INT_MAX; /* to init (e.g. p_size = 1) > INT_MIN  */
    uint32_t * int_ret_val;
    switch (search)
    {
        case search_e_time:
            if (optional_a != NULL && optional_b != NULL)
            {
                /* go threw the packet list in conversation*/
                start_time = *(double *)optional_a;
                end_time = *(double *)optional_b;
                temp = conv.packet_list;
                while(temp != NULL)
                {
                    if (DEBUG) info("p_id: %i %f < %f < %f", temp->p_id, start_time, temp->time_stamp_rltv, end_time);
                    if (
                        /* seconds is between min and max seconds  */
                        ( temp->time_stamp_rltv <= end_time && temp->time_stamp_rltv >= start_time )
                    )
                    {
                        counter++;
                    }
                    temp = temp->next;
                }
                int_ret_val = (uint32_t *)malloc(sizeof(uint32_t));
                *int_ret_val = counter;
                void_ret_val = int_ret_val;
                *ret_type = search_ret_e_pctl;
            }
            else
            {
                *ret_type = search_ret_e_null;
            }
            break;
        
        case search_e_exma:
            if (optional_a != NULL && optional_b != NULL && optional_c != NULL)
            {
                start_time = *(double *)optional_a;
                end_time = *(double *)optional_b;
                prev_ema = *(double *)optional_c;
                avg_packets_per_time = calculate_avg_packets_per_time(conv, start_time, end_time);                
                ex_ma = calculate_ema(avg_packets_per_time, prev_ema, ex_ma_alpha);
                ema_value = (double *)malloc(sizeof(double));
                *ema_value = ex_ma;
                /* info("avg exma = %f | exma = %f ", avg_packets_per_time, ex_ma); */
                void_ret_val = ema_value;
                *ret_type = search_ret_e_exma;
            }
            else
            {
                *ret_type = search_ret_e_null;
            }
            break;
        case search_e_min_size:
            temp = conv.packet_list;
            p->packet_size = min_size;
            while(temp != NULL)
            {
                if (temp->packet_size < p->packet_size) p = temp;
                temp = temp->next;
            }
            void_ret_val = copy_packet(p);
            optional_c = void_ret_val;
            *ret_type = search_ret_e_p_ptr_min;
            break;
        case search_e_max_size:
            temp = conv.packet_list;
            p->packet_size = max_size;
            while(temp != NULL)
            {
                if (temp->packet_size < p->packet_size) p = temp;
                temp = temp->next;
            }
            void_ret_val = copy_packet(p);
            optional_c = void_ret_val;
            *ret_type = search_ret_e_p_ptr_max;
            break;
        case search_e_between:
            if (optional_a != NULL && optional_b != NULL)
            {
                min_size = *(int *)optional_a;
                max_size = *(int *)optional_b;
                temp = conv.packet_list;
                while(temp != NULL)
                {
                    if ( ( temp->packet_size <= max_size && temp->packet_size >= min_size ) )
                    {
                        counter++;
                    }
                    temp = temp->next;
                }
                int_ret_val = (uint32_t *)malloc(sizeof(uint32_t));
                *int_ret_val = counter;
                void_ret_val = int_ret_val;
                *ret_type = search_ret_e_between;
            }
            else
            {
                *ret_type = search_ret_e_null;
            }
            break;
        default:
            break;
    }
    return void_ret_val;
}