import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

function CustomerHeader() {
  const { user } = useAuth()
  return (
    <header className='sticky top-0 z-50 border-b bg-white/95 backdrop-blur'>
      <div className='mx-auto flex h-14 max-w-md items-center justify-between px-4'>
        <div>
          <h1 className='text-lg font-bold text-gray-900'>WashFlow</h1>

          <p className='text-xs text-muted-foreground'>Customer</p>
        </div>

        <Link to='/profile'>
          <Button variant='ghost' size='icon' aria-label='Profile'>
            <User className='h-5 w-5' />
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default CustomerHeader
