import React from 'react'
import ReactApexChart from 'react-apexcharts'

class L4TimePacketChartComp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      series: [{
        name: "packet size",
        // color: '#b5d1e8',
        data: this.props.xDataPoints?.map((x, index) => [x, this.props.yDataPoints[index]])
      }],
      options: {
        animations: {
          enabled: true,
          easing: 'easeinout', 
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
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
            autoSelected: 'zoom',
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
            }
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
        },
        yaxis: {
          min: 0,
          labels: {
            formatter: function (val) {
              return Number(val).toFixed(3) + " Bytes"
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
            datetimeUTC: true,
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM',
              hour: 'HH:mm:ss',
              minute: 'HH:mm:ss',
              second: 'HH:mm:ss',
              millisecond: 'FFF'
            }
          },
          // range: 'millisecond'
        },
        tooltip: {
          shared: true,
          y: {
            formatter: function (val) {
              return val
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
    }
  }


  render() {
    return (
      <div style={{ position: 'relative', zIndex: '1', height: this.props.height, width: this.props.width }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: "white", backdropFilter: 'blur(10px)' }}></div>
          <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={this.props.height} />
      </div>
    )
  }
}

export default L4TimePacketChartComp