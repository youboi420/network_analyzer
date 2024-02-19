import { connection } from './db_service.js'

const undef_err_msg = "one or more of the given parameters is undefined"
const not_report_msg  = "no such report"
const insert_report_query = `INSERT INTO json_reports (owner_id, path, filename) VALUES (?, ?, ?)`
const delete_report_query = `DELETE FROM json_reports WHERE reportname = ? and password = ?`
const delete_report_by_id_query = `DELETE FROM json_reports WHERE report_id = ?`
const delete_all_reports_by_id_query = `DELETE FROM json_reports WHERE owner_id = ?`
const get_all_reports_query = `SELECT * FROM json_reports`
const get_all_reports_by_id_query = `SELECT * FROM json_reports WHERE owner_id = ?`

const create_json_report_query = `
CREATE TABLE IF NOT EXISTS json_reports (
  report_id INT NOT NULL AUTO_INCREMENT,
  owner_id INT NOT NULL,
  creation_date DATETIME DEFAULT NOW(),
  path VARCHAR(255) NOT NULL UNIQUE,
  filename VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (report_id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
)`

/* 
  ! if and only if the cookie token is valid and the id in the request is the id in the cookie token
  * helpers
    -- select * from project_schm.users
    -- update project_schm.users set isadmin = 1 where id = 1
    -- insert into project_schm.json_reports (owner_id, path, filename) values(1, "./test/this2.txt", "this2.txt")
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

const get_reports_by_id = (id) => {
  return new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(undef_err_msg)
    } else {
      connection.query(get_all_reports_by_id_query, [id], (err, res) => {
        if (err) {
          console.error("error querying user by credentials:", err)
          reject(err)
        } else {
          if (res.length > 0) {
            console.log("reports -> user found: " + id)
            console.log("Resualts:", res);
            resolve({ valid: true, reports: res})
          } else {
            console.log("reports -> user not found: " + id)
            resolve({ valid: false })
          }
        }
      })
    }
  })
}

// const create_json_report

export { create_json_report_table, get_reports_by_id }