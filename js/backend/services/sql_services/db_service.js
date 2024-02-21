import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_UPWD = process.env.DB_UPWD
const DB_DBS = process.env.DB_DBS

/**
 * the connection cred's
 */
const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_UPWD,
  database: DB_DBS,
})

/**
 * connect's the backend server to the sql server...
 * @returns void
 */
function connect_to_db() {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err)
        reject(err)
      } else {
        console.log('Connected to MySQL')
        resolve()
      }
    })
  })
}

export { connection, connect_to_db }