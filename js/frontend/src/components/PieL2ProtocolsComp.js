import React from 'react';
import ReactApexChart from 'react-apexcharts';

class PieL2ProtocolsComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: [props.res, props.req],
      options: {
        title: {
          text: 'Packet distribution by type',
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }
        },
        chart: {
          type: 'pie',
        },
        labels: ['RESPONSE', 'REQUEST'],
        colors: ['#FF4560', '#008FFB'],
      },
    };
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width={450} />
      </div>
    );
  }
}

export default PieL2ProtocolsComp;
