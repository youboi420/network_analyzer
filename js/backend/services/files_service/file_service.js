import fs from 'fs'
import path from 'path'
import { exec } from 'node:child_process'

const users_dir = './bin/users'

/**
 * dictionary of analyzer program exit codes
 */
const ANALYZE_EXIT_CODE  = {
  FAILED:    1,
  with_l2l4: 1 << 1,
  with_ddos: 1 << 2,
  with_mitm: 1 << 3
}

/**
 * dictionary of validator program exit codes
 */
const VALIDATOR_EXIT_CODE = {
  FAILED  :   1,
  VALID   : 101,
  INVALID : 102,
}


/**
 * creates the folder for a newly created user using node:child_process.exec
 * @param {Number} id 
 */
const create_folder_for_new_user = (id) => {
  if (id !== undefined) {
    const create_path = users_dir + "/" + id
    /* create the dir */
    fs.mkdir(create_path, err => {
      if (err) {
        return
      }
      console.log(err)
      fs.mkdir(create_path + '/reports', err => {
        if (err) {
          console.log(err)
          return
        }
        fs.mkdir(create_path + '/pcap', err => {
          if (err) {
            console.log(err)
            return
          }
        })
      })
    })
  } else {
    console.log("id is undefiend")
  }
}

/**
 * creates the specific direcotry with path (user id)/(report id)
 * @param {Number} user_id 
 * @param {Number} report_id 
 * @returns 
 */
async function create_report_folder_by_id(user_id, report_id) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  const ra = Math.floor(Math.random() * 10000) + alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)] +alphabet[Math.floor(Math.random() * alphabet.length)]
  const directoryPath = users_dir + "/" + user_id.toString() + "/reports/" + ra     //report_id.toString()
  return new Promise((resolve, reject) => {
      fs.access(directoryPath, fs.constants.F_OK, (err) => {
          if (!err) {
              resolve(directoryPath)
          } else {
              fs.mkdir(directoryPath, { recursive: true }, (err) => {
                  if (err) {
                      reject(err)
                  } else {
                      resolve(directoryPath)
                  }
              })
          }
      })
  })
}

/**
 * ls -1 the given path
 * @param {String} path 
 * @returns 
 */
const list_files = (path) => {
  return new Promise((resolve, reject) => {
    if (path !== undefined) {
      const command = `ls -1 ${path}`
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error}`)
          reject({ success: false, error: error, message: "listing files failed. " + command})
          return
        } else if (stderr) {
          console.log(`stderr: ${stderr}`)
          reject({ success: false, stderr: stderr })
          return
        } else {
          console.log(`${stdout}`)
          const files_arr = stdout.split('\n').filter(line => line.trim() !== '')
          resolve({ success: true, stdout: stdout, files: files_arr})
          return
        }
      })
    } else {
      reject({ success: false })
    }
  })
}

export { create_folder_for_new_user, create_report_folder_by_id, list_files, ANALYZE_EXIT_CODE, VALIDATOR_EXIT_CODE }