import * as React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import * as analyze_service from '../services/analyze_service';
import { NOTIFY_TYPES, notify } from '../services/notify_service';
import UploadComp from '../components/UploadComp';
import TestChartComp from '../components/TestChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import AdminIcon from '@mui/icons-material/SupervisedUserCircle';
import UserIcon from '@mui/icons-material/AccountCircle';
import { DataGrid } from '@mui/x-data-grid';
import AnalyzePanelComp from '../components/AnalyzePanelComp';

import * as files_service from '../services/files_service'

const AnalyzePage = ({ isValidUser, userData }) => {
  const [userAnalyzeData, setUserAnalyzeData] = React.useState({
    username: 'none',
    permission: 'none',
    id: 'none',
    numOfFiles: 'none'
  })
  const [rows, setRows] = React.useState([])
  const [selectedRow, setSelectedRow] = React.useState({})

  const handleFileIdClick = async (fileID) => {
    notify(`File ${fileID} pressed`, NOTIFY_TYPES.info)
  }
  const columns = [
    { field: 'filename', headerName: 'filename', width: 320 },
    { field: 'path'    , headerName: 'path',     flex: 1, renderCell: (params) => 
      {
        return (
          <button onClick={() => {handleFileIdClick(params.row.id)}} style={{color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background:  'transparent', boxShadow:  '0px 0px 0px transparent', border: '0px solid transparent', textShadow: '0px 0px 0px transparent', cursor: 'pointer', borderRadius: "12px",  borderStyle: 'solid', borderWidth: 'medium', borderColor: 'transparent', backgroundColor: '#1976d2'}} href={`/download/${params.value}`}>{params.value} <DownloadIcon style={{ marginLeft: '5px' }}/></button>)
      }
    },
  ]

  const handleSelectionChange = (selectionModel) => {
    setSelectedRow(selectionModel[0])
    console.log("Set:", selectedRow);
  }
  
  const navigate = useNavigate();
  const PermissionsP = "Your permission's"
  const AdminMSG = <div style={{ display: 'flex', alignItems: 'center' }}> {PermissionsP} - admin <AdminIcon style={{ marginLeft: '5px' }} /> </div>
  const UserMSG =  <div style={{ display: 'flex', alignItems: 'center' }}> {PermissionsP} - user <UserIcon   style={{ marginLeft: '5px' }} /> </div>
  
  const userAnalyzeDataCallback = async () => {
    fetchFilesData()
  }
  
  const fetchFilesData = async () => {
    let files = await files_service.get_my_files()
    if (files === undefined) {
      setUserAnalyzeData((oldState) => ({
        ...oldState,
        username: userData.username,
        permission: userData.isadmin ? AdminMSG : UserMSG,
        numOfFiles: 0 /* need to fetch manually from reports db */
      }));
    } else {
      files = files.map((obj, i) => ({ ...obj, id: i }))
      setUserAnalyzeData((oldState) => ({
        ...oldState,
        username: userData.username,
        permission: userData.isadmin ? AdminMSG : UserMSG,
        numOfFiles: files.length /* need to fetch manually from reports db */
      }));
      setRows(files)
    }
  }

  React.useEffect(() => {
    if (isValidUser)
      fetchFilesData()
    document.title = "analyze page"
  }, []);

  if (isValidUser) {
    return (
      <div style={{ display: 'flex', height: '100%'}}>
        <Box style={{ width: '40%'}} sx={{mr: -1, color: 'black'}}>
          <Stack direction={'column'} height={"92vh"}>
            <Box sx={{mt: "10px", mx: "10px", p: 2, backdropFilter: "blur(100px)", borderRadius: "12px", fontSize: "20px", fontFamily: "monospace", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white'}}>
              <div> Hello again, {userAnalyzeData.username} </div>
              <br />
              <div> {userAnalyzeData.permission} </div>
              <br />
              <div> Files: {userAnalyzeData.numOfFiles} </div>
            </Box>
            <Box sx={{ mt: "10px", mx: "10px", height: "55vh", display: 'flex', flexDirection: 'column', borderRadius: "12px", backdropFilter: "blur(100px)", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white' }}>
              <Box sx={{ fontSize: "20px", fontFamily: "monospace", marginBottom: '10px', justifyContent: 'center', textAlign: 'center', paddingTop: 1 }} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}> <span>Your uploaded pcap files</span> <CloudUploadIcon style={{ marginLeft: '5px' }}/> </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <DataGrid
                  sx={{ borderRadius: "10px", fontWeight: 'bold', fontFamily: 'monospace' }}
                  rows={rows}
                  columns={columns}
                  style={{ backdropFilter: "blur(300px)", fontWeight: "bold" }}
                  onRowClick={(row) => { setSelectedRow(row.row); }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: "10px", mx: "10px", p: 2, backdropFilter: "blur(100px)", borderRadius: "12px", height: "30%", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <UploadComp userAnalyzeDataCallback={userAnalyzeDataCallback} />
            </Box>
          </Stack>
        </Box>
        <Box sx={{color: 'black', mt: "10px", mx: "10px", p: 4, backdropFilter: "blur(100px)", borderRadius: "12px", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white'}} style={{ flex: 1, backdropFilter: "blur(100px)"}}>
          <AnalyzePanelComp data={selectedRow} />
        </Box>
      </div>
    )
  }
  return (
    <Navigate to={'/login'} />
  )
}

export default AnalyzePage;