import { AppBar, Dialog, IconButton, Toolbar, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import React from 'react'
import Transion from '@mui/material/Slide'
import CloseIcon from '@mui/icons-material/Close'
import * as analyze_service from '../services/analyze_service'


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Transion direction="up" ref={ref} {...props} />
})

const GraphL4Comp = ( { isOpen, onCloseCallBack, fileData, jsonData, fetchingStatus, l4Mode } ) => {
  let title = l4Mode === analyze_service.l4MODES.TCP ? `${analyze_service.l4MODES.TCP} - פרוטוקול` : l4Mode === analyze_service.l4MODES.UDP ? `${analyze_service.l4MODES.UDP} - פרוטוקול` : `כל הפרוטוקולים`
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
            <Typography sx={{ ml: 'auto' }} variant="h6" component="div">
            {fileData?.filename ? fileData?.filename : "Somehow not selected"} :דוח ויזואלי בשכבה 4 על קובץ
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ backgroundColor: "transparent", height: "100vh" }}>
          <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >{title}</h1>
        </div>
      </Dialog>
    </React.Fragment>
  )
  return (
    <div>
      <Dialog
      >
        Graph1L4Comp
        <LineChart
          xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
          series={[
            {
              data: [2, 5.5, 2, 8.5, 1.5, 5],
            },
          ]}
          width={500}
          height={300}
          />
      </Dialog>
    </div>
  )
}

export default GraphL4Comp