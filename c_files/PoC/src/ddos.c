#include "../includes/ddos.h"

#include <arpa/inet.h>
#include <netinet/ip.h>
#include <stdio.h>
#include <stdlib.h>

void analyze_ddos(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename, uint32_t conv_count)
{
    int count_flood = 0, index;
    double a = 2.0, b = 10.0, ema = 0.0;
    double ema_threshold = 50.0;
    double * exma_ptr = NULL;
    packet_node_s *temp;
    search_ret_e ret;

    for(index = 0; index < MAX_L4_CONVERSATIONS; index++)
    {
        if (conversations[index].src_ip.s_addr != 0)
        {
            info("-------------------------------------");
            info("index: %i|conv id: %i| type: %i", index, conversations[index].conv_id, conversations[index].proto_type);
            if (detect_flood(conversations[index]))
            {
                okay("flaged conv [%i] as possible flood", conversations[index].conv_id);
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
            }
            info("start: %f | end: %f", a, b);
            exma_ptr = search_params(conversations[index], search_e_exma, &ret, &a, &b, &ema);
            info("called exma");
            if (exma_ptr && ret == search_ret_e_exma)
            {
                okay("%f exma value", *exma_ptr);
                if (*exma_ptr  > ema_threshold && conversations[index].num_packets > DDOS_PACKET_LIMIT)
                {
                    info("!!! need to write to ddos report json file !!!");
                    error("potential ddos detected conv: %i | ema: %f", index, *exma_ptr);
                }
                free(exma_ptr);
            }
            info("-------------------------------------");
        }
    }
    if ((count_flood >= conv_count/2) && (conv_count != 1) )
    {
        error("%s%sPOSSIBLE DDOS (TCP/UDP) BY FLOOD FLOOD [flood: %i|convc: %i]%s", RED_FG, BLACK_BG, count_flood, conv_count,RESET_FG);
    }
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
                okay("ip: [%s]", inet_ntoa(ip_header->ip_src));
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
