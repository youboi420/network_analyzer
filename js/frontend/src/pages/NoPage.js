import { IconButton, Stack } from '@mui/material';
import React from 'react';
import NTErrorImage from '../components/NoPageSvgComp'
import HomeIcon from '@mui/icons-material/Home'
import { Navigate } from 'react-router-dom';
function NoPage({isValidUser}) {
  if (!isValidUser) {
    return (
      <Navigate to={'/login'}/>
    )
  }
  return (
    <div >
      <Stack spacing={2} alignItems="center">
        {/* <img src={NTErrorImage} alt='nopagefound'/> */}
        <NTErrorImage/>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <IconButton href='/' color='primary' variant='contained'>Take me <HomeIcon/></IconButton>
      </Stack>
    </div>
  );
}
export default NoPage;