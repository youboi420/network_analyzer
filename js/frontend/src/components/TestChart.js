import React from 'react';
import ReactApexChart from 'react-apexcharts';

class TestCharComp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'XYZ MOTORS',
        // color: '#B6EADA',
        color: '#b5d1e8',
        // color: "black",
        data: this.props.xDataPoints?.map((x, index) => [x, this.props.yDataPoints[index]])
        // data: [
        //   [new Date('2024-02-01').getTime(), 30],
        //   [new Date('2024-02-02').getTime(), 40],
        //   [new Date('2024-02-03').getTime(), 35],
        //   [new Date('2024-02-04').getTime(), 50],
        //   [new Date('2024-02-05').getTime(), 49],
        //   [new Date('2024-02-06').getTime(), 60],
        //   [new Date('2024-02-07').getTime(), 70],
        //   [new Date('2024-02-08').getTime(), 91],
        //   [new Date('2024-02-09').getTime(), 125]
        // ]
      }],
      options: {
        chart: {
          type: 'area',
          stacked: false,
          height: 350,
          zoom: {
            type: 'x',
            enabled: true,
            autoScaleYaxis: true
          },
          toolbar: {
            autoSelected: 'zoom'
          },
        },
        dataLabels: {
          enabled: false
        },
        markers: {
          size: 0,
        },
        // title: {
        //   text: 'Stock Price Movement',
        //   align: 'left'
        // },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 90, 100]
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return (val / 1000000).toFixed(0);
            },
          },
          title: {
            text: 'Size in bytes',
            textSize: 200
          },
        },
        xaxis: {
          type: 'datetime',
        },
        tooltip: {
          shared: false,
          y: {
            formatter: function (val) {
              return (val / 1000000).toFixed(0)
            }
          }
        }
      }
    };
  }

  render() {
    return (
      <div style={{ position: 'relative', zIndex: '1' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: "white"/*"#005a89" || "#03001C" */ ,backdropFilter: 'blur(10px)' }}></div>
          <ReactApexChart options={this.state.options} series={this.state.series} type="area" height={350} />
      </div>
    );
  }
}

export default TestCharComp;