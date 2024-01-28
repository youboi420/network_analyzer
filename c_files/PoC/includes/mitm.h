#include "conv_type.h"
#include <net/ethernet.h>

#ifndef MITM_HEADER
#define MITM_HEADER

#define MAX_L2_CONVERSATIONS 50
#define HASH_L2_CONST 5381

typedef enum arp_type
{
    ARP_REQ = 10001,
    ARP_REPLAY
} arp_type;

typedef struct arp_packet_node_s{
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

typedef struct arp_conv{
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

unsigned int get_arp_hash(struct ether_addr mac_a, struct ether_addr mac_b);
int add_packet_to_arp_list(arp_packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, struct in_addr src_ip, struct in_addr dest_ip, struct ether_addr src_mac, struct ether_addr dest_mac ,struct timeval timestamp, double relative_time, arp_type op);
void init_arp_list(arp_packet_node_s ** root);
void free_l2_list(arp_packet_node_s ** root);
void free_all_l2_convs(arp_conv convos[MAX_L2_CONVERSATIONS]);
int  compare_L2_conversations(const void *a, const void *b);

#endif