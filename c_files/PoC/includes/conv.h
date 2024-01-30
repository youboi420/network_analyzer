/* local includes */
#include "conv_type.h"
#include "utils.h"

/* libs includes */
#include <pcap.h>
#include <netinet/ip.h>
#include <netinet/in.h>
#include <netinet/ether.h>
#include <netinet/udp.h>
#include <netinet/tcp.h>
#include <json-c/json.h>
#include <sys/types.h>
#include <string.h>
#include <limits.h>

#ifndef CONV_HEADER /* header guard's */
#define CONV_HEADER
void print_output_to_file(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename);
void print_packet_list(packet_node_s ** root, int max);
void print_packets(conv_s conversations[MAX_L4_CONVERSATIONS]);

int  compare_L4_conversations(const void *a, const void *b);
unsigned int  conversation_hash(const conv_s *conversation);
int  invalid_files(char * pcap_file, char * output_file);

int  add_packet_to_list(packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, uint32_t seq, uint32_t ack, struct in_addr src_ip, struct in_addr dest_ip, struct timeval timestamp, double relative_time);
int  check_retransmission(packet_node_s *p, packet_node_s *atob, packet_node_s *btoa);
void analyze_conversations(conv_s conversations_arr[MAX_L4_CONVERSATIONS]);
void save_L4_convs_to_json(const char *filename);
void init_list(packet_node_s ** root);
void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet);
void free_all_lists(void);
void free_all_l4_convs(conv_s conversations[MAX_L4_CONVERSATIONS]);
void free_l4_list(packet_node_s **root);

#endif
/* 
    TODO: create these functions
    * check_tcp_peaks(conv_s conv);
    * check_udp_peaks(conv_s conv);
    * check_peaks(conv_s conv, int protocol);
*/