/* local includes */
#include "conv_type.h"
#include "utils.h"

/* libs includes */
#include <time.h>
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

/**
 * @brief writes the coversation's to a text file...
 * @time-complexity O(N) -> length of conv hash table
 * 
 * @param conversations conversation's hash table
 * @param filename the file name
 */
void print_output_to_file(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename);

/**
 * @brief print's the packet list
 * @time-complexity O(K) -> length of packet list
 * 
 * @param root the packet list header
 * @param packet_count the amount of packets
 */
void print_packet_list(packet_node_s ** root, int packet_count);

/**
 * @brief print's the packet list for all the conversation's
 * @time-complexity O(N*K) -> the size of the coversation's hash table times the length of packet list
 * 
 * @param conversations 
 */
void print_packets(conv_s conversations[MAX_L4_CONVERSATIONS]);

/**
 * @brief compares the id of the conversations for qsort function
 * @time-complexity O(1) just subs them
 * @param a l4 conv 1 caseted to void pointer.
 * @param b l4 conv 2 caseted to void pointer.
 * @return int the value of a.id - b.id
 */
int  compare_L4_conversations(const void *a, const void *b);

/**
 * @brief calculates the hash of conversation based on the src_ip, dest_ip, src_port, dest_port, proto_type
 * @time-complexity O(1) get's the xor's of fields and constant.
 * @param conversation the conversation to calculate hash for
 * @return unsigned int - hash of conversation
 */
unsigned int  conversation_hash(const conv_s *conversation);

/**
 * @brief check's if the given files for the program execution are valid or not
 * 
 * @param pcap_file the file to check
 * @param output_file the file to check
 * @return int returns 1 if invalid else return's 0
 */
int  invalid_files(char * pcap_file, char * output_file);

/**
 * @brief add's the data as a new packet to the end of the packet list
 * @time-complexity O(N) -> length of packet table.
 * 
 * @param root the packet list header
 * @param original_packet the packet original data for checks
 * @param packet_size the size of the packet
 * @param id the new id of the packet to insert
 * @param seq the seq number -1 if UDP
 * @param ack the ack number -1 if UDP
 * @param src_ip the src host ip
 * @param dest_ip the dest host ip
 * @param timestamp the unix time stamp of the packet
 * @param relative_time the local relative time stamp of the packet
 * @return int 1 if successed -1 if not
 */
int  add_packet_to_list(packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, uint32_t seq, uint32_t ack, struct in_addr src_ip, struct in_addr dest_ip, struct timeval timestamp, double relative_time);

/**
 * @brief check's if the packet is a retransmission using the last packet from a to b and the last packet from b to a correspondingly.
 * @time-complexity O(1) -> just compares values...
 * 
 * @param p the packet to check.
 * @param atob the last packet from a -> b
 * @param btoa the last packet from b -> a
 * @return int 1 if retransmission -1 if failed 0 if not.
 */
int  check_retransmission(packet_node_s *p, packet_node_s *atob, packet_node_s *btoa);

/**
 * @brief analyzes the conversation's for exceptions.
 * @time-complexity O(N) -> length of conv hash table.
 * 
 * @param conversations_arr conversation's hash table.
 */
void analyze_conversations(conv_s conversations_arr[MAX_L4_CONVERSATIONS]);

/**
 * @brief writes the coversation's to a json file.
 * @time-complexity O(N) -> length of conv hash table.
 * 
 * @param filename conversation's hash table.
 */
void save_L4_convs_to_json(const char *filename);

/**
 * @brief set's the root to null.
 * @time-complexity O(1).
 * 
 * @param root 
 */
void init_list(packet_node_s ** root);

/**
 * @brief handles the packet from the pcap file. insert's it to coresponding type (protocol) and conversation.
 * @time-complexity O(K // Q) -> the length of the packet list of the L4 and L2.
 * 
 * @param user u_char not used.
 * @param pkthdr the given packet header from the pcap file.
 * @param packet the given packet from the pcap file.
 */
void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet);

/**
 * @brief free's both the l4 conversations table and the l2 conversations table.
 * @time-complexity O(N*L2_root + K*L4_root) -> the size of the table times the size of the correspondingly packet list
 */
void free_all_lists(void);

/**
 * @brief free's the all the conversations and their depedencies.
 * @time-complexity O(N) -> len of conversation's hash table
 * @param conversations conversation's hash table
 */
void free_all_l4_convs(conv_s conversations[MAX_L4_CONVERSATIONS]);

/**
 * @brief free's the conversations packet list. frees node->arp_packet_data then the node itself
 * @time-complexity O(K) -> len of root
 * @param root the list head pointer 
 */
void free_l4_list(packet_node_s **root);

#endif