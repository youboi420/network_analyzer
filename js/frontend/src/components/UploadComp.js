import { Box, Button, CircularProgress, Input, Stack, Typography } from '@mui/material';
import PicktFileIcon from '@mui/icons-material/AttachFile'; 
import CheckIcon from '@mui/icons-material/Check';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import React from 'react';
import { NOTIFY_TYPES, notify } from '../services/notify_service';
import axios from 'axios';
const UploadComp = ( {userAnalyzeDataCallback} ) => {
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const PADDING_C = 15;
  
  const fileNotSelected = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <span>Please select a file!</span>
      <PicktFileIcon style={{ marginLeft: '5px' }} />
    </div>    
  );

  const fileSelected = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <span>Picked: {file?.name}</span>
      <CheckIcon style={{ marginLeft: '5px' }} />
    </div>
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const fileExtension = selectedFile.name.split('.').pop();
      if (fileExtension.toLowerCase() !== 'pcap') {
        notify('Please select a .pcap file', NOTIFY_TYPES.error);
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      notify("No file selected", NOTIFY_TYPES.error);
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const UPLOAD_URL = "http://" + process.env.REACT_APP_LOCAL_IP_ADDRESS + ":" + process.env.REACT_APP_SER_PORT + "/files/upload"
      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        notify("File uploaded successfully", NOTIFY_TYPES.success);
      } else if (response.status === 409) {
        notify("Duplicate file", NOTIFY_TYPES.warn);
      } else {
        notify("Failed to upload file", NOTIFY_TYPES.error);
      }
      setFile(null);
      userAnalyzeDataCallback()
    } catch (error) {
      if (String(error.response.data).indexOf("-duplicate") !== -1) {
        notify("Duplicate file", NOTIFY_TYPES.warn);
        userAnalyzeDataCallback()
      } else {
        notify("Error uploading file", NOTIFY_TYPES.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', borderRadius: "7px" }}>
        {loading && <CircularProgress style={{marginTop: '10px'}} />}
        {
          !loading &&
          <label htmlFor="fileInput">
            <Input type='file' name='file' color='primary' inputProps={{ accept: '.pcap' }} onChange={handleFileChange} id="fileInput" style={{ position: 'absolute', top: 0, left: 0, opacity: 0, zIndex: -1 }} />
            <div style={{ color: 'white', backgroundColor: '#1976d2', borderColor: 'transparent', borderRadius: '8px', borderStyle: 'solid', paddingTop: PADDING_C, paddingBottom: PADDING_C, paddingRight: PADDING_C, paddingLeft: PADDING_C, cursor: 'pointer', fontFamily: 'inherit', fontSize: '20px', boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.25)', width: "400px" }}>
              {file?.name === undefined ? fileNotSelected : fileSelected}
            </div>
          </label>
        }
        {
          !loading &&
          <Button sx={{ mt: 2, textTransform: 'none' }} style={{ textDecoration: 'none', color: 'white' }} onClick={handleUpload} color='primary' variant='contained' startIcon={<FileUploadIcon />}>
              Upload
          </Button>
        }
      </Box>
    </div>
  );
};

export default UploadComp;