/* npm lib's */
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

/* local moudle's and servies*/
import * as db_service from './services/sql_services/db_service.js'
import * as users_service from './services/sql_services/users_service.js'
import * as reports_service from './services/sql_services/report_service.js'
import * as pcap_files_service from './services/sql_services/pcap_files_service.js'

import usersRouter from './routes/users.js'
import analyzeRoute from './routes/analyze.js'
import filesRoute from './routes/files.js'
import authRouter from './routes/auth.js'
import reportsRouter from './routes/reports.js'

/* config's and server consts */
const port = process.env.PORT
const local_ip = process.env.LOCAL_IP_ADDRESS
const app = express()

const corsOptions = {
  // origin: [
  //   "http://localhost:3000",
  //   "http://192.168.211.53:3000",
  //   "http://192.168.68.128:3000/"
  // ],
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())
dotenv.config()

app.use('/analyze', analyzeRoute)
app.use('/files', filesRoute)
app.use('/auth', authRouter)
app.use('/users', usersRouter);
app.use('/reports', reportsRouter)

const initialize_server = async () => {
  try {
    await db_service.connect_to_db()
    await users_service.create_users_table()
    await pcap_files_service.create_pcap_table()
    await reports_service.create_json_report_table()
    app.listen(port, local_ip, () => {
      console.log(`Server is running on http://${local_ip}:${port}`)
    })
    app.get("/*", (req, res) => {
      res.json({message: "path " + req.path + " is not available..."})
    })
  } catch (error) {
    console.error('Error initializing server:', error)
  }
}

initialize_server()