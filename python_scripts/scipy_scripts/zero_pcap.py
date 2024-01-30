from scapy.all import IP, TCP, wrpcap

def create_tcp_conversation_with_zero_window():
    src_ip = "192.168.1.1"
    dst_ip = "192.168.1.2"
    syn_packet = IP(src=src_ip, dst=dst_ip) / TCP(dport=80, flags="S", seq=1000)
    syn_ack_packet = IP(src=dst_ip, dst=src_ip) / TCP(sport=80, dport=syn_packet[TCP].sport, flags="SA", seq=2000, ack=syn_packet[TCP].seq + 1)
    zero_window_packet = IP(src=src_ip, dst=dst_ip) / TCP(sport=syn_packet[TCP].sport, dport=syn_packet[TCP].dport, flags="A", seq=syn_ack_packet[TCP].ack, ack=syn_packet[TCP].seq + 1, window=0)
    wrpcap("tcp_conversation_with_zero_window.pcap", [syn_packet, syn_ack_packet, zero_window_packet])

if __name__ == "__main__":
    create_tcp_conversation_with_zero_window()