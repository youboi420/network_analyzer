import React from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, Button, IconButton, Stack, Select, MenuItem, FormControl, InputLabel, FormHelperText, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditNote from '@mui/icons-material/EditNote'
import { updateUser } from '../services/user_service'
import { hashPassword } from '../services/hashPassword'


import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'


const UserUpdateDialog = ({ isOpen = false, onClose, fetchDataAndSetRows, userObj, onSuccess, onFailed }) => {
  const [duplicateUsernameError, setDuplicateUsernameError] = React.useState('')
  const [newUsername, setNewUsername] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [newIsAdmin, setNewIsAdmin] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [usernameError, setUsernameError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [adminError, setAdminError] = React.useState('')
  const userErrMsg = 'No spaces allowed or special chars'
  const passErrMsg = 'Minimum length of 6 characters'
  const adminErrMsg = 'Invalid value. Please use true/false or 1/0.'
  const isUsernameValid = (username) => /^[a-zA-Z][a-zA-Z0-9]{0,250}$/.test(username)
  const isPasswordValid = (password) => password.length >= 6 && /^.{0,250}$/.test(password)
  const isAdminValid = (admin) => /^(true|false|1|0)$/.test(admin)

  const handleUpdate = async () => {
    try {
      if (isUsernameValid(newUsername) && isPasswordValid(newPassword) && isAdminValid(newIsAdmin) && userObj.id !== undefined) {
        const hashed_pass = await hashPassword(newPassword)
        await updateUser(userObj.id, newUsername, hashed_pass, newIsAdmin)
        fetchDataAndSetRows() /* reload data */
        onSuccess()
        onClose()
      } else {
        setUsernameError(isUsernameValid(newUsername) ? '' : userErrMsg)
        setPasswordError(isPasswordValid(newPassword) ? '' : passErrMsg)
        setAdminError(isAdminValid(newIsAdmin) ? '' : adminErrMsg)
      }
    } catch (error) {
      if (error.response.status === 409) {
        setDuplicateUsernameError("duplicate username")
      } else {
        console.error('Error updating user:', error)
        onFailed()
      }
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
      if (userObj === undefined) {
        setNewUsername('')
        setNewPassword('')
        setNewIsAdmin('')
      } else {
        setNewUsername('')
        setNewPassword('')
        setNewIsAdmin('')
        setNewUsername(userObj.username)
        setNewPassword(userObj.password)
        setNewIsAdmin(userObj.isadmin)
      }

      setUsernameError('')
      setPasswordError('')
      setAdminError('')
    }
  }, [isOpen, userObj])

  return (
    <div>

      <Dialog open={isOpen} onClose={handleClose} onAbort={handleClose} maxWidth='sm' style={{ backdropFilter: "blur(1px)" }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          Update User
          <IconButton sx={{ ml: 'auto' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack>
            <TextField
              InputProps={{
                readOnly: true,
              }}
              label="id"
              value={userObj === undefined ? "NaN" : userObj.id}
              sx={{ marginBottom: 1, marginTop: 1 }}
            />
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
          {duplicateUsernameError && (
            <Alert severity="error" sx={{ marginTop: 0, marginBottom: 2 }}>
              {duplicateUsernameError}
            </Alert>
          )}
          <Stack>
            <Button onClick={handleUpdate} color='info' variant='outlined' startIcon={<EditNote />} >UPDATE</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserUpdateDialog