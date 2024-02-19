import React, { useEffect, useState } from 'react'
import { getUserData } from '../services/user_service'

const LandingPage = ({ isValidUser }) => {
  const [userObj, setUserObj] = useState({username: "Guest"})
  useEffect(() => {
    const getUsernameCall = async () => {
      try {
        const res = await getUserData()
        if (res.valid === true) {
          setUserObj(res.user)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }
    getUsernameCall()
  }, [])

  return (
    <div>
      <p>
        Welcome {userObj.username}
      </p>
    </div>
  )
}

export default LandingPage
