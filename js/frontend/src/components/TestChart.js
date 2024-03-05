// // // // import React from 'react';
// // // // import ReactApexChart from 'react-apexcharts';

// // // // class TestCharComp extends React.Component {
// // // //   constructor(props) {
// // // //     super(props);

// // // //     this.state = {
// // // //       series: [{
// // // //         name: 'XYZ MOTORS',
// // // //         // color: '#B6EADA',
// // // //         // color: '#b5d1e8',
// // // //         color: "white",
// // // //         data: [
// // // //           [new Date('2024-02-01').getTime(), 30],
// // // //           [new Date('2024-02-02').getTime(), 40],
// // // //           [new Date('2024-02-03').getTime(), 35],
// // // //           [new Date('2024-02-04').getTime(), 50],
// // // //           [new Date('2024-02-05').getTime(), 49],
// // // //           [new Date('2024-02-06').getTime(), 60],
// // // //           [new Date('2024-02-07').getTime(), 70],
// // // //           [new Date('2024-02-08').getTime(), 91],
// // // //           [new Date('2024-02-09').getTime(), 125]
// // // //         ]
// // // //       }],
// // // //       options: {
// // // //         chart: {
// // // //           type: 'area',
// // // //           stacked: false,
// // // //           height: 350,
// // // //           zoom: {
// // // //             type: 'x',
// // // //             enabled: true,
// // // //             autoScaleYaxis: true
// // // //           },
// // // //           toolbar: {
// // // //             autoSelected: 'zoom'
// // // //           },
// // // //         },
// // // //         dataLabels: {
// // // //           enabled: false
// // // //         },
// // // //         markers: {
// // // //           size: 0,
// // // //         },
// // // //         title: {
// // // //           text: 'Stock Price Movement',
// // // //           align: 'left'
// // // //         },
// // // //         fill: {
// // // //           type: 'gradient',
// // // //           gradient: {
// // // //             shadeIntensity: 1,
// // // //             inverseColors: false,
// // // //             opacityFrom: 0.5,
// // // //             opacityTo: 0,
// // // //             stops: [0, 90, 100]
// // // //           },
// // // //         },
// // // //         yaxis: {
// // // //           labels: {
// // // //             formatter: function (val) {
// // // //               return (val / 1000000).toFixed(0);
// // // //             },
// // // //           },
// // // //           title: {
// // // //             text: 'Price'
// // // //           },
// // // //         },
// // // //         xaxis: {
// // // //           type: 'datetime',
// // // //         },
// // // //         tooltip: {
// // // //           shared: false,
// // // //           y: {
// // // //             formatter: function (val) {
// // // //               return (val / 1000000).toFixed(0)
// // // //             }
// // // //           }
// // // //         }
// // // //       }
// // // //     };
// // // //   }

// // // //   render() {
// // // //     return (
// // // //       <div style={{ position: 'relative', zIndex: '1' }}>
// // // //         <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: "black"/*"#005a89" || "#03001C" */ ,backdropFilter: 'blur(10px)' }}></div>
// // // //           <ReactApexChart options={this.state.options} series={this.state.series} type="area" height={350} />
// // // //       </div>

// // // //       // <div>
// // // //       //   <div id="chart">

// // // //       //   </div>
// // // //       // </div>
// // // //     );
// // // //   }
// // // // }

// // // // export default TestCharComp;

// // // import React, { useState, useEffect } from 'react';
// // // import ReactApexChart from 'react-apexcharts';
// // // import * as user_service from '../services/user_service'

