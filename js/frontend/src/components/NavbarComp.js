import React from 'react'
import { AppBar, Button, Stack, Toolbar, Typography } from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import AnalyzeIcon from '@mui/icons-material/FindInPage';
import ProfileIcon from '@mui/icons-material/AccountBox';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

const NavbarComp = ({isValidUser, userData}) => {
  return (
    <AppBar position="static" style={{ backgroundColor: '#1976d2'/* '#006093' */ }} px={2}>
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Network Analyzer - yair elad
      </Typography>
      <Stack direction={'row'} spacing={1}>

        <Button href="/profile" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<ProfileIcon/>}>
            Profile
        </Button>
        {
          !isValidUser && /* false */
          <Button href="/login" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<LoginIcon/>}>
            Login
          </Button>
        }
        {
          isValidUser &&
          <Button href="/Analyze" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<AnalyzeIcon/>}>
            Analyze
          </Button>
        }
        {
          isValidUser && userData.isadmin &&
          <Button href="/users" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<GroupIcon />}>
            Users
          </Button>
        }
        {
          isValidUser &&
          <Button href="/logout" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<LogoutIcon/>}>
            Logout
          </Button>
        }
      </Stack>
    </Toolbar>
  </AppBar>
  )
}

export default NavbarComp