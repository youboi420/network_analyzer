import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import UserIcon from '@mui/icons-material/Person'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import LoginPageStyle from '../Style/LoginPage.module.css'

import { notify, NOTIFY_TYPES } from '../services/notify_service'
import * as user_service from '../services/user_service'
import { hashPassword } from '../services/hashPassword'
import { Navigate, useNavigate } from 'react-router-dom'
import * as utils_service from '../services/utils_service'


const defaultTheme = createTheme()

export default function LoginPage({ isValidUser }) {
  const [username, setUsername] = React.useState('')
  const [password_value, setPassword] = React.useState('')
  const [usernameError, setUsernameError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  let navigate = useNavigate();

  const handleUsernameChange = (event) => {
    const value = event.target.value
    setUsername(value)
    setUsernameError(isUsernameValid(value) ? '' : 'Invalid username')
  }

  const handlePasswordChange = (event) => {
    const value = event.target.value
    setPassword(value)
    setPasswordError(isPasswordValid(value) ? '' : 'Invalid password')
  }

  const isUsernameValid = (username) => /^[a-zA-Z][a-zA-Z0-9]{0,250}$/.test(username)
  const isPasswordValid = (password) => password.length >= 6 && /^.{0,250}$/.test(password)

  const verifyCookieOnLoad = async () => {
    try {
      const verificationResult = await user_service.verifyUserCookie();
      if (verificationResult.valid === true) {
        notify("Youre already logged in...", NOTIFY_TYPES.success)
        navigate('/analyze')
      } else {
        console.log('no JWT cookie present');
      }
    } catch (error) {
      console.error('Error verifying JWT cookie:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isUsernameValid(username)) {
      setUsernameError('Invalid username')
      return
    }
    if (!isPasswordValid(password_value)) {
      setPasswordError('Invalid password')
      return
    }
    const hashed_pass = await hashPassword(password_value)
    const user = {
      un: username,
      password: hashed_pass,
    }
    try {
      const res = await user_service.login(user.un, user.password)
      if (res.data.valid === true) {
        navigate('/profile');
        utils_service.refreshPage()
        notify(`conncted going to "/home"`, NOTIFY_TYPES.success)
      } else {
        notify("Incorrect password", NOTIFY_TYPES.error)
        setPasswordError("Incorrect password")
      }
    } catch (error) {
      if (error.message === user_service.DB_ERROR_CODES.nouser) {
        notify("user not found", NOTIFY_TYPES.error)
        setUsernameError("Username not found")
      }
      else notify("server error", NOTIFY_TYPES.error)
    }
  }
  window.onload = () => {
    verifyCookieOnLoad()
  }
  if (!isValidUser)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' }} >
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="xs" style={{ justifyContent: 'center' }} className={LoginPageStyle.body}>
            <CssBaseline />
            <Box sx={{ margin: -10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: "blur(10000px)", borderRadius: "4%", borderStyle: 'dashed', borderColor: "white" }}>
              <Avatar sx={{ m: 1, bgcolor: '#1976d2' }}>
                <UserIcon />
              </Avatar>
              <Typography component="h1" variant="h5" color={"white"}>
                Login to your account
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, px: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={handleUsernameChange}
                      error={!!usernameError}
                      helperText={usernameError}
                      InputLabelProps={{ style: { color: "black"/* '#314852' */ } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={password_value}
                      onChange={handlePasswordChange}
                      error={!!passwordError}
                      helperText={passwordError}
                      InputLabelProps={{ style: { color: "black"/* '#314852' */ } }}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Login
                </Button>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link href="/signup" variant="body2" style={{ color: '#314852', padding: '1px' }}>
                      <Typography style={{ font: 'message-box' }}>Don't have an account? - Sign up here</Typography>
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
      </div>
    )
  return (
    <Navigate to={'/analyze'}/>
  )
}