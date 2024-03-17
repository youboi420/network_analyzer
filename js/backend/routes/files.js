import express from 'express'
import cookieParser from 'cookie-parser'
import fs from 'fs' /* will be used later */
import path from 'path'
import jwt from 'jsonwebtoken'
import multer from 'multer'

import * as pcap_files_service from '../services/sql_services/pcap_files_service.js'
import * as reports_service from '../services/sql_services/report_service.js'
import * as analyze_service from '../services/analyze_services/analyze_service.js'
import * as cookie_service from '../services/cookie_services/cookie_service.js'
import * as files_service from '../services/files_service/file_service.js'
import { getUserByCookie } from './auth.js'

/**
 * 
 */
const ERROR_TYPES = {

}

const filesRoute = express.Router()
const SEC_KEY = process.env.JWT_SECRET

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    const userID = userCookie?.decoded?.id
    let userFolderPath = './bin/users/'
    if (userID !== undefined) {
      jwt.verify(req.cookies.jwt, SEC_KEY, async (err) => {
        if (err) {
          cb(null, "-")
        } else {
          /* need to check pcap_files_service for unique path */
          userFolderPath = path.join(userFolderPath, String(userID), '/pcap')
          let ret
          try {
            ret = await pcap_files_service.create_file(userID, userFolderPath.toString() + "/" + file.originalname, file.originalname)
          } catch (error) {
            console.log("this is the error:", error)
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
  filename: async function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

filesRoute.use(cookieParser())

filesRoute.get('/gis/:id', async (req, res) => {
  const options = {
    root: path.join('')
  }
  try {
    const file_id = req.params.id
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    if (file_id === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    }
    else if (userCookie === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    } else {
      let error_flag = false
      const decoded = jwt.verify(req.cookies.jwt, SEC_KEY, (err) => {
        if (err) {
          error_flag = true
        }
      })
      if (error_flag) {
        res.status(403).send({message: "unauthoraized access"})
      } else {
        const user_id = userCookie.decoded.id
        const file_id_as_num = Number(file_id)
        const is_owner = await pcap_files_service.is_owner(file_id_as_num, user_id)
        if (is_owner.success !== true) {
          res.status(403).send({message: "unauthoraized access"})
        } else {
          try {
            const file = await pcap_files_service.get_file_by_fileid(file_id)
            const report = await reports_service.get_report_by_pcap_id(file_id)
            if (file.success === true && report.success === true) {
              const fileName = report.report.path + "/out_gis.json"
              res.status(200).sendFile(fileName, options, function (err) {
                if (err) {
                  console.error('Error sending file:', err)
                  res.status(400).send({message: "requested file is invalid."})
                } else {
                  console.log('Sent: ', fileName + "|:|" + file_id)
                }
              })
            } else {
              res.status(400).send({message: "requested file is invalid."})
            }
          } catch (error) {
            res.status(500).send({message: error})
          }
        }
      }
    }
  } catch (error) {
    if (error?.decoded === undefined) {
    res.status(401).json({ message: "no cookie provided" })
    } else {
      res.status(500).send()
    }
  }
// })

  // res.sendFile('./bin/reports/out_L2.json', (err) => {
  //   if (err) {
  //     console.log("Error reading file:", err)
  //   } else {
  //     console.log("Read file successfully...")
  //   }
  // })
  // const filePath = path.join('./bin/reports/out_L4.json')
  // fs.readFile(filePath, 'utf8', (err, data) => {
  //   if (err) {
  //     console.error('Error reading JSON file:', err)
  //     res.status(500).json({ error: 'Internal Server Error' })
  //     return
  //   }
  //   try {
  //     const jsonData = JSON.parse(data)
  //     res.json(jsonData)
  //   } catch (parseError) {
  //     console.error('Error parsing JSON:', parseError)
  //     res.status(500).json({ error: 'Internal Server Error' })
  //   }
  // })
})


filesRoute.get('/l4/:id', async (req, res) => {
  const options = {
    root: path.join('')
  }
  try {
    const file_id = req.params.id
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    if (file_id === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    }
    else if (userCookie === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    } else {
      let error_flag = false
      const decoded = jwt.verify(req.cookies.jwt, SEC_KEY, (err) => {
        if (err) {
          error_flag = true
        }
      })
      if (error_flag) {
        res.status(403).send({message: "unauthoraized access"})
      } else {
        const user_id = userCookie.decoded.id
        const file_id_as_num = Number(file_id)
        const is_owner = await pcap_files_service.is_owner(file_id_as_num, user_id)
        if (is_owner.success !== true) {
          res.status(403).send({message: "unauthoraized access"})
        } else {
          try {
            const file = await pcap_files_service.get_file_by_fileid(file_id)
            const report = await reports_service.get_report_by_pcap_id(file_id)
            console.log("got:", file);
            console.log("got:", report);
            if (file.success === true && report.success === true) {
              // const fileName = file.file.path
              const fileName = report.report.path + "/out_L4.json"
              res.status(200).sendFile(fileName, options, function (err) {
                if (err) {
                  console.error('Error sending file:', err)
                  res.status(err.status).send({message: "requested file is invalid."})
                } else {
                  console.log('Sent: ', fileName + "|:|" + file_id)
                }
              })
            } else {
              res.status(400).send({message: "requested file is invalid."})
            }
          } catch (error) {
            res.status(500).send({message: error})
          }
        }
      }
    }
  } catch (error) {
    if (error?.decoded === undefined) {
    res.status(401).json({ message: "no cookie provided" })
    } else {
      res.status(500).send()
    }
  }
})


filesRoute.get('/l2/:id', async (req, res) => {
  const options = {
    root: path.join('')
  }
  try {
    const file_id = req.params.id
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    if (file_id === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    }
    else if (userCookie === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    } else {
      let error_flag = false
      const decoded = jwt.verify(req.cookies.jwt, SEC_KEY, (err) => {
        if (err) {
          error_flag = true
        }
      })
      if (error_flag) {
        res.status(403).send({message: "unauthoraized access"})
      } else {
        const user_id = userCookie.decoded.id
        const file_id_as_num = Number(file_id)
        const is_owner = await pcap_files_service.is_owner(file_id_as_num, user_id)
        if (is_owner.success !== true) {
          res.status(403).send({message: "unauthoraized access"})
        } else {
          try {
            const file = await pcap_files_service.get_file_by_fileid(file_id)
            const report = await reports_service.get_report_by_pcap_id(file_id)
            console.log("got:", file);
            console.log("got:", report);
            if (file.success === true && report.success === true) {
              // const fileName = file.file.path
              const fileName = report.report.path + "/out_L2.json"
              res.status(200).sendFile(fileName, options, function (err) {
                if (err) {
                  console.error('Error sending file:', err)
                  res.status(400).send({message: "requested file is invalid."})
                } else {
                  console.log('Sent: ', fileName + "|:|" + file_id)
                }
              })
            } else {
              res.status(400).send({message: "requested file is invalid."})
            }
          } catch (error) {
            res.status(500).send({message: error})
          }
        }
      }
    }
  } catch (error) {
    if (error?.decoded === undefined) {
    res.status(401).json({ message: "no cookie provided" })
    } else {
      res.status(500).send()
    }
  }
})

// filesRoute.get('/all', async (req, res) => {
//   const results = await pcap_files_service.get_all()
//   res.json(results.results)
// })

filesRoute.get('/ddos/:id', async (req, res) => {
  const options = {
    root: path.join('')
  }
  try {
    const file_id = req.params.id
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    if (file_id === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    }
    else if (userCookie === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    } else {
      let error_flag = false
      const decoded = jwt.verify(req.cookies.jwt, SEC_KEY, (err) => {
        if (err) {
          error_flag = true
        }
      })
      if (error_flag) {
        res.status(403).send({message: "unauthoraized access"})
      } else {
        const user_id = userCookie.decoded.id
        const file_id_as_num = Number(file_id)
        const is_owner = await pcap_files_service.is_owner(file_id_as_num, user_id)
        if (is_owner.success !== true) {
          res.status(403).send({message: "unauthoraized access"})
        } else {
          try {
            const file = await pcap_files_service.get_file_by_fileid(file_id)
            const report = await reports_service.get_report_by_pcap_id(file_id)
            console.log("got:", file);
            console.log("got:", report);
            if (file.success === true && report.success === true) {
              // const fileName = file.file.path
              if (report.report.ddos_flag === 1) {
                const fileName = report.report.path + "/out_ddos.json"
                res.status(200).sendFile(fileName, options, function (err) {
                  if (err) {
                    console.error('Error sending file:', err)
                    res.status(400).send({ message: "requested file is invalid." })
                  } else {
                    console.log('Sent: ', fileName + "|:|" + file_id)
                  }
                })
              } else {
                res.status(404).json({
                  attacks: [],
                  message: "no ddos attack in this file."
                })
              }
            } else {
              res.status(400).send({message: "requested file is invalid."})
            }
          } catch (error) {
            res.status(500).send({message: error})
          }
        }
      }
    }
  } catch (error) {
    if (error?.decoded === undefined) {
    res.status(401).json({ message: "no cookie provided" })
    } else {
      res.status(500).send()
    }
  }
})

filesRoute.get('/mitm/:id', async (req, res) => {
  const options = {
    root: path.join('')
  }
  try {
    const file_id = req.params.id
    const userCookie = await cookie_service.decodeCookie(req.cookies)
    if (file_id === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    }
    else if (userCookie === undefined) {
      res.status(400).send({message: "one or more parameters missing"})
    } else {
      let error_flag = false
      const decoded = jwt.verify(req.cookies.jwt, SEC_KEY, (err) => {
        if (err) {
          error_flag = true
        }
      })
      if (error_flag) {
        res.status(403).send({message: "unauthoraized access"})
      } else {
        const user_id = userCookie.decoded.id
        const file_id_as_num = Number(file_id)
        const is_owner = await pcap_files_service.is_owner(file_id_as_num, user_id)
        if (is_owner.success !== true) {
          res.status(403).send({message: "unauthoraized access"})
        } else {
          try {
            const file = await pcap_files_service.get_file_by_fileid(file_id)
            const report = await reports_service.get_report_by_pcap_id(file_id)
            console.log("got:", file);
            console.log("got:", report);
            if (file.success === true && report.success === true) {
              // const fileName = file.file.path
              if (report.report.mitm_flag === 1) {
                const fileName = report.report.path + "/out_mitm.json"
                res.status(200).sendFile(fileName, options, function (err) {
                  if (err) {
                    console.error('Error sending file:', err)
                    res.status(400).send({ message: "requested file is invalid." })
                  } else {
                    console.log('Sent: ', fileName + "|:|" + file_id)
                  }
                })
              } else {
                res.status(404).json({
                  attacks: [],
                  message: "no mitm attack in this file."
                })
              }
            } else {
              res.status(400).send({message: "requested file is invalid."})
            }
          } catch (error) {
            res.status(500).send({message: error})
          }
        }
      }
    }
  } catch (error) {
    if (error?.decoded === undefined) {
    res.status(401).json({ message: "no cookie provided" })
    } else {
      res.status(500).send()
    }
  }
})

filesRoute.get('/my_files', async (req, res) => {
  const sleep = (milliseconds) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, milliseconds)
    })
  }
  // await sleep(3 * 1000)

  const jwtCookie = req.cookies.jwt
  try {
    const decodedToken = jwt.decode(jwtCookie, SEC_KEY)
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
            res.status(403).json({ valid: false, message: "forbidden" })
          }
        } else {
          res.json({ valid: false })
        }
      }
    })
  } catch (error) {
    const msg = jwtCookie === undefined ? "empty" : "internal server error" + jwtCookie
    console.error('error verifying JWT cookie ):', error)
    res.status(500).json({ valid: false, error: msg })
  }
})

