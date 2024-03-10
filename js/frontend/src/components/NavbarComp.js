import React from 'react'
import { AppBar, Box, Button, Card, Chip, Divider, Stack, Toolbar, Typography } from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import AnalyzeIcon from '@mui/icons-material/FindInPage';
import ProfileIcon from '@mui/icons-material/AccountBox';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import FilesIcon from '@mui/icons-material/FolderCopy';
import HomeIcon from '@mui/icons-material/Home';
const NavbarComp = ({ isValidUser, userData }) => {
  return (
    <AppBar position="static" style={{ backgroundColor: '#1976d2'/* '#006093' */ }} px={2}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, alignItems: 'baseline', justifyContent: 'center' }}>
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
            <Button href="/" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<HomeIcon />}>
              Home
            </Button>
          }
          {
            isValidUser &&
            <Divider orientation="vertical" variant="middle" flexItem />
          }
          <Button href="/profile" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<ProfileIcon />}>
            Profile
          </Button>
          <Divider orientation="vertical" variant="middle" flexItem />
          {
            !isValidUser && /* false */
            <Button href="/login" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<LoginIcon />}>
              Login
            </Button>
          }
          {
            isValidUser &&
            <Button href="/analyze" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<AnalyzeIcon />}>
              Analyze & Statistics
            </Button>
          }
          {
            isValidUser &&
            <Divider orientation="vertical" variant="middle" flexItem />
          }
          {
            isValidUser &&
            <Button href="/files" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<FilesIcon />}>
              Files
            </Button>
            
          }
          {
            isValidUser &&
            <Divider orientation="vertical" variant="middle" flexItem />
          }

          {
            isValidUser && userData.isadmin &&
            <Button href="/users" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<GroupIcon />}>
              Users
            </Button>
          }
          {
            userData.isadmin &&
          <Divider orientation="vertical" variant="middle" flexItem />
          }
          {
            isValidUser &&
            <Button href="/logout" sx={{ textTransform: 'none' }} style={{ textDecoration: 'none', color: 'inherit' }} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          }
          </Card>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default NavbarComp