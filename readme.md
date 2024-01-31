# Network analyzer - by yair elad

- the project is to create a helpfull tool to automate and shorten the investiagtion of a network pcap record. that includes general info, tcp exceptions, ddos detections, mitm detection, and more.

## Run locally
clone the repoistory and then follow these step's
- for windows user's please use this tool using [wsl](https://learn.microsoft.com/en-us/windows/wsl/install) because it uses some linux sys and netinet libs which are built in to linux and it won't work native in window's
## installation
[gcc](https://gcc.gnu.org/install/)

or just
```
sudo apt install gcc
```
- use your unix based package manager and install these lib's
```sh
sudo (your-package-manager) install libjson-c-dev
sudo (your-package-manager) install libpcap-dev
# example: sudo apt install libjson-c-dev 
# example: sudo apt install libpcap-dev 
```

installation in unix based system's
```
sudo apt install make
```
## Current Usage (for main alg...)
Iv'e created some pcap files, to scan the program on. there's a pcap_files folder which conatains the pcap files, with ddos scan's tcp exceptions. if you want you can install [wireshark](https://www.wireshark.org/) and record your own PCAP files.

go to the PoC directory and run the following commands
```sh
cd c_files/PoC
make conv
./build/conv <your-pcap-file.pcap> <your-output.json>
# example: ./build/conv pcap_files/ddos_captures/mitm_arp.pcap out/mitm.json
```