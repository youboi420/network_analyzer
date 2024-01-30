// // #include <stdio.h>
// // #include <pcap.h>
// // #include <netinet/if_ether.h>

// // void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet) {
// //     struct ether_header *eth_header = (struct ether_header *)packet;

// //     if (ntohs(eth_header->ether_type) == ETHERTYPE_ARP) {
// //         // Extract ARP information
// //         unsigned short ar_op = ntohs(*(unsigned short *)(packet + ETHER_HDR_LEN + 6));
// //         if (ar_op == ARPOP_REQUEST || ar_op == ARPOP_REPLY) {
// //             char src_ip[INET_ADDRSTRLEN];
// //             char dest_ip[INET_ADDRSTRLEN];
// //             char src_mac[ETHER_ADDR_LEN];
// //             char dest_mac[ETHER_ADDR_LEN];

// //             struct ether_arp *arp_header = (struct ether_arp *)(packet + ETHER_HDR_LEN);
// //             // Convert IP addresses to strings
// //             inet_ntop(AF_INET, arp_header->arp_spa, src_ip, sizeof(src_ip));
// //             inet_ntop(AF_INET, arp_header->arp_tpa, dest_ip, sizeof(dest_ip));
// //             // Convert MAC addresses to strings
// //             snprintf(src_mac, sizeof(src_mac), "%02x:%02x:%02x:%02x:%02x:%02x",
// //                      arp_header->arp_sha[0], arp_header->arp_sha[1], arp_header->arp_sha[2],
// //                      arp_header->arp_sha[3], arp_header->arp_sha[4], arp_header->arp_sha[5]);
// //             snprintf(dest_mac, sizeof(dest_mac), "%02x:%02x:%02x:%02x:%02x:%02x",
// //                      arp_header->arp_tha[0], arp_header->arp_tha[1], arp_header->arp_tha[2],
// //                      arp_header->arp_tha[3], arp_header->arp_tha[4], arp_header->arp_tha[5]);
// //             // Print or save the ARP conversation details
// //             printf("ARP %s - %s, Source MAC: %s, Dest MAC: %s\n", src_ip, dest_ip, src_mac, dest_mac);
// //         }
// //     }
// // }

// // int main() {
// //     char errbuf[PCAP_ERRBUF_SIZE];
// //     pcap_t *handle;

// //     // Open the network interface for packet capture
// //     handle = pcap_open_live("your_network_interface", BUFSIZ, 1, 1000, errbuf);
// //     if (handle == NULL) {
// //         fprintf(stderr, "Couldn't open device %s: %s\n", "your_network_interface", errbuf);
// //         return 2;
// //     }

// //     // Set a filter for ARP packets
// //     struct bpf_program fp;
// //     char filter_exp[] = "arp";
// //     if (pcap_compile(handle, &fp, filter_exp, 0, PCAP_NETMASK_UNKNOWN) == -1) {
// //         fprintf(stderr, "Couldn't parse filter %s: %s\n", filter_exp, pcap_geterr(handle));
// //         return 2;
// //     }
// //     if (pcap_setfilter(handle, &fp) == -1) {
// //         fprintf(stderr, "Couldn't install filter %s: %s\n", filter_exp, pcap_geterr(handle));
// //         return 2;
// //     }

// //     // Start capturing packets
// //     pcap_loop(handle, 0, packet_handler, NULL);

// //     // Close the capture handle
// //     pcap_close(handle);

// //     return 0;
// // }


// #include <stdio.h>
// #include <stdlib.h>
// #include <string.h>
// #include <pcap.h>
// #include <netinet/if_ether.h>
// #include <netinet/ip.h>
// #include <netinet/tcp.h>
// #include <netinet/udp.h>
// #include <netinet/in.h>
// #include <netinet/ip_icmp.h>

// #define MAX_ARP_ENTRIES 100

// // Structure to store ARP entries
// struct ARPEntry {
//     char ip[INET_ADDRSTRLEN];
//     char mac[ETH_ALEN];
// };

// struct ARPEntry arpEntries[MAX_ARP_ENTRIES];
// int counter = 0;
// // Function to detect ARP spoofing
// void detectArpSpoofing(const u_char *packet, struct pcap_pkthdr pkthdr) {
//     struct ether_header *ethHeader = (struct ether_header *)packet;
//     printf("INFO: %i\n", counter);
//     counter++;
//     // Check if it's an ARP packet
//     if (ntohs(ethHeader->ether_type) == ETHERTYPE_ARP) {
//         printf("MAC PACKET\n");
//         struct ether_arp *arpHeader = (struct ether_arp *)(packet + sizeof(struct ether_header));

//         char srcIP[INET_ADDRSTRLEN];
//         inet_ntop(AF_INET, arpHeader->arp_spa, srcIP, INET_ADDRSTRLEN);

//         char srcMAC[ETH_ALEN];
//         snprintf(srcMAC, sizeof(srcMAC), "%02x:%02x:%02x:%02x:%02x:%02x", arpHeader->arp_sha[0], arpHeader->arp_sha[1], arpHeader->arp_sha[2], arpHeader->arp_sha[3], arpHeader->arp_sha[4], arpHeader->arp_sha[5]);

//         // Check for ARP spoofing
//         for (int i = 0; i < MAX_ARP_ENTRIES; ++i) {
//             if (strcmp(arpEntries[i].ip, srcIP) != 0) {
//                 // New entry, store it
//                 strcpy(arpEntries[i].ip, srcIP);
//                 strcpy(arpEntries[i].mac, srcMAC);
//                 break;
//             } else if (strcmp(arpEntries[i].mac, srcMAC) != 0) {
//                 // Potential ARP spoofing detected
//                 printf("Potential ARP spoofing detected for IP: %s. Old MAC: %s, New MAC: %s\n", arpEntries[i].ip, arpEntries[i].mac, srcMAC);
//                 break;
//             }
//         }
//     }
// }

// int main(int argc, char *argv[]) {
//     if (argc != 2) {
//         fprintf(stderr, "Usage: %s <pcap_file>\n", argv[0]);
//         return EXIT_FAILURE;
//     }

//     // Open the pcap file
//     pcap_t *handle;
//     char errbuf[PCAP_ERRBUF_SIZE];

//     handle = pcap_open_offline(argv[1], errbuf);
//     if (handle == NULL) {
//         fprintf(stderr, "Could not open pcap file '%s': %s\n", argv[1], errbuf);
//         return EXIT_FAILURE;
//     }

//     // Loop through packets
//     struct pcap_pkthdr pkthdr;
//     const u_char *packet;

//     while ((packet = pcap_next(handle, &pkthdr)) != NULL) {
//         detectArpSpoofing(packet, pkthdr);
//     }

//     // Close the pcap file
//     pcap_close(handle);

//     return EXIT_SUCCESS;
// }
