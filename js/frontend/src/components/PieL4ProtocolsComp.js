import React from 'react';
import ReactApexChart from 'react-apexcharts';

class PieL4ProtocolsComp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [props.tcpConversations, props.udpConversations],
      options: {
        toolbar: {
          tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
          }
      },
        title: {
          text: 'Conversation distribution by type',
          align: 'center',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
          }
        },
        chart: {
          type: 'pie',
        },
        labels: ['TCP', 'UDP'],
        colors: ['#008FFB', '#FF4560'],
      },
    };
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width={380} />
      </div>
    );
  }
}

export default PieL4ProtocolsComp;
