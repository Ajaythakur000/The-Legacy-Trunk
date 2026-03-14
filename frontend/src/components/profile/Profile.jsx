import { useEffect, useState } from "react"
import axios from "../../api/axios"
import { USER_API_END_POINT } from "../../utils/constant"

function Profile() {

  // user data store karne ke liye state
  const [user, setUser] = useState(null)

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        // token read kar rahe
        const token = localStorage.getItem("token")

        // profile API call
        const res = await axios.get(`${USER_API_END_POINT}/profile`)

        // user data save
        setUser(res.data)

      } catch (error) {

        console.log(error.response.data)

      }

    }

    fetchProfile()

  }, [])

  return (
    <div>

      <h1>Profile Page</h1>

      {/* agar user load ho gaya */}

      {user && (
        <div>

          <p>Name: {user.name}</p>

          <p>Email: {user.email}</p>

          <p>Role: {user.role}</p>

        </div>
      )}

    </div>
  )
}

export default Profile