import jwt from 'jsonwebtoken'

const SEC_KEY = process.env.JWT_SECRET

const decodeCookie = (allCookiesObj) => {
  const jwtObj = allCookiesObj.jwt
  if (jwtObj === undefined) {
    return { message: "undefiend cookie", decoded: undefined }
  } else {
    const decoded = jwt.decode(jwtObj, SEC_KEY)
    return { message: "decoded succesfully", decoded: decoded }
  }
}

export { decodeCookie }