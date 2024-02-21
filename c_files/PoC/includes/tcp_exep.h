#include <bits/types/struct_timeval.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <stdlib.h>

#define MAX_EXEP 1024

#define ETH_HEADER_SIZE 14
#define ZERO_WINDOW_STR "zero window"
#define RETRANS_STR "retransmission"
#define RESET_STR "reset"
#define DUP_ACK_ATOB_STR "duplicate ack a to b"
#define DUP_ACK_BTOA_STR "duplicate ack b to a"

#ifndef TCP_EXEP_HEADER
#define TCP_EXEP_HEADER

/**
 * enumerates the search_e types.
 * 
 * possible values:
 * - FIN_P_TYPE represents a tcp FIN flag,
 * - SYN_P_TYPE represents a tcp SYN flag,
 * - RST_P_TYPE represents a tcp RST flag,
 * - PSH_P_TYPE represents a tcp PUSH flag,
 * - ACK_P_TYPE represents a tcp ACK flag,
 * - URG_P_TYPE represents a tcp URG flag,
 * - ZERO_WINDOW_TYPE represents a tcp zero window,
 * - ERR_P_TYPE represents an error
 */
typedef enum packet_type_e
{
    FIN_P_TYPE = TH_FIN,
    SYN_P_TYPE = TH_SYN,
    RST_P_TYPE = TH_RST,
    PSH_P_TYPE = TH_PUSH,
    ACK_P_TYPE = TH_ACK,
    URG_P_TYPE = TH_URG,
    ZERO_WINDOW_TYPE = 1111,
    ERR_P_TYPE = -1
} packet_type_e;

/**
 * enumerates the packet_exep_e types.
 * 
 * possible values:
 * - NORMAL_EXEP: represents a normal_exep exception,
 * - DUP_ACK_ATOB_EXEP: represents a dup_ack_atob_exep exception,
 * - DUP_ACK_BTOA_EXEP: represents a dup_ack_btoa_exep exception,
 * - ZERO_WINDOW_EXEP: represents a zero_window_exep exception,
 * - TIMEOUT_EXEP: represents a timeout_exep exception,
 * - RETRANS_EXEP: represents a retrans_exep exception,
 * - RESET_EXEP: represents a reset_exep exception,
 */
typedef enum packet_exep_e
{
    NORMAL_EXEP = 21,
    DUP_ACK_ATOB_EXEP,
    DUP_ACK_BTOA_EXEP,
    ZERO_WINDOW_EXEP,
    TIMEOUT_EXEP,
    RETRANS_EXEP,
    RESET_EXEP,
} packet_exep_e;

/**
 * struct representing a packet_node_s
 *
 * contains the following fields:
 * - u_char *packet_data: the data of the packet in u_char
 * - uint32_t p_id: the packet's id
 * - size_t packet_size: the size of the packet
 * - size_t packet_type: the type of the packet
 * - size_t packet_exep: the exception type
 * - uint32_t num_seq: if TCP it will be a non -1 value
 * - uint32_t num_ack: if TCP it will be a non -1 value
 * - struct in_addr src_ip: the host src ip address
 * - struct in_addr dest_ip: the host ip dest address
 * - struct timeval time_stamp: the time stamp in unix time
 * - double time_stamp_rltv: the relative time into the whole network record
 * - struct packet_node_s *next: the next node in the list
  */
typedef struct packet_node_s
{
    u_char *packet_data;
    uint32_t p_id;
    size_t packet_size;
    size_t packet_type;
    size_t packet_exep;
    uint32_t num_seq;
    uint32_t num_ack;
    struct in_addr src_ip;
    struct in_addr dest_ip;
    struct timeval time_stamp;
    double time_stamp_rltv;
    struct packet_node_s *next;
} packet_node_s;

/**
 * enumerates the packet_flags types.
 * possible values:
 * - NO_FLAGS represents a no flags are set 
 * - FIN_FLAG represents a fin flag is on 
 * - SYN_FLAG represents a syn flag is on 
 * - RST_FLAG represents a rst flag is on 
 * - PSH_FLAG represents a psh flag is on 
 * - ACK_FLAG represents a ack flag is on 
 * - URG_FLAG represents a urg flag is on 
 * - ZERO_WINDOW_FLAG represents a zero window is on 
 * - RETRANS_FLAG represents a retransmission is on
*/
typedef enum packet_flags
{
    NO_FLAGS      = 0,
    FIN_FLAG      = 1 << 0,
    SYN_FLAG      = 1 << 1,
    RST_FLAG      = 1 << 2,
    PSH_FLAG      = 1 << 3,
    ACK_FLAG      = 1 << 4,
    URG_FLAG      = 1 << 5,
    ZERO_WINDOW_FLAG = 1 << 6,
    RETRANS_FLAG  = 1 << 7,
    // DUPACK_FLAG = 1 << 8, /**/
    // ECE_FLAG      = 1 << 6,  /* 01000000 */ CWR_FLAG      = 1 << 7   /* 10000000 */
} packet_flags;

/**
 * struct representing a packet_node_s
 *
 * contains the following fields:
 * - struct in_addr src_ip: the src host ip address
 * - struct in_addr dest_ip: the dest host ip address 
 * - packet_exep_e exep: the packet exception type
 * - uint32_t packet_location: the id/location of the packet
*/
typedef struct packet_exep_node_s
{
    struct in_addr src_ip, dest_ip;
    packet_exep_e exep;
    uint32_t packet_location;
}packet_exep_node_s;

/**
 * enumerates the ret_val types.
 * possible values:
 * - FAILED represents a failed exit code for the program 
 * - with_l2l4 represents a with_l2l4 exit code for the program 
 * - with_ddos represents a with_ddos exit code for the program 
 * - with_mitm represents a with_mitm exit code for the program 
 */
typedef enum ret_val
{
    FAILED = EXIT_FAILURE,
    with_l2l4 = 1 << 1,
    with_ddos = 1 << 2,
    with_mitm = 1 << 3
} ret_val;

/**
 * @brief get's the type of the exception
 * @time-complexity O(1) &= for each flag
 * 
 * @param tcp_packet the packet
 * @return packet_exep_e type of exception
    packet_exep_e get_packet_exep(u_char * tcp_packet);
 */

/**
 * @brief analyzes the tcp packet for all set flags
 * @time-complexity O(1) &= for each flag
 * 
 * @param tcp_packet the packet
 * @return packet_flags all the set flags
 */
packet_flags analyze_packet(u_char * tcp_packet);

/**
 * @brief check's if the if crnt is a dupack using the comp node
 * @time-complexity O(1)
 * 
 * @param crnt the current packet
 * @param comp the packet to compare
 * @return int returns 1 if the packet is a dup ack else 0
 */
int check_dup_ack(packet_node_s *crnt, packet_node_s * comp);

/**
 * @brief check's if the packet is a keep alive packet 
 * @time-complexity O(1)
 * 
 * @param p the packet to check
 * @return int 1 if check alive else if fails -1 else 0
 */
int check_keep_alive(packet_node_s *p);

#endif