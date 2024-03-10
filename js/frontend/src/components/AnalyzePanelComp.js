import { Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import React from 'react';

import AnalyzeIcon from '@mui/icons-material/TravelExplore';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import GenereicDeleteDialog from './GenereicDeleteDialog';
import GraphIcon from '@mui/icons-material/InsertChartOutlined';
import SearchIcon from '@mui/icons-material/ManageSearch';
import SwitchIcon from '@mui/icons-material/DnsOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import DDOSIcon from '@mui/icons-material/Groups';
import MITMIcon from '@mui/icons-material/RemoveModerator';
import LeftIcon from '@mui/icons-material/West';
import AnalyzePageStyle from '../Style/AnalyzePage.module.css';

import { NOTIFY_TYPES, notify } from '../services/notify_service';
import * as analyze_service from '../services/analyze_service'
import * as file_service from '../services/files_service'
import AnalyzePanelGISView from './AnalyzePanelGISView';
import AnalyzePanelL4View from './AnalyzePanelL4View';
import AnalyzePanelL2View from './AnalyzePanelL2View';
import GraphL4Comp from './GraphL4Comp';

const sleep = (milliseconds) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}
const SLEEP_CONST = 350
function AnalyzePanelComp({ data, fetchDataCallBack, resetDataFallBack, analyzeLoading, analyzeEndError, openViewPanel }) {
  const ANALYZE_L4 = "Analyze L4"
  const GRAPH_L4 = "Graph L4"
  const GRAPH_L2 = "Graph L2"
  const ATTACKS = "Analyze attacks"
  const [analyzeL4Mode, setAnalyzeL4Mode] = React.useState("both");
  const [analyzeAttacksMode, setAnalyzeAttacksMode] = React.useState("both");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isAnalyzeGISViewOpen, setIsAnalyzeGISViewOpen] = React.useState(false)
  const [isAnalyzeL4ViewOpen, setIsAnalyzeL4ViewOpen] = React.useState(false)
  const [isAnalyzeL2ViewOpen, setIsAnalyzeL2ViewOpen] = React.useState(false)
  const [isGraphL4ViewOpen, setIsGraphL4ViewOpen] = React.useState(false)
  const [jsonData, setJsonData] = React.useState({})
  const [gisFetchingStatus, setGISFetchingStatus] = React.useState(false)
  const [l4FetchingStatus, setL4FetchingStatus] = React.useState(false)
  const [l2FetchingStatus, setL2FetchingStatus] = React.useState(false)
  
  const button_spacing = 4

  const handleL4ModeSelectClicked = (event) => {
    setAnalyzeL4Mode(event.target.value);
  };

  const handleAttacksSelectClicked = (event) => {
    setAnalyzeAttacksMode(event.target.value)
  }

  const handleL4AnalyzeClicked = async () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        /* fetch data */
        setIsAnalyzeL4ViewOpen(true)

        setL4FetchingStatus(false)
        const serverJsonData = await analyze_service.getL4JsonData(data.file_id)
        if (serverJsonData === undefined ) {
          setIsAnalyzeL4ViewOpen(false)
          notify("Server failed.", NOTIFY_TYPES.error)
          return
        }
        setJsonData(serverJsonData)
        await sleep(SLEEP_CONST)
        setL4FetchingStatus(true)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  };

  const handleL2AnalyzeClicked = async () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        const serverJsonData = await analyze_service.getL2JsonData(data.file_id)
        if (serverJsonData === undefined ) {
          setIsAnalyzeL2ViewOpen(false)
          notify("Server failed.", NOTIFY_TYPES.error)
          return
        }
        setL2FetchingStatus(false)
        setIsAnalyzeL2ViewOpen(true)
        await sleep(SLEEP_CONST)
        setJsonData(serverJsonData)
        setL2FetchingStatus(true)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  }

  const handleGraph1Clicked = async () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        const serverJsonData = await analyze_service.getL4JsonData(data.file_id)
        setJsonData(serverJsonData)
        setIsGraphL4ViewOpen(true)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  }

  const handleGraph2Clicked = () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        notify(`FILE: ${data.filename} Grpah 2 pressed...`, NOTIFY_TYPES.info)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  }

  const handleAttackClicked = () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        notify(`FILE: ${data.filename} Attacks pressed with mode ` + analyzeAttacksMode, NOTIFY_TYPES.info)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  }
  const handleDeletePressed = async () => {
    const file_id = data.file_id
    if (file_id !== undefined) {
      try {
        await file_service.delete_file(file_id)
        notify("File deleted", NOTIFY_TYPES.success)
        fetchDataCallBack()
      } catch (error) {
        notify(error, NOTIFY_TYPES.error)
      }
    } else {
      notify("undefiend", NOTIFY_TYPES.error)
    }
  }

  const handleMainAnalyzeClicked = async () => {
    const file_id = data.file_id
    try {
      if (file_id !== undefined) {
        if (data.analyzed !== 1) {
          analyzeLoading()
          await analyze_service.analyze(file_id)
          notify(`FILE: ${data.filename} is now analyzed!`, NOTIFY_TYPES.success);
          fetchDataCallBack()
        } else {
          notify(`FILE: ${data.filename} ALREADY ANALYZED!`, NOTIFY_TYPES.info);
          return
        }
      } else {
        notify("no file is selected...", NOTIFY_TYPES.short_error);
      }
    } catch (error) {
      notify("server error...", NOTIFY_TYPES.error)
      analyzeEndError()
    }
  }

  const handleGeneralInfo = async () => {
    // fetch the json data of file data.file_id and open the analyze panel view.
    setGISFetchingStatus(false)
    setIsAnalyzeGISViewOpen(true)

    const serverJsonData = await analyze_service.getGISJsonData(data.file_id)
  
    if (serverJsonData === undefined ) {
      setIsAnalyzeGISViewOpen(false)
      notify("Server failed.", NOTIFY_TYPES.error)
      return
    }
    await sleep(SLEEP_CONST)
    setJsonData(serverJsonData)
    setGISFetchingStatus(true)
  }

  return (
    <div className={AnalyzePageStyle.file_info}>
      {
        jsonData &&
        <AnalyzePanelGISView isOpen={isAnalyzeGISViewOpen} onCloseCallBack={() => {setIsAnalyzeGISViewOpen(false)}} fileData={data} jsonData={jsonData} fetchingStatus={gisFetchingStatus} />
      }
      {
        jsonData &&
        <AnalyzePanelL4View  isOpen={isAnalyzeL4ViewOpen}  onCloseCallBack={() => {setIsAnalyzeL4ViewOpen(false)}}  fileData={data} jsonData={jsonData} fetchingStatus={l4FetchingStatus} l4Mode={analyzeL4Mode} />
      }
      {
        jsonData &&
        <AnalyzePanelL2View  isOpen={isAnalyzeL2ViewOpen}  onCloseCallBack={() => {setIsAnalyzeL2ViewOpen(false)}}  fileData={data} jsonData={jsonData} fetchingStatus={l2FetchingStatus}/>
      }
      {
        jsonData &&
        <GraphL4Comp isOpen={isGraphL4ViewOpen} onCloseCallBack={() => {setIsGraphL4ViewOpen(false)}} fileData={data} l4Mode={analyzeL4Mode} jsonData={jsonData} conv_count={jsonData?.conv_count} />
      }

      <div style={{ textAlign: 'center', fontSize: "28px", paddingTop: 20 }}>
        <div >{(data.file_id === undefined ? "pick a file from your uploaded files" : "id {" + data.file_id + "} is selected")}</div>
        <div style={{color: data.filename === undefined ? "transparent" : "black" }} >{(data.filename === undefined ? "pick a file from your uploaded files" : "filename: " + data.filename)}</div>
      </div>
      <Stack sx={{ p: 2, mt: 6}} spacing={button_spacing}>
        <Stack alignItems="center" justifyContent={'center'}>
          <Button disabled={data.analyzed  !== 1 ? false : true} color='primary' variant='contained' size='large' onClick={handleMainAnalyzeClicked} sx={{ width: '500px' }}> {data.owner_id  === undefined ? <LeftIcon style={{ paddingBottom: 5, marginRight: '5px', fontSize: '64px' }} /> : null} <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '20px', fontFamily: 'inherit'}}> {data.file_id === undefined ? "Select a file"  : "Analyze"} {data.owner_id  === undefined ? null : <AnalyzeIcon style={{ paddingBottom: 5, marginLeft: '5px' }} />} </h3> </Button>
        </Stack>

        <Stack alignItems="center" justifyContent={'center'}>
          <Button disabled={data.analyzed  !== 1 ? true : false} color='primary' variant='contained' size='large' onClick={handleGeneralInfo} sx={{ width: '500px' }}> <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '20px', fontFamily: 'inherit'}}> General Info <InfoIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3> </Button>
        </Stack>

        <Stack spacing={1} direction={'row'} alignItems="center" justifyContent={'center'}>
          <Stack spacing={button_spacing} direction={'column'} alignItems="center" justifyContent={'center'} >
            <Stack spacing={1} direction={'row'} width={300} >
              <FormControl color='secondary' >
                <InputLabel sx={{color: "black"}}>Type</InputLabel>
                <Select disabled={data.analyzed  !== 1 ? true : false} label="analyze L4" fullWidth={false} value={analyzeL4Mode} onChange={handleL4ModeSelectClicked} >
                  <MenuItem value={analyze_service.l4MODES.BOTH}> {analyze_service.l4MODES.BOTH} </MenuItem>
                  <MenuItem value={analyze_service.l4MODES.TCP} > {analyze_service.l4MODES.TCP} </MenuItem>
                  <MenuItem value={analyze_service.l4MODES.UDP} > {analyze_service.l4MODES.UDP} </MenuItem>
                </Select>
              </FormControl>
              <ButtonGroup orientation="vertical">
                <Button disabled={data.analyzed  !== 1 ? true : false} color='primary' variant='contained' size='large' onClick={handleL4AnalyzeClicked}>
                  <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'inherit'}} > {analyzeL4Mode === analyze_service.l4MODES.TCP ? `${ANALYZE_L4} ${analyze_service.l4MODES.TCP}` : analyzeL4Mode === analyze_service.l4MODES.UDP ? `${ANALYZE_L4} ${analyze_service.l4MODES.UDP}` : `${ANALYZE_L4} Both`} <SearchIcon style={{ paddingBottom: 7, marginLeft: '5px', fontSize: '22px' }}/> </h3>
                </Button>
                <Button disabled={data.analyzed  !== 1 ? true : false} color='primary' variant='contained' size='large' onClick={handleL2AnalyzeClicked}>
                  <h1 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '18px', fontFamily: 'inherit'}} > Analyze L2 <SwitchIcon style={{ paddingBottom: 4, marginLeft: '5px', fontSize: '22px' }}/>  </h1>
                </Button>
              </ButtonGroup>
            </Stack>
          </Stack>
          
          <Stack spacing={button_spacing} direction={'column'} alignItems="center" justifyContent={'center'} sx={{pr: 11}}>
            <ButtonGroup orientation="vertical">
              <Button disabled={data.analyzed  !== 1 ? true : false} color='primary' variant='contained' size='large' onClick={handleGraph1Clicked}>
                <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'inherit'}} > {analyzeL4Mode === analyze_service.l4MODES.TCP ? `${GRAPH_L4} ${analyze_service.l4MODES.TCP}` : analyzeL4Mode === analyze_service.l4MODES.UDP ? `${GRAPH_L4} ${analyze_service.l4MODES.UDP}` : `${GRAPH_L4} Both`}  <GraphIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3>
              </Button>
              <Button disabled={data.analyzed  !== 1 ? true : false} color='primary' variant='contained' size='large' onClick={handleGraph2Clicked}>
                <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'inherit'}} > {GRAPH_L2} <GraphIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3>
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>

        <Stack spacing={button_spacing + 5} direction={'row'} alignItems="center" justifyContent={'center'} sx={{pr: 10}}>
          <Stack spacing={2} direction={'row'} alignItems="center" justifyContent={'center'} >
            <FormControl color='secondary'>
              <InputLabel  sx={{color: "black"}}>Type</InputLabel>
              <Select disabled={data.analyzed  !== 1 ? true : false} label="analyze" fullWidth={false} value={analyzeAttacksMode} onChange={handleAttacksSelectClicked} >
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="DDOS" >DDOS </MenuItem>
                <MenuItem value="MITM" >MITM </MenuItem>
              </Select>
            </FormControl>
            <Button disabled={data.analyzed  !== 1 ? true : false} color='primary' variant='contained' size='large' onClick={handleAttackClicked}>
              <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '20px', fontFamily: 'inherit'}} > {analyzeAttacksMode === "DDOS" ? `${ATTACKS} - DDOS` : analyzeAttacksMode === "MITM" ? `${ATTACKS} - MITM` : `${ATTACKS} - Both`} {analyzeAttacksMode === "DDOS" ? <DDOSIcon style={{paddingBottom: 5, marginLeft: '5px'}} /> : analyzeAttacksMode === "MITM" ? <MITMIcon style={{paddingBottom: 8, marginLeft: '5px'}} /> : <TerminalIcon style={{paddingBottom: 5, marginLeft: '5px'}} />}</h3>
            </Button>
          </Stack>
        </Stack>
        {
          data.file_id &&
          <Stack alignItems="center" justifyContent={'center'} direction={'row'} spacing={10}>
              <Button color='error' variant='contained' onClick={() => { if (data.file_id) setDeleteDialogOpen(true); else notify("Please select a file", NOTIFY_TYPES.warn) }} > <h3>DELETE FILE</h3> </Button>
              <Button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: "grey" }} color='secondary' variant='contained' onClick={() => resetDataFallBack()}>
                <div >
                  <h3>DESELCT FILE </h3>
                </div>
              </Button>
          </Stack>
        }
      </Stack>
      {
          deleteDialogOpen && 
          <GenereicDeleteDialog isOpen={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); resetDataFallBack() }} callBackFunction={handleDeletePressed} deletionType="file" />
      }
    </div>
  );
}

export default AnalyzePanelComp;