import React from 'react';
import { AppBar, Box, Button, Card, Divider, Stack, Toolbar, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

import GroupIcon from '@mui/icons-material/Group';
import AnalyzeIcon from '@mui/icons-material/FindInPage';
import ProfileIcon from '@mui/icons-material/AccountBox';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import FilesIcon from '@mui/icons-material/FolderCopy';
import HomeIcon from '@mui/icons-material/Home';
import logo from '../Images/logo1.png'

const NavbarComp = ({ isValidUser, userData }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <AppBar position="fixed" style={{ top: 0, zIndex: 1000, backgroundColor: 'rgba(25, 118, 210, 0.9)' }} px={2}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img style={{padding: 4, marginLeft: "-20px", marginRight: "10px"}} src={logo} alt='logo...' width={55} height={55} />
            <Typography variant="h6" component="div" >
              Network Analyzer
              <Typography variant="body1" >
                © Yair Elad {new Date().getFullYear()} 
              </Typography>
            </Typography>
          </Box>
          <Stack direction={'row'} spacing={1}>
            <Card
              variant="elevation"
              sx={{
                display: 'flex',
                backgroundColor: "transparent",
                color: 'white',
                '& svg': {
                  m: 1,
                },
                '& hr': {
                  mx: 0.5,
                },
              }}
            >
              {
                isValidUser &&
                <Button href="/" sx={{ textTransform: 'none', fontWeight: isActive('/') ? 'bold' : 'normal' }} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: isActive("/") ? "#0a4e8e" : "inherit" }} startIcon={<HomeIcon />}>
                  Home
                </Button>
              }
              {
                isValidUser &&
                <Divider orientation="vertical" variant="middle" flexItem />
              }
              <Button href="/profile" sx={{ textTransform: 'none', fontWeight: isActive('/profile') ? 'bold' : 'normal' }} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: isActive("/profile") ? "#0a4e8e" : "inherit" }} startIcon={<ProfileIcon />}>
                Profile
              </Button>
              <Divider orientation="vertical" variant="middle" flexItem />
              {
                !isValidUser && /* false */
                <Button href="/login" sx={{ textTransform: 'none', fontWeight: isActive('/login') ? 'bold' : 'normal' }} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: isActive("/login") ? "#0a4e8e" : "inherit" }} startIcon={<LoginIcon />}>
                  Login
                </Button>
              }
              {
                isValidUser &&
                <Button href="/analyzeandfiles" sx={{ textTransform: 'none', fontWeight: isActive('/analyzeandfiles') ? 'bold' : 'normal' }} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: isActive("/analyzeandfiles") ? "#0a4e8e" : "inherit" }}>
                  <AnalyzeIcon /> Analyze  && <FilesIcon /> Files
                </Button>
              }
              {
                isValidUser &&
                <Divider orientation="vertical" variant="middle" flexItem />
              }
              {
                isValidUser && userData.isadmin &&
                <Button href="/users" sx={{ textTransform: 'none', fontWeight: isActive('/users') ? 'bold' : 'normal' }} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: isActive("/users") ? "#0a4e8e" : "inherit" }} startIcon={<GroupIcon />}>
                  Users
                </Button>
              }
              {
                userData.isadmin &&
                <Divider orientation="vertical" variant="middle" flexItem />
              }
              {
                isValidUser &&
                <Button href="/logout" sx={{ textTransform: 'none', fontWeight: isActive('/logout') ? 'bold' : 'normal' }} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: isActive("/logout") ? "#0a4e8e" : "inherit" }} startIcon={<LogoutIcon />}>
                  Logout
                </Button>
              }
            </Card>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box pt={8}> {/* Offset content with padding equal to the height of the AppBar */}
        {/* Your content here */}
      </Box>
    </>
  )
}

export default NavbarComp;
