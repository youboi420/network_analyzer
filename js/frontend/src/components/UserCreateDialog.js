import React from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, Button, IconButton, Stack, Select, MenuItem, FormControl, InputLabel, FormHelperText, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DB_ERROR_CODES, createUser } from '../services/user_service'
import AddIcon from '@mui/icons-material/Add'
import 'react-toastify/dist/ReactToastify.css'
import { hashPassword } from '../services/hashPassword'

import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const UserCreateDialog = ({ isOpen = false, onClose, fetchDataAndSetRows, onSuccess, onFailed }) => {
  const [duplicateUsernameError, setDuplicateUsernameError] = React.useState('')
  const [newUsername, setNewUsername] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [repeatPasseord, setRepeatPasseord] = React.useState('')
  const [newIsAdmin, setNewIsAdmin] = React.useState('')
  const [adminError, setAdminError] = React.useState('')
  const [usernameError, setUsernameError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [passwordMissError, setPasswordMissError] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  const userErrMsg = 'No spaces allowed or special chars'
  const passErrMsg = 'Minimum length of 6 characters'
  const passErrMissMsg = "Password's do not match"
  const adminErrMsg = "empty or invalid option"

  const isUsernameValid = (username) => /^[a-zA-Z][a-zA-Z0-9]{0,250}$/.test(username)
  const isPasswordValid = (password) => password.length >= 6 && /^.{0,250}$/.test(password)
  const isAdminValid = (admin) => /^(true|false|1|0)$/.test(admin)

  const handleCreate = async () => {
    try {
      if (isUsernameValid(newUsername) && isPasswordValid(newPassword) && isAdminValid(newIsAdmin)) {
        const hashed_pass = await hashPassword(newPassword)
        const userObj = { un: newUsername, password: hashed_pass, isadmin: newIsAdmin === '1' ? true : false }
        await createUser(userObj.un, userObj.password, userObj.isadmin)
        fetchDataAndSetRows() /* reload data */
        onSuccess()
        onClose()
      } else {
        setUsernameError(isUsernameValid(newUsername) ? '' : userErrMsg)
        setPasswordError(isPasswordValid(newPassword) ? '' : passErrMsg)
        setAdminError(isAdminValid(newIsAdmin) ? '' : adminErrMsg)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      if (error.message === DB_ERROR_CODES.dup) setDuplicateUsernameError('Duplicate username. Please choose a different one.')
      else onFailed()
    }
  }

  const handleClose = () => {
    onClose()
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  
  React.useEffect(() => {
    if (isOpen) {
      setNewUsername('')
      setNewPassword('')
      setNewIsAdmin('')
      setUsernameError('')
      setPasswordError('')
      setAdminError('')
    }
  }, [isOpen])

  return (
    <div>
      <Dialog open={isOpen} onClose={handleClose} onAbort={handleClose} maxWidth='sm' style={{ backdropFilter: "blur(1px)" }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          Create User
          <IconButton sx={{ ml: 'auto' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack>
            <TextField
              sx={{ marginBottom: 1, marginTop: 1/* , borderLeft: 10, borderColor: "transparent" */ }}
              label="New Username"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value)
                setUsernameError(isUsernameValid(e.target.value) ? '' : userErrMsg)
              }}
              error={!!usernameError}
              helperText={usernameError}
            />
            <TextField
              sx={{ marginBottom: 1, marginTop: 1 }}
              label="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPasswordError(isPasswordValid(e.target.value) ? '' : passErrMsg)
              }}
              type={showPassword ? 'text' : 'password'}
              error={!!passwordError} /* covert to boolean */
              helperText={passwordError}
              InputProps={{
                style: { color: "black" },
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                ),
              }}

            />
            {/* need to add repeat password field */}
            {/* <TextField
              sx={{ marginBottom: 1, marginTop: 1 }}
              label="Repeat Password"
              value={repeatPasseord}
              onChange={(e) => {
                setRepeatPasseord(e.target.value)
                setPasswordMissError(isPasswordValid(e.target.value, newPassword) ? '' : passErrMissMsg)
              }}
              type="password"
              error={!!passwordError} // covert to boolean
              helperText={passwordError}
            /> */}
            <FormControl sx={{ marginBottom: 1, marginTop: 1, width: '100%' }}>
              <InputLabel>Admin</InputLabel>
              <Select
                label="Admin"
                value={newIsAdmin}
                fullWidth
                onChange={(e) => {
                  setNewIsAdmin(e.target.value)
                  setAdminError(isAdminValid(e.target.value) ? '' : adminErrMsg)
                }}
                error={!!adminError}
              >
                <MenuItem value="1">yes</MenuItem>
                <MenuItem value="0">no</MenuItem>
              </Select>
              <FormHelperText>{adminError}</FormHelperText>
            </FormControl>
          </Stack>
          <br />
          <Stack>
            <Button onClick={handleCreate} color='success' variant='outlined' startIcon={<AddIcon />} >CREATE</Button>
          </Stack>
          {duplicateUsernameError && (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {duplicateUsernameError}
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserCreateDialog