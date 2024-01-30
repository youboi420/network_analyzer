#include "tcp_exep.h"

#define MAX_L4_CONVERSATIONS 50000
// #define HASH_CONST 5381 /* 0 may be the issue? */

#ifndef CONV_TYPE_HEADER
#define CONV_TYPE_HEADER
#define GLOBAL_L4_EXT "_L4.json"
#define DEBUG 0

/**
 * enumerates the search_e types.
 * 
 * possible values:
 * - search_e_time: represents a search of a packet with time with init value of 11.
 * - search_e_max_size: represents a search of a packet with maximum size.
 * - search_e_min_size: represents a search of a packet with minimum size.
 * - search_e_between: represents  a search of a packet between optional a and b, given in the functions void * parameters.
 * - search_e_mac: represents  a search of a mac address !not implemented.
 * - search_e_exma: represents  a search of a expodential mean, uses the get_first_packet_bt and get_last_packet_bt to find the conversations start time and end time.
 * - search_e_null: represents null.
 */
typedef enum search_e
{
    search_e_time = 11,
    search_e_max_size,
    search_e_min_size,
    search_e_between,
    // search_e_mac,
    // search_e_sima, /* simple */
    search_e_exma, /* expod */
    search_e_null,
} search_e;

typedef enum search_ret_e
{
    search_ret_e_pctl = 21,
    search_ret_e_p_ptr_min,
    search_ret_e_p_ptr_max,
    search_ret_e_exma,
    search_ret_e_between,
    search_ret_e_null,
} search_ret_e;


/**
 * struct representing a conversation.
 * contains the following fields:
 * - conv_id: the conversation id.
 * - src_port: the source port.
 * - dest_port: the destination port.
 * - src_ip: the source ip address.
 * - dest_ip: the destination ip address.
 * - packets_from_a_to_b: the number of packets from a to b.
 * - packets_from_b_to_a: the number of packets from b to a.
 * - proto_type: the protocol type.
 * - num_packets: the total number of packets.
 * - num_exep: the number of exceptional packets.
 * - exep_packet_id: array of exceptional packet ids.
 * - packet_list: pointer to the list of packet nodes.
 */ 
typedef struct conv_s
{
    uint16_t conv_id;
    uint16_t src_port;
    uint16_t dest_port;
    struct in_addr src_ip;
    struct in_addr dest_ip;
    int packets_from_a_to_b;
    int packets_from_b_to_a;
    int proto_type;
    int num_packets;
    int num_exep; 
    packet_exep_node_s exep_packet_id[MAX_EXEP];
    packet_node_s * packet_list;
} conv_s;

void * search_params(conv_s conv, search_e search , search_ret_e * ret_type, void * optional_a, void * optional_b, void * optional_c);

packet_node_s * get_last_packet_bt(packet_node_s * p_list, double end_time);

packet_node_s * get_first_packet_bt(packet_node_s * p_list, double start_time);

#endif