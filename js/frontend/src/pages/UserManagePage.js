/* react-comps */
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditNote from '@mui/icons-material/EditNote'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Stack } from '@mui/material'
import { getAllUsers, deleteUser } from '../services/user_service'
import AnalyzePageStyle from '../Style/AnalyzePage.module.css';

/* my comps */
import UserUpdateDialog from '../components/UserUpdateDialog'
import UserCreateDialog from '../components/CreateDialog'
import { notify, NOTIFY_TYPES } from '../services/notify_service'
import { Navigate } from 'react-router-dom'
import GenereicDeleteDialog from '../components/GenereicDeleteDialog'

const UserManagePage = ({ isValidUser, userData }) => {
  const [rows, setRows] = useState([])
  const [selectedRow, setSelectedRow] = useState([])
  const [editData, setEditData] = useState({})
  const [editDialogOpen, setEditDialogOpen] = useState(false, false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false, false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false, false)
  const [deleteId, setDeleteId] = useState(undefined)

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

  const handleEdit = () => {
    const userToEdit = rows.find((user) => user.id === selectedRow[0])
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
    try {
      const userData = await getAllUsers()

      setRows(userData)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }
  useEffect(() => {
    document.title = "user manager page"
    if (userData.isadmin)
      fetchDataAndSetRows()
    else
      console.log("Youre not an admin")
  }, []);

  const columns = [
    { field: 'id', headerName: 'UID', headerAlign: 'center', align: 'center', width: 250 },
    { field: 'username', headerName: 'Username', headerAlign: 'center', align: 'center', width: 250 },
    {
      field: 'isadmin', headerName: 'Admin', headerAlign: 'center', align: 'center', width: 250, renderCell: (params) => {
        return <span className={AnalyzePageStyle.files_grid} style={{ borderRadius: '12px', width: "20%", backgroundColor: params.value === 1 ? "#77DD76" : "#FF6962", textAlign: 'center' }}> {params.value === 1 ? "Yes" : "No"} </span>
      }
    },
    { field: 'file_count', headerName: 'Files', headerAlign: 'center', align: 'center', width: 250 },
    { field: 'analyzed_file_count', headerName: 'Analyzed', headerAlign: 'center', align: 'center', width: 250 },

  ]

  if (isValidUser && userData.isadmin)
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
          <DataGrid rows={rows} columns={columns} onRowDoubleClick={(row) => { setEditData(row.row); setEditDialogOpen(true); }} onRowSelectionModelChange={handleSelectionChange} style={{ backdropFilter: "blur(300px)", fontWeight: "bold"}} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
          <Stack spacing={2} direction="row" alignContent='center' justifyContent='center' style={{ marginTop: "10px", marginBottom: "10px", paddingTop: "20px", paddingBottom: "20px", paddingRight: "15px", paddingLeft: "15px", backdropFilter: "blur(100px)", width: "20%", borderRadius: '12px', borderStyle: 'dashed' }}>
            <Button onClick={() => {
              setDeleteId(selectedRow[0]);
              if (selectedRow[0] !== undefined) {
                setDeleteDialogOpen(true)
              } else {
                notify("please select a user to delete", NOTIFY_TYPES.warn)
              }
            }} color='error' variant='contained' startIcon={<DeleteIcon />}> delete </Button>
            <Button onClick={handleEdit} color='info' variant='contained' startIcon={<EditNote />} > UPDATE </Button>
            <Button onClick={handleCreate} color='success' variant='contained' startIcon={<AddIcon />}> CREATE </Button>
          </Stack>
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
          <GenereicDeleteDialog isOpen={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setSelectedRow({}) }} callBackFunction={() => handleDelete(deleteId)} deletionType="user" />
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