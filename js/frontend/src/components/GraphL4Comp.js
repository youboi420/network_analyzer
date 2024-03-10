import { AppBar, Dialog, IconButton, Toolbar, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import React from 'react'
import Transion from '@mui/material/Slide'
import CloseIcon from '@mui/icons-material/Close'
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css';
import TestChartComp from "./TestChart"

import * as analyze_service from '../services/analyze_service'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Transion direction="up" ref={ref} {...props} />
})

const GraphL4Comp = ( { isOpen, onCloseCallBack, fileData, jsonData, fetchingStatus, l4Mode, conv_count } ) => {
  let title = l4Mode === analyze_service.l4MODES.TCP ? `Protocol: ${analyze_service.l4MODES.TCP}` : l4Mode === analyze_service.l4MODES.UDP ? `Protocol: ${analyze_service.l4MODES.UDP}` : `Both protocol's`
  let conversations
  let conversationsPointsData
  let xDataPoints = []
  let yDataPoints = []
  
  const totalPages = jsonData?.l4_conversations?.length
  if (totalPages === 0) console.log("FAILED...");
  
  if (jsonData?.l4_conversations) {
    conversations = jsonData?.l4_conversations[0]
    if (conversations?.packets_data) {
      for (let index = 0; index < conversations.packets_data.length; index++) {
        const element = conversations.packets_data[index];
        const p = { x: element.time_stamp_date_js, rltvX: element.time_stamp_rltv, y: element.size_in_bytes }
        // xDataPoints.push(new Date(p.x))
        xDataPoints.push(p.rltvX)
        yDataPoints.push(p.y)
        console.log(p);
      }
    } else {
      
    }
  }
  console.log("x axis:",xDataPoints, "y axis:",yDataPoints);
  return (
    <React.Fragment>
      <Dialog
        fullScreen
        TransitionComponent={Transition} 
        open={isOpen}
        onAbort={onCloseCallBack}
        onClose={onCloseCallBack}
        PaperProps={{
          sx: {
            backgroundColor: '#EEEEEE',
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
          <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >{title}</h1>
          <TestChartComp xDataPoints={xDataPoints} yDataPoints={yDataPoints}/>
          {
            (conv_count === 0 || conv_count === undefined ) &&
            <h2 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className={AnalyzePanelViewStyle.data_title} >
              No valid data provided in your file...
            </h2>
          }
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default GraphL4Comp