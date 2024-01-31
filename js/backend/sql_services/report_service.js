import { connection, connectToDatabase } from './db_service.js'

const create_json_report_query = `
CREATE TABLE IF NOT EXISTS json_reports (
  report_id INT NOT NULL AUTO_INCREMENT,
  owner_username VARCHAR(50) NOT NULL,
  owner_id INT NOT NULL,
  creation_date DATETIME DEFAULT NOW(),
  path VARCHAR(256) NOT NULL,
  PRIMARY KEY (report_id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
)`

function create_json_report_table() {
  return new Promise((resolve, reject) => {
    connection.query(create_json_report_query, (err, results) => {
      if (err) {
        console.log("error creating json reports table: ", err)
        reject(err)
      } else {
        console.log("created table")
        resolve()
      }
    })
  })
}

export { create_json_report_table }