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
 * - search_e_exma: represents  a search of a expodential mean, uses the get_first_packet_bt and get_last_packet_bt to find the conversations start time and end time.
 * - search_e_null: represents null.
 */
typedef enum search_e
{
    search_e_time = 11,
    search_e_max_size,
    search_e_min_size,
    search_e_between,
    search_e_exma, /* expod */
    search_e_null,
} search_e;

/**
 * enumerates the search_e types.
 * 
 * possible values:
 * - search_ret_e_pctl: represents a ret_val_search of number of packet's with time with init value of 11.
 * - search_ret_e_p_ptr_min: represents a ret_val_search of a packet with maximum size.
 * - search_ret_e_p_ptr_max: represents a ret_val_search of a packet with minimum size.
 * - search_ret_e_exma: represents a ret_val_search of a packet between optional a and b, given in the functions void * parameters.
 * - search_ret_e_between: represents a ret_val_search of a expodential mean, uses the get_first_packet_bt and get_last_packet_bt to find the conversations start time and end time.
 * - search_ret_e_null: represents a ret_val_search of null.
 */
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
 * - uint16_t conv_id: the conversation id.
 * - uint16_t src_port: the source port.
 * - uint16_t dest_port: the destination port.
 * - struct in_addr src_ip: the source ip address.
 * - struct in_addr dest_ip: the destination ip address.
 * - int packets_from_a_to_b: the number of packets from a to b.
 * - int packets_from_b_to_a: the number of packets from b to a.
 * - int proto_type: the protocol type.
 * - int num_packets: the total number of packets.
 * - int num_exep: the number of exceptional packets.
 * - packet_exep_node_s exep_packet_id: array of exceptional packet ids.
 * - packet_node_s * packet_list: pointer to the list of packet nodes.
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

/**
 * @brief searches a conv_s conversation for the given search_e search type which is defiend above...
 * @time-complexity O(N) -> length of conv
 * @param conv the conversation
 * @param search the searching filter
 * @param ret_type the returned type
 * @param optional_a an optional void pointer for searching with more specific needs e.g. start time
 * @param optional_b an optional void pointer for searching with more specific needs e.g. end time
 * @param optional_c an optional void pointer for returning a specific pointer e.g. a copied packet.
 * ! @return void* a return value determined by ret_type - need's to be freed!
 */
void * search_params(conv_s conv, search_e search , search_ret_e * ret_type, void * optional_a, void * optional_b, void * optional_c);

/**
 * @brief get's the last packet by time from the p_list
 * @time-complexity O(N) -> length of p_list
 * @param p_list the list of the packets
 * @param end_time the end time to seacrh packet to
 * ! @return packet_node_s* return either the found last packet or null - need's to be freed!
 */
packet_node_s * get_last_packet_bt(packet_node_s * p_list, double end_time);

/**
 * @brief get's the first packet by time from the p_list
 * @time-complexity O(N) -> length of p_list
 * @param p_list the list of the packets
 * @param start_time the start time to seacrh packet to
 * ! @return packet_node_s* return either the found first packet or null - need's to be freed!
 */
packet_node_s * get_first_packet_bt(packet_node_s * p_list, double start_time);

#endif