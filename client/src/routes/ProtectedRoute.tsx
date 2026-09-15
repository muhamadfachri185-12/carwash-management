import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../pages/Sidebar"

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className=' h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3'>
            <p className='text-sm text-gray-500'>Memuat sesi...</p>
          </div>
        </div>
      </div>
    )
  }

  return isAuthenticated ? (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <main className='flex-1 p-6'>
        <Outlet />
      </main>
    </div>
  ) : (
    <Navigate to='/login' replace />
  )
}
