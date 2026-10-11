import { Link, useLocation } from "react-router-dom"
import { Home, ClipboardList, User } from "lucide-react"

function CustomerBottomNav() {
  const location = useLocation()

  const navigation = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: ClipboardList,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 border-t bg-white'>
      <div className='mx-auto flex h-16 max-w-md items-center justify-around'>
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex min-w-16 flex-col items-center gap-1 text-xs font-medium transition ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className='h-5 w-5' />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default CustomerBottomNav
