import os from 'node:os'
import fs from 'fs'

function get_local_ip() {
	const interfaces = os.networkInterfaces()
	for (const interface_name in interfaces) {
		const interfaceInfo = interfaces[interface_name]
		for (const iface of interfaceInfo) {
			if (iface.family === 'IPv4' && !iface.internal) {
				return iface.address
			}
		}
	}
	return 'localhost'
}

const local_ip = get_local_ip()
const port = 8080
const HOST = "localhost"
const PORT = 8081
const USER = 'root'
const UPWD = 'root'
const DB_DBS = 'project_schm'
const SQL_API_PATH = "/sql_api"

const api_tests = `
### IP ADDRESS: ${local_ip} 
### GET ALL
GET http://${local_ip}:${PORT}${SQL_API_PATH}/all_users

### GET ONE
GET http://${local_ip}:${PORT}${SQL_API_PATH}/user?un=ID

### PUT
PUT http://${local_ip}:${PORT}${SQL_API_PATH}/user/:id
Content-Type: application/json

{
    
}

### DELETE
DELETE http://${local_ip}:${PORT}${SQL_API_PATH}/user/:id
Content-Type: application/json

{
    
}

###POST CREATE USER
POST http://${local_ip}:${PORT}${SQL_API_PATH}/user
Content-Type: application/json

{
	"un": "",
	"password": ""
}

###POST CHECK USER
POST http://${local_ip}:${PORT}/login
Content-Type: application/json

{
	"un": "",
	"password": ""
}
`
const env_content = `############# ENV FILE #############
LOCAL_IP_ADDRESS=${local_ip}
PORT=${PORT}
DB_HOST=${HOST}
DB_USER=${USER}
DB_UPWD=${UPWD}
DB_PORT=${PORT}
DB_DBS=${DB_DBS}
SQL_API_PATH=${SQL_API_PATH}
JWT_SECRET=82304893209482n30c928n4098230n9c4n8230948cn02983m4c293m0482
############# END ENV FILE #############`

if (process.argv.length >= 3) {
	if (process.argv[2] === "http") {
		console.log("rewriting api tests")
		fs.writeFileSync("api_test.http", api_tests)
	}
}

console.log("rewriting .env")
fs.writeFileSync('.env', env_content)