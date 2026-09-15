// Link      → pindah halaman tanpa reload browser
// useLocation → mengetahui URL/path halaman yang sedang aktif
import { Link, useLocation } from "react-router-dom"

// Custom hook untuk mengambil data user dan function logout
import { useAuth } from "@/context/AuthContext"

// Button dari shadcn/ui
import { Button } from "@/components/ui/button"

// Icon dari lucide-react
import {
  LayoutDashboard,
  Users,
  Car,
  Settings,
  FileText,
  Clock,
  LogOut,
} from "lucide-react"

// =========================================================
// NAVIGATION ICONS
// =========================================================

// Record<string, React.ReactNode> artinya:
//
// key   → string
// value → React component/node
//
// Contoh:
//
// navIcons["Dashboard"]
//        ↓
// <LayoutDashboard />
//
// Jadi nanti kita cukup menyimpan nama icon sebagai string
// di navItems, lalu mengambil icon sebenarnya dari object ini.
const navIcons: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className='h-4 w-4' />,
  Customers: <Users className='h-4 w-4' />,
  Vehicles: <Car className='h-4 w-4' />,
  Services: <Settings className='h-4 w-4' />,
  Orders: <FileText className='h-4 w-4' />,
  History: <Clock className='h-4 w-4' />,
}

export default function Sidebar() {
  // =========================================================
  // AUTH CONTEXT
  // =========================================================

  // useAuth() adalah custom hook dari AuthContext.
  //
  // Kita mengambil:
  // user   → data user yang sedang login
  // logout → function untuk logout
  //
  // Contoh user:
  // {
  //   id: 1,
  //   name: "Fachri",
  //   email: "...",
  //   role: "ADMIN"
  // }
  const { user, logout } = useAuth()

  // =========================================================
  // CURRENT LOCATION
  // =========================================================

  // useLocation() memberikan informasi tentang URL
  // halaman yang sedang dibuka.
  //
  // Misalnya sedang di:
  // http://localhost:5173/customers
  //
  // location.pathname
  //        ↓
  // "/customers"
  const location = useLocation()

  // Function untuk mengecek apakah menu sedang aktif.
  //
  // Kalau:
  // location.pathname === "/customers"
  //
  // maka return true.
  const isActive = (path: string) => location.pathname === path

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  // Array ini nantinya berisi menu sidebar.
  //
  // Awalnya kosong karena menu akan dibuat berdasarkan
  // role user.
  const navItems = []

  // =========================================================
  // ADMIN MENU
  // =========================================================

  // ?. disebut optional chaining.
  //
  // user?.role artinya:
  // "Kalau user ada, ambil role-nya."
  //
  // Kalau user masih null, tidak akan error.
  if (user?.role === "ADMIN") {
    navItems.push({
      label: "Dashboard",
      path: "/",
      icon: "Dashboard",
    })
  }

  // Menu ini bisa diakses semua role.
  //
  // ADMIN  → bisa
  // STAFF  → bisa
  navItems.push(
    {
      label: "Customers",
      path: "/customers",
      icon: "Customers",
    },
    {
      label: "Vehicles",
      path: "/vehicles",
      icon: "Vehicles",
    },
  )

  // Services hanya boleh muncul untuk ADMIN.
  if (user?.role === "ADMIN") {
    navItems.push({
      label: "Services",
      path: "/services",
      icon: "Services",
    })
  }

  // Orders dan History bisa diakses semua role.
  navItems.push(
    {
      label: "Orders",
      path: "/orders",
      icon: "Orders",
    },
    {
      label: "History",
      path: "/history",
      icon: "History",
    },
  )

  // =========================================================
  // RENDER SIDEBAR
  // =========================================================

  return (
    <aside className='fixed left-0 top-0 flex h-full w-64 flex-col justify-between border-r border-gray-200 bg-white p-4 shadow-sm'>
      <div>
        {/* =====================================================
            LOGO
        ====================================================== */}

        <div className='mb-6 flex items-center gap-2 p-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600'>
            <Car className='h-5 w-5 text-white' />
          </div>

          <h2 className='text-lg font-semibold text-gray-800'>WashFlow</h2>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className='space-y-1'>
          {/* 
            map() digunakan untuk mengubah setiap item di
            navItems menjadi elemen <Link>.

            Misalnya navItems:
            [
              {
                label: "Customers",
                path: "/customers",
                icon: "Customers"
              }
            ]

            Akan menghasilkan:
            <Link to="/customers">
              icon
              Customers
            </Link>
          */}
          {navItems.map((item) => (
            <Link
              // key wajib ketika melakukan map.
              // React menggunakannya untuk membedakan setiap item.
              key={item.path}
              // Link digunakan untuk navigasi antar halaman
              // tanpa reload browser.
              to={item.path}
              // Template literal menggunakan backtick (`).
              //
              // Kita bisa menggabungkan class CSS berdasarkan
              // kondisi tertentu.
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                // Kalau path menu sama dengan URL sekarang,
                // menu dianggap ACTIVE.
                isActive(item.path)
                  ? "border-l-4 border-blue-600 bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {/* 
                Ambil icon berdasarkan string.

                Misalnya:
                item.icon = "Customers"

                maka:
                navIcons["Customers"]

                menghasilkan:
                <Users />
              */}
              {navIcons[item.icon]}

              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* =====================================================
          USER PROFILE + LOGOUT
      ====================================================== */}

      <div className='border-t border-gray-200 pt-4'>
        {/* =====================================================
            USER INFO
        ====================================================== */}

        <div className='mb-3 flex items-center gap-3 px-2'>
          <div
            // Class warna avatar berbeda berdasarkan role.
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
              user?.role === "ADMIN"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {/*
              charAt(0)
              ↓
              mengambil karakter pertama.

              Contoh:
              "Fachri"
              ↓
              "F"

              toUpperCase()
              ↓
              "F"
            */}
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            {/* Tampilkan nama user yang sedang login */}
            <p className='text-sm font-medium text-gray-700'>{user?.name}</p>

            {/* Tampilkan role user */}
            <p className='text-xs text-gray-500'>{user?.role}</p>
          </div>
        </div>

        {/* =====================================================
            LOGOUT BUTTON
        ====================================================== */}

        <Button
          variant='ghost'
          size='sm'
          // Ketika tombol diklik:
          // jalankan function logout().
          onClick={() => logout()}
          className='w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-600'
        >
          <LogOut className='mr-2 h-4 w-4' />
          Logout
        </Button>
      </div>
    </aside>
  )
}
