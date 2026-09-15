import { createContext, useContext, useState, useEffect } from "react"
import axios from "../lib/axios"

type User = {
  id: number
  name: string
  email: string
  role: "ADMIN" | "STAFF"
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  )
  const [loading, setLoading] = useState<boolean>(true)

  // Ambil data autentikasi dari LocalStorage saat aplikasi dimuat dengan memanggil endpoint /api/auth/me
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("token")

        const response = await axios.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUser(response.data.user)
      } catch (error) {
        // Jika token invalid atau expired, maka hapus sesi dan logout
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
