import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Transion from '@mui/material/Slide'
import { Box, Button, CircularProgress, Stack, Switch } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { L4_DATA_TYPES } from './L4Common'
import * as analyze_service from '../services/analyze_service'
import CustomReactJson from './CustomReactJson'
import L4ConvPanel from './L4ConvComp'
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Transion direction="up" ref={ref} {...props} />
})

const bothPanel = (tcpConversationDetails, udpConversationDetails) => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center'}}>
      <L4ConvPanel convsDataArray={tcpConversationDetails} singleMode={false} proType={L4_DATA_TYPES.TCP} />
      <L4ConvPanel convsDataArray={udpConversationDetails} singleMode={false} proType={L4_DATA_TYPES.UDP} />
    </div>
  )
}

const AnalyzePanelL4View = ({ isOpen, fileData, jsonData, onCloseCallBack, fetchingStatus, l4Mode }) => {
  const [viewMode, setViewMode] = React.useState(false)
  let title = l4Mode === analyze_service.l4MODES.TCP ? `Protocol: ${analyze_service.l4MODES.TCP}` : l4Mode === analyze_service.l4MODES.UDP ? `Protocol: ${analyze_service.l4MODES.UDP}` : ``

  const conversationDetails = jsonData?.l4_conversations?.map(conversation => ({
    conversationId: conversation.conv_id,
    conversationType: conversation.conv_type,
    hostA: conversation.source_ip,
    hostB: conversation.destination_ip,
    portA: conversation.source_port,
    portB: conversation.destination_port,
    numberPacketA: conversation.packets_from_a_to_b,
    numberPacketB: conversation.packets_from_b_to_a,
    durationInSeconds: analyze_service.calculateConversationDuration(conversation),
    packetsPerHost: analyze_service.calculatePacketsPerHost(conversation),
    exceptionsList: conversation.conv_type === L4_DATA_TYPES.TCP ? conversation.exceptions : [],
    packetList: conversation.packets_data
  }));

  const tcpConversationDetails = conversationDetails?.filter(conversation => conversation.conversationType === "TCP");
  const udpConversationDetails = conversationDetails?.filter(conversation => conversation.conversationType === "UDP");

  return (
    <React.Fragment>
      <Dialog fullScreen open={isOpen} onClose={() => { setViewMode(false); onCloseCallBack() }} TransitionComponent={Transition} onAbort={() => { setViewMode(false); onCloseCallBack() }}
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
              onClick={() => { setViewMode(false); onCloseCallBack() }}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: '20px' }} variant="h6" component="div">
              {fileData?.filename ? "Layer 4 info about file: " + fileData?.filename : "Somehow not selected"}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ height: "100vh" }}>
          {/* <div>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: !fetchingStatus ? "grey" : "black"}} sx={{ mt: "20px" }}>
              <Typography >
                תצוגה מילולית
              </Typography>
              <Switch size='large' checked={viewMode} onChange={() => { setViewMode(!viewMode) }} disabled={!fetchingStatus} />
              <Typography>
                JSON
              </Typography>
            </Box>
          </div> */}
          { // loading animatio
            !fetchingStatus &&
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '80vh' }} >
              <CircularProgress style={{ marginTop: '40px' }} size={"100px"} />
            </div>
          }
          { // verbal view
            !viewMode && fetchingStatus &&
            <div >
              <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}} className={AnalyzePanelViewStyle.data_title} >{title}</h1>
              {
                l4Mode === analyze_service.l4MODES.BOTH
                && bothPanel(tcpConversationDetails, udpConversationDetails)
              }
              {
                l4Mode === analyze_service.l4MODES.TCP &&
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center'}}>
                  <L4ConvPanel convsDataArray={tcpConversationDetails} singleMode={true} proType={L4_DATA_TYPES.TCP}/>
                </div>
              }
              {
                l4Mode === analyze_service.l4MODES.UDP &&
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center'}}>
                  <L4ConvPanel convsDataArray={udpConversationDetails} singleMode={true} proType={L4_DATA_TYPES.UDP}/>
                </div>
              }
            </div>
          }
          { // json view
            viewMode && fetchingStatus && 0 &&
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} >JSON - תצוגה לוגית</h1>
              <Stack direction={'column'} spacing={2} sx={{ p: 2, alignItems: 'center' }}>
                {/* <IconButton sx={{width: "20%", textTransform: 'none'}} onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2)) } color='primary' >
                    Copy
                    <ContentCopyIcon sx={{ml: "4px", mt: "4px"}}/>
                  </IconButton> */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CustomReactJson src={jsonData} />
                  </div>
                </div>
              </Stack>
            </div>
          }
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default AnalyzePanelL4View