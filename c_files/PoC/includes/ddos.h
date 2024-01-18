#include <netinet/in.h>
#include <stdint.h>
typedef struct addr_ll{
    uint32_t id;
    struct in_addr addr;
    struct addr_ll * next;
} addr_ll;
typedef struct ddos_info{
    struct in_addr victim;
    struct addr_ll * attackers;
    uint32_t src_port;
    uint32_t dst_port;
} ddos_info;