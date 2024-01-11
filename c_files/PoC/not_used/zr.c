#include <stdio.h>
#include <pcap.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>

int count = 0;

void packet_handler(unsigned char *user_data, const struct pcap_pkthdr *pkthdr, const unsigned char *packet) {
    struct ip *ip_header = (struct ip *)(packet + 14); // Assuming Ethernet frames
    struct tcphdr *tcp_header = (struct tcphdr *)(packet + 14 + (ip_header->ip_hl << 2));
    count++;
    printf("(%i)PROTOCOL: %i\n", count, ip_header->ip_p);
    // Check if it's a TCP packet
    if (ip_header->ip_p == IPPROTO_TCP) {
        // Check if the TCP window size is zero
        if (tcp_header->th_win == 0) {
            printf("Zero window detected in packet with sequence number %u\n", ntohl(tcp_header->th_seq));
        }
    }
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s <pcap_file>\n", argv[0]);
        return 1;
    }

    char errbuf[PCAP_ERRBUF_SIZE];
    pcap_t *handle = pcap_open_offline(argv[1], errbuf);

    if (handle == NULL) {
        fprintf(stderr, "Error opening pcap file: %s\n", errbuf);
        return 1;
    }

    if (pcap_loop(handle, 0, packet_handler, NULL) < 0) {
        return 1;
        fprintf(stderr, "Error in pcap_loop: %s\n", pcap_geterr(handle));
    }

    pcap_close(handle);

    return 0;
}