#define okay(msg, ...) printf("[+] " msg "\n", ##__VA_ARGS__)
#define info(msg, ...) printf("[i] INFO: " msg "\n", ##__VA_ARGS__)
#define warn(msg, ...) printf("[!] " msg "\n", ##__VA_ARGS__)
#define error(msg, ...)printf("[-] " msg "\n", ##__VA_ARGS__)

/* for colored output */
#define BLACK_FG  "\033[0;30m"
#define RED_FG    "\033[0;31m"
#define GREEN_FG  "\033[0;32m"
#define YELLOW_FG "\033[0;33m"
#define BLUE_FG   "\033[0;34m"
#define PURPLE_FG "\033[0;35m"
#define CYAN_FG   "\033[0;36m"
#define WHITE_FG  "\033[0;37m"
#define RESET_FG  "\033[0m"
#define BLACK_BG  "\033[1;40m"
#define RED_BG    "\033[1;41m"
#define GREEN_BG  "\033[1;42m"
#define YELLOW_BG "\033[1;43m"
#define MAX_STR_LEN 256