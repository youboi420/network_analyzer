import express from 'express'
import cookieParser from 'cookie-parser'
import fs from 'fs' /* will be used later */
import path from 'path'
import multer from 'multer'

import * as report_service from '../services/sql_services/report_service.js'
import * as cookie_service from '../services/cookie_services/cookie_service.js'

const reportsRouter = express.Router()
const files_location = 'uploads/'
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, files_location)
  },
  filename: function(req, file, cb) {
    const userCookie = cookie_service.decodeCookie(req.cookies)
    console.log(userCookie);
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

reportsRouter.use(cookieParser())

reportsRouter.get('/user/:id', async(req, res) => {
  const { id }  = req.params
  const reports = await report_service.get_reports_by_id(id)
  console.log("got:",reports);
  if (reports?.valid === true) {
    console.log("Here!!!");
    res.status(200).json(reports.reports)
  } else {
    res.status(404).json({code: 404, message: "user " + id + ": not found" })
  }
});

reportsRouter.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file  
  res.send(`Uploaded ${filename}`)
})

export default reportsRouter