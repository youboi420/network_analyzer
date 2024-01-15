#include <stdio.h>
#include <pcap.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>

int count = 0;

void packet_handler(unsigned char *user, const struct pcap_pkthdr *pkthdr, const unsigned char *packet) {
    struct ip *ip_header = (struct ip *)(packet + 14); // Ethernet header is 14 bytes
    struct tcphdr *tcp_header = (struct tcphdr *)(packet + 14 + (ip_header->ip_hl << 2)); // IP header length is in 4-byte words
    int total_length = ntohs(ip_header->ip_len), ip_header_length = (ip_header->ip_hl) << 2, tcp_header_length = (tcp_header->th_off) << 2, tcp_segment_length = total_length - ip_header_length - tcp_header_length;
    count++;
    // Check if it's a TCP packet
    if (ip_header->ip_p == IPPROTO_TCP) {
        // Check TCP flags and other conditions for TCP Dup ACK
        if (tcp_header->ack && tcp_header->th_seq != 0 &&
            tcp_header->th_win != 0 && tcp_header->th_urp == 0 &&
            (tcp_header->th_flags & (TH_SYN | TH_FIN | TH_RST)) == 0) {
            printf("tcp segment length: %d\n", tcp_segment_length);
            printf("TCP Dup ACK detected! Frame: %ld, Acknowledgment number: %u\n", pkthdr->ts.tv_sec, tcp_header->th_ack);
        }
    }
}

int main() {
    char errbuf[PCAP_ERRBUF_SIZE];
    pcap_t *handle; 

    // Open the pcap file
    handle = pcap_open_offline("pcap_files/my_zero.pcap", errbuf);
    if (handle == NULL) {
        fprintf(stderr, "Could not open file: %s\n", errbuf);
        return 2;
    }

    // Set a packet filter to capture only TCP ACK packets
    // struct bpf_program fp;
    // char filter_exp[] = "tcp and (tcp[tcpflags] & (tcp-ack) != 0)";
    // if (pcap_compile(handle, &fp, filter_exp, 0, PCAP_NETMASK_UNKNOWN) == -1) {
    //     fprintf(stderr, "Could not parse filter %s: %s\n", filter_exp, pcap_geterr(handle));
    //     return 2;
    // }
    // if (pcap_setfilter(handle, &fp) == -1) {
    //     fprintf(stderr, "Could not install filter %s: %s\n", filter_exp, pcap_geterr(handle));
    //     return 2;
    // }

    // Start processing packets from the file
    pcap_loop(handle, 0, packet_handler, NULL);

    // Close the pcap handle
    pcap_close(handle);
    printf("count %i\n\n", count);
    return 0;
}
