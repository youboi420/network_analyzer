import React from 'react';
import "../Style/InfoCard.css"
import { Dialog, DialogTitle, IconButton, Paper } from '@mui/material';
import UserCreateDialog from '../components/UserCreateDialog'
import CloseIcon from '@mui/icons-material/Close'

const InfoCard = ({ src, title, description, link, target }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const openDialog = () => {
    setIsDialogOpen(true);
  }

  const closeDialog = () => {
    setIsDialogOpen(false);
  }

  return (
    <div>
      <div className='card-link' onClick={openDialog} target={target}>
        <div className='card'>
          <img src={src} alt={title} />
          <div className="card_info">
            <h3>{title}</h3>
          </div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onClose={closeDialog} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {title}
          <IconButton sx={{ ml: 'auto', mb: 0.5 }} onClick={closeDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Paper sx={{padding: 3, width: "500px", height: "500px"}}>
          {description}
        </Paper>
      </Dialog>
    </div>
  );
}

export default InfoCard;
