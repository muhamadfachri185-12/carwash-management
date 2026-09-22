import React, { createContext, useContext, useState, useEffect } from "react"

import api from "../lib/api"
import { storage } from "../lib/storage"

// Struktur data user yang digunakan di aplikasi
interface User {
  id: number
  name: string
  email: string
  role: "ADMIN" | "STAFF"
}

// Data dan fungsi yang disediakan oleh AuthContext
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

// Membuat Context untuk menyimpan data authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider menyediakan data auth ke component di dalamnya
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Menyimpan data user yang sedang login
  const [user, setUser] = useState<User | null>(null)

  // Menyimpan token login
  const [token, setToken] = useState<string | null>(null)

  // Menandakan proses pengecekan login sedang berjalan
  const [loading, setLoading] = useState(true)

  // Dijalankan sekali ketika AuthProvider pertama kali dibuka
  useEffect(() => {
    loadStoreAuth()
  }, [])

  // Mengecek apakah token dan user masih tersimpan
  const loadStoreAuth = async () => {
    try {
      // Ambil token dan user dari AsyncStorage
      const storedToken = await storage.getToken()
      const storedUser = await storage.getUser()

      // Kalau data ditemukan, masukkan ke state
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
    } catch (error) {
      console.error("Error loading auth:", error)
    } finally {
      // Selesai mengecek authentication
      setLoading(false)
    }
  }

  // Digunakan ketika user melakukan login
  const login = async (email: string, password: string) => {
    try {
      // Kirim email dan password ke backend
      const response = await api.post("/auth/login", {
        email,
        password,
        role: "STAFF",
      })

      // Ambil token dan data user dari response
      const { token, user } = response.data

      // Simpan token dan user ke AsyncStorage
      await storage.setToken(token)
      await storage.setUser(user)

      // Simpan token dan user ke state
      setToken(token)
      setUser(user)
    } catch (error: any) {
      // Kirim error ke component yang memanggil login
      console.log("AUTH ERROR:", error)
      console.log("AUTH ERROR MESSAGE:", error.message)
      console.log("AUTH ERROR RESPONSE:", error.response?.data)

      throw error
    }
  }

  // Digunakan ketika user melakukan logout
  const logout = async () => {
    try {
      // Hapus token dan user dari storage
      await storage.clearAll()

      // Hapus token dan user dari state
      setToken(null)
      setUser(null)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    // Menyediakan data auth ke semua component di dalam Provider
    <AuthContext.Provider
      value={{
        // Data user yang sedang login
        user,

        // Token login
        token,

        // Fungsi login
        login,

        // Fungsi logout
        logout,

        // Status loading
        loading,

        // true jika user dan token tersedia
        isAuthenticated: !!token && !!user,
      }}
    >
      {/* Component yang dibungkus oleh AuthProvider */}
      {children}
    </AuthContext.Provider>
  )
}

// Hook khusus untuk mengambil data dari AuthContext
export function useAuth() {
  // Mengambil value dari AuthContext
  const context = useContext(AuthContext)

  // Memastikan useAuth hanya digunakan di dalam AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  // Mengembalikan data auth agar bisa digunakan component
  return context
}
