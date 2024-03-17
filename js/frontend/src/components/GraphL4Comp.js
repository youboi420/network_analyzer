import { AppBar, CircularProgress, Dialog, Divider, Grid, IconButton, Toolbar, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import React from 'react'
import Transion from '@mui/material/Slide'
import CloseIcon from '@mui/icons-material/Close'
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import * as analyze_service from '../services/analyze_service'
import L4TimePacketChartComp from "./L4TimePacketDataChartComp"
import PieL4ProtocolsComp from './PieL4ProtocolsComp'
import L4TopHosts from './L4TopHostsByPackets'
import L4TopHostsBySize from './L4TopHostsBySize'
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Transion direction="up" ref={ref} {...props} />
})

const GraphL4Comp = ({ isOpen, onCloseCallBack, fileData, jsonData, fetchingStatus, conv_count }) => {
  const [convIndex, setConvIndex] = React.useState(0);
  const [chartData, setChartData] = React.useState({ xDataPoints: [], yDataPoints: [] });

  React.useEffect(() => {
    if (jsonData?.l4_conversations !== undefined) {
      const conversations = jsonData?.l4_conversations[convIndex] ? jsonData?.l4_conversations[convIndex] : null;
      if (conversations?.packets_data) {
        const xDataPoints = [];
        const yDataPoints = [];
        for (let index = 0; index < conversations.packets_data.length; index++) {
          const element = conversations.packets_data[index];
          const p = { x: element.time_stamp_date_js, rltvX: element.time_stamp_rltv, y: element.size_in_bytes };
          const nope = new Date(p.x).getTime();
          xDataPoints.push(nope);
          yDataPoints.push(p.y);
        }
        setChartData({ xDataPoints, yDataPoints });
      }
    }
  }, [convIndex, jsonData]);

  const nextPage = () => {
    const numOfPages = jsonData?.l4_conversations?.length || 0;
    setConvIndex(prev => (prev + 1) % numOfPages);
  };

  const lastPage = () => {
    const numOfPages = jsonData?.l4_conversations?.length || 0;
    setConvIndex(prev => (prev - 1 + numOfPages) % numOfPages);
  };

  return (
    <div>
      <Dialog
        fullScreen
        TransitionComponent={Transition}
        open={isOpen}
        onAbort={() => { setConvIndex(0); onCloseCallBack() }}
        onClose={() => { setConvIndex(0); onCloseCallBack() }}
        PaperProps={{
          sx: {
            backgroundColor: '#EEEEEE',
            opacity: "100%",
            marginTop: "100px",
            marginRight: "50px",
            marginLeft: "50px",
          },
        }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onCloseCallBack}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: '20px' }} variant="h6" component="div">
              Layer 4 - Visual report of file{fileData?.filename ? fileData?.filename : "Somehow not selected"}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ backgroundColor: "transparent", height: "100vh" }} className={AnalyzePanelViewStyle.data_title} >
          <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >Visual representation of OSI - Layer 4</h1>
          {
            !fetchingStatus &&
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
              <CircularProgress style={{ marginTop: '300px' }} size={"100px"} />
            </div>
          }
          {
            fetchingStatus &&
            <div style={{ height: "110%" }}>
              <Grid container spacing={0} >
                <Grid item xs={12} md={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <PieL4ProtocolsComp tcpConversations={jsonData?.tcp_count} udpConversations={jsonData?.udp_count} />
                </Grid>
                <Grid item xs={12} md={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <L4TopHosts jsonData={jsonData} height={'400px'} width={'100%'} />
                </Grid>
                <Grid item xs={12} md={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <L4TopHostsBySize jsonData={jsonData} height={'350px'} width={'100%'} />
                </Grid>
              </Grid>
              <Divider orientation='horizontal' sx={{ borderWidth: "2px", marginBottom: "10px", marginRight: "calc(40% - 200px)", marginLeft: "calc(40% - 200px)", borderColor: "rgba(0, 0, 0, 0.52)" }} />
              <div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <IconButton
                    edge="start"
                    color="inherit"
                    onClick={lastPage}
                    aria-label="close"
                    sx={{ marginRight: "5px", marginBottom: "3px" }}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  {
                    jsonData?.l4_conversations &&
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}> Conversation {convIndex + 1} of {conv_count} - type: {jsonData?.l4_conversations[convIndex]?.conv_type} </div>
                  }
                  <IconButton
                    edge="start"
                    color="inherit"
                    onClick={nextPage}
                    aria-label="close"
                    sx={{ marginLeft: "5px", marginBottom: "3px" }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                <L4TimePacketChartComp key={chartData.xDataPoints} xDataPoints={chartData.xDataPoints} yDataPoints={chartData.yDataPoints} height={"420px"} width={"90%"} />
              </div>
            </div>
          }
          {
            fetchingStatus &&
            (conv_count === 0 || conv_count === undefined) &&
            <h2 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className={AnalyzePanelViewStyle.data_title} >
              No valid Layer 4 data provided in your file...
            </h2>
          }
        </div>
      </Dialog>
    </div>
  )
  // return (
  //   <div>
  //     <Dialog
  //       fullScreen
  //       TransitionComponent={Transition}
  //       open={isOpen}
  //       onAbort={() => {setConvIndex(0); onCloseCallBack()}}
  //       onClose={() => {setConvIndex(0); onCloseCallBack()}}
  //       PaperProps={{
  //         sx: {
  //           backgroundColor: '#EEEEEE',
  //           opacity: "100%",
  //           marginTop: "100px",
  //           marginRight: "50px",
  //           marginLeft: "50px",
  //         },
  //       }}
  //     >
  //       <AppBar sx={{ position: 'relative' }}>
  //         <Toolbar>
  //           <IconButton
  //             edge="start"
  //             color="inherit"
  //             onClick={onCloseCallBack}
  //             aria-label="close"
  //           >
  //             <CloseIcon />
  //           </IconButton>
  //           <Typography sx={{ ml: '20px' }} variant="h6" component="div">
  //             Layer 4 - Visual report of file{fileData?.filename ? fileData?.filename : "Somehow not selected"}
  //           </Typography>
  //         </Toolbar>
  //       </AppBar>
  //       <div style={{ backgroundColor: "transparent", height: "100vh" }} className={AnalyzePanelViewStyle.data_title} >
  //         <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >Visual representation of OSI - Layer 4</h1>
  //         {
  //           !fetchingStatus &&
  //           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
  //             <CircularProgress style={{ marginTop: '300px' }} size={"100px"} />
  //           </div>
  //         }
  //         {
  //           fetchingStatus &&
  //           <div style={{marginTop: "-20px", height: "90vh"}}>
  //             <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
  //               <IconButton
  //                 edge="start"
  //                 color="inherit"
  //                 onClick={lastPage}
  //                 aria-label="close"
  //                 sx={{ marginRight: "5px", marginBottom: "3px" }}
  //               >
  //                 <ArrowBackIosNewIcon />
  //               </IconButton>
  //               {
  //                 jsonData?.l4_conversations &&
  //                 <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}> Conversation {convIndex + 1} of {conv_count} - type: {jsonData?.l4_conversations[convIndex]?.conv_type} </div>
  //               }
  //               <IconButton
  //                 edge="start"
  //                 color="inherit"
  //                 onClick={nextPage}
  //                 aria-label="close"
  //                 sx={{ marginLeft: "5px", marginBottom: "3px" }}
  //               >
  //                 <ArrowForwardIosIcon />
  //               </IconButton>
  //             </div>
  //             <Divider orientation='horizontal' sx={{ borderWidth: "2px", marginBottom: "10px", marginRight: "calc(40% - 200px)", marginLeft: "calc(40% - 200px)" }} />
  //             <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
  //               <L4TimePacketChartComp key={chartData.xDataPoints} xDataPoints={chartData.xDataPoints} yDataPoints={chartData.yDataPoints} height={"420px"} width={"90%"} />
  //             </div>
  //             {
  //               fetchingStatus &&
  //               <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
  //                 <PieL4ProtocolsComp tcpConversations={jsonData?.tcp_count} udpConversations={jsonData?.udp_count} />
  //                 <div style={{marginTop: "200px"}}>
  //                   <L4TopHosts jsonData={jsonData} height={'400px'} width={'100%'} />
  //                 </div>
  //               </div>
  //             }
  //           </div>
  //         }
  //         {
  //           fetchingStatus &&
  //           (conv_count === 0 || conv_count === undefined) &&
  //           <h2 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className={AnalyzePanelViewStyle.data_title} >
  //             No valid data provided in your file...
  //           </h2>
  //         }
  //       </div>
  //     </Dialog>
  //   </div>
  // )
}

export default GraphL4Comp