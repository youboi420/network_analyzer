import express from 'express'
import cookieParser from 'cookie-parser'
import fs from 'fs' /* will be used later */
import path from 'path'
import jwt from 'jsonwebtoken'

import * as pcap_files_service from '../services/sql_services/pcap_files_service.js'


import multer from 'multer'
import * as cookie_service from '../services/cookie_services/cookie_service.js'
import { getUserByCookie } from './auth.js'

const filesRoute = express.Router()
const SEC_KEY = process.env.JWT_SECRET

const storage = multer.diskStorage({  
  destination: async function(req, file, cb) {
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    const userID = userCookie?.decoded?.id
    let userFolderPath = './bin/users/'
    if ( userID !== undefined ) {
      jwt.verify(req.cookies.jwt, SEC_KEY, async (err) => {
        if (err) {
          cb(null, "-")
        } else {
          /* need to check pcap_files_service for unique path */
          userFolderPath = path.join(userFolderPath, String(userID), '/pcap')
          let ret
          try {
            ret = await pcap_files_service.create_file(userID, "./" + userFolderPath.toString() + "/" + file.originalname, file.originalname)
          } catch (error) {
            console.log("this is the error:",error);
            if (error.message === 'dup') {
              cb(null, "-duplicate")
              return
            }
            cb(null, "-")
            return
          }
          if (ret.success === false) {
          } else {
            if (file.originalname.endsWith(".pcap")) {
              cb(null, userFolderPath)
            } else {
              cb(null, "-")
            }
          }
        }
      })
    } else {
      cb(null, "-")
    }
  },
  filename: async function(req, file, cb) {
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

filesRoute.use(cookieParser())

filesRoute.get('/json_data', (req, res) => {
  // Specify the path to your JSON file
  const filePath = path.join('./bin/reports/out_L4.json');
  // Read the JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

filesRoute.get('/all', async (req, res) => {
  const results = await pcap_files_service.get_all()
  res.json(results.results)
})

filesRoute.get('/my_files', async (req, res) => {
  const sleep = (milliseconds) => {
    return new Promise(resolve => {
      setTimeout( () => {
        console.log("aint no way");
        resolve();
      }, milliseconds);
    });
  }
  // await sleep(3 * 1000)
  
  const jwtCookie = req.cookies.jwt
  try {
    const decodedToken = jwt.decode(jwtCookie, SEC_KEY);
    const cookie_id = decodedToken ? decodedToken.id : undefined  
    let user_res = await getUserByCookie(jwtCookie)
    jwt.verify(jwtCookie, SEC_KEY, async (err) => {
      if (err) {
        res.json({ valid: false })
      } else {
        if (user_res.valid === true) {
          user_res = user_res.user
          const my_files = await pcap_files_service.get_all_files_by_userid(cookie_id)
          if (my_files.success === true) {
            res.json(my_files.files)
          } else {
            res.status(403).json({valid: false, message: "forbidden"})
          }
        } else {
          res.json({ valid: false })
        }
      }
    })
  } catch (error) {
    const msg = jwtCookie === undefined ? "empty" : "Internal server error" + jwtCookie
    console.error('Error verifying JWT cookie ):', error);
    res.status(500).json({ valid: false, error: msg});
  }
})

filesRoute.post('/upload', upload.single('file'), async (req, res) => {
  const jwtCookie = req.cookies.jwt
  const dec = cookie_service.decodeCookie(req.cookies)
  const user_id = dec.decoded?.id
  const filename = req.file.filename
  const filepath = req.file.path
  if (jwtCookie === undefined) {
    res.status(403).json({message: "no cookie provided"})
  } else {
    if (! req.file.filename.endsWith(".pcap")) {
      res.status(403).send( {success: false, message: "invalid file type"} )
    } else {
      if ( !req.file.path.startsWith('-') ) {
        res.status(200).send( {success: true } )
      } else {
        res.status(403).send( {success: false } )
      }
    }
  }
})


export default filesRoute