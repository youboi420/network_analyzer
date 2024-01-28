#include "../includes/mitm.h"
#include "../includes/utils.h"
#include <net/ethernet.h>
#include <stdlib.h>
#include <stdio.h>

/* GLOBALS */
unsigned int arp_conv_hash_g;

int add_packet_to_arp_list(arp_packet_node_s **root, const u_char * original_packet, size_t packet_size, uint32_t id, struct in_addr src_ip, struct in_addr dest_ip, struct ether_addr src_mac, struct ether_addr dest_mac ,struct timeval timestamp, double relative_time, arp_type op)
{
    int flag = 1, index;
    arp_packet_node_s * node = malloc(sizeof(arp_packet_node_s)), *temp = *root;
    struct tcphdr *tcp_header;
    struct ip *ip_header;
    
    if (!node)
    {
        error("failed to alloc a packet_node.");
        flag = -1;
    }
    else
    {
        /* set general data */
        node->p_id = id;
        node->p_size = packet_size;
        node->time_stamp = timestamp;
        node->time_stamp_rltv = relative_time;
        node->p_type = op;
        /* set source */
        node->src_ip = src_ip;
        /* set destenation */
        node->dest_ip = dest_ip;
        // node->src_mac = src_mac;
        // node->dest_mac = dest_mac;

        node->src_mac = src_mac;
        node->dest_mac = dest_mac;
        
        node->arp_packet_data = (u_char *)malloc(packet_size);
        node->next = NULL;
        for(index = 0; index < packet_size; index++)
        {
            node->arp_packet_data[index] = original_packet[index];
        }
        if (temp != NULL)
        {
            while(temp->next != NULL)
            {
                temp = temp->next;
            }
            temp->next = node;
        }
        else
            *root = node;
    }
    return flag;
}

void init_arp_list(arp_packet_node_s ** root)
{
    *root = NULL;
}

void free_all_l2_convs(arp_conv l2_convs[MAX_L2_CONVERSATIONS])
{
    int i;
    for(i = 0; i < MAX_L2_CONVERSATIONS; i++)
    {
        if (l2_convs[i].src_ip.s_addr != 0)
            free_l2_list(&l2_convs[i].p_list);
    }
}

void free_l2_list(arp_packet_node_s **root)
{
    arp_packet_node_s *temp = *root, *next;
    while (temp != NULL) {
        next = temp->next;
        free(temp->arp_packet_data); /* the alloc for the u_char packet */
        free(temp);
        temp = next;
    }
}

unsigned int get_arp_hash(struct ether_addr mac_a, struct ether_addr mac_b)
{
    unsigned int arp_hash = HASH_L2_CONST;
    arp_hash ^= mac_a.ether_addr_octet[0];
    arp_hash ^= mac_b.ether_addr_octet[0];
    arp_hash ^= mac_a.ether_addr_octet[1];
    arp_hash ^= mac_b.ether_addr_octet[1];
    arp_hash ^= mac_a.ether_addr_octet[4];
    arp_hash ^= mac_b.ether_addr_octet[4];
    return arp_hash % MAX_L2_CONVERSATIONS;
}

int  compare_L2_conversations(const void *a, const void *b)
{
    const arp_conv *conv_a = (const arp_conv *)a;
    const arp_conv *conv_b = (const arp_conv *)b;
    return conv_a->cid - conv_b->cid;
}