filesRoute.post('/upload', upload.single('file'), async (req, res) => {
  const jwtCookie = req.cookies.jwt
  const dec = cookie_service.decodeCookie(req.cookies)
  const user_id = dec.decoded?.id
  const filename = req.file.filename
  const filepath = req.file.path
  if (jwtCookie === undefined) {
    res.status(401).json({ message: "no cookie provided" })
  } else {
    if (!req.file.filename.endsWith(".pcap")) {
      res.status(403).send({ success: false, message: "invalid file type" })
    } else {
      if (!req.file.path.startsWith('-')) {
        try {
          const valid = await analyze_service.valiate_file(req.file.path)
          res.status(200).send({ success: true })

        } catch (error) {
          try {
            const del = await pcap_files_service.delete_file_by_path(req.file.path)
          } catch (error) {
            console.log(error)
          }
          res.status(400).send({ success: true, message: "failed...", error: error })
        }
      } else {
        res.status(403).send({ success: false })
      }
    }
  }
})

filesRoute.delete('/delete/:id', async (req, res) => {
  const file_id = req.params.id
  const jwtCookie = req.cookies.jwt
  const dec = cookie_service.decodeCookie(req.cookies)
  const user_id = dec.decoded?.id
  if (jwtCookie === undefined) {
    res.status(401).send({success: false, message: "unauthed..."})
  } else {
    try {
      const ver = jwt.verify(req.cookies.jwt, SEC_KEY)
      const db_res_reports_delete = await reports_service.delete_report_by_file_id(Number(file_id))
      const db_res_files_delete = await pcap_files_service.delete_file_by_file_id(Number(file_id))
      console.log(ver);
      res.status(200).send("ok.")
    } catch (error) {
      console.log(error);
      res.status(500).send("error")
    }
  }
})

filesRoute.get('/download/:id', async (req, res) => {
  const file_id = req.params.id
  if (file_id === undefined) {
    res.status(400).send("invalid request...")
  } else {
    const file = await pcap_files_service.get_path_by_fileid(file_id)
    if (file.success === true) {
      const options = {
        root: path.join('')
      }
      res.sendFile(file.r.path, options, function (err) {
        if (err) {
          console.error('Error sending file:', err)
          res.status(400).send({message: "requested file is invalid."})
        }
      })
    } else {
      res.status(500).send("invalid file id.")
    }
  }
})

export default filesRoute