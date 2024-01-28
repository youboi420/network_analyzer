# Network analyzer - by yair elad

- the project is to create a helpfull tool to automate and shorten the investiagtion of a network pcap record. that includes general info, tcp exceptions, ddos detections, mitm detection, and more.

## installation
[gcc](https://gcc.gnu.org/install/)
- use your unix based package manager and install these lib's
```sh
sudo (your-package-manager) install libjson-c-dev
sudo (your-package-manager) install libpcap-dev
# example: sudo apt install libjson-c-dev 
# example: sudo apt install libpcap-dev 
```
[make - windows](https://gnuwin32.sourceforge.net/packages/make.htm)


installation in unix based system's
```
sudo apt install make
```
## Current Usage (for main alg...)
go to the PoC directory and run the following commands
```sh
cd c_files/PoC
make conv
./build/conv <your-pcap-file.pcap> <your-output.json>
# example: ./build/conv pcap_files/ddos_captures/mitm_arp.pcap out/mitm.json
```