#include <string.h>
#include <pcap.h>
#include <stdlib.h>

void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
    printf("[+] {%s} - {%s}\n", packet, user);
}

int main(int argc, char *argv[])
{
	char errbuf[PCAP_ERRBUF_SIZE], *pcap_file;
    pcap_t *handle;
    FILE *fp;
    
    if (argc != 2)
    {
        printf("Usage: %s <pcap file> \n", argv[0]);
        return EXIT_FAILURE;
    }

    if (strcmp(argv[1], ".") == 0) return EXIT_FAILURE;

    fp = fopen(argv[1], "rb");
    if (fp == NULL) return EXIT_FAILURE;
    else fclose(fp);
    
    pcap_file = argv[1];
    handle = pcap_open_offline(pcap_file, errbuf);
    pcap_loop(handle, 0, packet_handler, NULL);

    if (handle == NULL)
    {
        return EXIT_FAILURE;
    }
    pcap_close(handle);
    return EXIT_SUCCESS;
}