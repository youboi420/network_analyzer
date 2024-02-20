import fs from 'fs'
import path from 'path'
import { exec } from 'node:child_process'

const users_dir = './bin/users'

const EXIT_CODE  = {
  FAILED:    1,
  with_l2l4: 1 << 1,
  with_ddos: 1 << 2,
  with_mitm: 1 << 3
}

const create_folder_for_new_user = (id) => {
  if (id !== undefined) {
    const create_path = users_dir + "/" + id
    /* create the dir */
    fs.mkdir(create_path, err => {
      if (err) {
        return
      }
      console.log(err);
      fs.mkdir(create_path + '/reports', err => {
        if (err) {
          console.log(err);
          return
        }
        fs.mkdir(create_path + '/pcap', err => {
          if (err) {
            console.log(err);
            return
          }
        })
      })
    })
  } else {
    console.log("id is undefiend");
  }
}

const makeDir = async (dir) => {
  const fsp = fs.promises;
  try {
      await fsp.mkdir(dir)
  } catch (err) {
      console.log(err);
  }
}

async function createReportDirectory(user_id, report_id) {
  const directoryPath = users_dir + "/" + user_id.toString() + "/reports/" + report_id.toString()
  return new Promise((resolve, reject) => {
      fs.access(directoryPath, fs.constants.F_OK, (err) => {
          if (!err) {
              resolve(directoryPath);
          } else {
              fs.mkdir(directoryPath, { recursive: true }, (err) => {
                  if (err) {
                      reject(err);
                  } else {
                      resolve(directoryPath);
                  }
              });
          }
      });
  });
}

const list_files = (path) => {
  return new Promise((resolve, reject) => {
    if (path !== undefined) {
      const command = `ls -1 ${path}`
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error}`);
          reject({ success: false, error: error })
          return
        } else if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject({ success: false, stderr: stderr })
          return
        } else {
          console.log(`${stdout}`);
          resolve({ success: true, stdout: stdout })
          return
        }
      })
    } else {
      reject({ success: false })
    }
  })
}

export { create_folder_for_new_user, createReportDirectory as create_report_folder_by_id, list_files, EXIT_CODE}