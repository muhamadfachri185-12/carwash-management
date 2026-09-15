// Navigate = untuk melakukan redirect ke halaman lain
// Outlet = tempat untuk menampilkan child route
import { Navigate, Outlet } from "react-router-dom"

// useAuth = mengambil data authentication dari AuthContext
import { useAuth } from "../context/AuthContext"

// Sidebar akan ditampilkan di semua halaman yang dilindungi
import Sidebar from "../pages/Sidebar"

// ProtectedRoute berfungsi sebagai "penjaga" halaman
// Hanya user yang sudah login yang boleh masuk
export default function ProtectedRoute() {
  // Ambil 2 data dari AuthContext:
  // isAuthenticated = apakah user sudah login?
  // loading = apakah proses pengecekan session masih berlangsung?
  const { isAuthenticated, loading } = useAuth()

  // ==========================================
  // 1. CEK APAKAH SESSION MASIH LOADING
  // ==========================================

  // Saat aplikasi pertama kali dibuka,
  // AuthContext perlu mengecek token dan /auth/me terlebih dahulu.
  //
  // Selama proses tersebut belum selesai,
  // jangan langsung redirect ke /login.
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          {/* 
            animate-spin = membuat elemen berputar
            rounded-full = membuat bentuk lingkaran
            border-t-transparent = bagian atas dibuat transparan
            sehingga terlihat seperti loading spinner
          */}
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3'></div>

          {/* Teks yang ditampilkan saat mengecek session */}
          <p className='text-sm text-gray-500'>Memuat sesi...</p>
        </div>
      </div>
    )
  }

  // ==========================================
  // 2. CEK APAKAH USER SUDAH LOGIN
  // ==========================================

  // Ternary operator:
  //
  // kondisi ? jikaTrue : jikaFalse
  //
  // Jadi:
  // kalau isAuthenticated === true
  //     → tampilkan halaman aplikasi
  //
  // kalau false
  //     → redirect ke /login
  return isAuthenticated ? (
    // ==========================================
    // 3. TAMPILKAN HALAMAN UNTUK USER YANG LOGIN
    // ==========================================

    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar selalu muncul di halaman protected */}
      <Sidebar />

      <main className='flex-1 p-6'>
        {/*
          Outlet adalah tempat React Router
          menampilkan child route.

          Contoh App.tsx:

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/vehicles" element={<VehiclePage />} />
          </Route>

          Kalau URL = /customers,
          maka CustomerPage akan muncul di sini.
        */}
        <Outlet />
      </main>
    </div>
  ) : (
    // ==========================================
    // 4. KALAU BELUM LOGIN → REDIRECT
    // ==========================================

    /*
      Navigate digunakan untuk pindah halaman.

      to="/login"
      → arahkan user ke halaman login

      replace
      → mengganti history browser,
        jadi user tidak gampang kembali ke
        halaman protected menggunakan tombol Back.
    */
    <Navigate to='/login' replace />
  )
}
