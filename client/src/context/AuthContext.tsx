// =========================================================
// IMPORT
// =========================================================

// createContext → membuat tempat penyimpanan data global (Context)
// useContext   → mengambil data dari Context
// useState     → membuat state
// useEffect    → menjalankan logic saat component tertentu berubah
import { createContext, useContext, useState, useEffect } from "react"

// Axios instance untuk komunikasi dengan backend
import axios from "../lib/axios"

// =========================================================
// USER TYPE
// =========================================================

// Interface/type ini mendefinisikan bentuk data user.
//
// Jadi TypeScript tahu bahwa object User harus memiliki:
// id, name, email, dan role.
//
// Role hanya boleh "ADMIN" atau "STAFF".
type User = {
  id: number
  name: string
  email: string
  role: "ADMIN" | "STAFF"
}

// =========================================================
// AUTH CONTEXT TYPE
// =========================================================

// Type ini mendefinisikan semua data/function
// yang akan disediakan oleh AuthContext.
//
// Nanti component lain bisa mengambil data ini
// menggunakan useAuth().
type AuthContextType = {
  // User yang sedang login.
  //
  // User | null artinya:
  // bisa berupa object User
  // ATAU null kalau belum login.
  user: User | null

  // JWT token.
  //
  // string = ada token
  // null   = tidak ada token
  token: string | null

  // Function login menerima:
  // newToken → string
  // newUser  → User
  login: (token: string, user: User) => void

  // Function logout tidak menerima parameter
  // dan tidak mengembalikan value.
  logout: () => void

  // true  = user sudah login
  // false = belum login
  isAuthenticated: boolean

  // true  = proses pengecekan session masih berjalan
  // false = proses sudah selesai
  loading: boolean
}

// =========================================================
// CREATE CONTEXT
// =========================================================

// createContext() digunakan untuk membuat Context.
//
// Context ini menjadi tempat menyimpan informasi authentication
// yang bisa digunakan oleh banyak component.
//
// Kenapa undefined?
//
// Karena pada awalnya Context belum memiliki value.
//
// Nanti value sebenarnya diberikan melalui:
// <AuthContext.Provider value={...}>
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// =========================================================
// AUTH PROVIDER
// =========================================================

