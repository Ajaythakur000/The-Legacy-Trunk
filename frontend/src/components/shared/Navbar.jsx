import { Link } from "react-router-dom"

function Navbar() {
  return (
    <div>

      <Link to="/">Home</Link> | 

      <Link to="/login">Login</Link> | 

      <Link to="/signup">Signup</Link> | 

      <Link to="/dashboard">Dashboard</Link> | 

      <Link to="/story/create">Create Story</Link>

    </div>
  )
}

export default Navbar