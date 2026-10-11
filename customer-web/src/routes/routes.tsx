import { createBrowserRouter } from "react-router-dom"

import CustomerLayout from "@/components/layout/CustomerLayout"
import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ServicesPage from "@/pages/services/ServicesPage"
import ProfilePage from "@/pages/profile/ProfilePage"
import VehiclesPage from "@/pages/vehicles/VehiclePage"
import ScanPage from "@/pages/scan/ScanPage"
import OutletQrGeneratorPage from "@/pages/scan/OutletQrGeneratorPage"
import OrdersPage from "@/pages/orders/OrdersPage"
import CreateOrderPage from "@/pages/orders/CreateOrderPage"

import ProtectedRoute from "./ProtectedRoute"
import OrderDetailPage from "@/pages/orders/OrderDetailPage"

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className='px-4 py-6'>
      <h1 className='text-2xl font-bold'>{title}</h1>
    </div>
  )
}

const router = createBrowserRouter([
  // Semua halaman di dalam ProtectedRoute membutuhkan login.
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <CustomerLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "orders/new",
            element: <CreateOrderPage />,
          },
          {
            path: "orders/:id",
            element: <OrderDetailPage />,
          },
          {
            path: "vehicles",
            element: <VehiclesPage />,
          },
          {
            path: "services",
            element: <ServicesPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "scan",
            element: <ScanPage />,
          },
        ],
      },
    ],
  },

  // Public routes.
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/outlet-qr",
    element: <OutletQrGeneratorPage />,
  },
])

export default router
