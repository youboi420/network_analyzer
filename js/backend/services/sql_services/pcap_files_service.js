import { connection } from './db_service.js'

const undef_err_msg = "one or more of the given parameters is undefined"
const no_file_msg  = "no such file"
const insert_file_query = `INSERT INTO pcap_files (owner_id, path, filename, analyzed) VALUES (?, ?, ?, ?)`
const delete_file_by_id_query = `DELETE FROM pcap_files WHERE file_id = ?`
const delete_all_files_by_id_query = `DELETE FROM pcap_files WHERE owner_id = ?`
const get_file_by_id_query = `SELECT * FROM pcap_files WHERE file_id = ?`
const get_all_files_by_id_query = `SELECT * FROM pcap_files WHERE owner_id = ?`
const check_file_exists_by_path_query = `SELECT * FROM pcap_files WHERE path = ?`
const update_file_analyzed_by_id_query = `UPDATE pcap_files set analyzed = 1 WHERE file_id = ?`

const get_all_query = `SELECT * FROM pcap_files`

const create_pcap_files_table_query = `
CREATE TABLE IF NOT EXISTS pcap_files (
  file_id INT NOT NULL AUTO_INCREMENT,
  owner_id INT NOT NULL,
  creation_date DATETIME DEFAULT NOW(),
  path VARCHAR(255) NOT NULL UNIQUE,
  filename VARCHAR(255) NOT NULL,
  analyzed BOOLEAN NOT NULL,
  PRIMARY KEY (file_id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
)`

/* 
  ! if and only if the cookie token is valid and the id in the request is the id in the cookie token
  * helpers
    -- select * from project_schm.users
    -- update project_schm.users set isadmin = 1 where id = 1
    -- insert into project_schm.json_reports (owner_id, path, filename) values(1, "./test/this2.txt", "this2.txt")
 */


const create_pcap_table = () => {
  return new Promise((resolve, reject) => {
    connection.query(create_pcap_files_table_query, (err, results) => {
      if (err) {
        console.log("error creating json reports table: ", err)
        reject(err)
      } else {
        console.log(results.affectedRows !== 0 ? "created table json reports" : "table json reports already exist's")
        resolve()
      }
    })
  })
}

const check_file_exists = (file_path) => {
  return new Promise((resolve, reject) => {
    if (file_path === undefined) {
      reject( {success: false, message: undef_err_msg } )
    } else {
      connection.query(check_file_exists_by_path_query, [file_path], (err, res) => {
        if (err) {
          reject( {success: false, message: err} )
        } else {
          if (res.length > 0) {
            resolve( {success: true, message: "dup" })
          } else {
            resolve( {success: true })
          }
        }
      })
    }
  })
}

/* 
need to used:
  1) in files /upload after creating the file...
*/
const create_file = (owner_id, path, filename) => {
  return new Promise( async (resolve, reject) => {
    if (owner_id === undefined || path === undefined || filename === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      const fileExists = await check_file_exists(path)
      if (fileExists.success === true && fileExists.message === 'dup') {
        reject( {success: false, message: "dup"} )
      } else {
        connection.query(insert_file_query, [owner_id, path, filename, 0], (err, res) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              reject({success: false, message: 'ER_DUP_ENTRY'})
            } else {
              reject({success: false, message: err})
            }
          } else {
            if (res.affectedRows > 0) {
              resolve({ success: true })
            } else {
              resolve({ success: false, message: "creating file record failed..."})
            }
          }
        })
      }
    }
  })
}

const update_set_file_is_analyzed = (file_id) => {
  return new Promise( async (resolve, reject) => {
    if (file_id === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      const fileExists = await check_file_exists(path)
      if (fileExists.success === false && fileExists.message === 'dup') {
        reject( {success: true, message: "dup"} )
      } else {
        connection.query(update_file_analyzed_by_id_query, [file_id], (err, res) => {
          if (err) {
            reject({success: false, message: err})
          } else {
            if (res.affectedRows > 0) {
              resolve({ success: true })
            } else {
              console.log("update is analyzed ----------> updating record failed...");
              resolve({ success: false, message: "updating record failed..."})
            }
          }
        })
      }
    }
  })
}

/* 
need to used:
  1) in users user/:id delete
*/
const delete_file_by_file_id = (file_id) => {
  return new Promise((resolve, reject) => {
    if (file_id === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      connection.query(delete_file_by_id_query, [file_id], (err, res) => {
        if (err) {
          console.log("error querying by file id, delete file by id")
          reject({success: false, message: err})
        } else {
          if (res.affectedRows > 0) {
            resolve({ success: true })
          } else {
            resolve({ success: false, message: no_file_msg})
          }
        }
      })
    }
  })
}

/* 
need to used:
  1) in users user/:id delete
*/
const delete_all_files_by_user_id = (user_id) => {
  return new Promise((resolve, reject) => {
    if (user_id === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      connection.query(delete_all_files_by_id_query, [user_id], (err, res) => {
        if (err) {
          console.error("error querying user by credentials:", err)
          reject({success: false, message: err})
        } else {
          if (res.affectedRows > 0) {
            console.log("delete all pcap files -> user found: " + user_id)
            resolve({success: true})
          } else {
            console.log("delete all pcap files -> user not found: " + user_id)
            resolve({ success: false })
          }
        }
      })
    }
  })
}

/* 
  need to be used:
    1) in files /file/:id but need's to be checked if the cookie is valid and its id and the res[0].owner_id are equal
 */
const get_file_by_fileid = (file_id) => {
  return new Promise((resolve, reject) => {
    if (file_id === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      connection.query(get_file_by_id_query, [file_id], (err, res) => {
        if (err) {
          reject({success: false, message: err})
        } else {
          if (res.length > 0) {
            console.log("got file pcap file -------> file: ", file_id);
            resolve({ success: true, file: res[0] })
          } else {
            console.log("didn't get file pcap file -------> file: ", file_id);
            resolve({ success: false, message: no_file_msg})
          }
        }
      })
    }
  })
}

/* 
  need to be used:
  1) in files /all_info
 */
const get_all_files_by_userid = (user_id) => {
  return new Promise((resolve, reject) => {
    if (user_id === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      connection.query(get_all_files_by_id_query, [user_id], (err, res) => {
        if (err) {
          console.error("error querying user by credentials:", err)
          reject({success: false, message: err})
        } else {
          if (res.length > 0) {
            console.log("get all pcap files -> user found: " + user_id)
            resolve({ success: true, files: res })
          } else {
            console.log("get all pcap files -> user not found: " + user_id)
            resolve({ success: false })
          }
        }
      })
    }
  })
}

export const get_all = () => {
  return new Promise((resolve, reject) => {
    connection.query(get_all_query, (err, res) => {
      if (err) {
        reject({success: false, message: err})
      } else {
        console.log(res);
        resolve( {success: true, results: res} )
      }
    })
  })
}

export { create_pcap_table, get_all_files_by_userid, get_file_by_fileid, create_file, delete_all_files_by_user_id, delete_file_by_file_id, update_set_file_is_analyzed }