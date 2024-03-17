import React from 'react';
import ReactApexChart from 'react-apexcharts';

class L2TimePacketChartComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: [
        {
          name: "ARP Requests",
          data: this.mapDataPoints(this.props.reqXDataPoints, this.props.reqYDataPoints)
        },
        {
          color: "#FF4560",
          name: "ARP Responses",
          data: this.mapDataPoints(this.props.resXDataPoints, this.props.resYDataPoints)
        }
      ],
      options: {
        stroke: {
          curve: 'stepline',
        },
        chart: {
          type: 'line',
          stacked: false,
          height: 350,
          zoom: {
            type: 'xy',
            enabled: true,
            autoScaleYaxis: true,
            autoScaleXaxis: true
          },
          toolbar: {
            autoSelected: 'zoom'
          },
        },
        dataLabels: {
          enabled: false
        },
        markers: {
          size: 5,
        },
        title: {
          text: 'Packet size as a function of time.',
          align: 'center'
        },
        fill: {
          type: 'solid',
          gradient: {
            color: "red",
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.40,
            opacityTo: 0,
            stops: [0, 90, 100]
          },
        },
        yaxis: {
          min: 0,
          labels: {
            formatter: function (val) {
              return Number(val);
            },
          },
          title: {
            text: 'Size in bytes',
          },
          axisTicks: {
            show: true,
          },
          scrollbar: {
            enabled: true,
          },
        },
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeUTC: false,
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM',
              hour: 'HH:mm:ss',
              minute: 'HH:mm:ss',
              second: 'HH:mm:ss',
            }
          },
          // range: 'millisecond'
        },
        tooltip: {
          shared: true,
          y: {
            formatter: function (val) {
              return val;
            }
          },
          x: {
            formatter: function (val) {
              const packetTime = new Date(val);
              const options = { hour12: false };
              const formattedTime = packetTime.toLocaleString(undefined, { ...options, milliseconds: 'numeric' });
              return `Packet Time: ${formattedTime}`;
            }
          },
          style: {
            fontSize: '14px',
            fontFamily: 'monospace',
            padding: '4px',
          }
        }
      }
    };
  }

  mapDataPoints(xDataPoints, yDataPoints) {
    return xDataPoints.map((x, index) => ({
      x: x.getTime(),
      y: yDataPoints[index] /* === 1 ? 100 : -100 */
    }));
  }

  render() {
    return (
      <div style={{ position: 'relative', zIndex: '1', height: this.props.height, width: this.props.width }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: "white", backdropFilter: 'blur(10px)' }}></div>
        <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={this.props.height} />
      </div>
    );
  }
}

export default L2TimePacketChartComp;