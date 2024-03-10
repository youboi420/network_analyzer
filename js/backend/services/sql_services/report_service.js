import { connection } from './db_service.js'

const undef_err_msg = "one or more of the given parameters is undefined"
const not_report_msg  = "no such report"
const insert_report_query = `INSERT INTO json_reports (owner_id, pcap_file_id, path, ddos_flag, mitm_flag) VALUES (?, ?, ?, ?, ?)`
// const delete_report_query = `DELETE FROM json_reports WHERE reportname = ? and password = ?`
const delete_report_by_file_id_query = `DELETE FROM json_reports WHERE pcap_file_id = ?`
const delete_all_reports_by_user_id_query = `DELETE FROM json_reports WHERE owner_id = ?`
const get_all_reports_query = `SELECT * FROM json_reports`
const get_all_reports_by_pcap_fil_id_query = `SELECT * FROM json_reports WHERE pcap_file_id = ?`
const get_all_reports_by_id_query = `SELECT * FROM json_reports WHERE owner_id = ?`
const get_next_id_query = `
SELECT AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'project_schm'
AND TABLE_NAME = 'json_reports'
`
const create_json_report_query = `
CREATE TABLE IF NOT EXISTS json_reports (
  report_id INT NOT NULL AUTO_INCREMENT,
  owner_id INT NOT NULL,
  pcap_file_id INT NOT NULL,
  creation_date DATETIME DEFAULT NOW(),
  path VARCHAR(255) NOT NULL UNIQUE,
  ddos_flag BOOLEAN NOT NULL,
  mitm_flag BOOLEAN NOT NULL,
  PRIMARY KEY (report_id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (pcap_file_id) REFERENCES pcap_files(file_id)
) AUTO_INCREMENT = 1
`

/* 
  ! if and only if the cookie token is valid and the id in the request is the id in the cookie token
  * helpers
    -- select * from project_schm.users
    -- update project_schm.users set isadmin = 1 where id = 1
    -- insert into project_schm.json_reports (owner_id, path, filename) values(1, "./test/this2.txt", "this2.txt")
 */

/**
 * creates the json report table
 * @returns void
 */
const create_json_report_table = () => {
  return new Promise((resolve, reject) => {
    connection.query(create_json_report_query, (err, results) => {
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

/**
 * gets all the reports of a user(id)
 * @param {Number} id 
 * @returns valid: (false if failed else true), [optional] reports: res from db, [optional] message: {undef_err_msg | not_report_msg}
 */
const get_reports_by_id = (id) => {
  return new Promise((resolve, reject) => {
    if (id === undefined) {
      reject({valid: false, message: undef_err_msg})
    } else {
      connection.query(get_all_reports_by_id_query, [id], (err, res) => {
        if (err) {
          console.error("error querying user by credentials:", err)
          reject(err)
        } else {
          if (res.length > 0) {
            console.log("reports -> user found: " + id)
            resolve({ valid: true, reports: res})
          } else {
            console.log("reports -> user not found: " + id)
            resolve({ valid: false, message: not_report_msg})
          }
        }
      })
    }
  })
}

/**
 * get the report record by the pcap_file_id
 * @param {Number} pcap_file_id 
 * @returns success if successfully fetched. else false, [optional] message: {undef_err_msg | err}, [optional on success] reports: the report record
 */
const get_report_by_pcap_id = (pcap_file_id) => {
  return new Promise((resolve, reject) => {
    if (pcap_file_id === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      connection.query(get_all_reports_by_pcap_fil_id_query, [pcap_file_id], (err, res) => {
        if (err) {
          reject({success: false, message: err})
        } else {
          if (res.length > 0) {
            resolve({success: true, report: res[0]})
          } else {
            reject({success: false})
          }
        }
      })
    }
  })
}

/**
 * get the next AUTO_INCREMENT from the db
 * @returns {Number} -1 if failed else the next AUTO_INCREMENT number
 */
const get_next_id_and_inc = () => {
  return new Promise((resolve, reject) => {
    connection.query(get_next_id_query, (err, res) => {
      if (err) {
        reject(-1)
      } else {
        if (res.length > 0) {
          resolve(res[0].AUTO_INCREMENT)
        } else {
          reject(-1)
        }
      }
    })
  })
}

/**
 * creates a new report record from the given owner_id pcap_file_id the report folder and the attack flags
 * @param {Number} owner_id 
 * @param {Number} pcap_file_id 
 * @param {String} path 
 * @param {boolean} ddos_flag 
 * @param {boolean} mitm_flag 
 * @returns success: true if succesfully created else false, [optional] message: {err (on failed or on exists)}, [optional on success] res: the resualt.
  */
const create_json_report = (owner_id, pcap_file_id, path, ddos_flag, mitm_flag) => {
  return new Promise((resolve, reject) => {
    connection.query(insert_report_query, [owner_id, pcap_file_id, path, ddos_flag, mitm_flag], (err, res) => {
      if (err) {
        connection.rollback(function() {
          reject({success: false, message: err})
        })
      } else {
        connection.commit(function(err) {
          if (err) {
            connection.rollback(function() {
              reject({success: false, message: err})
            })
          }
          resolve({success: true, res})
        })
      }
    })
  })
}

/**
 * deletes all reports associated with a given owner_id.
 * @param {Number} owner_id - The ID of the owner whose reports are to be deleted.
 * @returns {Promise} A promise indicating the success or failure of the operation.
 */
const delete_all_reports_by_user_id = (owner_id) => {
  return new Promise((resolve, reject) => {
    if (owner_id === undefined) {
      reject({ success: false, message: undef_err_msg });
    } else {
      connection.query(delete_all_reports_by_user_id_query, [owner_id], (err, result) => {
        if (err) {
          console.error("error deleting reports by owner_id:", err);
          reject(err);
        } else {
          if (result.affectedRows > 0) {
            console.log("deleted reports for owner_id:", owner_id);
            resolve({ success: true });
          } else {
            console.log("no reports found for owner_id:", owner_id);
            resolve({ success: false, message: not_report_msg });
          }
        }
      });
    }
  });
};

/**
 * deletes the file if found.
 * @param {Number} file_id 
 * @returns success (true if deleted else false) [optional] message: {undef_err_msg | err | not_report_msg} 
 */
const delete_report_by_file_id = (file_id) => {
  return new Promise((resolve, reject) => {
    if (file_id === undefined) {
      reject({ success: false, message: undef_err_msg });
    } else {
      connection.query(delete_report_by_file_id_query, [file_id], (err, result) => {
        if (err) {
          console.error("error deleting reports by owner_id:", err);
          reject({success: false, message: err});
        } else {
          if (result.affectedRows > 0) {
            console.log("deleted reports for owner_id:", file_id);
            resolve({ success: true });
          } else {
            console.log("no reports found for owner_id:", file_id);
            resolve({ success: false, message: not_report_msg });
          }
        }
      });
    }
  });
};

export { create_json_report_table, get_reports_by_id, get_next_id_and_inc, create_json_report, get_report_by_pcap_id, delete_all_reports_by_user_id, delete_report_by_file_id }