import axios from 'axios'
import { NOTIFY_TYPES, notify } from './notify_service'

/* consts and configurations */
axios.defaults.withCredentials = true;

const analyze_api_path = '/analyze'
const LOCAL_IP = process.env.REACT_APP_LOCAL_IP_ADDRESS
const SER_PORT = process.env.REACT_APP_SER_PORT
const ANALYZE_URL = `http://${LOCAL_IP}:${SER_PORT}${analyze_api_path}/get_file`

export const analyze = async (file_id) => {
  try {
    const response = await axios.post(ANALYZE_URL, {
      file_id: file_id
    })
    return response
  } catch (error) {
    throw new Error(error)
  }
}