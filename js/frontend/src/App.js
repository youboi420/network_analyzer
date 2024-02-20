import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserManagePage from './pages/UserManagePage';
import NoPage from './pages/NoPage';
import AnaylzePage from './pages/AnaylzePage';
import SignUpPage from './pages/SignUpPage';

import LogoutPage from './pages/LogoutPage';
import NavbarComp from './components/NavbarComp';

import * as user_service from './services/user_service';
import { Box, LinearProgress } from '@mui/material';
import LandingPage from './pages/LandingPage';

function App() {
  const [isValidUser, setIsValidUser] = useState(false);
  const [usersData, setIsValidData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const title = "Analyze app © Y-E "
  const fetchValidUser = async () => {
    try {
      const isValidUserResponse = await user_service.verifyUserCookie();
      setIsValidUser(isValidUserResponse.valid);
      setIsValidData(isValidUserResponse)
    } catch (error) {
      console.error('Error fetching valid user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = title
    fetchValidUser();
  }, []);


  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress style={{height: "20px"}} />
      </Box>
    )
  }

  return (
    <BrowserRouter>
      <NavbarComp isValidUser={isValidUser} userData={usersData}/>
      <Routes>
        {/* Routes protected by user validity */}
        <Route path="/profile" element={<LandingPage    /> } />
        <Route path="/logout"  element={<LogoutPage     /> } />
        <Route path="/login"   element={<LoginPage      isValidUser={isValidUser}/> } />
        <Route index           element={<HomePage       isValidUser={isValidUser}/> } />
        <Route path="/users"   element={<UserManagePage isValidUser={isValidUser} userData={usersData} /> } />
        <Route path="/signup"  element={<SignUpPage     isValidUser={isValidUser}/> } />
        <Route path="/analyze" element={<AnaylzePage    isValidUser={isValidUser} userData={usersData} /> } />
        <Route path="*"        element={<NoPage         isValidUser={isValidUser}/> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;