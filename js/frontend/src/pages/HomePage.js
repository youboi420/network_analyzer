import React from 'react';
import HomeStyle from '../Style/HomePage.module.css'
import { Button } from '@mui/material';
import * as user_service from '../services/user_service'
import { NOTIFY_TYPES, notify } from '../services/notify_service';
import { Navigate } from 'react-router-dom';


function HomePage({isValidUser, userData}) {
	console.log(userData);
	if (isValidUser) {
		return (
			<div className={HomeStyle.body} >
				<h1>Welcome to home page</h1>
					{/* <Button
				fullWidth
				variant="contained"
				sx={{ mt: 3, mb: 2 }}
				onClick={click}
				>
				TEST COOKIE
			</Button> */}
			</div>
		)
	}
	return (
		<Navigate to={'/login'} />
	);
}
export default HomePage;