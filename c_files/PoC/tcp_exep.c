#include "./includes/tcp_exep.h"
#include <netinet/ip.h>
#include <netinet/tcp.h>
#include <stdio.h>

packet_exep_e get_packet_exep(u_char * tcp_packet)
{
    int ret_val = NORMAL_EXEP;
    return ret_val;
}
packet_type_e analyze_packet(u_char * tcp_packet)
{
    int ret_val = ERR_P_TYPE;
    struct tcphdr *tcp_header;
    struct ip *ip_header;
    ip_header = (struct ip *)(tcp_packet + ETH_HEADER_SIZE);
    tcp_header = (struct tcphdr *)(tcp_packet + ETH_HEADER_SIZE + (ip_header->ip_hl << 2));
    if (tcp_header->th_win == 0){
        ret_val = ZERO_WINDOW_TYPE;
    } else if (tcp_header->th_flags & TH_FIN) {
        ret_val =  FIN_P_TYPE;
    } else if (tcp_header->th_flags & TH_SYN) {
        ret_val =  SYN_P_TYPE;
    } else if (tcp_header->th_flags & TH_RST) {
        ret_val =  RST_P_TYPE;
    } else if (tcp_header->th_flags & TH_PUSH) {
        ret_val =  PSH_P_TYPE;
    } else if (tcp_header->th_flags & TH_ACK) {
        ret_val =  ACK_P_TYPE;
    } else if (tcp_header->th_flags & TH_URG) {
        ret_val =  URG_P_TYPE;
    }

    return ret_val;
}