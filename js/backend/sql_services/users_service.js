import mysql from "mysql";

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_UPWD = process.env.DB_UPWD
const DB_DBS = process.env.DB_DBS

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_UPWD,
  database: DB_DBS,
});

const create_user = `
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  isadmin TINYINT NOT NULL,
  PRIMARY KEY (id)
)
`
const insert_user = `insert into users (username, password, isadmin) values ?`

function create_users_table() {
  return new Promise((resolve, reject) => {
    connection.query(create_json_report_query, (err, results) => {
      if (err) {
        console.log("error creating json reports table: ", err)
        reject(err)
      } else {
        console.log("created table");
        resolve()
      }
    })
  })
}

function insert_user(un, pw, isadmin) {
  return new Promise((resolve, reject) => {
    connection.query(insert_user, )
  })
}

export { create_users_table }