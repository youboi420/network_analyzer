import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { getUserByCookie } from './auth.js'

import * as analyze_service from '../services/analyze_services/analyze_service.js'
import * as files_service from '../services/files_service/file_service.js'
import * as cookie_service from '../services/cookie_services/cookie_service.js'
import * as pcap_files_service from '../services/sql_services/pcap_files_service.js'
import * as users_service from '../services/sql_services/users_service.js'
import * as reports_service from '../services/sql_services/report_service.js'

/* config's and server consts */
const DEBUG = false
dotenv.config()
const SEC_KEY = process.env.JWT_SECRET

const analyzeRoute = express.Router()
analyzeRoute.use(cookieParser())

analyzeRoute.get('/:id', async (req, res) => {
  const jwtCookie = req.cookies.jwt
  jwt.verify(jwtCookie, SEC_KEY, (err) => {
    if (err) {
      console.log("...")
      res.status(403).json({ valid: false })
    }
  })

  const decodedCookie = await cookie_service.decodeCookie(req.cookies)
  const uid = decodedCookie.decoded?.id
  const is_valid = await users_service.get_user_by_id(uid)
  if (is_valid.valid !== true) {
    res.status(403).json({ valid: false })
  }
  try {
    /* regex to validate a filename... and then create a command using regex to get the <pcap-filename>.json */
    const command = 'default'
    const file_id = req.params.id
    const decodeCookie = await cookie_service.decodeCookie(req.cookies)
    const user_id = decodeCookie.decoded?.id
    
    try {
      const file_path_promise = pcap_files_service.get_path_by_fileid(file_id)
      const file_path = await file_path_promise
      const next_id = await reports_service.get_next_id_and_inc()
      if (Number(next_id) === -1) {
        res.status(500).send({
          message: "getting next id. not analyzed"
        })
      }
      const report_folder_path = await files_service.create_report_folder_by_id(user_id, next_id)
      if (report_folder_path === -1) {
        res.status(500).send({
          message: "creating folder failed. not analyzed"
        })
      }
      const isAnalzed = await pcap_files_service.get_file_analyzed(file_id)
      if (isAnalzed.success === true) {
        res.status(200).send({
          message: "file already analyzed... need to select all the reports with owner file id of " + file_id
        })
      } else {
        const analyze_file = await analyze_service.analyze_file( report_folder_path, file_path, user_id, file_id )
        if (analyze_file.success === true) {
          const updated = await pcap_files_service.update_set_file_is_analyzed(file_id)
          res.status(200).send({
            updated: updated,
            analyze_file: analyze_file,
            report_path: report_folder_path,
            file_path: file_path,
          })
        } else {
          res.status(500).send({
            message: "internal server error analyze failed.",
            err: error,
          })
        }
      }
    } catch (error) {
      console.log(error)
      res.status(500).send({
        message: "internal server error :_(",
        err: error,
      })
    }
  } catch (error) {
    console.log("Error...", error)
    res.status(500).send()
  }
})

analyzeRoute.post('/get_file', async (req, res) => {
  const dec = cookie_service.decodeCookie(req.cookies)
  const jwtCookie = req.cookies.jwt
  const user_id = dec.decoded?.id
  const file_id = req.body.file_id
  /* make sure decoded id is equal to the file_id file owner id... */
  if (jwtCookie === undefined || file_id === undefined) {
    res.status(403).send({ message: "invalid request - cookie or file id is missing" })
  } else {
    let user_res = await getUserByCookie(jwtCookie)
    jwt.verify(jwtCookie, SEC_KEY, async (err) => {
      if (err) {
        res.status(403).json({ valid: false })
      } else {
        if (user_res.valid === true) {
          user_res = user_res.user
          try {
            const db_reponse = await pcap_files_service.update_set_file_is_analyzed(file_id)
            if (db_reponse.success === true) {
              res.status(200).send({ r: db_reponse.res })
            } else {
              res.status(403).json({ valid: false, message: "forbidden" })
            }
          } catch (error) {
            res.status(500).json({ valid: false })
          }
        } else {
          res.json({ valid: false })
        }
      }
    })
  }
})

export default analyzeRoute