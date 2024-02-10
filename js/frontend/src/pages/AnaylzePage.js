import * as React from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import * as analyze_service from '../services/analyze_service'
import { NOTIFY_TYPES, notify } from '../services/notify_service';
import uploadComp from '../components/upload_comp';

const AnaylzePage = () => {
  const [username, setUsername] = React.useState('')
  const navigate = useNavigate()
  const handleClick  = () => {
    notify("clicked on analyze... calling analyze service", NOTIFY_TYPES.info);
    analyze_service.analyze()
  }
  const validateUser = () => {
    // /*
    //   TODO get the cookie if its valid. get the username else navigate to '/login'
    //  */
    // navigate('/login')
    // console.log("Sorry not supported yet...");
  }
  const getUserName = () => {
    
  }
  window.onload = validateUser
  return (
    <uploadComp />
    // <div>
    //   AnaylzePage
    //   {
    //     <div>sensetive data</div>
    //   }
    // </div>
  )
}

export default AnaylzePage