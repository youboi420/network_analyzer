import express from 'express'
import dotenv from 'dotenv'
import * as analyze_service from '../services/analyze_services/analyze_service.js'
import cookieParser from 'cookie-parser'

/* config's and server consts */
const DEBUG = false
dotenv.config()
const SEC_KEY = process.env.JWT_SECRET
// TODO (probably) use a middleware for the user verification

const analyzeRoute = express.Router()
analyzeRoute.use(cookieParser())

analyzeRoute.get('', async (req, res) => {
  /* regex to validate a filename... and then create a command using regex to get the <pcap-filename>.json*/
  const command = req.body.filename
  try {
    const response = await analyze_service.analyze(command)
    res.status(200).send({
      response
    })
  } catch (error) {
    res.status(500).send({
      message: "internal server error :_(",
      err: error
    })
  }

})

export default analyzeRoute