// // // const YourComponent = () => {
// // //   const [data, setData] = useState(null);
// // //   const [error, setError] = useState(null);

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       try {
// // //         const response = await user_service.getJsonData();
// // //         setData(response.data.L2_coversations);
// // //       } catch (error) {
// // //         setError(error);
// // //       }
// // //     };

// // //     fetchData();
// // //   }, []);

// // //   if (error) {
// // //     return <div>Error: {error.message}</div>;
// // //   }

// // //   if (!data) {
// // //     return <div>Loading...</div>;
// // //   }

// // //   const options = {
// // //     chart: {
// // //       type: 'line',
// // //       height: 350,
// // //       zoom: {
// // //         type: 'x',
// // //         enabled: true,
// // //       },
// // //     },
// // //     xaxis: {
// // //       type: 'numeric',
// // //     },
// // //   };

// // //   const series = data.map(conversation => ({
// // //     name: `Conversation ${conversation.conv_id}`,
// // //     data: conversation.packets_data.map(packet => ({
// // //       x: packet.time_stamp_rltv,
// // //       y: 1, // Value for the y-axis, can be any constant or derived from your data
// // //     })),
// // //   }));

// // //   return (
// // //     <div>
// // //       <ReactApexChart options={options} series={series} type="line" height={350} />
// // //     </div>
// // //   );
// // // };

// // // export default YourComponent;


// // import React, { useState, useEffect } from 'react';
// // import ReactApexChart from 'react-apexcharts';
// // import * as user_service from '../services/user_service';

// // const YourComponent = () => {
// //   const [data, setData] = useState(null);
// //   const [error, setError] = useState(null);
// //   const [maxPackets, setMaxPackets] = useState(0); // State to hold the maximum number of packets

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const response = await user_service.getJsonData();
// //         setData(response.data.L2_coversations);
// //         setMaxPackets(findMaxPackets(response.data.L2_coversations)); // Calculate maximum packets
// //       } catch (error) {
// //         setError(error);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   const findMaxPackets = (conversations) => {
// //     let max = 0;
// //     conversations.forEach(conversation => {
// //       if (conversation.packets > max) {
// //         max = conversation.packets;
// //       }
// //     });
// //     return max;
// //   };

// //   if (error) {
// //     return <div>Error: {error.message}</div>;
// //   }

// //   if (!data) {
// //     return <div>Loading...</div>;
// //   }

// //   const options = {
// //     chart: {
// //       type: 'line',
// //       height: 350,
// //       zoom: {
// //         type: 'x',
// //         enabled: true,
// //       },
// //     },
// //     xaxis: {
// //       type: 'numeric',
// //     },
// //     yaxis: {
// //       max: maxPackets, // Set the maximum y-axis value to the maximum number of packets
// //     },
// //   };

// //   const series = data.map(conversation => ({
// //     name: `Conversation ${conversation.conv_id}`,
// //     data: conversation.packets_data.map(packet => ({
// //       x: packet.time_stamp_rltv,
// //       y: conversation.packets, // Set y-axis value to the number of packets in the conversation
// //     })),
// //   }));

// //   return (
// //     <div>
// //       <ReactApexChart options={options} series={series} type="line" height={350} />
// //     </div>
// //   );
// // };

// // export default YourComponent;


// import React, { useState, useEffect } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import * as user_service from '../services/user_service';

// const YourComponent = () => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [maxPackets, setMaxPackets] = useState(0); // State to hold the maximum number of packets

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await user_service.getJsonData();
//         setData(response.data.conversations);
//         setMaxPackets(findMaxPackets(response.data.conversations)); // Calculate maximum packets
//       } catch (error) {
//         setError(error);
//       }
//     };

//     fetchData();
//   }, []);

//   const findMaxPackets = (conversations) => {
//     let max = 0;
//     conversations.forEach(conversation => {
//       const totalPackets = conversation.packets_from_a_to_b + conversation.packets_from_b_to_a;
//       if (totalPackets > max) {
//         max = totalPackets;
//       }
//     });
//     return max;
//   };

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   if (!data) {
//     return <div>Loading...</div>;
//   }

//   const options = {
//     chart: {
//       type: 'line',
//       height: 350,
//       zoom: {
//         type: 'x',
//         enabled: true,
//       },
//     },
//     xaxis: {
//       type: 'numeric',
//     },
//     yaxis: {
//       max: maxPackets, // Set the maximum y-axis value to the maximum number of packets
//     },
//   };

//   const series = data.map(conversation => ({
//     name: `Conversation ${conversation.conv_id}`,
//     data: [{
//       x: conversation.conv_id,
//       y: conversation.packets_from_a_to_b + conversation.packets_from_b_to_a, // Calculate total packets
//     }],
//   }));

//   return (
//     <div>
//       <ReactApexChart options={options} series={series} type="line" height={350} />
//     </div>
//   );
// };

// export default YourComponent;