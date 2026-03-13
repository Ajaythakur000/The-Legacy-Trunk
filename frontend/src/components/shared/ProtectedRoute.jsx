import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {

  const user = true

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute