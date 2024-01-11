#include "tcp_exep.h"

#include <pcap.h>
#include <netinet/ip.h>
#include <netinet/udp.h>
#include <netinet/in.h>

#include <sys/types.h>
#include <string.h>

#include <json-c/json.h>

#define MAX_CONVERSATIONS 1000
#define HASH_CONST 5381
#define DEBUG 0

#define okay(msg, ...) printf("[+] " msg "\n", ##__VA_ARGS__)
#define info(msg, ...) printf("[i] INFO: " msg "\n", ##__VA_ARGS__)
#define warn(msg, ...) printf("[!] " msg "\n", ##__VA_ARGS__)
#define error(msg, ...)printf("[-] " msg "\n", ##__VA_ARGS__)

typedef struct packet_node_s {
    u_char *packet_data;
    uint32_t p_id;
    size_t packet_length;
    size_t packet_type;
    size_t packet_exep;
    struct packet_node_s *next;
} packet_node_s;

typedef struct {
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

void analyze_conversations(conv_s conversations_arr[MAX_CONVERSATIONS]);
void init_list(packet_node_s ** root);
void print_output_to_file(conv_s conversations[MAX_CONVERSATIONS], char * filename);
void print_packet_list(packet_node_s ** root, int max);
void print_packets(conv_s conversations[MAX_CONVERSATIONS]);
void free_list(packet_node_s **root);
void free_all(conv_s conversations[MAX_CONVERSATIONS]);
void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet);
int compare_conversations(const void *a, const void *b);
void save_to_json(const char *filename);
void analyze_conversations(conv_s conversations_arr[MAX_CONVERSATIONS]);

int conversation_hash(const conv_s *conversation);
int add_packet_to_list(packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id);