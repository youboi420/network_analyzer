import React from 'react';
import ReactApexChart from 'react-apexcharts';

class L4TopHostsBySize extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: [],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '45%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        title: {
          text: 'Heatmap of packet size in bytes',
          align: 'center',
        }, 
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
            text: "Bytes count"
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val;
            },
          },
        },
      },
    };
  }

  componentDidMount() {
    this.generateChartData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.jsonData !== this.props.jsonData) {
      this.generateChartData();
    }
  }

  generateChartData = () => {
    const { jsonData } = this.props;
    const conversations = jsonData?.l4_conversations || [];
    let hostsMap = {};
  
    conversations.forEach(conversation => {
      const sourceHost = conversation.source_ip;
      const destinationHost = conversation.destination_ip;
  
      let sizeFromAToB = 0;
      let sizeFromBToA = 0;
  
      conversation.packets_data.forEach(packet => {
        if (packet.from === sourceHost) {
          sizeFromAToB += packet.size_in_bytes;
        } else {
          sizeFromBToA += packet.size_in_bytes;
        }
      });
  
      hostsMap[sourceHost] = (hostsMap[sourceHost] || 0) + sizeFromAToB;
      hostsMap[destinationHost] = (hostsMap[destinationHost] || 0) + sizeFromBToA;
    });
  
    let hostsArray = [];
    for (let host in hostsMap) {
      hostsArray.push({ host, size: hostsMap[host] });
    }
    hostsArray.sort((a, b) => b.size - a.size);
  
    const topFiveHosts = hostsArray.slice(0, 5);
  
    let categories = [];
    let seriesData = [];
    topFiveHosts.forEach(item => {
      categories.push(item.host);
      seriesData.push(item.size);
    });
  
    this.setState({
      series: [
        {
          name: ' ',
          data: seriesData,
        },
      ],
      options: {
        ...this.state.options,
        xaxis: {
          categories: categories,
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
      },
    });
  };
  
  
  render() {
    return (
      <div >
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="heatmap"
          height={this.props.height}
          width={this.props.width}
        />
      </div>
    );
  }
}

export default L4TopHostsBySize;