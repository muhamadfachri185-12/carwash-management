// Navigate = untuk melakukan redirect ke halaman lain
// Outlet = tempat untuk menampilkan child route
import { Navigate, Outlet } from "react-router-dom"

// useAuth = mengambil data user dari AuthContext
import { useAuth } from "../context/AuthContext"

// AdminRoute berfungsi sebagai "satpam khusus ADMIN"
//
// Bedanya dengan ProtectedRoute:
// - ProtectedRoute → mengecek apakah user sudah login
// - AdminRoute → mengecek apakah user punya role ADMIN
export default function AdminRoute() {
  // Ambil data user dari AuthContext
  //
  // user bisa berupa:
  // - object user → kalau sudah login
  // - null → kalau belum login
  const { user } = useAuth()

  // ==========================================
  // 1. CEK USER SUDAH LOGIN ATAU BELUM
  // ==========================================

  // Kalau user tidak ada (null),
  // berarti user belum login.
  if (!user) {
    // Redirect user ke halaman login
    //
    // replace = mengganti history browser,
    // supaya halaman sebelumnya tidak disimpan
    // sebagai halaman yang bisa kembali dengan tombol Back.
    return <Navigate to='/login' replace />
  }

  // ==========================================
  // 2. CEK ROLE USER
  // ==========================================

  // Kalau user sudah login,
  // sekarang kita cek role-nya.
  //
  // User hanya boleh lanjut kalau:
  //
  // user.role === "ADMIN"
  //
  // Kalau role-nya bukan ADMIN,
  // berarti user tidak punya izin.
  if (user.role !== "ADMIN") {
    // Redirect STAFF ke halaman orders
    //
    // Jadi STAFF tidak bisa mengakses
    // halaman khusus ADMIN.
    return <Navigate to='/orders' replace />
  }

  // ==========================================
  // 3. USER ADALAH ADMIN
  // ==========================================

  // Kalau sampai sini berarti:
  //
  // 1. user sudah login
  // 2. user.role === "ADMIN"
  //
  // Maka user boleh mengakses child route.
  //
  // Outlet akan menampilkan halaman yang
  // berada di dalam <AdminRoute>.
  return <Outlet />
}
