#include "conv_type.h"
#include <net/ethernet.h>

#ifndef MITM_HEADER
#define MITM_HEADER

#define MAX_L2_CONVERSATIONS 50
#define HASH_L2_CONST 5381
#define GLOBAL_MITM_EXT "_mitm.json"
#define GLOBAL_L2_EXT "_L2.json"

/**
 * enumerates the arp types.
 * 
 * possible values:
 * - ARP_REQ: arp request type with value 10001.
 * - ARP_REPLAY: arp reply type.
 */
typedef enum arp_type
{
    ARP_TYPE_REQUEST = 10001,
    ARP_TYPE_REPLAY
} arp_type;

/**
 * struct representing an arp packet node.
 * 
 * contains the following fields:
 * - arp_packet_data: pointer to the arp packet data.
 * - p_type: the arp packet type.
 * - p_size: the size of the arp packet.
 * - p_id: the id of the arp packet.
 * - src_mac: the source mac address.
 * - dest_mac: the destination mac address.
 * - src_ip: the source ip address.
 * - dest_ip: the destination ip address.
 * - next: pointer to the next arp packet node.
 * - time_stamp: the timestamp of the arp packet.
 * - time_stamp_rltv: the relative timestamp of the arp packet.
 */
typedef struct arp_packet_node_s
{
    u_char * arp_packet_data;
    arp_type p_type;
    size_t p_size;
    uint32_t p_id;
    struct ether_addr src_mac;
    struct ether_addr dest_mac;
    struct in_addr src_ip;
    struct in_addr dest_ip;
    struct arp_packet_node_s * next;
    struct timeval time_stamp;
    double time_stamp_rltv;
} arp_packet_node_s;

/**
 * struct representing an arp conversation.
 * 
 * contains the following fields:
 * - cid: the conversation id.
 * - src_ip: the source ip address.
 * - dest_ip: the destination ip address.
 * - src_mac: the source mac address.
 * - dest_mac: the destination mac address.
 * - num_atob: the number of packets from a to b.
 * - num_btoa: the number of packets from b to a.
 * - num_p: the total number of packets.
 * - p_list: pointer to the list of arp packet nodes.
 */
typedef struct arp_conv
{
    uint32_t cid;
    struct in_addr src_ip;
    struct in_addr dest_ip;
    struct ether_addr src_mac;
    struct ether_addr dest_mac;
    int num_atob;
    int num_btoa;
    int num_p;
    arp_packet_node_s * p_list;
} arp_conv;

typedef struct mitm_node_s
{
    struct in_addr vict_ip_addr;
    struct mitm_node_s *next;
} mitm_node_s;

typedef struct mitm_ll_s
{
    struct ether_addr attacker;
    mitm_node_s *list;
} mitm_ll_s;

int add_to_mitm(mitm_node_s **root, struct in_addr *vict);

/**
 * calculates the hash value for arp conversation between two mac addresses by xor-ing the 0,1,4 indexes of both the MAC addresses (there's 6).
 * 
 * @param mac_a the first MAC address.
 * @param mac_b the second MAC address.
 * @return the hash value for the arp conversation.
 */
unsigned int get_arp_hash(struct ether_addr mac_a, struct ether_addr mac_b);

/**
 * @brief create's a packet node (arp_packet_node_s) then add's the packet to root (replaces root with node if it's the first packet)
 * 
 * @param root the root of the arp packet node list.
 * @param original_packet the original packet data.
 * @param packet_size the size of the packet.
 * @param id the id of the packet.
 * @param src_ip the source ip address.
 * @param dest_ip the destination ip address.
 * @param src_mac the source mac address.
 * @param dest_mac the destination mac address.
 * @param timestamp the timestamp of the packet.
 * @param relative_time the relative timestamp of the packet.
 * @param op the arp packet type.
 * @return int returns 1 if successful, -1 otherwise.
 */
int add_packet_to_arp_list(arp_packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, struct in_addr src_ip, struct in_addr dest_ip, struct ether_addr src_mac, struct ether_addr dest_mac ,struct timeval timestamp, double relative_time, arp_type op);

/**
 * @brief intilizes the list of the packets to null
 * 
 * @param root 
 */
void init_arp_list(arp_packet_node_s ** root);

/**
 * @brief free's the conversations packet list. (it's the only malloc in the arp conv struct)
 * 
 * @param root frees node->arp_packet_data then the node itself 
 */
void free_l2_list(arp_packet_node_s ** root);

/**
 * @brief free all the conversations in convos[MAX_L2_CONVERSATIONS] by iterating on each index and checking if theres an arp conv and free's the arp conv if exist's 
 * 
 * @param convos hash table of all the arp conv
 */
void free_all_l2_convs(arp_conv convos[MAX_L2_CONVERSATIONS]);

/**
 * @brief compares the two mac addresses
 * 
 * @param a 
 * @param b 
 * @return int returns the subtracted value of b from a (a.all_octets - b.all_octets)
 */
int compare_macs(struct ether_addr a, struct ether_addr b);

void save_L2_convs_to_json(arp_conv convs[MAX_L2_CONVERSATIONS], const char *filename);

void analyze_mitm(arp_conv l2_convs[MAX_L2_CONVERSATIONS], char * filename, uint32_t conv_count);

/**
 * @brief compares the id of the conversations for qsort function
 * 
 * @param a arp conv 1 caseted to void pointer.
 * @param b arp conv 2 caseted to void pointer.
 * @return int 
 */
int  compare_L2_conversations(const void *a, const void *b);

#endif