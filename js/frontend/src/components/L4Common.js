import { Box, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'
import DownArrowIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

const FLOATING_LIMITER = 2

const PARAMETER_ROW = {
  IP: "IP Address",
  PORT: "Port",
  PACKET: "Packet Count",
  DATA: "Data Size"
}
const PARAMETER_ROW_EXP = {
  IP: "An ip address is logical address of a computer in the network, the ip address of the host.",
  PORT: "An port number is the logical identifier for a program's connection in the newtwork, the port number of the host.",
  PACKET: "A packet is form of data transmitted in layer 4 in the osi model, the amount of sent packet's from the host.",
  DATA: "The amount of bytes sent by the host"
}

const EXCEP_PARAMETER_ROW = {
  RETRANS:    "retransmission",
  RESET:      "reset",
  ACK_A_TO_B: "duplicate ack a to b",
  ACK_B_TO_A: "duplicate ack b to a",
  ZEROWIN:    "zero window",
}
const EXCEP_PARAMETER_ROW_EXP = {
  RETRANS_EXCEP:    "retransmission is caused. trying to re send the data. or requesting a specific packet soon.",
  RESET_EXCEP:      "either the conversation ended unpredictebly, or it will restart.",
  ACK_B_TO_A_EXCEP: "duplicated ack packet from host a to b",
  ACK_A_TO_B_EXCEP: "duplicated ack packet from host b to a",
  ZEROWIN_EXCEP:    "a zero window packet was sent."
};

const explainL4Label = (value) => {
  switch (value) {
    case PARAMETER_ROW.IP:
      return <Typography>{PARAMETER_ROW_EXP.IP}</Typography>;
    case PARAMETER_ROW.PORT:
      return <Typography>{PARAMETER_ROW_EXP.PORT}</Typography>;
    case PARAMETER_ROW.PACKET:
      return <Typography>{PARAMETER_ROW_EXP.PACKET}</Typography>;
    case PARAMETER_ROW.DATA:
      return <Typography>{PARAMETER_ROW_EXP.DATA}</Typography>;
    default:
      return <Typography>...</Typography>;
  }
};


const explainException = (value) => {
  switch (value) {
    case EXCEP_PARAMETER_ROW.RETRANS:
      return <Typography>{EXCEP_PARAMETER_ROW_EXP.RETRANS_EXCEP}</Typography>;
    case EXCEP_PARAMETER_ROW.RESET:
      return <Typography>{EXCEP_PARAMETER_ROW_EXP.RESET_EXCEP}</Typography>;
    case EXCEP_PARAMETER_ROW.ACK_A_TO_B:
      return <Typography>{EXCEP_PARAMETER_ROW_EXP.ACK_A_TO_B_EXCEP}</Typography>;
    case EXCEP_PARAMETER_ROW.ACK_B_TO_A:
      return <Typography>{EXCEP_PARAMETER_ROW_EXP.ACK_B_TO_A_EXCEP}</Typography>;
    case EXCEP_PARAMETER_ROW.ZEROWIN:
      return <Typography>{EXCEP_PARAMETER_ROW_EXP.ZEROWIN_EXCEP}</Typography>;
    default:
      return "The type of TCP exception...";
  }
};

const getExepBG = (value) => {
  switch (value) {
    case EXCEP_PARAMETER_ROW.RETRANS:
      return exceptionColors.RETRANSColors.bg;
    case EXCEP_PARAMETER_ROW.RESET:
      return exceptionColors.RESETColors.bg;
    case EXCEP_PARAMETER_ROW.ACK_A_TO_B:
    case EXCEP_PARAMETER_ROW.ACK_B_TO_A:
      return exceptionColors.DUPACKColors.bg;
    case EXCEP_PARAMETER_ROW.ZEROWIN:
      return exceptionColors.ZEROWINColors.bg;
    default:
      return "white";
  }
};

const getExepFG = (value) => {
  switch (value) {
    case EXCEP_PARAMETER_ROW.RETRANS:
      return exceptionColors.RETRANSColors.fg;
    case EXCEP_PARAMETER_ROW.RESET:
      return exceptionColors.RESETColors.fg;
    case EXCEP_PARAMETER_ROW.ACK_A_TO_B:
    case EXCEP_PARAMETER_ROW.ACK_B_TO_A:
    case EXCEP_PARAMETER_ROW.ZEROWIN:
      return exceptionColors.DUPACKColors.fg;
    default:
      return "black";
  }
};


const exceptionColors = {
  DUPACKColors: { fg: "#f78786", bg: "#12272e" },
  RESETColors: { fg: "#f6f298", bg: "#a40000" },
  RETRANSColors: { fg: "white", bg: "#f78786" },
  ZEROWINColors: { fg: "#f78786", bg: "#12272e" },
}
const exceptionText = {
  ZEROWINDText: "zero window",
  RETRANSText: "retransmission",
  RESETText: "reset",
  DUPACKAtoBText: "duplicate ack a to b",
  DUPACKBtoAText: "duplicate ack b to a",
}

const hostsColumns = [
  { 
    field: 'param', 
    headerName: "Parameter", 
    sortable: false, 
    disableColumnMenu: true, 
    width: 200, 
    align: 'center', 
    headerAlign: 'center', 
    renderCell: (params) => {
      return (
        <Tooltip title={explainL4Label(params.value)} style={{ borderRadius: '12px', width: "100%", height: "50%", backgroundColor: "#1976d2", color: "white", padding: 2, paddingTop: 3, cursor: 'zoom-in'}}> 
          <div>{params.value}</div> 
        </Tooltip>
      );
    }
  },
  { field: 'hostA', headerName: 'Host A', flex: 1, align: 'center', headerAlign: 'center' },
  { field: 'hostB', headerName: 'Host B', flex: 1, align: 'center', headerAlign: 'center' },
];


const exceptionsColumns = [
  { field: 'exep_type', headerName: "Exception Type", sortable: false, disableColumnMenu: true, width: 200, align: 'center', headerAlign: 'center', renderCell: (params) => {
    return (
      <Tooltip title={<Typography fontSize={16}>{explainException(params.value)}</Typography>} style={{borderRadius: '10px',width: "100%", height: "50%",backgroundColor: getExepBG(params.value), color: getExepFG(params.value), padding: 2, paddingTop: 8  , cursor: 'zoom-in', fontSize: "14px" }}>
        <div>{params.value}</div>
      </Tooltip>
    )
  }},
  { field: 'from', headerName: 'Sender', flex: 1, align: 'center', headerAlign: 'center' },
  { field: 'to', headerName: 'Reciver', flex: 1, align: 'center', headerAlign: 'center' },
  { field: 'packet_index', headerName: 'Packet Index', flex: 1, align: 'center', headerAlign: 'center' },
];

const L4_DATA_TYPES = {
  UDP: 'UDP',
  TCP: 'TCP'
}
const hostsDataTable = (singleMode, perConvData, type) => {
  if (!perConvData) {
    return <div>Error: perConvData is undefined or null</div>;
  }
  const exceptionList = perConvData.exceptionsList?.map((exception, index) => ({ ...exception, id: index }));
  const convId = perConvData?.conversationId
  const convRltvTime = perConvData?.durationInSeconds
  const convRealTime = { start: perConvData?.packetList[0].time_stamp_date, end: perConvData?.packetList[perConvData?.packetList.length - 1].time_stamp_date }
  const convNumPacketsA = perConvData?.numberPacketA
  const convNumPacketsB = perConvData?.numberPacketB
  const convNumberPacket = convNumPacketsA + convNumPacketsB

  const convDataSizeA = perConvData?.packetList.reduce((accumulator, packet) => {
    return (packet.from === perConvData?.hostA) ? accumulator + packet.size_in_bytes : accumulator
  }, 0);

  const convDataSizeB = perConvData?.packetList.reduce((accumulator, packet) => {
    return (packet.from === perConvData?.hostB) ? accumulator + packet.size_in_bytes : accumulator
  }, 0);

  const convDataSize = perConvData?.packetList.reduce((accumulator, packet) => {
    return accumulator + packet.size_in_bytes
  }, 0);

  const hostsRows = [
    { id: 1, param: PARAMETER_ROW.IP, hostA: perConvData?.hostA, hostB: perConvData?.hostB},
    { id: 2, param: PARAMETER_ROW.PORT, hostA: perConvData?.portA, hostB: perConvData?.portB },
    { id: 3, param: PARAMETER_ROW.PACKET, hostA: convNumPacketsA, hostB: convNumPacketsB },
    { id: 4, param: PARAMETER_ROW.DATA, hostA: convDataSizeA + " bytes ", hostB: convDataSizeB + " bytes" },
  ]

  // const exceptionRows = 
  return (
    <div style={{ flex: 1, borderStyle: "solid", borderRadius: "12px" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 className={AnalyzePanelViewStyle.data_title}  >{"Conversation: " + (convId + 1)}</h1>
        <Stack spacing={0}>
          <Box>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: type === L4_DATA_TYPES.UDP ? 20 : -20 }}>
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
                  <h3 className={AnalyzePanelViewStyle.data_title}  >
                    Recording Time Stamp
                  </h3>
                  <h4 style={{marginBottom: 4}}>
                    {convRealTime.start}
                  </h4>
                  <DownArrowIcon sx={{ml: "105px"}} />
                  <h4 style={{marginTop: 2}}>
                    {convRealTime.end}
                  </h4>
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
                <Divider orientation='horizontal' sx={{ bgcolor: "black", marginRight: "20px", borderBottomWidth: 2 }} />
                <div>
                  <h3 className={AnalyzePanelViewStyle.data_title} >
                    Transffered Data Size
                  </h3>
                  <h3>
                    {"≈ " + ((convDataSize) / 1024 / 1024).toFixed(FLOATING_LIMITER * 3) + " mb"}
                  </h3>
                </div>
              </div>
              {
                hostsRows !== undefined &&
                <DataGrid
                sx={{ height: "50vh", width: !singleMode ? "675px" : "1200px", marginLeft: 0, marginRight: 2, borderStyle: "solid", borderColor: "black", borderRadius: "18px", borderWidth: "medium", fontSize: "18px", fontFamily: "monospace" }}
                rows={hostsRows}
                columns={hostsColumns}
                />
              }
            </div>
          </Box>
          {
            type === L4_DATA_TYPES.TCP &&
            <Box sx={{ mb: exceptionList !== undefined ? 1 : 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {
                exceptionList !== undefined &&
                <h1 className={AnalyzePanelViewStyle.data_title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 15}} >Exceptions</h1>
              }
              {
                exceptionList !== undefined &&
                <DataGrid
                sx={{ width: "98%", borderStyle: "solid", borderRadius: "12px", borderColor: "black", borderWidth: "medium", fontSize: "18px" , fontFamily: "monospace" }}
                rows={exceptionList}
                columns={exceptionsColumns}
                />
              }
            </Box>
          }
        </Stack>
      </div>
    </div>
  );
}
export { L4_DATA_TYPES, hostsDataTable };
