import axios from 'axios'
import { NOTIFY_TYPES, notify } from './notify_service'

/* consts and configurations */
axios.defaults.withCredentials = true;

const analyze_api_path = '/analyze'
const files_api_path = '/files'
const LOCAL_IP = process.env.REACT_APP_LOCAL_IP_ADDRESS
const SER_PORT = process.env.REACT_APP_SER_PORT
const ANALYZE_URL = `http://${LOCAL_IP}:${SER_PORT}${analyze_api_path}`
const GET_GIS_JSON_URL = `http://${LOCAL_IP}:${SER_PORT}${files_api_path}/gis`
const GET_L4_JSON_URL = `http://${LOCAL_IP}:${SER_PORT}${files_api_path}/l4`
const GET_L2_JSON_URL = `http://${LOCAL_IP}:${SER_PORT}${files_api_path}/l2`

const l4MODES = {
  BOTH: "both",
  TCP: "TCP",
  UDP: "UDP",
}

const analyze = async (file_id) => {
  try {
    const response = await axios.get(ANALYZE_URL+ "/" + file_id, {
      file_id: file_id
    })
    return response
  } catch (error) {
    throw new Error(error)
  }
}

const getGISJsonData = async (file_id) => {
  try {
    if (file_id) {
      const response = await axios.get(GET_GIS_JSON_URL + "/" + file_id)
      return response.data
    }
  } catch (error) {
    return undefined
  }
}

const getL4JsonData = async (file_id) => {
  try {
    if (file_id) {
      const response = await axios.get(GET_L4_JSON_URL + "/" + file_id)
      return response.data
    }
  } catch (error) {
    throw error
  }
}

const getL2JsonData = async (file_id) => {
  try {
    if (file_id) {
      const response = await axios.get(GET_L2_JSON_URL + "/" + file_id)
      return response.data
    }
  } catch (error) {
    throw error
  }
}

const calculateConversationDuration = (conversation) => {
  const packetsData = conversation.packets_data;
  if (packetsData.length < 2) return 0;
  const firstPacketTime = packetsData[0].time_stamp_rltv;
  const lastPacketTime = packetsData[packetsData.length - 1].time_stamp_rltv;
  return lastPacketTime - firstPacketTime;
}

const calculatePacketsPerHost = (conversation) => {
  const packetsFromAtoB = conversation.packets_from_a_to_b;
  const packetsFromBtoA = conversation.packets_from_b_to_a;
  return {
    fromHostA: packetsFromAtoB,
    fromHostB: packetsFromBtoA
  };
}

export { analyze, getGISJsonData, getL4JsonData, getL2JsonData, calculateConversationDuration, calculatePacketsPerHost, l4MODES }