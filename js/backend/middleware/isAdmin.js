import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { get_user_by_id } from '../services/sql_services/users_service.js'
import cookieParser from 'cookie-parser'

dotenv.config()

/**
 * checks if the cookie is valid and if so if the user in the cookie is and admin 
 * @param {JwtCookie} cookie 
 * @returns valid: ( true if user is an admin false if not ) code: ( 200, 401, 401, 404, 500 ) 
 */
const isAdminMiddleware = async (cookie) => {
  const jwtCookie = cookie
  try {
    if (!jwtCookie) {
      return { valid: false, error: 'Unauthorized: Missing cookie', code: 401 }
    }
    const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET)
    const userId = decodedToken.id
    const user = await get_user_by_id(userId)
    console.log(user);
    if (user.valid === false) {
      return { valid: false, code: 404, error: 'User not found' }
    }
    if (user.user.isadmin === 1) {
      return { valid: true, code: 200 }
    } else {
      return { valid: false, code: 403, error: 'Forbidden: Not authorized' }
    }
  } catch (error) {
    console.error('Error verifying JWT cookie or checking admin status:', error)
    return { valid: false, code: 500, error: 'Internal server error' }
  }
}

export default isAdminMiddleware