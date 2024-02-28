import { Box, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { NOTIFY_TYPES, notify } from '../services/notify_service';

import AnalyzeIcon from '@mui/icons-material/TravelExplore';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import GenereicDeleteDialog from './GenereicDeleteDialog';
import GraphIcon from '@mui/icons-material/InsertChartOutlined';
import SearchIcon from '@mui/icons-material/ManageSearch';
import SwitchIcon from '@mui/icons-material/DnsOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import DDOSIcon from '@mui/icons-material/Groups';
import MITMIcon from '@mui/icons-material/RemoveModerator';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import DeselectIcon from '@mui/icons-material/Deselect';
import AnalyzePageStyle from '../Style/AnalyzePage.module.css';

import * as analyze_service from '../services/analyze_service'
import * as file_service from '../services/files_service'

function AnalyzePanelComp({ data, fetchDataCallBack, resetDataFallBack, analyzeLoading, analyzeEndError }) {
  const ANALYZE_L4 = "Analyze L4"
  const ATTACKS = "Analyze attacks"
  const [analyzeL4Mode, setAnalyzeL4Mode] = useState("both");
  const [analyzeAttacksMode, setAnalyzeAttacksMode] = useState("both");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const button_spacing = 4

  const handleL4ModeSelectClicked = (event) => {
    setAnalyzeL4Mode(event.target.value);
  };

  const handleAttacksSelectClicked = (event) => {
    setAnalyzeAttacksMode(event.target.value)
  }

  const handleL4AnalyzeClicked = () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        notify(`FILE: ${data.filename} L4 pressed with mode ` + analyzeL4Mode, NOTIFY_TYPES.info)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  };

  const handleL2AnalyzeClicked = () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        notify(`FILE: ${data.filename} L2 pressed...`, NOTIFY_TYPES.info)
      }
    } else {
      notify("no file is selected...", NOTIFY_TYPES.short_error);
    }
  }

  const handleGraph1Clicked = () => {
    if (data.file_id !== undefined) {
      if (data.analyzed !== 1) {
        notify(`FILE: ${data.filename} is not analyzed`, NOTIFY_TYPES.warn)
      } else {
        notify(`FILE: ${data.filename} Graph 1 pressed...`, NOTIFY_TYPES.info)
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
        const a = await file_service.delete_file(file_id)
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
          const res = await analyze_service.analyze(file_id)
          notify(`FILE: ${data.filename} is now analyzed!`, NOTIFY_TYPES.success);
          fetchDataCallBack()
        } else {
          notify(`FILE: ${data.filename} ALREADY ANALYZED!`, NOTIFY_TYPES.info);
          resetDataFallBack()
        }
      } else {
        notify("no file is selected...", NOTIFY_TYPES.short_error);
      }
    } catch (error) {
      notify("server error...", NOTIFY_TYPES.error)
      analyzeEndError()
    }
  }

  return (
    <div className={AnalyzePageStyle.file_info}>
      <div style={{ textAlign: 'center', fontSize: "28px", paddingTop: 20 }}>
        <div >{(data.file_id === undefined ? "pick a file from your uploaded files" : "id {" + data.file_id + "} is selected")}</div>
        <div style={{color: data.filename === undefined ? "transparent" : "black" }} >{(data.filename === undefined ? "pick a file from your uploaded files" : "filename: " + data.filename)}</div>
        <div style={{color: data.owner_id === undefined ? "transparent" : "black" }} >{(data.owner_id === undefined ? "pick a file from your uploaded files" : "owner's id: " + data.owner_id)}</div>
      </div>
      <Stack sx={{ p: 2, mt: 2}} spacing={button_spacing}>
        <Stack alignItems="center" justifyContent={'center'}>
          <Button color='primary' variant='contained' size='large' onClick={handleMainAnalyzeClicked} sx={{ width: '500px' }}> <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '20px', fontFamily: 'inherit'}}> Analyze <AnalyzeIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3> </Button>
        </Stack>

        <Stack alignItems="center" justifyContent={'center'}>
          <Button color='primary' variant='contained' size='large' onClick={handleMainAnalyzeClicked} sx={{ width: '500px' }}> <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '20px', fontFamily: 'inherit'}}> General Info <InfoIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3> </Button>
        </Stack>

        <Stack spacing={10} direction={'row'} alignItems="center" justifyContent={'center'}>
          <Stack spacing={button_spacing} direction={'column'} alignItems="center" justifyContent={'center'} >
            <Stack spacing={1} direction={'row'} width={300} >
              <FormControl color='warning' sx={{}}>
                <InputLabel >Type</InputLabel>
                <Select label="analyze L4" fullWidth={false} value={analyzeL4Mode} onChange={handleL4ModeSelectClicked} >
                  <MenuItem value="both">Both</MenuItem>
                  <MenuItem value="TCP" >TCP </MenuItem>
                  <MenuItem value="UDP" >UDP </MenuItem>
                </Select>
              </FormControl>
              <ButtonGroup orientation="vertical">
                <Button color='primary' variant='contained' size='large' onClick={handleL4AnalyzeClicked}>
                  <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'inherit'}} >{analyzeL4Mode === "TCP" ? `${ANALYZE_L4} TCP` : analyzeL4Mode === "UDP" ? `${ANALYZE_L4} UDP` : `${ANALYZE_L4} All`} <SearchIcon style={{ paddingBottom: 7, marginLeft: '5px', fontSize: '22px' }}/> </h3>
                </Button>
                <Button color='primary' variant='contained' size='large' onClick={handleL2AnalyzeClicked}>
                  <h1 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '18px', fontFamily: 'inherit'}} > Analyze L2 <SwitchIcon style={{ paddingBottom: 7, marginLeft: '5px', fontSize: '22px' }}/>  </h1>
                </Button>
              </ButtonGroup>
            </Stack>
          </Stack>
          
          <Stack spacing={button_spacing} direction={'column'} alignItems="center" justifyContent={'center'} sx={{pr: 11}}>
            <ButtonGroup orientation="vertical">
              <Button color='primary' variant='contained' size='large' onClick={handleGraph1Clicked}>
                <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'inherit'}} >Graph 1 <GraphIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3>
              </Button>

              <Button color='primary' variant='contained' size='large' onClick={handleGraph2Clicked}>
                <h3 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'inherit'}} > Graph 2 <GraphIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3>
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>

        <Stack spacing={button_spacing + 5} direction={'row'} alignItems="center" justifyContent={'center'} sx={{pr: 10}}>
          <Stack spacing={2} direction={'row'} alignItems="center" justifyContent={'center'} >
            <FormControl color='warning'>
              <InputLabel >Type</InputLabel>
              <Select label="analyze" fullWidth={false} value={analyzeAttacksMode} onChange={handleAttacksSelectClicked} >
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="DDOS" >DDOS </MenuItem>
                <MenuItem value="MITM" >MITM </MenuItem>
              </Select>
            </FormControl>
            <Button color='primary' variant='contained' size='large' onClick={handleAttackClicked}>
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