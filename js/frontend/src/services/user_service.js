import axios from 'axios'
/* 
  3,4,6
  עצמיים ודטרמננטים ירד
  טרנספומציות נשאר
  ---
  סייבר נשאר הכל
  ---
  רשתות תקשורת 5,8,10,12,13,16
  17,שיטות שידור
 */
const sql_api_path = '/sql_api'
const REACT_LOCAL_IP = process.env.REACT_APP_LOCAL_IP_ADDRESS
const REACT_SER_PORT = process.env.REACT_APP_SER_PORT
const REACT_BASE_URL = `http://${REACT_LOCAL_IP}:${REACT_SER_PORT}`
export const DB_ERROR_CODES =
{
  nouser: "user not exists",
  dup: "duplicate username"
}

export const createUser = async (newUsername, newPassword, newIsAdmin) => {
  try {
    const response = await axios.post(`${REACT_BASE_URL}${sql_api_path}/user`, {
      un: newUsername,
      password: newPassword,
      isadmin: newIsAdmin
    })

    if (response.status === 200) {
      console.log("user created succesfully")
    } else {
      console.error('Failed to update user:', response.data)
      throw new Error('Failed to create user')
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 409) {

        throw new Error(DB_ERROR_CODES.dup)
      }
      else throw new Error('Failed to create user')
    }
    throw error
  }
}

export const updateUser = async (userId, newUsername, newPassword, newIsAdmin) => {
  try {
    const response = await axios.put(`${REACT_BASE_URL}${sql_api_path}/user/${userId}`, {
      un: newUsername,
      password: newPassword,
      isadmin: newIsAdmin,
    })
    if (response.status === 200) {
    } else {
      console.error('Failed to update user:', response.data)
      throw new Error('Failed to update user')
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const getAllUsers = async () => {
  try {
    const response = await fetch(`${REACT_BASE_URL}${sql_api_path}/all_users`)
    console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${REACT_BASE_URL}${sql_api_path}/user/${userId}`)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export const login = async (un, password) => {
  try {
    const res = await axios.post(`${REACT_BASE_URL}${sql_api_path}/login`, {un: un, password: password})
    return res
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(DB_ERROR_CODES.nouser)
      }
      else throw new Error('Failed to create user')
    }
    throw error
  }
}