import { Link, useNavigate } from "react-router-dom"

function Navbar() {

  // navigation use karne ke liye hook
  const navigate = useNavigate()

  // localStorage se token read kar rahe hain
  const token = localStorage.getItem("token")

  // logout function
  const handleLogout = () => {

    // token delete kar rahe hain
    localStorage.removeItem("token")

    // login page redirect
    navigate("/login")
  }

  return (
    <div>

      {/* normal navigation links */}

      <Link to="/">Home</Link> | 

      <Link to="/dashboard">Dashboard</Link> | 
      <Link to="/profile">Profile</Link> |

      <Link to="/story/create">Create Story</Link> | 

      {/* agar token nahi hai → login show */}
      {!token && <Link to="/login">Login</Link>}

      {/* agar token nahi hai → signup show */}
      {!token && <Link to="/signup">Signup</Link>}

      {/* agar token hai → logout show */}
      {token && <button onClick={handleLogout}>Logout</button>}

    </div>
  )
}

export default Navbar