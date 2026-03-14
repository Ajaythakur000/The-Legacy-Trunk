import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { USER_API_END_POINT } from "../../utils/constant"

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()

  try {

    const res = await axios.post(
      `${USER_API_END_POINT}/login`,
      { email, password }
      
    )

    console.log(res.data)
    localStorage.setItem("token", res.data.token)

    navigate("/dashboard")

  } catch (error) {

    console.log(error.response.data)

  }
}

  return (
    <div>

      <h1>Login Page</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Login</button>

      </form>

    </div>
  )
}

export default Login