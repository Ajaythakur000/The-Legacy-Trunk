import { useEffect, useState } from "react"
import axios from "../../api/axios"
import { USER_API_END_POINT } from "../../utils/constant"
import Navbar from "../shared/Navbar"
import { useNavigate } from "react-router-dom"
import { STORY_API_END_POINT } from "../../utils/constant"

function Dashboard() {
   const navigate = useNavigate()
  // user data store
  const [user, setUser] = useState(null)

  // stories store
  const [stories, setStories] = useState([])

  useEffect(() => {

    // profile fetch
    const fetchProfile = async () => {

      try {

        const res = await axios.get(`${USER_API_END_POINT}/profile`)

        setUser(res.data)

      } catch (error) {

        console.log(error.response.data)

      }

    }

    // stories fetch
    const fetchStories = async () => {

      try {

        const res = await axios.get(STORY_API_END_POINT)

        setStories(res.data)

      } catch (error) {

        console.log(error.response.data)

      }

    }

    // functions call
    fetchProfile()
    fetchStories()

  }, [])

  // story delete function
// story delete function
const deleteStory = async (id) => {

  try {

    // backend delete API
    await axios.delete(`${STORY_API_END_POINT}/${id}`)

    // UI se story remove
    setStories(stories.filter((story) => story._id !== id))

  } catch (error) {

    console.log(error.response.data)

  }

}

  return (
    <div>

      {/* navbar */}
      <Navbar />

      <h1>Dashboard</h1>

      {/* user info */}
      {user && (
        <div>

          <h2>Welcome {user.name}</h2>

          <p>Email: {user.email}</p>

          <p>Role: {user.role}</p>

        </div>
      )}

      <h2>Stories</h2>

      {/* stories list */}
      {stories.map((story) => (

        <div key={story._id}>

          <h3>{story.title}</h3>

          <p>{story.content}</p>

          <p>Tags: {story.tags}</p>

           {/* delete button */}
    <button onClick={() => deleteStory(story._id)}>
      Delete
    </button>
    <button onClick={() => navigate(`/story/edit/${story._id}`)}>
      Edit
    </button>

        </div>

      ))}

    </div>
  )
}

export default Dashboard