import React, { useEffect } from 'react'
import * as user_service from '../services/user_service'
import { useNavigate } from 'react-router-dom';
import * as utils_service from '../services/utils_service'

const LogoutPage = () => {
  let navigate = useNavigate()
  useEffect(() => {
    const logout = async () => {
      try {
        const res = await user_service.clearCookie();
        navigate('/profile')
        utils_service.refreshPage()
      } catch (error) {
        console.error('Error loggin-out:', error);
      }
    };
    logout();
  }, [])
  
  return (
    <div>LogoutPage</div>
  )
}

export default LogoutPage