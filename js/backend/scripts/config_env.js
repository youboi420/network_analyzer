import os from 'node:os'
import fs from 'fs'

const get_local_ip = () => {
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
const HOST = "localhost"
const PORT = 8081
const USER = 'root'
const UPWD = 'root'
const DB_DBS = 'project_schm'

const env_content = `############# ENV FILE #############
LOCAL_IP_ADDRESS=${local_ip}
DB_HOST=${HOST}
DB_USER=${USER}
DB_UPWD=${UPWD}
DB_PORT=${PORT}
DB_DBS=${DB_DBS}
############# END ENV FILE #############`

fs.writeFileSync('.env', env_content)
console.log(`changed env to \n${env_content}`)