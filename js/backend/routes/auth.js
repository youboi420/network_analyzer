import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

import * as files_service from '../services/files_service/file_service.js'
import * as users_service from '../services/sql_services/users_service.js'

dotenv.config()
const SEC_KEY = process.env.JWT_SECRET

const authRouter = express.Router()
authRouter.use(cookieParser())

export const getUserByCookie = async (cookie) => {
  const decodedToken = jwt.decode(cookie, SEC_KEY)
  const cookie_id = decodedToken ? decodedToken.id : undefined
  return await users_service.get_user_by_id(cookie_id)
}

authRouter.get(`/profile`, async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.cookies.jwt, SEC_KEY)
    const id = decodedToken /* !== null || decodedToken !== undefined */  ? decodedToken.id : undefined
    const user_res = await users_service.get_user_by_id(id)
    if (user_res.valid === true) {
      user_res.user.password = "undefined"
      res.json({ valid: true, user: user_res.user})
    } else {
      res.json({ valid: false, user: undefined})
    }
  } catch (error) {
    const msg = req.cookies.jwt === undefined ? "empty" : "Internal server error"
    console.error('Error verifying JWT cookie:', error)
    res.status(500).json({ valid: false, error: msg})
  }
})

authRouter.get(`/verify`, async (req, res) => {
  const jwtCookie = req.cookies.jwt
  try {
    const decodedToken = jwt.decode(jwtCookie, SEC_KEY)
    const cookie_id = decodedToken ? decodedToken.id : undefined  
    let user_res = await getUserByCookie(jwtCookie)
    jwt.verify(jwtCookie, SEC_KEY, (err) => {
      if (err) {
        res.json({ valid: false })
      } else {
        if (user_res.valid === true) {
          user_res = user_res.user
          /* only if the user is found */
          const valid = user_res.id == cookie_id
          /* only if the user is found */
          const isAdmin = user_res.isadmin === 1
          res.json({ valid: valid, isadmin: isAdmin, id: cookie_id, username: user_res.username})
        } else {
          res.json({ valid: false, isadmin: false })
        }
      }
    })
  } catch (error) {
    const msg = jwtCookie === undefined ? "empty" : "Internal server error" + jwtCookie
    console.error('Error verifying JWT cookie ):', error)
    res.status(500).json({ valid: false, error: msg})
  }
})

/* validate a user */
/* should be in auth router later */
authRouter.post(`/login`, async (req, res) => {
  const { un, password } = req.body
  console.log("POST REQUEST!")
  try {
    /* check in db is valid... if so {success: true, valid: true} */
    const db_res = await users_service.validate_user(un, password)
    if (db_res.valid === true) {
      const user = db_res.user
      console.log(user)
      const user_token = jwt.sign({ id: user.id }, SEC_KEY, { expiresIn: '90d' })
      res.cookie('jwt', user_token, { httpOnly: true, maxAge: (90 * 24 * 60 * 60 * 1000) })
      res.status(200).send({ success: true, valid: true })
    } else {
      res.status(200).send({ success: true, valid: false })
    }
    /* if not valid return {success: true, valid: false} */
  } catch (error) {
    /* return {success: false, valid: false} */
    if (error.code === 404) {
      res.status(error.code).send("user not exists")
    } else {
      console.log(error)
      res.status(500).send("server error")
    }
  }
})

authRouter.post(`/signup`, async (req, res) => {
  const { un, password } = req.body
  try {
    /* check in db is valid... if so {success: true, valid: true} */
    const db_create_res = await users_service.create_user(un, password, 0) /* 0 for false */
    if (db_create_res.success !== true) {
      res.status(500).send("server error")
    }
    const db_res = await users_service.validate_user(un, password)
    files_service.create_folder_for_new_user(db_create_res.id)
    if (db_res.valid === true) {
      const user = db_res.user
      const user_token = jwt.sign({ id: user.id }, SEC_KEY, { expiresIn: '90d' })
      res.cookie('jwt', user_token, { httpOnly: true, maxAge: (90 * 24 * 60 * 60 * 1000) })
      res.status(200).send({ success: true, valid: true })
    } else {
      res.status(200).send({ success: true, valid: false })
    }
    /* if not valid return {success: true, valid: false} */
  } catch (error) {
    /* return {success: false, valid: false} */
    if (error.code === 409) {
      res.status(error.code).send("duplicate user")
    } else {
      res.status(500).send("server error")
    }
  }
})

authRouter.get(`/clear-cookie`, async (req, res) => {
  try {
    const msg = req.cookies.jwt ? 'JWT cookie cleared successfully' : 'JWT cookie not present'
    res.clearCookie('jwt')
    res.json({ message:  msg})
  } catch (error) {
    console.error('Error clearing JWT cookie:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default authRouter