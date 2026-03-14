import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {

  // localStorage se token read kar rahe hain
  const token = localStorage.getItem("token")

  // agar token nahi mila to user login nahi hai
  if (!token) {
    // login page par redirect kar denge
    return <Navigate to="/login" />
  }

  // agar token hai to page access allow
  return children
}

export default ProtectedRoute