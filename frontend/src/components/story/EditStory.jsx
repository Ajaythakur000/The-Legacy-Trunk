import { useState, useEffect } from "react"
import axios from "../../api/axios"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../shared/Navbar"

function EditStory() {

  // URL se story id nikal rahe
  const { id } = useParams()

  const navigate = useNavigate()

  // story inputs
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")

  // existing story fetch
  useEffect(() => {

    const fetchStory = async () => {

      try {

        const res = await axios.get(`${STORY_API_END_POINT}/${id}`)

        // form fields fill
        setTitle(res.data.title)
        setContent(res.data.content)
        setTags(res.data.tags)

      } catch (error) {

        console.log(error.response.data)

      }

    }

    fetchStory()

  }, [id])


  // update story
  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      await axios.put(
  `${STORY_API_END_POINT}/${id}`,
  {
    title,
    content,
    tags: Array.isArray(tags) ? tags.join(",") : tags
  }
)

      alert("Story updated")

      navigate("/dashboard")

    } catch (error) {

      console.log(error.response.data)

    }

  }

  return (
    <div>

      <Navbar />

      <h1>Edit Story</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Content</label>
          <br />
          <textarea
            value={content}
            onChange={(e)=>setContent(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Tags</label>
          <br />
          <input
            type="text"
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Update Story</button>

      </form>

    </div>
  )
}

export default EditStory