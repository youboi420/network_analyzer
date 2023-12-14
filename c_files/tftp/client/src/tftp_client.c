#include "../includes/headers.h"
#include <netinet/in.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char const *argv[])
{
    /* code */
    char packet_to_send[PACKET_SIZE + 1] = "\0", prev_packet[PACKET_SIZE] = "\0", filename[STR_FILE_LIMIT] = "\0", mode[STR_FILE_LIMIT] = "\0", err_msg[PACKET_DATA_SIZE] = "\0", port[PORT_LEN] = "\0", ip[INET_ADDRSTRLEN + 1],  operation[PACKET_HEAD] = "\0";
	unsigned short blockno = 1, timeout_cnter = 0, potential_err, op_code = OP_END;
	struct sockaddr_in server_s, client_s;
	int packet_size = PACKET_DATA_SIZE, client_sock, flag = 1, connection, write_count = -1;
	socklen_t len;
	ssize_t n;
	FILE *file_ptr = NULL;

    /* usage ./client ip port mode file  */
    if (argc != 6)
    {
        error("Incorrect number of parameters");
        usage();
        exit_prog("");
    }

    handle_args(argv, ip, port, mode, filename, operation);

    client_sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (check_error(client_sock)) exit_prog("sock asign failed");
    
    memset(&client_s, 0, sizeof(client_s));
    server_s.sin_family = AF_INET;
    server_s.sin_addr.s_addr = inet_addr(ip);
    server_s.sin_port = htons(atoi(port));
    
    if (strcmp(operation, "get") == 0)
    {
        /* the function  initilize the first packet to send for the read request */
        prep_packet(filename, mode, packet_to_send, OP_RRQ);
        flag = sendto(client_sock, packet_to_send, sizeof(packet_to_send), 0, (struct sockaddr*)&server_s, sizeof(server_s));
        if (check_error(flag)) exit_prog("packet failed to send");
        get_local_mode(mode, OP_RRQ);
        
        

    }
    else if (strcmp(operation, "put") == 0)
    {
        /* 
            the function will verify if theres such file and if so 
            it will initilize the first packet to send
        */        
        prep_packet(filename, mode, packet_to_send, OP_WRQ);
        flag = sendto(client_sock, packet_to_send, sizeof(packet_to_send), 0, (struct sockaddr*)&server_s, sizeof(server_s));
        if (check_error(flag)) exit_prog("packet failed to send");
        
        get_local_mode(mode, OP_WRQ);
        file_ptr = open_file(filename, mode);
        if (!file_ptr) exit_prog("given file is invalid");

        while (1)
        {
            /* send file */
        }
    }
    else
    {
        exit_prog("invalid type of request");
    }
    return EXIT_SUCCESS;
}

void usage(void)
{
    printf("Usage: ./client <ip> <port> <mode> <file>\n\n");
    printf("Description:\n");
    printf("  Connects to a server using TCP/IP and performs a specified operation.\n\n");
    printf("Arguments:\n");
    printf("  <ip>      : IP address of the server.\n");
    printf("  <port>    : Port number to establish the connection.\n");
    printf("  <request> : The type of the request (put/get).\n");
    printf("  <mode>    : Operation mode (e.g., 'upload', 'download').\n");
    printf("  <file>    : File to be transferred or processed.\n\n");
    printf("Example:\n");
    printf("  ./client 192.168.1.100 8080 get ascii data.txt\n");
    printf("  ./client server.example.com 12345 put binary result.bin\n");
}

void handle_args(const char *argv[], char ip[], char port[], char mode[], char filename[], char operation[])
{
    int p = atoi(argv[2]);

    if (strlen(argv[1]) != INET_ADDRSTRLEN)
        exit_prog("invalid ip address");

    if (strlen(argv[2]) != PORT_LEN || (p < MIN_PORT || p > MAX_PORT))
        exit_prog("invalid port number");

    if (strlen(argv[3]) != PACKET_SIZE - 1)
        exit_prog("invalid mode");

    if (strcmp(argv[4], "binary") != 0 && strcmp(argv[3], "ascii") != 0) /* if mode is not binary or ascii */
        exit_prog("invalid mode");

    if (strchr(argv[5], '/') != 0)
        exit_prog("invalid file name");

    /* if these execute it means that the input is valid */
    strcpy(ip, argv[1]); /* get the port into the port array */
    strcpy(port, argv[2]); /* get the port into the port array */
    strcpy(operation, argv[3]); /* get the type of request (get/put) */
    strcpy(mode, argv[4]); /* get the the type of the file (ascii/octet) */
    strcpy(filename, argv[5]); /* get the filename */
}

void get_local_mode(char *mode, int op)
{
    if (op == OP_RRQ)
    {
        if (strcmp(mode, "ascii") == 0) strcpy(mode, "r");
        else if (strcmp(mode, "binary") == 0) strcpy(mode, "rb");
    }
    else if (op == OP_WRQ) 
    {
        if (strcmp(mode, "ascii") == 0) strcpy(mode, "w");
        else if (strcmp(mode, "binary") == 0) strcpy(mode, "wb");
    }
}

int prep_packet(char *filename, char *mode, char *packet_ts, int op)
{
    int i = 0;

    packet_ts[i++] = 0;
    packet_ts[i++] = op;
    // strcpy filename to packet
    strcpy(packet_ts + i, filename);
    i += strlen(filename) + 1;
    // strcpy mode to packet_ts
    strcpy(packet_ts + i, mode);
    i += strlen(mode) + 1;
    // null termination
    packet_ts[i++] = '\0';
    return i;
}