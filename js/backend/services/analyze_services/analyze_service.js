import { exec } from 'node:child_process'
import * as pcap_files_service from '../sql_services/pcap_files_service.js'
import * as report_service from '../sql_services/report_service.js'
import * as files_service from '../files_service/file_service.js'
// import c_files from '../../../../c_files/PoC/src/'
const cFilePath = './c_files/test.c'
const executablePath = './c_files/test'
const default_filename = './bin/build/test'//'firefox'

const sleep = (milliseconds) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}
const valiate_file = (file_path) => {
  console.log("got path", file_path)
  return new Promise((resolve, reject) => {
    if (file_path === undefined) {
      reject({success: false, code: 409, message: "undefined..."})
    } else{ 
      const bin = './bin/build/validator'
      const command = `${bin} ${file_path}`
      try {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.log(error)
            reject({success: false, code: error.code})
          } else {
            resolve({success: true, code: 200})
          }
        })
      } catch (error) {
        reject({success: false, code: 500, message: "failed... " + error})
      }
    }
  })
}

/**
 * run's the analyze command on the given file and the output is the given report path
 * @param {String} report_folder_path 
 * @param {String} file_path 
 * @returns success: ( true if opperation was succesfull false if not ),  error (error.message), [optional] output_files: array of the files 
 */
const analyze_file = async (report_folder_path, file_path, user_id, pcap_file_id) => {
  return new Promise(async (resolve, reject) => {
    const bin = './bin/build/conv'
    const report_file_name = "out.json" /* need's to be the last / of the orginal filename and replace the .pcap with .json*/
    const command = `${bin} ${file_path.r.path} ${report_folder_path + "/" + report_file_name}`
    let ddos_flag = false
    let mitm_flag = false
    try {
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          if (!!(error.code & files_service.ANALYZE_EXIT_CODE.with_ddos)) {
            console.log("need to update the `ddos` to specific report...")
            ddos_flag = true
          }
          if (!!(error.code & files_service.ANALYZE_EXIT_CODE.with_mitm)) {
            console.log("need to update the `mitm` to specific report...")
            mitm_flag = true
          }
          if (!!(error.code & files_service.ANALYZE_EXIT_CODE.with_l2l4)) {
            let report
            try {
              report = await report_service.create_json_report(user_id, pcap_file_id, report_folder_path, ddos_flag, mitm_flag)
            } catch (error) {
              console.log("Error...", error)
              reject({ success: false, error: error})
            }
            if (report.success !== true) {
              reject({ success: false })
            } else {
              console.log("After")
              console.log("------------------------")
              const files = await files_service.list_files(report_folder_path)
              const files_arr = files?.files
              console.log("------------------------")
              console.log("Inserted file `gis l2 l4` to table")
              console.log(files_arr)
              resolve({ success: true, output_files: files_arr })
            }
          } else if (!!(error.code & files_service.ANALYZE_EXIT_CODE.FAILED)) {
            console.log(`running the program failed... :( : ${error.message}`)
            reject({ success: false, error: error.message })
          } else {
            console.log(`error command failed [${error.code}] : ${error.message}`)
            reject({ success: false, error: error.message })
          }
          reject({ success: false, error: error.message })
          return
        } else if (stderr) {
          console.log(`stderr: ${stderr}`)
          reject({ some: -2, stderr: stderr })
          return
        } else {
          console.log(`stdout: ${stdout}`)
          resolve({ some: 1 })
          return
        }
      })
    } catch (error) {
      reject({ some: -1000})
    }
  })
}

export { analyze_file, valiate_file }