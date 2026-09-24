import axios from "axios"
import { storage } from "./storage"

// Membuat koneksi ke API backend
const API_URL = "http://10.25.68.225:3000/api"

// Membuat Axios dengan konfigurasi dasar
const api = axios.create({
  // URL utama backend
  baseURL: API_URL,

  // Request akan timeout setelah 10 detik
  timeout: 10000,

  // Data yang dikirim menggunakan format JSON
  headers: {
    "Content-Type": "application/json",
  },
})

// REQUEST INTERCEPTOR
// Digunakan untuk menambahkan token sebelum request dikirim
api.interceptors.request.use(
  async (config) => {
    // Mengambil token login dari AsyncStorage
    const token = await storage.getToken()

    // Kalau token ada, kirim token ke backend
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Melanjutkan request ke backend
    return config
  },

  // Menangani error saat request dibuat
  (error) => {
    return Promise.reject(error)
  },
)

// RESPONSE INTERCEPTOR
// Digunakan untuk menangani response dari backend
api.interceptors.response.use(
  // Kalau berhasil, kembalikan response
  (response) => response,

  // Kalau terjadi error
  async (error) => {
    // 401 berarti token tidak valid atau sudah expired
    if (error.response?.status === 401) {
      // Hapus token dan data user
      await storage.clearAll()
    }

    // Teruskan error ke kode yang memanggil API
    return Promise.reject(error)
  },
)

// Export agar Axios ini bisa digunakan di file lain
export default api
