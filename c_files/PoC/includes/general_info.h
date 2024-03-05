#include <netinet/in.h>
#include <stdint.h>
#include <stdio.h>

#ifndef GIS_HEADER
#define GIS_HEADER

#define HASH_L4_CONST 5381
#define MAX_HOSTS 10000
#define MAX_PORTS 10000
#define DATE_LIMIT 65
#define GLOBAL_INFO_EXT "_gis.json"

/**
 * struct representing a host
 *
 * contains the following fields:
 * - raw_addr: a struct in_addr object representing the raw address of the host.
 * - count: an integer representing the count of the host.
 */
typedef struct host_s
{
    struct in_addr raw_addr;
    int count;
} host_s;

/**
 * struct representing a port
 *
 * contains the following fields:
 * - nthos_port: a uint16_t representing the port number in network byte order.
 * - count: an integer representing the count of the port.
 */
typedef struct port_s
{
    uint16_t nthos_port;
    int count;
} port_s;

/**
 * struct representing general information
 *
 * contains the following fields:
 * - hosts_table: an array of host_s structs representing the hosts table.
 * - ports_table: an array of port_s structs representing the ports table.
 * - filesize: an unsigned long representing the file size.
 * - num_packets: an unsigned long representing the number of packets.
 */
typedef struct gen_inf_s
{
    host_s hosts_table[MAX_HOSTS];
    port_s ports_table[MAX_PORTS];
    uint64_t filesize; /* unsigned long */
    uint64_t num_packets;
}gen_inf_s;

/**
 * @brief creates the new extention of a file name with given new_extension. e.g f = file.some -> get_file_name(f, ".else") returns file.else
 * @time-complexity O(K) length of 'string'
 * @param org_file_name original file name
 * @param new_extension the new file extension
 * ! @return char* the new file name - need's to be freed!
 */
char* get_file_name(char* org_file_name, const char* new_extension);

/**
 * @brief calculates the hash of the host
 * @time-complexity O(1) get's the xor's of host and constant.
 * @param addr_hash 
 * @param addr 
 * @return unsigned int - hash of host
 */
unsigned int host_hash_func(unsigned int addr_hash, struct in_addr addr);

/**
 * @brief calculates the hash of the port
 * @time-complexity O(1) get's the xor's of port and constant.
 * @param port_hash 
 * @param port 
 * @return unsigned int - hash of port
 */
unsigned int port_hash_func(unsigned int port_hash, uint16_t port);

/**
 * @brief get's the file size from the os using stat
 * @time-complexity O(1) get's the file size as a syscall
 * @param file 
 * @return uint64_t 
 */
uint64_t get_file_size(char *file);

/**
 * @brief print's out to stdout the global info table
 * @time-complexity O(N) the length of global info table
 * @param gis global info table
 */
void print_general_info(gen_inf_s gis);

/**
 * @brief saves the global infromation into the json filename
 * @time-complexity O(N) the length of global info table writing to memory...
 * @param gis the global info table
 * @param filename the json f-name
 */
void save_gis_to_json(gen_inf_s gis, char * filename, uint32_t num_ports_g, uint32_t num_hosts_g, double duration);

/**
 * @brief create's the packet time stamp 'my type' aka wrshrk time-format string
 * @time-complexity O(1) coverts a number to 'string'
 * @param timestamp the unix-machine time stamp
 * ! @return char* the time-stamp as js time object - need's to be freed!
 */
char * get_packet_time_stamp_mt(const struct timeval *timestamp);

/**
 * @brief create's the packet time stamp as A js time object
 * @time-complexity O(1) coverts a number to 'string'
 * @param timestamp the unix-machine time stamp 
 * ! @return char* the time-stamp as js time object - need's to be freed!
 */
char * get_packet_time_stamp_js(const struct timeval *timestamp);

#endif