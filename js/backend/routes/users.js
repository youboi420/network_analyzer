import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import isAdminMiddleware from '../middleware/isAdmin.js'

import * as files_service from '../services/files_service/file_service.js'
import * as pcap_files_service from '../services/sql_services/pcap_files_service.js'
import * as users_service from '../services/sql_services/users_service.js'

/* config's and server consts */
const DEBUG = false
dotenv.config()
const sql_api_path = process.env.SQL_API_PATH

const usersRouter = express.Router()
usersRouter.use(cookieParser())

usersRouter.get(`${sql_api_path}/all_users`, async (req, res) => {
  const isAdmin = await isAdminMiddleware(req.cookies.jwt)
  if (isAdmin.valid) {
    if (DEBUG) console.log(`GET /${sql_api_path}/all_users`)
    var users = await users_service.get_all_users()
    res.json(users)
  } else {
    res.status(403).send({ error: "login as admin." })
  }
})

/* get a specific user */
usersRouter.get(`${sql_api_path}/user/:id`, async (req, res) => {
  const isAdmin = await isAdminMiddleware(req.cookies.jwt)
  if (isAdmin.valid) {
    const { id } = req.params
    if (DEBUG) console.log(`GET ${sql_api_path}/user`)
    if (DEBUG) console.log("id = " + id)
    if (!id) {
      return res.status(400).json({ error: "/(id) is required", valid: false })
    }
    const user = await users_service.get_user_by_id(id)
    if (user.valid === true) {
      res.json({ message: "user found", valid: true, ...user })
    } else {
      return res.status(404).json({ error: "user not found", valid: false, u: user })
    }
  } else {
    res.status(403).send({ error: "login as admin." })
  }
})

/* validate user by username */
usersRouter.get(`${sql_api_path}/user`, async (req, res) => {
  const isAdmin = await isAdminMiddleware(req.cookies.jwt)
  if (isAdmin.valid) {
    const { un } = req.query
    if (DEBUG) console.log(`GET ${sql_api_path}/user`)
    if (DEBUG) console.log(req.query)
    if (DEBUG) console.log("un = " + un)
    if (!un) {
      return res.status(400).json({ error: "un=(username) is required", valid: false })
    }
    const user = await users_service.get_user_by_un(un)
    if (user.valid === true) {
      res.json({ message: "user found", valid: true, u: user })
    } else {
      return res.status(404).json({ error: "user not found", valid: false, u: user })
    }
  } else {
    res.status(403).send({ error: "login as admin." })
  }
})

/* delete a user by_id from table... */
usersRouter.delete(`${sql_api_path}/user/:id`, async (req, res) => {
  const isAdmin = await isAdminMiddleware(req.cookies.jwt)
  if (isAdmin.valid) {
    console.log("DELETE REQ")
    const { id } = req.params
    try {
      const user = await users_service.get_user_by_id(id)
      const all_files = pcap_files_service.get_all_files_by_userid(id)
      if (all_files?.files !== undefined) await pcap_files_service.delete_all_files_by_user_id(id)
      const del_user = await users_service.delete_user_by_id(id)
      if (del_user.success)
        res.status(200).send("user deleted successfully")
      else
        res.status(500).send("server error")
      // if (!!user.user) {
      //   if (deleted_files !== true) {
      //     if (deleted_files.message === "no files") {
      //     } else {
      //       res.status(401).json({message: "oh no files:|"})
      //     }
      //   } else {
      //     const del_user = await users_service.delete_user_by_id(id)
      //     if (del_user.success === true) res.status(200).send("user deleted successfully")
      //   }
      // }
    } catch (exception) {
      if (exception.code === 404) {
        res.status(404).send("user not found")
      } else {
        res.status(500).send("server error")
      }
    }
  } else {
    res.status(403).send({ error: "login as admin." })
  }
})

/* create a user */
usersRouter.post(`${sql_api_path}/user`, async (req, res) => {
  const isAdmin = await isAdminMiddleware(req.cookies.jwt)
  if (isAdmin.valid) {
    const { un, password, isadmin } = req.body
    if (DEBUG) console.log(`un = ${un}|pw = ${password}|admin = ${isadmin}`)
    try {
      const new_user = await users_service.create_user(un, password, isadmin)
      if (new_user.success === true) {
        /* create the directory of the new user in ./bin/users/:id where id new_user.id */
        console.log("new user", new_user.id);
        files_service.create_folder_for_new_user(new_user.id)
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
  } else {
    res.status(403).send({ error: "login as admin." })
  }
})

/* update a user */
usersRouter.put(`${sql_api_path}/user/:id`, async (req, res) => {
  const isAdmin = await isAdminMiddleware(req.cookies.jwt)
  if (isAdmin.valid) {
    const { id } = req.params
    if (DEBUG) console.log(req.body)
    const { un, password, isadmin } = req.body
    if (DEBUG) console.log(`un = ${un}|pw = ${password}|admin = ${isadmin}`)
    try {
      const updated_user = await users_service.update_user_new_data(id, un, password, isadmin)
      if (updated_user.success === true) {
        res.status(200).send("user updated succesfully")
      }
    } catch (exception) {
      if (exception.code === 404) {
        res.status(exception.code).send("user not exists")
      } else if (exception.message === 'dup') {
        res.status(409).send("duplicate username")
      } else {
        res.status(500).send("server error")
      }
    }
  } else {
    res.status(403).send({ error: "login as admin." })
  }
})

export default usersRouter