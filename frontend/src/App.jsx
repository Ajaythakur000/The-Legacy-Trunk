import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Home from "./components/Home"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import Dashboard from "./components/dashboard/Dashboard"
import CreateStory from "./components/story/CreateStory"
import Navbar from "./components/shared/Navbar"
import ProtectedRoute from "./components/shared/ProtectedRoute"
import Profile from "./components/profile/Profile"
import EditStory from "./components/story/EditStory"

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
    <>
    <Navbar />
    <Home />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <Navbar />
        <Login />
      </>
    ),
  },
  {
    path: "/signup",
    element: (
      <>
        <Navbar />
        <Signup />
      </>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
       
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/story/create",
    element: (
      <ProtectedRoute>
        
        <CreateStory />
      </ProtectedRoute>
    ),
  },
  {
  path: "/profile",
  element: <ProtectedRoute><Profile /></ProtectedRoute>
},
  {
  path: "/story/edit/:id",
  element: <EditStory />
},
])

function App() {
  return <RouterProvider router={appRouter} />
}

export default App