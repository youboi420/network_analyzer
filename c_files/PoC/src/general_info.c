#include "../includes/general_info.h"
#include "../includes/utils.h"
#include <arpa/inet.h>
#include <json-c/json.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <time.h>

unsigned int host_hash_func(unsigned int addr_hash, struct in_addr addr)
{
    addr_hash = HASH_L4_CONST;
    addr_hash ^= addr.s_addr;
    return addr_hash % MAX_HOSTS;
}
unsigned int port_hash_func(unsigned int port_hash, uint16_t port)
{
    port_hash = HASH_L4_CONST;
    port_hash ^= port;
    return port_hash % MAX_PORTS;
}
uint64_t get_file_size(char *file_name)
{
    struct stat st;
    return (stat(file_name, &st) == 0) ? st.st_size : 0;
}
void print_general_info(gen_inf_s gis)
{
    int i, counter;
    printf("-----------------GENERAL INFO-----------------------\n");
    info("packet record size: %8.2f MB|num of packet: %6zu", ((float)gis.filesize/1048576), gis.num_packets);
    printf("------------ HOSTS ------------\n");
    for (counter = 0, i = 0; i < MAX_HOSTS; i++) {
        if (gis.hosts_table[i].raw_addr.s_addr != 0)
        {
            counter++;
            info("host (%5i): [%15s]:[%4d]", counter, inet_ntoa(gis.hosts_table[i].raw_addr), gis.hosts_table[i].count);
        }
    }
    printf("------------ PORTS ------------\n");
    for (counter = 0, i = 0; i < MAX_PORTS; i++) {
        if (gis.ports_table[i].nthos_port != 0)
        {
            counter++;
            info("port (%5i): [%5hu]:[%4d]", counter, ntohs(gis.ports_table[i].nthos_port), gis.ports_table[i].count);
        }
    }
    printf("---------------------------------------------------\n");
}
char* get_file_name(char* org_file_name, const char* new_extension)
{
    // const char* new_extension = "_gis.json";
    char* ret_str = NULL;
    const char* last_dot;
    size_t original_length;
    if (!new_extension) return NULL;
    last_dot = strrchr(org_file_name, '.');

    if (last_dot != NULL) {
        original_length = last_dot - org_file_name;
        ret_str = (char*)malloc(original_length + strlen(new_extension) + 1);
        if (ret_str != NULL) {
            strncpy(ret_str, org_file_name, original_length);
            strcpy(ret_str + original_length, new_extension);
        }
    }
    return ret_str;
}
void save_gis_to_json(gen_inf_s gis, char * filename, uint32_t num_ports_g, uint32_t num_hosts_g, double duration)
{
    json_object *root_obj, *hosts_arr, *ports_arr, *host, *port;
    FILE *file_ptr;
    int i;
    double file_size_mb = (double)gis.filesize / (1024 * 1024);
    
    root_obj = json_object_new_object();
    json_object_object_add(root_obj, "raw_file_size", json_object_new_int64(gis.filesize));
    json_object_object_add(root_obj, "file_size_mb", json_object_new_double(file_size_mb));
    json_object_object_add(root_obj, "num_packets", json_object_new_int64(gis.num_packets));
    json_object_object_add(root_obj, "duration", json_object_new_double(duration));
    json_object_object_add(root_obj, "num_hosts", json_object_new_int64(num_hosts_g));
    json_object_object_add(root_obj, "num_ports", json_object_new_int64(num_ports_g));
    
    hosts_arr = json_object_new_array();
    ports_arr = json_object_new_array();
    json_object_object_add(root_obj, "hosts", hosts_arr);
    json_object_object_add(root_obj, "ports", ports_arr);
    for (i = 0; i < MAX_HOSTS; i++)
    {
        if (gis.hosts_table[i].raw_addr.s_addr != 0)
        {
            host = json_object_new_object();
            json_object_object_add(host, "host_ip", json_object_new_string(inet_ntoa(gis.hosts_table[i].raw_addr)));
            json_object_object_add(host, "count", json_object_new_int(gis.hosts_table[i].count));
            json_object_array_add(hosts_arr, host);
        }
    }
    for (i = 0; i < MAX_PORTS; i++)
    {
        if (gis.ports_table[i].nthos_port != 0)
        {
            port = json_object_new_object();
            json_object_object_add(port, "port", json_object_new_int(gis.ports_table[i].nthos_port));
            json_object_object_add(port, "count", json_object_new_int(gis.ports_table[i].count));
            json_object_array_add(ports_arr, port);
        }
    }
    if (!filename) error("error opening file");
    file_ptr = fopen(filename, "w");
    if (!file_ptr) error("error opening file");
    else fprintf(file_ptr, "%s\n", json_object_to_json_string_ext(root_obj, JSON_C_TO_STRING_PRETTY));
    json_object_put(root_obj);
    if (file_ptr) fclose(file_ptr);
}
char * get_packet_time_stamp_mt(const struct timeval *timestamp)
{
    time_t seconds;
    struct tm *time_info;
    char * ret_time_str = NULL;
    char time_str[DATE_LIMIT];

    if (!timestamp)
    {
        return ret_time_str;
    }
    seconds = timestamp->tv_sec;
    time_info = localtime(&seconds);
    ret_time_str = (char *)malloc(DATE_LIMIT);
    strftime(time_str, sizeof(time_str), "%b %e, %Y %H:%M:%S", time_info);
    snprintf(ret_time_str, DATE_LIMIT, "%s.%06ld %s", time_str, timestamp->tv_usec, tzname[time_info->tm_isdst]);
    return ret_time_str;
}
char * get_packet_time_stamp_js(const struct timeval *timestamp)
{
    time_t seconds;
    struct tm *time_info;
    char * ret_time_str = NULL;
    char time_str[DATE_LIMIT];

    if (!timestamp)
    {
        return ret_time_str;
    }
    seconds = timestamp->tv_sec;
    time_info = localtime(&seconds);
    ret_time_str = (char *)malloc(DATE_LIMIT);
    /* format timestamp as "YYYY-MM-DD HH:MM:SS" */
    strftime(time_str, sizeof(time_str), "%Y-%m-%dT%H:%M:%S", time_info);
    snprintf(ret_time_str, DATE_LIMIT, "%s.%06ld%+03d:%02ld", time_str, timestamp->tv_usec, (int)time_info->tm_gmtoff / 3600, labs((time_info->tm_gmtoff / 60) % 60));    
    return ret_time_str;
}