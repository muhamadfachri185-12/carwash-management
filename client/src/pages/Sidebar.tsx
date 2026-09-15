import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Car,
  Settings,
  FileText,
  Clock,
  LogOut,
} from "lucide-react"

const navIcons: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className='h-4 w-4' />,
  Customers: <Users className='h-4 w-4' />,
  Vehicles: <Car className='h-4 w-4' />,
  Services: <Settings className='h-4 w-4' />,
  Orders: <FileText className='h-4 w-4' />,
  History: <Clock className='h-4 w-4' />,
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = []

  if (user?.role === "ADMIN") {
    navItems.push({ label: "Dashboard", path: "/", icon: "Dashboard" })
  }

  navItems.push(
    { label: "Customers", path: "/customers", icon: "Customers" },
    { label: "Vehicles", path: "/vehicles", icon: "Vehicles" },
  )

  if (user?.role === "ADMIN") {
    navItems.push({ label: "Services", path: "/services", icon: "Services" })
  }

  navItems.push(
    { label: "Orders", path: "/orders", icon: "Orders" },
    { label: "History", path: "/history", icon: "History" },
  )

  return (
    <aside className='fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm p-4 flex flex-col justify-between'>
      <div>
        <div className='flex items-center gap-2 mb-6 p-2'>
          <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <Car className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-lg font-semibold text-gray-800'>WashFlow</h2>
        </div>
        <nav className='space-y-1'>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {navIcons[item.icon]}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className='border-t border-gray-200 pt-4'>
        <div className='flex items-center gap-3 mb-3 px-2'>
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              user?.role === "ADMIN"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className='text-sm font-medium text-gray-700'>{user?.name}</p>
            <p className='text-xs text-gray-500'>{user?.role}</p>
          </div>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => logout()}
          className='w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50'
        >
          <LogOut className='h-4 w-4 mr-2' />
          Logout
        </Button>
      </div>
    </aside>
  )
}
