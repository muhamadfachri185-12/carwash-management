import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import ProtectedRoute from "./routes/ProtectedRoute"
import AdminRoute from "./routes/AdminRoute"

import Sidebar from "./pages/Sidebar"

import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CustomerPage from "./pages/CustomerPage"
import VehiclePage from "./pages/VehiclePage"
import ServicePage from "./pages/ServicePage"
import OrderPage from "./pages/OrderPage"
import HistoryPage from "./pages/HistoryPage"
import OrderDetailPage from "./pages/OrderDetailPage"

import "./App.css"
import DashboardPage from "./pages/DashboardPage"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />

          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <>
                  <Sidebar />
                  <main className='ml-60 p-8'>
                    <Outlet />
                  </main>
                </>
              }
            >
              {/* Dashboard (Admin Only) */}
              <Route element={<AdminRoute />}>
                <Route path='/' element={<DashboardPage />} />
              </Route>

              {/* Customer */}
              <Route path='/customers' element={<CustomerPage />} />

              {/* Vehicle */}
              <Route path='/vehicles' element={<VehiclePage />} />

              {/* Service */}
              <Route path='/services' element={<ServicePage />} />

              {/* Order */}
              <Route path='/orders' element={<OrderPage />} />

              {/* Order Detail Page */}
              <Route path='/orders/:id' element={<OrderDetailPage />} />

              {/* History */}
              <Route path='/history' element={<HistoryPage />} />
            </Route>
          </Route>

          {/* =========================
              FALLBACK
          ========================= */}

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
