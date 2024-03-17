import { DataGrid } from '@mui/x-data-grid'
import AnalyzePanelViewStyle from '../Style/AnalyzePanelViewStyle.module.css'



const tableColumns = [
  // { 
  //   field: 'src_port', 
  //   headerName: (
  //     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
  //       Parameter
  //       <InfoIcon sx={{ml: "5px"}}/>
  //     </div>
  //   ), 
  //   sortable: false, 
  //   disableColumnMenu: true, 
  //   width: 130, 
  //   align: 'center', 
  //   headerAlign: 'center', 
  //   renderCell: (params) => {
  //     return (
  //       <Tooltip title={explainL4Label(params.value)} style={{ borderRadius: '12px', width: "100%", height: "50%", backgroundColor: "#1976d2", color: "white", padding: 2, paddingTop: 3, cursor: 'zoom-in'}}> 
  //         <div>{params.value}</div> 
  //       </Tooltip>
  //     );
  //   }
  // },
  { field: 'attacker_ip', headerName: "Attacker's IP", flex: 1, align: 'center', headerAlign: 'center' },
  { field: 'src_port', headerName: 'Source/Attack port', flex: 1, align: 'center', headerAlign: 'center' },
];

const DDOSAttackDataTable = (singleMode, attackersDataArray, attackID, victimObj) => {
  return (
    <div style={{ flex: 1, borderStyle: "solid", borderRadius: "12px" }} >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: "-2px" }} >
        <h1 className={AnalyzePanelViewStyle.data_title} >{"DDOS Attack: " + (attackID + 1)}</h1>
        <h2 style={{marginBottom: "-2px"}}>Victim: {victimObj.victim} </h2>
      </div>
      <DataGrid 
        sx={{ height: "52vh", borderStyle: "solid", borderColor: "transparent", borderRadius: "18px", borderWidth: "medium", fontSize: "16px", fontFamily: "monospace" }}
        rows={attackersDataArray}
        columns={tableColumns}
      />
    </div>
  )
}

export { DDOSAttackDataTable }