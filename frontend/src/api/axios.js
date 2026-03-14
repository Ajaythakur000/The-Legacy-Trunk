import axios from "axios"

// axios ka custom instance create kar rahe
const instance = axios.create({
  baseURL: "http://localhost:8000/api"
})

// interceptor request bhejne se pehle run hota hai
instance.interceptors.request.use((config) => {

  // localStorage se JWT token read
  const token = localStorage.getItem("token")

  // agar token hai to header me attach karo
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default instance