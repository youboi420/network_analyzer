import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';


const GenereicDeleteDialog = ({ isOpen = false, callBackFunction, onClose, userId, deletionType }) => {
  const handleConfirm =  () => {
    callBackFunction()
    onClose()
  };
  
  const deleteMsg = <div></div>
  
  return (
    <Dialog open={isOpen} onClose={onClose} style={{backdropFilter: "blur(0.5px)"}}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this {deletionType}?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={ <CloseIcon/> } >Cancel</Button>
        <Button onClick={handleConfirm} color="error" startIcon={ <DeleteIcon /> }>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default GenereicDeleteDialog