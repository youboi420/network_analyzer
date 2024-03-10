import React from 'react';
import { Button, Box, Stack, Divider, IconButton, Typography } from '@mui/material';
import { hostsDataTable, L4_DATA_TYPES } from './L4Common';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'

const L4ConvPanel = ({ convsDataArray, singleMode, proType }) => {
  const [startIndex, setStartIndex] = React.useState(0);
  const ITEMS_PER_PAGE = proType === L4_DATA_TYPES.TCP ? (!singleMode ? 3 : 5) : (!singleMode ? 5 : 10);
  const handlePrevPage = () => {
    setStartIndex(Math.max(startIndex - ITEMS_PER_PAGE, 0));
  };

  const handleNextPage = () => {
    setStartIndex(Math.min(startIndex + ITEMS_PER_PAGE, convsDataArray?.length));
  };

  const totalPages = Math.ceil(convsDataArray?.length / ITEMS_PER_PAGE);

  return (
    <div style={{ flex: 1,}}>
      {!singleMode && <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: -5, marginBottom: 5 }} className={AnalyzePanelViewStyle.data_title}>{proType}</h1>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {
          totalPages !== 0 &&
          <Stack direction="row" alignItems="center" style={{ marginBottom: 10 }}>
            <IconButton onClick={handlePrevPage} disabled={startIndex === 0}>
              <FirstPageIcon />
            </IconButton>
            <Typography style={{ textTransform: "none", marginTop: 5 }}>
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
              {proType} conversations didn't accour
            </h1>
          </div>
        }
      </div>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={1} style={{ width: '95%' }}>
          {convsDataArray?.slice(startIndex, startIndex + ITEMS_PER_PAGE)?.map((conversation, index) => (
            <div key={conversation.conversationId}>
              <Box sx={{ paddingBottom: 1 }}>
                {hostsDataTable(singleMode, conversation, proType)}
              </Box>
              {
                index !== convsDataArray?.slice(startIndex, startIndex + ITEMS_PER_PAGE).length - 1 && (
                <Divider
                  orientation="horizontal"
                  sx={{ bgcolor: '#1976d2', borderBottomWidth: 15, marginRight: 10, marginLeft: 10 }}
                />)
              }
            </div>
          ))}
        </Stack>
      </div>
    </div>
  );
};

export default L4ConvPanel;
