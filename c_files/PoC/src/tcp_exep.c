#include "../includes/tcp_exep.h"
#include <netinet/in.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>
packet_exep_e get_packet_exep(u_char * tcp_packet)
{
    int ret_val = NORMAL_EXEP;
    return ret_val;
}
packet_flags analyze_packet(u_char * tcp_packet)
{
    packet_flags ret_val = NO_FLAGS;
    struct tcphdr *current_tcp_header, *last_a_tcphdr, *last_b_tcphdr;
    struct ip *current_ip_header, *last_a_ip_header, *last_b_ip_header;
    current_ip_header = (struct ip *)(tcp_packet + ETH_HEADER_SIZE);
    current_tcp_header = (struct tcphdr *)(tcp_packet + ETH_HEADER_SIZE + (current_ip_header->ip_hl << 2));
    /*  
        all if statements because of binary flag type... 
        which means a function returns one flag with a possible more than one field on,
        each field indicating something diffrent.
    */
    if (current_tcp_header->th_win == 0 && !(current_tcp_header->th_flags & (TH_RST | TH_FIN | TH_SYN)) ) {
        ret_val |= ZERO_WINDOW_FLAG;
    }
    if (current_tcp_header->th_flags & TH_FIN) {
        ret_val |= FIN_FLAG;
    }
    if (current_tcp_header->th_flags & TH_SYN) {
        ret_val |= SYN_FLAG;
    }
    if (current_tcp_header->th_flags & TH_RST) {
        ret_val |= RST_FLAG;
    }
    if (current_tcp_header->th_flags & TH_PUSH) {
        ret_val |= PSH_FLAG;
    }
    if (current_tcp_header->th_flags & TH_ACK) {
        ret_val |= ACK_FLAG;
    }
    if (current_tcp_header->th_flags & TH_URG) {
        ret_val |= URG_FLAG;
    }
    return ret_val;
}