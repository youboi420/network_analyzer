import axios from 'axios'
import { NOTIFY_TYPES, notify } from './notify_service'

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

axios.defaults.withCredentials = true;

const sql_api_path = '/sql_api'
const LOCAL_IP = process.env.REACT_APP_LOCAL_IP_ADDRESS
const SER_PORT = process.env.REACT_APP_SER_PORT
const USERS_URL = `http://${LOCAL_IP}:${SER_PORT}/users`
const USERS_URL_TEST = `http://${LOCAL_IP}:${SER_PORT}/example`
const USERS_URL_VERIFY = `http://${LOCAL_IP}:${SER_PORT}/users${sql_api_path}/verify`
export const DB_ERROR_CODES =
{
  nouser: "user not exists",
  dup: "duplicate username"
}
/* USERS_URL_EXEC */

export const verifyUserCookie = async () => {
  try {
    console.log(USERS_URL_VERIFY);
    const response = await axios.get(`${USERS_URL_VERIFY}`)
  } catch (error) {
    
  }
}

export const getCookie = async () => {
  try {
    const response = await axios.get(`${USERS_URL_TEST}`)
    console.log(response.data); // Log the response data
  } catch (error) {
    notify("ERROR SETTING COOKIE", NOTIFY_TYPES.error)
    throw error
  }
}

// export const getCookie = async () => {
//   try {
//     const response = await fetch(`${USERS_URL_EXEC}`)
//     console.log(response);
//   } catch (error) {
//     notify("ERROR SETTING COOKIE", NOTIFY_TYPES.error)
//     throw error
//   }
// }
export const createUser = async (newUsername, newPassword, newIsAdmin) => {
  try {
    const response = await axios.post(`${USERS_URL}${sql_api_path}/user`, {
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
    const response = await axios.put(`${USERS_URL}${sql_api_path}/user/${userId}`, {
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
    const response = await fetch(`${USERS_URL}${sql_api_path}/all_users`)
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
    await axios.delete(`${USERS_URL}${sql_api_path}/user/${userId}`)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
export const login = async (un, password) => {
  try {
    const res = await axios.post(`${USERS_URL}${sql_api_path}/login`, {un: un, password: password})
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