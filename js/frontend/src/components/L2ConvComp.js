import React from 'react';
import { Button, Box, Stack, Divider, IconButton, Typography } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { arpDataTable } from './L2Common';
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'

const L2ConvComp = ({ convsDataArray }) => {
  const [startIndex, setStartIndex] = React.useState(0);
  const ITEMS_PER_PAGE = 10;
  
  const handlePrevPage = () => {
    setStartIndex(Math.max(startIndex - ITEMS_PER_PAGE, 0));
  };

  const handleNextPage = () => {
    setStartIndex(Math.min(startIndex + ITEMS_PER_PAGE, convsDataArray?.length));
  };

  const totalPages = Math.ceil(convsDataArray?.length / ITEMS_PER_PAGE);

  return (
    <div style={{ flex: 1 }}>
      <h1 className={AnalyzePanelViewStyle.data_title}  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>Layer 2 - ARP Conversations</h1>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {
          totalPages !== 0 &&
          <Stack direction="row" alignItems="center" >
            <IconButton onClick={handlePrevPage} disabled={startIndex === 0}>
              <FirstPageIcon />
            </IconButton>
            <Typography style={{textTransform: "none", marginTop: 5}}>
              Page: {Math.floor(startIndex / ITEMS_PER_PAGE) + 1} of {totalPages}
            </Typography>
            <IconButton onClick={handleNextPage} disabled={startIndex >= convsDataArray?.length - ITEMS_PER_PAGE}>
              <LastPageIcon />
            </IconButton>
          </Stack>
        }
        {
          totalPages === 0 &&
          <div>
            <h1 className={AnalyzePanelViewStyle.data_title}>
              Arp conversations didn't accour
            </h1>
          </div>
        }
      </div>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={1} style={{ width: '95%' }}>
          {
            convsDataArray.slice(startIndex, startIndex + ITEMS_PER_PAGE).map((conversation, index) => (
              <div key={conversation.conversationId}>
                <Box sx={{ paddingBottom: 1 }}>
                  {
                    arpDataTable(conversation)
                  }
                </Box>
                {
                  index !== convsDataArray?.slice(startIndex, startIndex + ITEMS_PER_PAGE).length - 1 && (
                  <Divider
                    orientation="horizontal"
                    sx={{ bgcolor: '#1976d2', borderBottomWidth: 15, marginRight: 10, marginLeft: 10 }}
                  />)
                }
              </div>
            ))
          }
        </Stack>
      </div>
    </div>
  );
};

export default L2ConvComp;