import React from 'react';
import ReactApexChart from 'react-apexcharts';

class L4TopHosts extends React.Component {
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
          text: 'Number of packets sent in the record',
          align: 'center',
        }, 
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
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
    
    let packetsFromAToB = conversation.packets_from_a_to_b || 0;
    let packetsFromBToA = conversation.packets_from_b_to_a || 0;

    if (sourceHost === conversation.source_ip) {
      hostsMap[sourceHost] = (hostsMap[sourceHost] || 0) + packetsFromAToB;
    } else {
      hostsMap[sourceHost] = (hostsMap[sourceHost] || 0) + packetsFromBToA;
    }
    if (destinationHost === conversation.destination_ip) {
      hostsMap[destinationHost] = (hostsMap[destinationHost] || 0) + packetsFromBToA;
    } else {
      hostsMap[destinationHost] = (hostsMap[destinationHost] || 0) + packetsFromAToB;
    }
  });

  let hostsArray = [];
  for (let host in hostsMap) {
    hostsArray.push({ host, packets: hostsMap[host] });
  }
  hostsArray.sort((a, b) => b.packets - a.packets);

  const topFiveHosts = hostsArray.slice(0, 5);

  let categories = [];
  let seriesData = [];
  topFiveHosts.forEach(item => {
    categories.push(item.host);
    seriesData.push(item.packets);
  });

  this.setState({
    series: [
      {
        name: 'Packets sent',
        data: seriesData,
      },
    ],
    options: {
      ...this.state.options,
      xaxis: {
        categories: categories,
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
          type="bar"
          height={this.props.height}
          width={this.props.width}
        />
      </div>
    );
  }
}

export default L4TopHosts;