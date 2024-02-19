import React, { useState } from 'react';
import { Box, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { NOTIFY_TYPES, notify } from '../services/notify_service';
import AnalyzeIcon from '@mui/icons-material/TravelExplore';
function AnalyzePanelComp({ data }) {
  const ANALYZE_L4 = "Analyze L4"
  const ATTACKS = "Analyze attacks"
  const [analyzeL4Mode, setAnalyzeL4Mode] = useState("both");
  const [analyzeAttacksMode, setAnalyzeAttacksMode] = useState("both");

  const button_spacing = 10

  const handleL4ModeSelect = (event) => {
    setAnalyzeL4Mode(event.target.value);
  };

  const handleAttacksSelect = (event) => {
    setAnalyzeAttacksMode(event.target.value)
  }

  const handleL4Analyze = () => {
    notify("L4 pressed with mode " + analyzeL4Mode, NOTIFY_TYPES.info)
  };

  const handleL2Analyze = () => {
    notify("L2 pressed...", NOTIFY_TYPES.info)
  }

  const handleGraph1 = () => {
    notify("Graph 1 pressed...", NOTIFY_TYPES.info)
  }

  const handleGraph2 = () => {
    notify("Grpah 2 pressed...", NOTIFY_TYPES.info)
  }

  const handleAttack = () => {
    notify("Attacks pressed with mode " + analyzeAttacksMode, NOTIFY_TYPES.info)
  }

  const handleMainAnalyze = () => {
    notify("clicked on analyze... calling analyze service", NOTIFY_TYPES.info);
  }

  return (
    <div>
      <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: "28px", paddingTop: 20 }}>
        <div>{(data.id === undefined ? "pick a file from your files" : "id: " + data.id + " is selected")}</div>
        <div>{(data.filename === undefined ? "" : "filename: " + data.filename)}</div>
        <div>{(data.owner_id === undefined ? "" : "owner's id: " + data.owner_id)}</div>
      </div>
      <Stack sx={{ p: 2, mt: 8}} spacing={button_spacing}>
        <Stack alignItems="center" justifyContent={'center'}>
          <Button color='primary' variant='contained' size='large' onClick={handleMainAnalyze} sx={{ width: '500px' }}> <h3 style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }}> Analyze <AnalyzeIcon style={{ paddingBottom: 5, marginLeft: '5px' }} /> </h3> </Button>
        </Stack>

        <Stack spacing={20} direction={'row'} alignItems="center" justifyContent={'center'}>
          <Stack spacing={button_spacing} direction={'column'} alignItems="center" justifyContent={'center'} >
            <Stack spacing={1} direction={'row'} width={300} >
              <FormControl color='warning' sx={{}}>
                <InputLabel >Type</InputLabel>
                <Select label="analyze" fullWidth={false} value={analyzeL4Mode} onChange={handleL4ModeSelect} >
                  <MenuItem value="both">Both</MenuItem>
                  <MenuItem value="TCP" >TCP </MenuItem>
                  <MenuItem value="UDP" >UDP </MenuItem>
                </Select>
              </FormControl>
              <ButtonGroup orientation="vertical">
                <Button color='primary' variant='contained' size='large' onClick={handleL4Analyze}>
                  <h3>{analyzeL4Mode === "TCP" ? `${ANALYZE_L4} TCP` : analyzeL4Mode === "UDP" ? `${ANALYZE_L4} UDP` : `${ANALYZE_L4} All`}</h3>
                </Button>
                <Button color='primary' variant='contained' size='large' onClick={handleL2Analyze}>
                  <h3> Analyze L2 ARP</h3>
                </Button>
              </ButtonGroup>
            </Stack>
          </Stack>

          <Stack spacing={button_spacing} direction={'column'} alignItems="center" justifyContent={'center'} sx={{pr: 11}}>
            <ButtonGroup orientation="vertical">
              <Button color='primary' variant='contained' size='large' onClick={handleGraph1}>
                <h3>Graph 1</h3>
              </Button>
              <Button color='primary' variant='contained' size='large' onClick={handleGraph2}>
                <h3> Graph 2</h3>
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>

        <Stack spacing={button_spacing + 5} direction={'row'} alignItems="center" justifyContent={'center'} sx={{pr: 12}}>
          <Stack spacing={2} direction={'row'} alignItems="center" justifyContent={'center'} >
            <FormControl color='warning'>
              <InputLabel >Type</InputLabel>
              <Select label="analyze" fullWidth={false} value={analyzeAttacksMode} onChange={handleAttacksSelect} >
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="DDOS" >DDOS </MenuItem>
                <MenuItem value="MITM" >MITM </MenuItem>
              </Select>
            </FormControl>
            <Button color='primary' variant='contained' size='large' onClick={handleAttack}>
              <h3>{analyzeAttacksMode === "DDOS" ? `${ATTACKS} DDOS` : analyzeAttacksMode === "MITM" ? `${ATTACKS} MITM` : `${ATTACKS} Both`}</h3>
            </Button>
          </Stack>
        </Stack>

      </Stack>
    </div>
  );
}

export default AnalyzePanelComp;