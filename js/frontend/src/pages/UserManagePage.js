/* react-comps */
import React from 'react'
import AddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete'
import EditNote from '@mui/icons-material/EditNote'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, LinearProgress, Stack } from '@mui/material'
import { getAllUsers, deleteUser } from '../services/user_service'
import AnalyzePageStyle from '../Style/AnalyzePage.module.css';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';

/* my comps */
import UserUpdateDialog from '../components/UserUpdateDialog'
import UserCreateDialog from '../components/UserCreateDialog'
import { notify, NOTIFY_TYPES } from '../services/notify_service'
import { Navigate } from 'react-router-dom'
import GenereicDeleteDialog from '../components/GenereicDeleteDialog'

const UserManagePage = ({ isValidUser, userData }) => {
  const [gridLoading, setGridLoading] = React.useState(false);  
  const [rows, setRows] = React.useState([])
  const [selectedRow, setSelectedRow] = React.useState([])
  const [editData, setEditData] = React.useState({})
  const [editDialogOpen, setEditDialogOpen] = React.useState(false, false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false, false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false, false)
  const [deleteId, setDeleteId] = React.useState(undefined)
  const [deleteName, setDeleteName] = React.useState(undefined)

  const handleDelete = async (userId) => {
    try {
      if (userId !== undefined) {
        await deleteUser(userId)
        await fetchDataAndSetRows()
        notify("deleted succesfully", NOTIFY_TYPES.success)
      } else {
        notify("please select a user to delete", NOTIFY_TYPES.warn)
      }
    } catch (error) {
      notify("error deleting user", NOTIFY_TYPES.error)
    }
  }

  const handleEdit = (userId) => {
    const userToEdit = rows.find((user) => user.id === userId)
    if (userToEdit !== undefined) {
      setEditData(userToEdit)
      setEditDialogOpen(true)
    } else {
      notify("please select a user to edit", NOTIFY_TYPES.warn)
    }
  }

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  const handleSelectionChange = (selectionModel) => {
    setSelectedRow(selectionModel.map((id) => parseInt(id)))
  }

  const fetchDataAndSetRows = async () => {
    setGridLoading(true);
    try {
      const userData = await getAllUsers()
      setRows(() => {
        return userData.map(
          (obj) => ({ ...obj, delete: "d",
                              edit: "e"
          })
        )
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
    setGridLoading(false);
  }

  React.useEffect(() => {
    document.title = "admin panel"
    if (userData.isadmin)
      fetchDataAndSetRows()
    else
      console.log("Youre not an admin")
  }, []);

  const handleDeleteClicked = (userId) => {
    setDeleteId(userId);
    setDeleteName(rows.find((user) => user.id === userId).username);
    if (userId) {
      setDeleteDialogOpen(true);
    } else {
      notify("Please select a user to delete", NOTIFY_TYPES.warn);
    }
  };
  
  
  const columns = [
    { field: 'id', headerName: 'UID', headerAlign: 'center', align: 'center', width: 250 },
    { field: 'username', headerName: 'Username', headerAlign: 'center', align: 'center', width: 250 },
    {
      field: 'isadmin', headerName: 'Admin', headerAlign: 'center', align: 'center', width: 250, renderCell: (params) => {
        return <span className={AnalyzePageStyle.files_grid} style={{ fontWeight: 'bold',borderRadius: '12px', width: "20%", backgroundColor: params.value === 1 ? "#77FF26" : "#d32f2f", textAlign: 'center' }}> {params.value === 1 ? "YES" : "NO"} </span>
      }
    },
    { field: 'file_count', headerName: 'Files', headerAlign: 'center', align: 'center', width: 250 },
    { field: 'analyzed_file_count', headerName: 'Analyzed', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'delete', headerName: "", align: "center", width: 150, renderCell: (params) => {
        return (
          <div>
            <Button onClick={() => { handleDeleteClicked(params.row.id) }} color='error' variant='contained' >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span>DELETE</span>
                <DeleteIcon style={{ marginLeft: '5px' }} />
              </div>
            </Button>
          </div>
        )
      }
    },
    { field: 'edit', headerName: "", align: "center", width: 150, renderCell: (params) => {
        return (
          <div>
            <Button onClick={() => { handleEdit(params.row.id) }} color='primary' variant='contained'  >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span>EDIT</span>
                <EditNote style={{ marginLeft: '5px' }} />
              </div>
            </Button>
          </div>
        )
      }
    },
  ]


  if (isValidUser && userData.isadmin)
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
          <Box className={AnalyzePageStyle.files_grid} sx={{ mt: "10px", mx: "10px", width: '100%' ,height: "91vh", display: 'flex', flexDirection: 'column', borderRadius: "12px", backdropFilter: "blur(100px)", borderStyle: 'solid', borderWidth: 'medium', borderColor: 'white', textAlign: 'center' }}>
            <Box sx={{ fontSize: "10px", marginBottom: '-10px', justifyContent: 'center', textAlign: 'center', paddingTop: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}> <h1>Welcome Admin - {userData.username}</h1> <AdminIcon style={{ marginLeft: '5px' }} /> </Box>
            <div style={{ justifyContent: 'flex-end', textAlign: 'right', alignItems: "flex-end", marginRight: "calc(1%)"}}>
            <Button onClick={handleCreate} color='success' variant='contained' sx={{marginBottom: '10px',}} >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                <span style={{padding: 4}}>Create User</span>
                <AddIcon style={{ marginLeft: '5px', marginBottom: "4px" }} />
              </div>   
            </Button>

            </div>
            <Box sx={{ flex: 1, overflow: 'hidden', zIndex: '-1'}}>
              {
                gridLoading && <LinearProgress size={75} />
              }
              {
                !gridLoading &&
                <DataGrid rows={rows} columns={columns} onRowDoubleClick={(row) => { setEditData(row.row); setEditDialogOpen(true); }} onRowSelectionModelChange={handleSelectionChange} style={{ backdropFilter: "blur(300px)", fontWeight: "bold", overflow: 'hidden', borderColor: 'transparent', borderRadius: '12px'}} />
              }
            </Box>
          </Box>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
          {/* <Stack spacing={2} direction="row" alignContent='center' justifyContent='center' style={{ marginTop: "10px", marginBottom: "10px", paddingTop: "20px", paddingBottom: "20px", paddingRight: "15px", paddingLeft: "15px", backdropFilter: "blur(300px)", width: "20%", borderRadius: '12px', borderStyle: 'solid', borderColor: 'white' }}>
            <Button onClick={handleDeleteClicked} color='error' variant='contained' >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span>DELETE</span>
                <DeleteIcon style={{ marginLeft: '5px' }} />
              </div>
            </Button>
            <Button onClick={handleEdit} color='primary' variant='contained'  >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span>EDIT</span>
                <EditNote style={{ marginLeft: '5px' }} />
              </div>
            </Button>
          </Stack> */}
        </div>
        {
          editDialogOpen &&
          <UserUpdateDialog isOpen={editDialogOpen} fetchDataAndSetRows={fetchDataAndSetRows} onClose={() => { setEditDialogOpen(false); setSelectedRow({}) }} userObj={editData} onSuccess={() => { notify("UPDATE: Success", NOTIFY_TYPES.success) }} onFailed={() => { notify("UPDATE: Failed", NOTIFY_TYPES.error) }} />
        }

        {
          createDialogOpen &&
          <UserCreateDialog isOpen={createDialogOpen} fetchDataAndSetRows={fetchDataAndSetRows} onClose={() => { setCreateDialogOpen(false); setSelectedRow({}) }} onSuccess={() => { notify("CREAT: Success", NOTIFY_TYPES.success) }} onFailed={() => { notify("CREAT: Failed", NOTIFY_TYPES.error) }} />
        }

        {/* {
          deleteDialogOpen &&
          <GenereicDeleteDialog isOpen={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setSelectedRow({}) }} callBackFunction={ () => deleteUser(deleteId) }/>
        } */}

        {
          deleteDialogOpen &&
          <GenereicDeleteDialog isOpen={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setSelectedRow({}) }} callBackFunction={() => handleDelete(deleteId)} deletionType={"user : " + deleteName} />
        }

      </div>
    )

  else if (isValidUser) {
    return (
      <div>
        <h1>Your'e not an admin sorry...</h1>
      </div>
    )
  }

  return (
    <Navigate to={'/login'} />
  );
}

export default UserManagePage