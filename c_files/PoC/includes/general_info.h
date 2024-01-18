#include <netinet/in.h>
#include <stdint.h>
#include <stdio.h>
#define HASH_CONST 5381
#define MAX_HOSTS 10000
#define MAX_PORTS 10000
typedef struct host_s{
    struct in_addr raw_addr;
    int count;
} host_s;

typedef struct port_s{
    uint16_t nthos_port;
    int count;
} port_s;

typedef struct gen_inf_s{
    host_s hosts_table[MAX_HOSTS];
    port_s ports_table[MAX_PORTS];
    uint64_t filesize; /* unsigned long */
    uint64_t num_packets;
}gen_inf_s;
char * get_file_name(char * org_file_name);
unsigned int host_hash_func(unsigned int addr_hash, struct in_addr addr);
unsigned int port_hash_func(unsigned int addr_hash, uint16_t port);
uint64_t get_file_size(char *file);
void print_general_info(gen_inf_s gis);
void save_gis_to_json(gen_inf_s gis, char * filename);