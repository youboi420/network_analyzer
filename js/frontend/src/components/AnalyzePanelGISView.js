import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Transion from '@mui/material/Slide'
import { Box, CircularProgress, Stack, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import InfoIcon from '@mui/icons-material/Info';

import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Transion direction="up" ref={ref} {...props} />
})

const AnalyzePanelGISView = ({ isOpen, fileData, jsonData, onCloseCallBack, fetchingStatus }) => {
  const [open, setOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState(false)
  const FLOATING_LIMITER = 3
  const { hosts, ports } = jsonData;

  const VERBAL_BOX_HEIGHT = "75vh"
  const hostsWithIds = hosts?.map((host, index) => ({ ...host, id: `host_${index}` }));
  const portsWithIds = ports?.map((port, index) => ({ ...port, id: `port_${index}` }));
  
  const portsGridCols = [
    { field: "count", headerName: 
      (
        <Tooltip title={<Typography fontSize={16}> Number of occurrences in the file un related to a certian conversation service or protocol </Typography>} style={{ borderRadius: '12px', backgroundColor: "#1976d2", color: "white", padding: 2, cursor: 'zoom-in' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Number of occurrences <InfoIcon sx={{ml: "5px"}}/> </div>
        </Tooltip>
      ), 
      headerAlign: "center", align: "center", flex: 1, },
    { field: "port", headerName:  (
      <Tooltip title={<Typography fontSize={16}> Ports are essential for enabling multiple network services to operate concurrently on a single device. They allow a single device to offer various services to clients over a network, such as web browsing, email, file transfer, and more. </Typography>} style={{ borderRadius: '12px', backgroundColor: "#1976d2", color: "white", padding: 2, cursor: 'zoom-in' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}> Ports <InfoIcon sx={{ml: "5px"}}/> </div>
      </Tooltip>
    ),  headerAlign: "center", align: "center",  flex: 1 },
  ]
  
  const hostsGridCols = [
    { field: "count", headerName: 
    (
      <Tooltip title={<Typography fontSize={16}> Number of occurrences in the file un related to a certian conversation service or protocol </Typography>} style={{ borderRadius: '12px', backgroundColor: "#1976d2", color: "white", padding: 2, cursor: 'zoom-in' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Number of occurrences <InfoIcon sx={{ml: "5px"}}/> </div>
      </Tooltip>
    ), headerAlign: "center", align: "center" ,  flex: 1 },
    { field: "host_ip", headerName: (
      <Tooltip title={<Typography fontSize={16}> An IP (Internet Protocol) address is a unique numerical logical identifier assigned to each device on a network, allowing them to communicate with each other. It serves as the address system of the internet, enabling data packets to be routed to their intended destinations across the network. </Typography>} style={{ borderRadius: '12px', backgroundColor: "#1976d2", color: "white", padding: 2, cursor: 'zoom-in' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Host IP <InfoIcon sx={{ml: "5px"}}/> </div>
      </Tooltip>
    ), headerAlign: "center", align: "center"       ,  flex: 1 },
  ]

  return (
    <div>
      <Dialog fullScreen open={isOpen} onClose={() => { setViewMode(false); onCloseCallBack() }} TransitionComponent={Transition} onAbort={() => { setViewMode(false); onCloseCallBack() }} 
        PaperProps={{
          sx: {
            backgroundColor: '#EEEEEE',
            opacity: "100%",
            marginTop: "100px",
            marginRight: "50px",
            marginLeft: "50px",
            marginTop: "100px",

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
              {fileData?.filename ? "General info about file: " + fileData?.filename : "Somehow not selected"}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ backgroundColor: "transparent" }}>
          {/* <div>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: !fetchingStatus ? "grey" : "black" }} sx={{ mt: "20px" }}>
              <Typography>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '80vh' }}>
              <CircularProgress style={{ marginTop: '40px' }} size={"100px"} />
            </div>
          }
          { // verbal view
            !viewMode && fetchingStatus &&
            <div style={{marginBottom: "calc(3%)", height: "20vh"}}>
              <h1 className={AnalyzePanelViewStyle.data_title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 10, paddingBottom: 10 }} >General info text based</h1>
                <Stack direction={'row'} spacing={2} style={{ justifyContent: 'center' }} >
                  <Stack direction={'column'} sx={{ borderRadius: "12px", borderStyle: "solid", height: VERBAL_BOX_HEIGHT}} >
                    <div style={{ alignItems: 'center', justifyContent: 'flex-end', textAlign: 'center'}}>
                      <div >
                        <h1 className={AnalyzePanelViewStyle.data_title} >File Size</h1>
                        <h3>
                          {jsonData.file_size_mb ? Number(jsonData.file_size_mb).toFixed(FLOATING_LIMITER) + " MB" : "Oh..."}
                        </h3>
                      </div>
                      <Divider orientation='horizontal' sx={{ bgcolor: "black" }} />
                      <div>
                        <h1 className={AnalyzePanelViewStyle.data_title} >Packet's</h1>
                        <h3>
                          {jsonData.num_packets ? jsonData.num_packets : "Oh..."}
                        </h3>
                      </div>
                      <Divider orientation='horizontal' sx={{ bgcolor: "black" }}/>
                      <div>
                        <h1 className={AnalyzePanelViewStyle.data_title}  style={{padding: 4}}>Time Duration </h1>
                        <h3>
                          {jsonData.duration ? parseFloat(jsonData.duration) < 60.0 ? (parseFloat(jsonData.duration).toFixed(FLOATING_LIMITER) + " ' sec") : `${(parseFloat(jsonData.duration) / 60 * 60).toFixed(FLOATING_LIMITER)} minuets`  : "Oh..."}
                        </h3>
                      </div>
                      <Divider orientation='horizontal' sx={{ bgcolor: "black" }} />
                      <div>
                        <h1 className={AnalyzePanelViewStyle.data_title} >Host's Count</h1>
                        <h3>
                          {jsonData.num_hosts ? jsonData.num_hosts : "Oh..."}
                        </h3>
                      </div>
                      <Divider orientation='horizontal' sx={{ bgcolor: "black" }} />
                      <div>
                        <h1 className={AnalyzePanelViewStyle.data_title} > Port's Count </h1>
                        <h3>
                          {jsonData.num_ports ? jsonData.num_ports : "Oh..."}
                        </h3>
                      <Divider orientation='horizontal' sx={{ bgcolor: "black" }} />
                      </div>
                    </div>
                  </Stack>
                  <Box sx={{ height: VERBAL_BOX_HEIGHT, width: "35%", borderRadius: "12px", borderStyle: "solid", overflow: "hidden" }}>
                    <h1 className={AnalyzePanelViewStyle.data_title} style={{textAlign: 'center'}} > Port's Table</h1>
                    <div style={{ width: "100%", height: "calc(100% - 75px)", overflow: "auto" }}>
                      <DataGrid rows={portsWithIds} columns={portsGridCols} style={{fontFamily: "monospace", fontSize: "16px"}}/>
                    </div>
                  </Box>
                  <Box sx={{ height: VERBAL_BOX_HEIGHT, width: "35%", borderRadius: "12px", borderStyle: "solid", overflow: "hidden" }}>
                    <h1 className={AnalyzePanelViewStyle.data_title} style={{ textAlign: 'center' }}> Host's Table </h1>
                    <div style={{ width: "100%", height: "calc(100% - 75px)", overflow: "auto" }}>
                      <DataGrid rows={hostsWithIds} columns={hostsGridCols}  style={{fontFamily: "monospace", fontSize: "16px"}} />
                    </div>
                  </Box>
                </Stack>
            </div>
          }
        </div>
      </Dialog>
    </div>
  )
}

export default AnalyzePanelGISView