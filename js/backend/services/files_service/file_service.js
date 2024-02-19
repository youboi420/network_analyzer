import fs from 'fs'
import path from 'path'

const working_dir = process.cwd()
const users_dir = './bin/users'

const create_folder_for_new_user = (id) => {
  if (id !== undefined) {
    console.log("working in:", working_dir);
    const create_path = users_dir + "/" + id
    /* create the dir */
    fs.mkdir(create_path, err => {
      if (err) {
        return
      }
      console.log(err);
      fs.mkdir(create_path + '/reports', err => {
        if (err) {
          console.log(err);
          return
        }
        fs.mkdir(create_path + '/pcap', err => {
          if (err) {
            console.log(err);
            return
          }
        })
      })
    })
  } else {
    console.log("id is undefiend");
  }
}

export { create_folder_for_new_user }