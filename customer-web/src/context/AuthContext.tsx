import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import api from "../lib/api"
import type { User } from "@/features/auth/types"

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("@carwash-token"),
  )

  // Loading digunakan ketika aplikasi
  // sedang mengecek token yang tersimpan.
  const [loading, setLoading] = useState(true)

  // ======================================================
  // CEK LOGIN SAAT APLIKASI DIBUKA / REFRESH
  // ======================================================
  useEffect(() => {
    const storedToken = localStorage.getItem("@carwash-token")

    // Kalau tidak ada token,
    // berarti user belum login.
    if (!storedToken) {
      setLoading(false)
      return
    }

    // Kalau ada token,
    // tanyakan ke backend siapa user tersebut.
    api
      .get("/customer/auth/me")
      .then((response) => {
        // Backend mengembalikan:
        //
        // {
        //   user: {...}
        // }
        setUser(response.data.user)
      })
      .catch(() => {
        // Kalau token tidak valid atau expired,
        // hapus data login.
        localStorage.removeItem("@carwash-token")
        localStorage.removeItem("@carwash-user")

        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // ======================================================
  // LOGIN
  // ======================================================
  const login = (newToken: string, newUser: User) => {
    // Simpan token ke localStorage
    localStorage.setItem("@carwash-token", newToken)

    // Simpan data user ke localStorage
    localStorage.setItem("@carwash-user", JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    // Hapus token
    localStorage.removeItem("@carwash-token")

    // Hapus user
    localStorage.removeItem("@carwash-user")

    // Reset state
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ======================================================
// USE AUTH
// ======================================================
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

export default AuthProvider
