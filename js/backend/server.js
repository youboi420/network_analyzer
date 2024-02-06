/* npm lib's */
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

/* local moudle's and servies*/
import * as db_service from './sql_services/db_service.js'
import * as users_service from './sql_services/users_service.js'
import * as reports_service from './sql_services/report_service.js'

/* config's and server consts */
const sql_api_path = process.env.SQL_API_PATH //"/sql_api"
const app = express()
const local_ip = process.env.LOCAL_IP_ADDRESS
const port = process.env.PORT
const DEBUG = false
app.use(cors())
app.use(express.json())
dotenv.config()


const initialize_server = async () => {
  try {
		await db_service.connect_to_db()
    await users_service.create_users_table()
    await reports_service.create_json_report_table()
    app.listen(port, local_ip, () => {
      console.log(`Server is running on http://${local_ip}:${port}`)
    })
    app.get("/*", (req, res) => {
      res.json({message: "welcome to " + req.path})
    })
  } catch (error) {
    console.error('Error initializing server:', error)
  }
}

const sql_rest_controller = () => {
  try {
    /* need to sanatize all the parameters.... aka check for sql injection... */
    /* use the sql_servies... */
    /* all users */
    app.get(`${sql_api_path}/all_users`, async (req, res) => {
      if (DEBUG) console.log(`GET /${sql_api_path}/all_users`)
      var users = await users_service.get_all_users()
      res.json(users)
    })

    app.get(`${sql_api_path}/user/:id`, async (req, res) => {
      const { id } = req.params
      if (DEBUG) console.log(`GET ${sql_api_path}/user`)
      if (DEBUG) console.log("id = " + id)
      if (!id) {
        return res.status(400).json({ error: "/(id) is required", valid: false })
      }
      const user = await users_service.get_user_by_id(id)
      if (user.valid === true) {
        res.json({ message: "user found", valid: true, ...user})
      } else {
        return res.status(404).json({ error: "user not found", valid: false, u: user })
      }
    })
    
    /* validate user by username */
    app.get(`${sql_api_path}/user`, async (req, res) => {
      const { un } = req.query
      if (DEBUG) console.log(`GET ${sql_api_path}/user`)
      if (DEBUG) console.log(req.query)
      if (DEBUG) console.log("un = " + un)
      if (!un) {
        return res.status(400).json({ error: "un=(username) is required", valid: false })
      }
      const user = await users_service.get_user_by_un(un)
      if (user.valid === true) {
        res.json({ message: "user found", valid: true, u: user})
      } else {
        return res.status(404).json({ error: "user not found", valid: false, u: user })
      }
    })

    // /* delete a user from table... */
    // app.delete(`${sql_api_path}/user`, async(req, res) => {
    //   const { un, updw, isadmin } = req.body
    //   console.log(`un = ${un}|pw = ${updw}|adn = ${isadmin}`)
    //   try{
    //     const del_user = await users_service.delete_user(un, updw, isadmin)
    //     if (del_user.success === true) res.status(200).send("user deleted successfully")
    //   } catch (exception) {
    //     // console.log(exception)
    //     if (exception.code === 404) {
    //       res.status(404).send("user not found")
    //     } else {
    //       res.status(500).send("server error")
    //     }
    //   }
    // })

    /* delete a user by_id from table... */
    app.delete(`${sql_api_path}/user/:id`, async(req, res) => {
      console.log("DELETE REQ")
      const { id } = req.params
      try {
        const del_user = await users_service.delete_user_by_id(id)
        if (del_user.success === true) res.status(200).send("user deleted successfully")
      } catch (exception) {
        // console.log(exception)
        if (exception.code === 404) {
          res.status(404).send("user not found")
        } else {
          res.status(500).send("server error")
        }
      }
    })

    /* post a user */
    app.post(`${sql_api_path}/login`, async(req, res) => {
      const { un, password } = req.body
      try {
        /* check in db is valid... if so {success: true, valid: true} */
        const db_res = await users_service.validate_user(un, password)
        if (db_res.success === true){
          res.status(200).send({success: true, valid: true, data: {a: Math.random(), b: Math.random().toString(36).slice(0, 6)}})
        }
        /* if not valid return {success: true, valid: false} */
      } catch (error) {
        /* return {success: false, valid: false} */
        if (error.code === 404) {
          res.status(error.code).send("user not exists")
        } else {
          res.status(500).send("server error")
        }
      }
    })
    
    app.post(`${sql_api_path}/user`, async (req, res) => {
      const { un, password, isadmin } = req.body
      console.log(`un = ${un}|pw = ${password}|admin = ${isadmin}`)
      try {
        const new_user = await users_service.create_user(un, password, isadmin)
        if (new_user.success === true) {
          res.status(200).send("user added succesfully")
        } else {
          res.status(409).send("user already exist's")
        }
      } catch (exception) {
        if (exception.code === 409) {
          res.status(exception.code).send("user already exists")
        } else {
          res.status(500).send("server error")
        }
      }
    })

    /* update a user */
    app.put(`${sql_api_path}/user/:id`, async (req, res) => {
      const { id } = req.params
      console.log(req.body)
      const { un, password, isadmin } = req.body
      console.log(`un = ${un}|pw = ${password}|admin = ${isadmin}`)
      try {
        const updated_user = await users_service.update_user_new_data(id, un, password, isadmin)
        if (updated_user.success === true) {
          res.status(200).send("user updated succesfully")
        }
      } catch (exception) {
        if (exception.code === 404) {
          res.status(exception.code).send("user not exists")
        } else {
          res.status(500).send("server error")
        }
      }
    })

  } catch (err) {
    /* catch any error...  */
    console.error("some error: " + err)
  }
}

initialize_server()
sql_rest_controller()

// app.get("/books", (req, res) => {
	// 	const q = "SELECT * FROM books"
// 	db.query(q, (err, data) => {
// 		if (err) {
// 			console.log(err)
// 			return res.json(err)
// 		}
// 		return res.json(data)
// 	})
// })

// app.post("/books", (req, res) => {
// 	const q = "INSERT INTO books(`title`, `desc`, `price`, `cover`) VALUES (?)"

// 	const values = [
// 		req.body.title,
// 		req.body.desc,
// 		req.body.price,
// 		req.body.cover,
// 	]

// 	db.query(q, [values], (err, data) => {
// 		if (err) return res.send(err)
// 		return res.json(data)
// 	})
// })

// app.delete("/books/:id", (req, res) => {
// 	const bookId = req.params.id
// 	const q = " DELETE FROM books WHERE id = ? "

// 	db.query(q, [bookId], (err, data) => {
// 		if (err) return res.send(err)
// 		return res.json(data)
// 	})
// })

// app.put("/books/:id", (req, res) => {
// 	const bookId = req.params.id
// 	const q = "UPDATE books SET `title`= ?, `desc`= ?, `price`= ?, `cover`= ? WHERE id = ?"

// 	const values = [
// 		req.body.title,
// 		req.body.desc,
// 		req.body.price,
// 		req.body.cover,
// 	]

// 	db.query(q, [...values, bookId], (err, data) => {
// 		if (err) return res.send(err)
// 		return res.json(data)
// 	})
// })
