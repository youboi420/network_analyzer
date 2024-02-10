import { exec } from 'node:child_process'

const cFilePath = './c_files/test.c'
const executablePath = './c_files/test'
const default_filename = './bin/build/test'//'firefox'
const validFilename = (filename) => {
  // if (filename === undefined || filename === ''){ 
  //  return false
  // }
  // let valid = /![]/.test(filename)
  // if (valid) valid = /![]/.test(filename)
  // else return false
  // return valid
  
  return true
}

const analyze = (filename) => {
  console.log(filename);
  return new Promise((resolve, reject) => {
    const filename_const = filename === undefined ? '' : filename
    if (!validFilename(filename_const)) {
      reject({message: "invalid filename"})
      return
    }
    if (filename === 'default') {
      console.log("----------------------------------");
      exec(default_filename, (error, stdout, stderr) => {
        if (error) {
          console.error('Error:', error);
          reject({error, stdout})
          return;
        }
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
        resolve({message: "runned default", output: stdout})
      })
      return
    }
    console.log("this?");
    exec(filename_const, (error, stdout, stderr) => {
      if (error) {
        console.error('Error:', error);
        reject(error)
        return;
      }
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);
      resolve(stdout)
      return
    });
  })
}

export { analyze }