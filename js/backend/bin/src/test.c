#include <stdio.h>
#include <stdlib.h>

int main (void)
{
    const char filepath[] = "./bin/out/users/nope.txt";
    const char message[] = "New message...\n";
    FILE *fp = fopen(filepath, "w");
    printf("[!] this is a test\n");
    if (fp)
        fprintf(fp, "%s", message);
    else {
        printf("[-] filepath is invalid <=> failed to open the file\n");
        exit(EXIT_FAILURE);
    }
    if (fclose(fp)) printf("error closing the file\n");
	printf("Created file: %s with content: %s\n", filepath, message);
    printf("Hello world\n");
    printf("Hello world2\n");
}
