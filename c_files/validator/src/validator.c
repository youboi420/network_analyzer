#include <pcap.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
	char errbuf[PCAP_ERRBUF_SIZE], *pcap_file;
    pcap_t *handle;
    
    if (argc != 2)
    {
        printf("Usage: %s <pcap file> \n", argv[0]);
        return EXIT_FAILURE;
    }
    pcap_file = argv[1];
    handle = pcap_open_offline(pcap_file, errbuf);

    if (handle == NULL)
    {
        return EXIT_FAILURE;
    }
    pcap_close(handle);
    return EXIT_SUCCESS;
}