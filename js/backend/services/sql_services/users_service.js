import { connection } from "./db_service.js"

const create_user_table_query = `
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isadmin BOOLEAN NOT NULL,
  PRIMARY KEY (id)
)`

const undef_err_msg = "one or more of the given parameters is undefined"
const not_user_msg  = "no such user"
const insert_user_query = `INSERT INTO users (username, password, isadmin) VALUES (?, ?, ?)`
const update_user_query = `UPDATE users SET username = ?, password = ?, isadmin = ? where id = ?`
const delete_user_query = `DELETE FROM users WHERE username = ? and password = ?`
const delete_user_by_id_query = `DELETE FROM users WHERE id = ?`
const get_user_valid_query = `SELECT * FROM users WHERE username = ? and password = ?`
const get_all_users_query = `SELECT * FROM users`
const get_user_by_un_query = `SELECT * FROM users WHERE username = ?`
const get_user_by_id_query = `SELECT * FROM users WHERE id = ?`

const create_users_table = () => {
  return new Promise((resolve, reject) => {
    connection.query(create_user_table_query, (err, results) => {
      if (err) {
        console.log("error creating json reports table: ", err)
        reject(err)
      } else {
        console.log(results.affectedRows !== 0 ? "created table users" : "table users already exist's")
        resolve()
      }
    })
  })
}
const get_user_by_un = (un) => {
  return new Promise((resolve, reject) => {
    if (un === undefined) {
      reject(undef_err_msg)
    } else {
      connection.query(get_user_by_un_query, [un], (err, res) => {
        if (err) {
          console.error("error querying user by credentials:", err)
          reject(err)
        } else {
          if (res.length > 0) {
            console.log("user found: " + un)
            resolve({ valid: true})
          } else {
            console.log("user not found: " + un)
            resolve({ valid: false })
          }
        }
      })
    }
  })
}

const get_user_by_id = (id) => {
  return new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(undef_err_msg)
    } else {
      connection.query(get_user_by_id_query, [id], (err, res) => {
        if (err) {
          console.error("error querying user by credentials:", err)
          reject(err)
        } else {
          if (res.length > 0) {
            console.log("user found: " + id)
            resolve({ valid: true, user: res[0]})
          } else {
            console.log("user not found: " + id)
            resolve({ valid: false })
          }
        }
      })
    }
  })
}

const create_user = (un, pw, isadmin) => {
  return new Promise(async (resolve, reject) => {
    if (un !== undefined && pw !== undefined && isadmin !== undefined) {
      const check = await get_user_by_un(un) 
      if (check.valid === true) {
        reject({ success: false, message: "duplicate user", code: 409})
        return
      }
      connection.query(insert_user_query, [un, pw, isadmin], (err, res) => {
        if (err) {
          // console.error('error creating user:', err)
          reject(err)
          return
        } else {
          console.log(res);
          resolve({success: true, message: "created user", id: res.insertId})
          return
        }
      })
    } else {
      reject("one or more of the given fields are " + undefined)
      return
    }
  })
}

const delete_user = (un, pw, isadmin) => {
  if (isadmin) {
    if (un !== undefined && pw !== undefined) {
      return new Promise (async (resolve, reject) => {
        const check = await get_user_by_un(un) 
        if (check.valid === true) {
          connection.query(delete_user_query, [un, pw], (err, res) => {
            if (err) {
              console.log("deletion failed\n" + err)
              reject(err)
            } else {
              connection.query(delete_user_query, [un, pw, isadmin], (res, err) => {
                if (err){
                  console.log("deletion failed: " + err)
                  reject(err)
                } else {
                  console.log("deleted succesfully: " + un)
                  resolve(res)
                }
              })
            }
          })
        } else {
          reject({success: false, message: "user not exist's", code: 404})
        }
      })
    }
  }
}

const delete_user_by_id = (id) => {
  return new Promise ( async (resolve, reject) => {
    if (id === undefined) {
      reject({success: false,message: undef_err_msg})
      return
    } else {
      const check = await get_user_by_id(id)
      if (check.valid === true) {
        connection.query(delete_user_by_id_query, [id], (err, res) => {
          if (err) {
            reject({success: false, message: not_user_msg, code: 409})
            return
          } else {
            resolve({success: true, code: 200 ,message: res})
            return
          }
        })
      } else {
        reject({success: false, message: not_user_msg, code: 404})
        return
      }
    }
  })
}

const validate_user = (un, password) => {
  return new Promise( async(resolve, reject) => {
    if (un === undefined || password === undefined) {
      reject({success: false, message: undef_err_msg, valid: false})
    } else {
      const check = await get_user_by_un(un)
      if (check.valid === true) {
        connection.query(get_user_valid_query, [un, password], (err, res) => {
          if (err) {
            reject({ success: false, message: err })
          } else {
            if (res.length === 1) resolve({ success: true, valid: true, user: res[0], message: "Hello valid"})
            else resolve({ success: true, valid: false})
          }
        })
      } else {
        reject({success: false, code: 404})
      }
    }
  })
}

const update_user_new_data = (id, un, upwd, isadmin) => {
  return new Promise(async (resolve, reject) => {
    if (id === undefined || un === undefined || upwd === undefined || isadmin === undefined) {
      reject({success: false, message: undef_err_msg})
    } else {
      const check = await get_user_by_id(id)
      if (check.valid === true) {
        connection.query(update_user_query, [un, upwd, isadmin, id], (err, res) => {
          if (err) {
            console.log("update failed")
            console.log(err)
            reject({success: false, message: err})
          } else {
            console.info(`user: ${id} updated`)
            resolve({success: true})
          }
        })
      } else {
        reject({success: false, code: 404})
      }
    }
  })
}

const get_all_users = () => {
  return new Promise((resolve, reject) => {
    connection.query(get_all_users_query, (err, res) => {
      if (err) {
        console.log("getting all users failed...\n" + err)
        reject(err)
      } else {
        console.log(`${new Date(Date.now())} => got all users`)
        resolve(res)
      }
    })
  })
}

export { create_users_table, create_user, delete_user, get_all_users, get_user_by_un, get_user_by_id, delete_user_by_id, update_user_new_data, validate_user }