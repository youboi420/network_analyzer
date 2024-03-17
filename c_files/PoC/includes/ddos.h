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

/**
 * struct representing a ddos_info
 * 
 * contains the following fields:
 * - struct in_addr victim: the victim's IP address
 * - struct ddos_addr_ll *attackers: linked list of attackers' IP addresses
 * - uint32_t dst_port: the destination port
 */
typedef struct ddos_info
{
    struct in_addr victim;
    struct ddos_addr_ll * attackers;
    uint32_t dst_port;
} ddos_info;

/**
 * struct representing a linked list node for storing ddos address information.
 * 
 * contains the following fields:
 * - uint32_t id: the identifier of the node
 * - struct in_addr addr: the ip address of the node
 * - uint32_t src_port: the source port of the node
 * - struct ddos_addr_ll *next: pointer to the next node in the linked list
 */
typedef struct ddos_addr_ll{
    uint32_t id;
    struct in_addr addr;
    uint32_t src_port;
    uint32_t dest_port;
    struct ddos_addr_ll * next;
} ddos_addr_ll;

/**
 * @brief calculates the average of conv from start time of the conversation and the end time
 * @time-complexity O(1)
 * 
 * @param conv the conversation to calculate the average
 * @param start_time the start time of the conversation
 * @param end_time the end time of the conversation
 * @return double the average packet's sent
 */
double calculate_avg_packets_per_time(conv_s conv, double start_time, double end_time);

/**
 * @brief calculates the expodential average using the current value and prev value and alpha which is a constant int the code
 * @time-complexity O(1) calculates using the current value and  
 * 
 * @param current_value the current value
 * @param previous_ema the prev value
 * @param alpha constant in the code
 * @return double 
 */
double calculate_ema(double current_value, double previous_ema, double alpha);

/**
 * @brief analyzes for ddos attack and saves it to json filename if found and modfies the main return value
 * @time-complexity O(N) goes threw the hash table to find attack
 * 
 * @param conversations the hash table
 * @param filename the json fname
 * @param conv_count the amount of coversations
 * @param MAIN_RET_VAL the main return value of the 
 */
void analyze_ddos(conv_s conversations[MAX_L4_CONVERSATIONS], char * filename, uint32_t conv_count, ret_val * MAIN_RET_VAL);

/**
 * @brief 
 * @time-complexity O(N) goes threw the whole ddos list 
 * 
 * @param convo the conversation to scan
 * @return int 1 if flood is detected 0 if not
 */
int detect_flood(conv_s convo);

/**
 * @brief 
 * @time-complexity O(K) add's as the last ddos in list
 * 
 * @param root the ddos list header
 * @param atkr_addr the attacket host ip address
 * @param src_port the attacket host source port
 * @return int 1 if inserted or existed 0 if not inserted
 */
int add_to_ddos_ll(ddos_addr_ll **root, struct in_addr atkr_addr, uint32_t src_port, uint32_t dest_port);

/**
 * @brief 
 * @time-complexity O(K) len of the list 
 * 
 * @param root the list of packet's to free 
 */
void free_ddos_list(ddos_addr_ll **root);
#endif