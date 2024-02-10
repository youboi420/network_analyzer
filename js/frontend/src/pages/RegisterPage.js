import { Avatar, Box, Button, Container, Grid, TextField, Link, Typography, ThemeProvider } from '@mui/material'
import React from 'react'
import RegisterPageStyle from '../Style/LoginPage.module.css'
import UserIcon from '@mui/icons-material/Person'
import { NOTIFY_TYPES, notify } from '../services/notify_service'
import { hashPassword } from '../services/hashPassword'


function RegisterPage() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [repeat_password, setRepeatPasseword] = React.useState('')
  const [usernameError, setUsernameError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [passwordErrorMiss, setPasswordErrorMiss] = React.useState('')

  const isUsernameValid = (username) => /^[a-zA-Z][a-zA-Z0-9]{0,250}$/.test(username)
  const isPasswordValid = (password) => password.length >= 6 && /^.{0,250}$/.test(password)
  const isPasswordMatch = (p1, p2) => p1 === p2


  const handleUsernameChange = (event) => {
    const value = event.target.value
    setUsername(value)
    setUsernameError(isUsernameValid(value) ? '' : 'Invalid username')
  }

  const handlePasswordChange = (event) => {
    const value = event.target.value
    setPassword(value)
    setPasswordError(isPasswordValid(value) ? '' : 'Invalid password')
    setPasswordErrorMiss(isPasswordMatch(value, repeat_password) ? '' : "Password's do not match")
  }

  const handleRepPasswordChange = (event) => {
    const value = event.target.value
    setRepeatPasseword(value)
    setPasswordErrorMiss(isPasswordMatch(value, password) ? '' : "Password's do not match")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (username === '' || password === '' || repeat_password === '') {
      notify("One or more fields are empty...", NOTIFY_TYPES.error)
      return
    }

    if (!isPasswordMatch(password, repeat_password)) {
      setPasswordErrorMiss("Password's do not match - please try again")
      return
    }
    if (!isPasswordValid(password)) {
      setPasswordError('Invalid password')
      return
    }
    if (!isUsernameValid(username)) {
      setUsername('Invalid username')
      return
    }
    const hashed_pass = await hashPassword(password)
    notify(`Should (POST) request ${username} ${hashed_pass} with axios`, NOTIFY_TYPES.info)
    console.log(`Should (POST) request ${username} ${hashed_pass} with axios`)
  }

  return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '85vh' }} className={RegisterPageStyle.body}>
      <Container component="main" maxWidth='xs' style={{ justifyContent: 'ce' }} >
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: "blur(10000px)", borderRadius: "4%"}}>
            <Avatar sx={{ m: 1, bgcolor: '#1976d2' }}><UserIcon /></Avatar>
            <Typography component="h1" variant="h5" style={{/* color:"white", */ borderRadius: "30%", backdropFilter: 'blur(100px)'}}>
              Create your account
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id='username'
                    label='Username'
                    type="text"
                    name='username'
                    autoComplete='username'
                    value={username}
                    onChange={handleUsernameChange}
                    error={!!usernameError}
                    helperText={usernameError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id='password'
                    label='Password'
                    type="password"
                    name='Password'
                    autoComplete='password'
                    value={password}
                    onChange={handlePasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id='rep_password'
                    label='Repeat password'
                    type="password"
                    name='rep_Password'
                    autoComplete='password'
                    value={repeat_password}
                    onChange={handleRepPasswordChange}
                    error={!!passwordErrorMiss}
                    helperText={passwordErrorMiss}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    Already have an account? - Sign in here
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  )
}

export default RegisterPage