// #include <stdio.h>
// #include <pcap.h>
// #include <netinet/if_ether.h>

// void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet) {
//     struct ether_header *eth_header = (struct ether_header *)packet;

//     if (ntohs(eth_header->ether_type) == ETHERTYPE_ARP) {
//         // Extract ARP information
//         unsigned short ar_op = ntohs(*(unsigned short *)(packet + ETHER_HDR_LEN + 6));
//         if (ar_op == ARPOP_REQUEST || ar_op == ARPOP_REPLY) {
//             char src_ip[INET_ADDRSTRLEN];
//             char dest_ip[INET_ADDRSTRLEN];
//             char src_mac[ETHER_ADDR_LEN];
//             char dest_mac[ETHER_ADDR_LEN];

//             struct ether_arp *arp_header = (struct ether_arp *)(packet + ETHER_HDR_LEN);
//             // Convert IP addresses to strings
//             inet_ntop(AF_INET, arp_header->arp_spa, src_ip, sizeof(src_ip));
//             inet_ntop(AF_INET, arp_header->arp_tpa, dest_ip, sizeof(dest_ip));
//             // Convert MAC addresses to strings
//             snprintf(src_mac, sizeof(src_mac), "%02x:%02x:%02x:%02x:%02x:%02x",
//                      arp_header->arp_sha[0], arp_header->arp_sha[1], arp_header->arp_sha[2],
//                      arp_header->arp_sha[3], arp_header->arp_sha[4], arp_header->arp_sha[5]);
//             snprintf(dest_mac, sizeof(dest_mac), "%02x:%02x:%02x:%02x:%02x:%02x",
//                      arp_header->arp_tha[0], arp_header->arp_tha[1], arp_header->arp_tha[2],
//                      arp_header->arp_tha[3], arp_header->arp_tha[4], arp_header->arp_tha[5]);
//             // Print or save the ARP conversation details
//             printf("ARP %s - %s, Source MAC: %s, Dest MAC: %s\n", src_ip, dest_ip, src_mac, dest_mac);
//         }
//     }
// }

// int main() {
//     char errbuf[PCAP_ERRBUF_SIZE];
//     pcap_t *handle;

//     // Open the network interface for packet capture
//     handle = pcap_open_live("your_network_interface", BUFSIZ, 1, 1000, errbuf);
//     if (handle == NULL) {
//         fprintf(stderr, "Couldn't open device %s: %s\n", "your_network_interface", errbuf);
//         return 2;
//     }

//     // Set a filter for ARP packets
//     struct bpf_program fp;
//     char filter_exp[] = "arp";
//     if (pcap_compile(handle, &fp, filter_exp, 0, PCAP_NETMASK_UNKNOWN) == -1) {
//         fprintf(stderr, "Couldn't parse filter %s: %s\n", filter_exp, pcap_geterr(handle));
//         return 2;
//     }
//     if (pcap_setfilter(handle, &fp) == -1) {
//         fprintf(stderr, "Couldn't install filter %s: %s\n", filter_exp, pcap_geterr(handle));
//         return 2;
//     }

//     // Start capturing packets
//     pcap_loop(handle, 0, packet_handler, NULL);

//     // Close the capture handle
//     pcap_close(handle);

//     return 0;
// }
