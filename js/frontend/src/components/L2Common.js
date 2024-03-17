import { Box, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'
import DownArrowIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import InfoIcon from '@mui/icons-material/Info';


const FLOATING_LIMITER = 2

const L2_DATA_TYPES = {
  REQ: 'REQ',
  RES: 'RES'
}

const PARAMETER_ROW = {
  MAC: "MAC Address",
  ARP_REQ: "Arp Request",
  ARP_RES: "Arp Response",
  PACKETS: "Packet's Sent"
}

const PARAMETER_ROW_EXP = {
  MAC: "A mac address is physical address of a network adaptor and is asigned by the manufacturing company.",
  ARP_REQ: "An arp request is a frame in layer two that request a certian IP (logical) address to respond with it's MAC (physical) address.",
  ARP_RES: "An arp reponse is a frame in layer two that has said certian MAC (physical) address that curresponds to it's IP (logical) address.",
  PACKETS: "The amount of bytes sent by the host"
}
const explainL2Label = (value) => {
  switch (value) {
    case PARAMETER_ROW.MAC:
      return PARAMETER_ROW_EXP.MAC
    case PARAMETER_ROW.ARP_REQ:
      return PARAMETER_ROW_EXP.ARP_REQ
    case PARAMETER_ROW.ARP_RES:
      return PARAMETER_ROW_EXP.ARP_RES
    case PARAMETER_ROW.PACKETS:
      return PARAMETER_ROW_EXP.PACKETS
    default:
      return "..."
  }
}

const arpColumns = [
  { field: 'param', headerName: (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      Parameter
      <InfoIcon sx={{ml: "5px"}}/>
    </div>
  ), width: 150, align: 'right', headerAlign: 'center', renderCell: (params) => {
    return <Tooltip title={<Typography fontSize={16}>{explainL2Label(params.value)}</Typography>} style={{borderRadius: '12px',width: "100%", height: "50%",backgroundColor: "#1976d2", color: "white",alignItems: 'center', justifyContent: 'center', padding: 2, paddingTop: 8, cursor: 'zoom-in' }}> {params.value} </Tooltip>
  }},
  { field: 'hostA', headerName: 'Host A', flex: 1, align: 'center', headerAlign: 'center' },
  { field: 'hostB', headerName: 'Host B', flex: 1, align: 'center', headerAlign: 'center' },
];
const arpDataTable = (perConvData) => {
  if (!perConvData) {
    return <div>Error: perConvData is undefined or null</div>;
  }
  const convId = perConvData.conversationId
  const convRltvTime = perConvData.durationInSeconds
  const convRealTime = { start: perConvData.packetList[0].time_stamp_date, end: perConvData.packetList[perConvData.packetList.length - 1].time_stamp_date }
  const convNumPacketsA = perConvData.numberPacketA
  const convNumPacketsB = perConvData.numberPacketB
  const convNumberPacket = convNumPacketsA + convNumPacketsB

  const arpRows = [
    { id: 1, param: PARAMETER_ROW.MAC, hostA: perConvData.hostA, hostB: perConvData.hostB },
    { id: 2, param: PARAMETER_ROW.ARP_REQ, hostA: perConvData.numberREQA, hostB: perConvData.numberREQB },
    { id: 3, param: PARAMETER_ROW.ARP_RES, hostA: perConvData.numberRESA, hostB: perConvData.numberRESB },
    { id: 4, param: PARAMETER_ROW.PACKETS, hostA: convNumPacketsA, hostB: convNumPacketsB },
  ]

  return (
    <div style={{ flex: 1, borderStyle: "solid", borderRadius: "12px", textAlign: "center" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 className={AnalyzePanelViewStyle.data_title} >{"Conversation: " + (convId + 1)}</h1>
        <Stack spacing={0}>
          <Box>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom:  20 }}>
              <div style={{ width: '30%', textAlign: 'left', borderStyle: "solid", borderRadius: "12px", marginLeft: 10, marginRight: 10, paddingLeft: 20 }}>
                <div>
                  <h2 className={AnalyzePanelViewStyle.data_title} >
                    Relative Time
                  </h2>
                  <h3>
                    {
                      Number(convRltvTime) === 0 ? "Only one packet sent" :
                        Number(convRltvTime) < 60 ?
                          Number(convRltvTime).toFixed(FLOATING_LIMITER * 3) + " 'sec" :
                          `≈ ${Math.floor(Number(convRltvTime) / 60)}:${(Number(convRltvTime) % 60).toFixed(FLOATING_LIMITER).padStart(2, '0')} 'min`
                    }
                  </h3>
                </div>
                <Divider orientation='horizontal' sx={{ bgcolor: "black", marginRight: "20px", borderBottomWidth: 2 }} />
                <div>
                  <h2 className={AnalyzePanelViewStyle.data_title} >
                    Recording Time Stamp
                  </h2>
                  <h3 style={{marginBottom: 1}}>
                    {convRealTime.start}
                  </h3>
                  <DownArrowIcon sx={{ml: "130px"}} />
                  <h3 style={{marginTop: 1}}>
                    {convRealTime.end}
                  </h3>
                </div>
                <Divider orientation='horizontal' sx={{ bgcolor: "black", marginRight: "20px", borderBottomWidth: 2 }} />
                <div>
                  <h2 className={AnalyzePanelViewStyle.data_title} >
                    Packet Count
                  </h2>
                  <h3>
                    {convNumberPacket}
                  </h3>
                </div>
              </div>
              <DataGrid
                sx={{ height: "40.5vh", width: "800px", marginLeft: 1, borderStyle: "solid", borderColor: "black", borderRadius: "18px", borderWidth: "medium", fontSize: "16px" }}
                rows={arpRows}
                columns={arpColumns}
              />
            </div>
          </Box>
        </Stack>
      </div>
    </div>
  );
}
export { arpDataTable, L2_DATA_TYPES };
