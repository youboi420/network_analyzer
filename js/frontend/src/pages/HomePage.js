import React from 'react';
// import '../Images/NoPage.jpg'
import HomeStyle from '../Style/HomePage.module.css'
import { Button } from '@mui/material';
import * as user_service from '../services/user_service'
import { NOTIFY_TYPES, notify } from '../services/notify_service';


function HomePage() {
	const click = async () => {
		try {
			await user_service.getCookie();
			notify("Created cookie", NOTIFY_TYPES.success)
		} catch (error) {
			console.log("Error setting cookie");
		}
	}
	return (
		<div className={HomeStyle.body} >
			<Button
				fullWidth
				variant="contained"
				sx={{ mt: 3, mb: 2 }}
				onClick={click}
			>
				TEST COOKIE
			</Button>
		</div>
	);
}
export default HomePage;