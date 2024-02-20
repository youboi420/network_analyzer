import axios from 'axios'

const MY_FILES_URL = 'http://' + process.env.REACT_APP_LOCAL_IP_ADDRESS + ":" + process.env.REACT_APP_SER_PORT + '/files/my_files'

const get_my_files = async () => {
  try {
    const response = await axios.get(MY_FILES_URL)
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    return error.data
  }
}

export { get_my_files, }