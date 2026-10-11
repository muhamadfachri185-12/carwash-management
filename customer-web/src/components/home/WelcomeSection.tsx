import { Link } from "react-router-dom"
import { CarFront, ChevronRight } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

function WelcomeSection() {
  const { user } = useAuth()

  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-sm text-slate-500'>Selamat datang di WashFlow</p>

          <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-900'>
            Halo, {user?.name || "Pelanggan"} 👋
          </h1>

          <p className='mt-1 text-sm leading-5 text-slate-500'>
            Siap bikin kendaraanmu bersih dan berkilau?
          </p>
        </div>

        <Link
          to='/profile'
          aria-label='Lihat profil'
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-[#4F8FEF] shadow-sm transition hover:bg-blue-50'
        >
          <CarFront className='h-5 w-5' />
        </Link>
      </div>

      <Link to='/orders' className='block'>
        <Button
          variant='outline'
          className='h-10 w-full justify-between rounded-xl border-blue-100 bg-white text-sm font-medium text-slate-700 hover:bg-blue-50'
        >
          <span>Lihat riwayat order</span>
          <ChevronRight className='h-4 w-4 text-slate-400' />
        </Button>
      </Link>
    </section>
  )
}

export default WelcomeSection
