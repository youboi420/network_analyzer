#include <bits/types/struct_timeval.h>
#include <netinet/in.h>
#include <netinet/tcp.h>

#define MAX_EXEP 1024

#define ETH_HEADER_SIZE 14
#define ZERO_WINDOW_STR "zero window"
#define RETRANS_STR "retransmission"
#define RESET_STR "reset"
#define DUP_ACK_ATOB_STR "duplicate ack a to b"
#define DUP_ACK_BTOA_STR "duplicate ack b to a"

#ifndef TCP_EXEP_HEADER
#define TCP_EXEP_HEADER
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

typedef enum
{
    NO_FLAGS      = 0,
    FIN_FLAG      = 1 << 0,  /* 00000001 */  SYN_FLAG      = 1 << 1,  /* 00000010 */
    RST_FLAG      = 1 << 2,  /* 00000100 */  PSH_FLAG      = 1 << 3,  /* 00001000 */
    ACK_FLAG      = 1 << 4,  /* 00010000 */  URG_FLAG      = 1 << 5,  /* 00100000 */
    ZERO_WINDOW_FLAG = 1 << 6, /* 01000000 */RETRANS_FLAG  = 1 << 7,
    // DUPACK_FLAG = 1 << 8, /**/
    // ECE_FLAG      = 1 << 6,  /* 01000000 */ CWR_FLAG      = 1 << 7   /* 10000000 */
} packet_flags;


typedef struct packet_exep_node_s
{
    struct in_addr src_ip, dest_ip;
    packet_exep_e exep;
    uint32_t packet_location;
}packet_exep_node_s;

packet_exep_e get_packet_exep(u_char * tcp_packet);
packet_flags analyze_packet(u_char * tcp_packet);
int check_dup_ack(packet_node_s *crnt, packet_node_s * comp);
int check_keep_alive(packet_node_s *p);
#endif