import { AppBar, CircularProgress, Dialog, IconButton, Toolbar, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import React from 'react'
import Transion from '@mui/material/Slide'
import CloseIcon from '@mui/icons-material/Close'
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'

import * as analyze_service from '../services/analyze_service'
import PieL4ProtocolsComp from './PieL4ProtocolsComp'
import PieL2ProtocolsComp from './PieL2ProtocolsComp'
import L2TimePacketChartComp from './L2TimePacketDataChartComp'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Transion direction="up" ref={ref} {...props} />
})

const GraphL2Comp = ( { isOpen, onCloseCallBack, fileData, jsonData, fetchingStatus, conv_count } ) => {
  let title = "Visual representation of OSI - Layer 2: ARP Protocol"
  let arpRESCount = 0
  let arpREQCount = 0
  const reqXDataPoints = []
  const reqYDataPoints = []
  const resXDataPoints = []
  const resYDataPoints = []

  const lenOfArr = jsonData?.L2_conversations?.length

  jsonData?.L2_conversations?.forEach(conversation => {
    conversation["packets_data"].forEach(packet => {
      if (packet["type"] === "REQ") {
        reqYDataPoints.push(1)
        reqXDataPoints.push(new Date(packet["time_stamp_date_js"]))
        arpREQCount++;
      } else if (packet["type"] === "RES") {
        arpRESCount++;
        resYDataPoints.push(0)
        resXDataPoints.push(new Date(packet["time_stamp_date_js"]))
      }
    });
  });
  
  const totalPages = jsonData?.L2_conversations?.length

  return (
    <div>
      <Dialog
        fullScreen
        TransitionComponent={Transition} 
        open={isOpen}
        onAbort={onCloseCallBack}
        onClose={onCloseCallBack}
        PaperProps={{
          sx: {
            backgroundColor: '#EEEEEE',
            opacity: "100%",
            marginTop: "100px",
            marginRight: "100px",
            marginLeft: "100px",
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
            Layer 2 - Visual report of file: {fileData?.filename ? fileData?.filename : "Somehow not selected"}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ backgroundColor: "transparent", height: "100vh" }} className={AnalyzePanelViewStyle.data_title} >
          <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >{title}</h1>
          {
            !fetchingStatus &&
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
              <CircularProgress style={{ marginTop: '300px' }} size={"100px"} />
            </div>
          }
          {
            fetchingStatus &&
            !((arpRESCount === 0 || arpRESCount === undefined ) ||  (arpREQCount === 0 || arpREQCount === undefined )) &&
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
              <L2TimePacketChartComp reqXDataPoints={reqXDataPoints} reqYDataPoints={reqYDataPoints} resXDataPoints={resXDataPoints} resYDataPoints={resYDataPoints} height={"200%"} width={"100%"}/>
            </div>
          }
          {
            fetchingStatus &&
            !((arpRESCount === 0 || arpRESCount === undefined ) ||  (arpREQCount === 0 || arpREQCount === undefined )) &&
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px"}}>
              <PieL2ProtocolsComp res={arpRESCount} req={arpREQCount}/>
            </div>
          }

          {
            fetchingStatus && lenOfArr === 0 && 
            <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: "calc(20%)" }} className={AnalyzePanelViewStyle.data_title} >
              Arp conversations didn't accour
            </h1>
          }
          {
            fetchingStatus && lenOfArr !== 0 && 
            ((arpRESCount === 0 || arpRESCount === undefined ) ||  (arpREQCount === 0 || arpREQCount === undefined )) &&
            <h2 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className={AnalyzePanelViewStyle.data_title} >
              No valid Layer 2 data provided in your file...
            </h2>
          }
        </div>
      </Dialog>
    </div>
  )
}

export default GraphL2Comp