import axios from "axios"

const api = axios.create({
  baseURL: "https://1f76-114-10-147-111.ngrok-free.app/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@carwash-token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
