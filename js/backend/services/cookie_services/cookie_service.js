import jwt from 'jsonwebtoken'

const SEC_KEY = process.env.JWT_SECRET

/**
 * decode's the cookie
 * @param {AllCookies} allCookiesObj 
 * @returns the decoded cookie...
 */
const decodeCookie = async (allCookiesObj) => {
  return new Promise((resolve, reject) => {
    const jwtObj = allCookiesObj.jwt
    if (jwtObj === undefined) {
      reject({ message: "undefiend cookie", decoded: undefined })
    } else {
      const decoded = jwt.decode(jwtObj, SEC_KEY)
      resolve({ message: "decoded succesfully", decoded: decoded })
    }
  })
}

export { decodeCookie }