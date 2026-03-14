import { useState } from "react"
import axios from "../../api/axios"
import Navbar from "../shared/Navbar"
import { STORY_API_END_POINT } from "../../utils/constant"



function CreateStory() {

  // story inputs
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")

  // form submit
  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      // API call to create story
      const res = await axios.post(
        STORY_API_END_POINT,
        {
          title,
          content,
         tags: Array.isArray(tags) ? tags.join(",") : tags
        }
      )

      console.log(res.data)

      alert("Story created successfully")

      // form reset
      setTitle("")
      setContent("")
      setTags("")

    } catch (error) {

      console.log(error.response.data)

    }

  }

  return (
    <div>

      {/* Navbar */}
      <Navbar />

      <h1>Create Story</h1>

      <form onSubmit={handleSubmit}>

        {/* Title */}
        <div>
          <label>Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <br />

        {/* Content */}
        <div>
          <label>Content</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <br />

        {/* Tags */}
        <div>
          <label>Tags</label>
          <br />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Story</button>

      </form>

    </div>
  )
}

export default CreateStory