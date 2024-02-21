import * as React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Backdrop, Box, CircularProgress, LinearProgress, Stack } from '@mui/material';
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
import AnalyzePageStyle from '../Style/AnalyzePage.module.css';
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
  const [gridLoading, setGridLoading] = React.useState(false);  
  const [isAnalyzeLoading, setIsAnalyzeLoading] = React.useState(false)
  const const_width = 300
  const const_end_str = 42

  const handleFileIdClick = async (fileID) => {
    notify(`File ${fileID} pressed`, NOTIFY_TYPES.info)
  }
  const columns = [
    {
      field: 'filename', headerName: 'filename', width: const_width, headerAlign: 'center', renderCell: (params) => {
        let btnText = String(params.row.filename)
        btnText = btnText.replace(".pcap", "")
        if (btnText.slice(0, const_end_str) !== btnText) {
          btnText = btnText.slice(0, const_end_str - 3) + "..."
        }
        return (
          <button className={AnalyzePageStyle.files_grid}  onClick={() => { handleFileIdClick(params.row.file_id) }} style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center', background: 'transparent', boxShadow: '0px 0px 0px transparent', border: '0px solid transparent', textShadow: '0px 0px 0px transparent', cursor: 'pointer', borderRadius: "12px", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'transparent', backgroundColor: '#1976d2', width: "100%" }} > <DownloadIcon style={{ marginRight: '5px' }} /> {btnText} </button>)
      }
    },
    { field: 'path', headerName: 'path', headerAlign: 'center', width: const_width + 35 },
    {
      field: 'analyzed', headerName: 'analyzed', headerAlign: 'center', align: 'center', flex: 1, renderCell: (params) => {
        return <span className={AnalyzePageStyle.files_grid} style={{borderRadius: '12px',width: "50%", backgroundColor: params.value === 1 ? "#77DD76" : "#FF6962"}}> {params.value === 1 ? "Yes" : "No"} </span>
        // for users page! -> return <span className={AnalyzePageStyle.files_grid} style={{borderRadius: '12px',width: "50%", backgroundColor: params.value === 1 ? "#77DD76" : "#FF6962"}}> {params.value === 1 ? "Yes" : "No"} </span>
      }
    }
  ]

  const handleSelectionChange = (selectionModel) => {
    setSelectedRow(selectionModel[0])
    console.log("Set:", selectedRow);
  }

  const PermissionsP = "Your permission's"
  const AdminMSG = <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'inherit' }}> {PermissionsP} - admin <AdminIcon style={{ marginLeft: '5px' }} /> </div>
  const UserMSG = <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'inherit' }}> {PermissionsP} - normal user <UserIcon style={{ marginLeft: '5px' }} /> </div>

  const userAnalyzeDataCallback = async () => {
    fetchFilesData()
  }

  const fetchFilesData = async () => {
    setGridLoading(true);
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
    setGridLoading(false);
  }

  const fallBack = () => {
    setSelectedRow({})
  }
  
  const fetchDataCallBack = async () => {
    setIsAnalyzeLoading(false)
    setSelectedRow({})
    fetchFilesData()
  }

  const analyzeLoading = () => {
    setIsAnalyzeLoading(true)
    notify("LOADING...", NOTIFY_TYPES.info)
  }

  React.useEffect(() => {
    if (isValidUser)
      fetchFilesData()
    document.title = "analyze page"
  }, []);

  if (isValidUser) {
    return (
      <div style={{ display: 'flex', height: '100%' }} className={AnalyzePageStyle.info_panel}>
        {
          isAnalyzeLoading &&
          <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isAnalyzeLoading}
          onClick={() => {setIsAnalyzeLoading(false)}}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        }
        <Box style={{ width: '40%' }} sx={{ mr: -1, color: 'black' }}>
          <Stack direction={'column'} height={"93vh"}>
            <Box sx={{ mt: "10px", mx: "10px", p: 2, backdropFilter: "blur(100px)", borderRadius: "12px", fontSize: "20px", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white' }}>
              <Stack direction={'column'} spacing={0.2}>
                <div> Hello again, {userAnalyzeData.username} </div>
                <div> {userAnalyzeData.permission} </div>
                <div> Files: {userAnalyzeData.numOfFiles} </div>
              </Stack>
            </Box>
            <Box className={AnalyzePageStyle.files_grid} sx={{ mt: "10px", mx: "10px", height: "60vh", display: 'flex', flexDirection: 'column', borderRadius: "12px", backdropFilter: "blur(100px)", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white', textAlign: 'center' }}>
              <Box sx={{ fontSize: "20px", marginBottom: '10px', justifyContent: 'center', textAlign: 'center', paddingTop: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}> <span>Your uploaded pcap files</span> <CloudUploadIcon style={{ marginLeft: '5px' }} /> </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {
                  gridLoading && <LinearProgress size={75} />
                }
                {
                  !gridLoading &&
                  <DataGrid
                  sx={{ borderRadius: "10px", fontWeight: 'bold', fontFamily: 'inherit' }}
                  rows={rows}
                  columns={columns}
                  style={{ backdropFilter: "blur(300px)", fontWeight: "bold" }}
                  onRowClick={(row) => { setSelectedRow(row.row); }}
                  />
                }
              </Box>
            </Box>
            <Box sx={{ mt: "10px", mx: "10px", p: 2, backdropFilter: "blur(100px)", borderRadius: "12px", height: "30%", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <UploadComp className={AnalyzePageStyle.info_panel} userAnalyzeDataCallback={userAnalyzeDataCallback} />
            </Box>
          </Stack>
        </Box>
        <Box sx={{ color: 'black', mt: "10px", mx: "10px", p: 4, backdropFilter: "blur(100px)", borderRadius: "12px", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white' }} style={{ flex: 1, backdropFilter: "blur(100px)" }}>
          <AnalyzePanelComp  data={selectedRow} fetchDataCallBack={fetchDataCallBack} resetDataFallBack={fallBack} analyzeLoading={analyzeLoading}/>
        </Box>
      </div>
    )
  }

  return (
    <Navigate to={'/login'} />
  )
}

export default AnalyzePage;