// AuthProvider adalah component yang "menyediakan"
// data authentication ke component-component di dalamnya.
//
// children = semua component yang dibungkus oleh AuthProvider.
//
// Contoh di App:
//
// <AuthProvider>
//   <App />
// </AuthProvider>
//
// Maka <App /> dan component di dalamnya bisa menggunakan
// useAuth().
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // =========================================================
  // USER STATE
  // =========================================================

  // Menyimpan user yang sedang login.
  //
  // Awalnya null karena kita belum tahu apakah user login
  // atau tidak.
  const [user, setUser] = useState<User | null>(null)

  // =========================================================
  // TOKEN STATE
  // =========================================================

  // Coba ambil token dari LocalStorage ketika component
  // pertama kali dibuat.
  //
  // localStorage.getItem("token"):
  //
  // kalau token ada:
  // → mengembalikan string token
  //
  // kalau token tidak ada:
  // → mengembalikan null
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  )

  // =========================================================
  // LOADING STATE
  // =========================================================

  // Digunakan untuk mengetahui apakah aplikasi masih
  // melakukan pengecekan token ke backend.
  //
  // Awalnya true karena ketika aplikasi pertama dibuka,
  // kita belum tahu token masih valid atau tidak.
  const [loading, setLoading] = useState<boolean>(true)

  // =========================================================
  // VERIFY TOKEN
  // =========================================================

  // useEffect digunakan untuk mengecek apakah token yang
  // tersimpan masih valid.
  //
  // Dependency [token] artinya effect akan dijalankan:
  //
  // 1. Saat pertama kali component muncul
  // 2. Saat nilai token berubah
  //
  // Contoh:
  //
  // login()
  //   ↓
  // setToken(newToken)
  //   ↓
  // token berubah
  //   ↓
  // useEffect jalan lagi
  useEffect(() => {
    // Function async dibuat di dalam useEffect
    // karena callback useEffect sendiri tidak dibuat async.
    const verifyToken = async () => {
      // =======================================================
      // CEK TOKEN
      // =======================================================

      // Kalau token tidak ada:
      //
      // tidak perlu request ke backend.
      if (!token) {
        // Matikan loading.
        setLoading(false)

        // Hentikan function.
        return
      }

      // =======================================================
      // REQUEST KE BACKEND
      // =======================================================

      try {
        // Ambil token terbaru dari LocalStorage.
        //
        // Token ini nanti dikirim ke backend.
        const token = localStorage.getItem("token")

        // GET /auth/me
        //
        // Karena baseURL Axios sudah:
        // http://localhost:3000/api
        //
        // maka request sebenarnya:
        //
        // http://localhost:3000/api/auth/me
        //
        // headers Authorization digunakan untuk mengirim
        // JWT token ke backend.
        const response = await axios.get("/auth/me", {
          headers: {
            // Format standar Bearer Token:
            //
            // Authorization: Bearer <JWT_TOKEN>
            Authorization: `Bearer ${token}`,
          },
        })

        // Kalau request berhasil, backend mengembalikan
        // data user.
        //
        // Kemudian user tersebut disimpan ke state.
        setUser(response.data.user)
      } catch (error) {
        // =====================================================
        // TOKEN INVALID / EXPIRED
        // =====================================================

        // Kalau request /auth/me gagal, kemungkinan:
        //
        // - token invalid
        // - token expired
        // - session tidak valid
        //
        // Maka kita logout.
        logout()
      } finally {
        // finally selalu dijalankan setelah try/catch selesai.
        //
        // Berhasil → loading false
        // Gagal    → loading false
        setLoading(false)
      }
    }

    // Jalankan function verifyToken().
    verifyToken()

    // token adalah dependency.
    //
    // Kalau token berubah, useEffect dijalankan lagi.
  }, [token])

  // =========================================================
  // LOGIN
  // =========================================================

  // Function ini dipanggil setelah login berhasil.
  //
  // Contoh dari LoginPage:
  //
  // login(response.data.token, response.data.user)
  const login = (newToken: string, newUser: User) => {
    // =======================================================
    // SIMPAN TOKEN KE LOCAL STORAGE
    // =======================================================

    // LocalStorage memungkinkan token tetap ada
    // walaupun browser direfresh.
    //
    // Tanpa localStorage:
    // refresh browser → state React hilang → user logout.
    localStorage.setItem("token", newToken)

    // =======================================================
    // UPDATE REACT STATE
    // =======================================================

    // Simpan token ke state.
    setToken(newToken)

    // Simpan data user ke state.
    setUser(newUser)
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    // Hapus token dari LocalStorage.
    localStorage.removeItem("token")

    // Hapus token dari React state.
    setToken(null)

    // Hapus data user dari React state.
    setUser(null)
  }

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    // Provider adalah bagian paling penting dari Context.
    //
    // Semua component yang berada di dalam Provider
    // bisa mengakses value yang kita berikan di sini.
    <AuthContext.Provider
      value={{
        // User yang sedang login
        user,

        // JWT token
        token,

        // Function login
        login,

        // Function logout
        logout,

        // ===================================================
        // IS AUTHENTICATED
        // ===================================================

        // !! digunakan untuk mengubah value menjadi boolean.
        //
        // Contoh:
        //
        // !!"abc" → true
        // !!null  → false
        //
        // Jadi:
        //
        // !!token && !!user
        //
        // artinya:
        //
        // token ada DAN user ada
        //
        // → user dianggap sudah login.
        isAuthenticated: !!token && !!user,

        // Status loading
        loading,
      }}
    >
      {/* children adalah component yang dibungkus
          oleh AuthProvider. */}
      {children}
    </AuthContext.Provider>
  )
}

// =========================================================
// CUSTOM HOOK: useAuth
// =========================================================

// Custom hook digunakan supaya component lain
// tidak perlu menulis useContext(AuthContext) berulang kali.
//
// Nanti cukup:
//
// const { user, logout } = useAuth()
export function useAuth() {
  // Ambil value dari AuthContext.
  const context = useContext(AuthContext)

  // =======================================================
  // SAFETY CHECK
  // =======================================================

  // Kalau useAuth() digunakan di luar AuthProvider,
  // context akan undefined.
  //
  // Daripada aplikasi error dengan pesan yang membingungkan,
  // kita buat error yang lebih jelas.
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  // Kalau context tersedia,
  // kembalikan semua value dari AuthContext.
  return context
}
