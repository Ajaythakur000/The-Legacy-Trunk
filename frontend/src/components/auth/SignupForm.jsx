import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { USER_API_END_POINT } from "../../utils/constant"

function Signup() {

  // input states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // navigation hook
  const navigate = useNavigate()

  // form submit
  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      // backend register API call
      const res = await axios.post(
        `${USER_API_END_POINT}/register`,
        {
          name,
          email,
          password,
          role: "parent" // default role
        }
      )

      // token save
      localStorage.setItem("token", res.data.token)

      // dashboard redirect
     navigate("/home")

    } catch (error) {

      console.log(error.response.data)

    }
  }

  return (
    <div>

      <h1>Signup Page</h1>

      <form onSubmit={handleSubmit}>

        {/* name input */}
        <div>
          <label>Name</label>
          <br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <br />

        {/* email input */}
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

        {/* password input */}
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

        {/* submit button */}
        <button type="submit">Signup</button>

      </form>

    </div>
  )
}

export default Signup