#include "conv_type.h"
#include "utils.h"

#include <netinet/in.h>
#include <stdint.h>

#ifndef DDOS_HEADER /* header guard's */
#define DDOS_HEADER

#define DDOS_MIN_TIME 0
#define DDOS_MAX_TIME 100000000.0
#define DDOS_PACKET_LIMIT 3
#define DDOS_UDP_LIMIT_MULT 2
#define DDOS_UDP_LIMIT 1000
#define GLOBAL_DDOS_EXT "_ddos.json"
typedef struct ddos_info
{
    struct in_addr victim;
    struct ddos_addr_ll * attackers;
    uint32_t dst_port;
} ddos_info;

typedef struct ddos_addr_ll{
    uint32_t id;
    struct in_addr addr;
    uint32_t src_port;
    struct ddos_addr_ll * next;
} ddos_addr_ll;

double calculate_avg_packets_per_time(conv_s conv, double start_time, double end_time);
double calculate_ema(double current_value, double previous_ema, double alpha);

void analyze_ddos(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename, uint32_t conv_count);
int detect_flood(conv_s convo);
int add_to_ddos_ll(ddos_addr_ll **root, struct in_addr atkr_addr, uint32_t src_port);
void free_ddos_list(ddos_addr_ll **root);
#endif