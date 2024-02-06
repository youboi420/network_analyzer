import { IconButton, Stack } from '@mui/material';
import React from 'react';
import NTErrorImage from '../Images/network-error.png'
import HomeIcon from '@mui/icons-material/Home'
function NoPage() {
  return (
    <div >
      <Stack spacing={2} alignItems="center">
        <img src={NTErrorImage}/>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <IconButton href='/' color='primary' variant='contained'><HomeIcon/> page</IconButton>
      </Stack>
    </div>
  );
}
export default NoPage;