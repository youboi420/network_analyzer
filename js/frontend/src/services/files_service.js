import axios from 'axios'

const MY_FILES_URL = 'http://' + process.env.REACT_APP_LOCAL_IP_ADDRESS + ":" + process.env.REACT_APP_SER_PORT + '/files/my_files'
const DELETE_FILE_URL = 'http://' + process.env.REACT_APP_LOCAL_IP_ADDRESS + ":" + process.env.REACT_APP_SER_PORT + '/files/delete'
const DOWNLOAD_FILE_URL = 'http://' + process.env.REACT_APP_LOCAL_IP_ADDRESS + ":" + process.env.REACT_APP_SER_PORT + '/files/download'
const UPLOAD_FILE_URL = 'http://' + process.env.REACT_APP_LOCAL_IP_ADDRESS + ":" + process.env.REACT_APP_SER_PORT + '/files/upload'

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

const delete_file = async (file_id) => {
  try {
    const response = await axios.delete(DELETE_FILE_URL + "/" + file_id)
    console.log(response);
  } catch (error) {
    console.log("Error", error);
  }
}

const upload = async (formData) => {
  try {
    const response = await axios.post(UPLOAD_FILE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response
  } catch (error) {
    throw error
  }
}

const download = async (file_id, filename) => {
  try {
      const response = await axios.get(DOWNLOAD_FILE_URL + "/" + file_id, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
  } catch (error) {
    throw error
  }
}

export { get_my_files, delete_file, upload, download }