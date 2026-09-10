import { createContext, useContext, useState } from "react"
import { api } from "../lib/axios"

type User = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "STAFF"
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  )

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    })

    const { token, user } = response.data
    localStorage.setItem("token", token)
    setToken(token)
    setUser(user)

    api.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  const logout = () => {
    localStorage.removeItem("token")

    setToken(null)
    setUser(null)

    delete api.defaults.headers.common.Authorization
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
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
