import { Box, Button, CircularProgress, Input, Stack, Typography } from '@mui/material';
import PicktFileIcon from '@mui/icons-material/AttachFile'; 
import CheckIcon from '@mui/icons-material/Check';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import React from 'react';
import { NOTIFY_TYPES, notify } from '../services/notify_service';
import axios from 'axios';

import * as files_service from '../services/files_service'

const MAX_FILE_SIZE_MB = 16
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const UploadComp = ( {userAnalyzeDataCallback, fallBack} ) => {
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const PADDING_C = 25;
  
  const fileNotSelected = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: "24px" }}>
      <span>Please select a file!</span>
      <PicktFileIcon style={{ marginLeft: '5px' }} />
    </div>    
  );

  const fileSelected = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: "28px" }}>
      <span>Picked: {file?.name}</span>
      <CheckIcon style={{ marginLeft: '5px' }} />
    </div>
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        notify(`File size exceeds (${MAX_FILE_SIZE_MB} MB) limit`, NOTIFY_TYPES.error);
        setFile(null);
        return;
      }
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
      notify("No file selected", NOTIFY_TYPES.short_error);
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData()
      formData.append('file', file);
      const response = await files_service.upload(formData)
      if (response?.status === 200) {
        notify("File uploaded successfully", NOTIFY_TYPES.success);
      } else if (response?.status === 409) {
        notify("Duplicate file", NOTIFY_TYPES.warn);
        setFile(null)
      } else {
        notify("Failed to upload file", NOTIFY_TYPES.error);
      }
      setFile(null);
      userAnalyzeDataCallback()
    } catch (error) {
      if (String(error.response.data).indexOf("-duplicate") !== -1) {
        notify("Duplicate file", NOTIFY_TYPES.warn);
        setFile(null)
      } else {
        if (error.response?.status === 400) {
          notify("bad file uploaded. please upload a valid file.", NOTIFY_TYPES.error);
          setFile(null)
        } else {
          notify("Error uploading file", NOTIFY_TYPES.error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', borderRadius: "7px" }}>
        {loading && <CircularProgress style={{marginTop: '30px'}} />}
        {
          !loading &&
          <label htmlFor="fileInput">
            <Input type='file' name='file' color='primary' inputProps={{ accept: '.pcap' }} onChange={handleFileChange} id="fileInput" style={{ position: 'absolute', top: 0, left: 0, opacity: 0, zIndex: -1 }} />
            <div style={{ color: 'white', backgroundColor: '#1976d2', borderColor: 'transparent', borderRadius: '8px', borderStyle: 'solid', paddingTop: PADDING_C, paddingBottom: PADDING_C, paddingRight: PADDING_C, paddingLeft: PADDING_C, cursor: 'pointer', fontFamily: 'inherit', fontSize: '1px', boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.25)', width: "600px" }}>
              {file?.name === undefined ? fileNotSelected : fileSelected}
            </div>
          </label>
        }
        {
          !loading &&
          <Button size='large' disabled={!file} sx={{ width: "100%", mt:  "calc(3%)", textTransform: 'none' }} style={{ textDecoration: 'none', color: 'white' }} onClick={handleUpload} color='primary' variant='contained' startIcon={<FileUploadIcon style={{fontSize: "28px"}} />}>
              <Typography style={{fontSize: "24px", marginTop: 8}} >Upload</Typography>
          </Button>
        }
      </Box>
    </div>
  );
};

export default UploadComp;