import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  LogOut,
  Mail,
  UserRound,
  CarFront,
  ReceiptText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  if (!user) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center px-6 text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600'>
          <UserRound className='h-8 w-8' />
        </div>

        <h2 className='mt-4 text-lg font-semibold text-slate-900'>
          Akun belum tersedia
        </h2>

        <p className='mt-2 max-w-xs text-sm leading-6 text-slate-500'>
          Silakan login kembali untuk melihat informasi akun kamu.
        </p>

        <Button
          className='mt-5 rounded-xl bg-[#4F8FEF] hover:bg-blue-600'
          onClick={() => navigate("/login")}
        >
          Ke halaman login
        </Button>
      </div>
    )
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "U"

  return (
    <div className='min-h-screen space-y-6 bg-[#F3F7FF] px-4 py-6'>
      {/* Judul halaman */}
      <section>
        <p className='text-sm font-medium text-[#4F8FEF]'>AKUN KAMU</p>

        <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-900'>
          Profil Saya
        </h1>

        <p className='mt-1 text-sm leading-6 text-slate-500'>
          Kelola informasi dan aktivitas akun WashFlow kamu.
        </p>
      </section>

      {/* Kartu informasi akun */}
      <section className='rounded-3xl border border-blue-50 bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#3978D4] ring-4 ring-blue-50'>
            {initial}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='break-words text-lg font-bold text-slate-900'>
                {user.name}
              </h2>

              <ShieldCheck className='h-4 w-4 shrink-0 text-[#4F8FEF]' />
            </div>

            <span className='mt-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'>
              Customer
            </span>
          </div>
        </div>

        <div className='my-5 border-t border-slate-100' />

        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
            <Mail className='h-5 w-5' />
          </div>

          <div className='min-w-0 flex-1 py-0.5'>
            <p className='text-xs text-slate-500'>Alamat email</p>

            <p className='mt-1 break-all text-sm font-medium text-slate-800'>
              {user.email}
            </p>
          </div>
        </div>
      </section>

      {/* Menu akun */}
      <section className='space-y-3'>
        <div className='px-1'>
          <h2 className='text-sm font-bold text-slate-800'>Aktivitas Saya</h2>

          <p className='mt-1 text-xs text-slate-500'>
            Akses kendaraan dan riwayat pencucian kamu.
          </p>
        </div>

        <Link
          to='/vehicles'
          className='group flex items-center gap-3 rounded-2xl border border-blue-50 bg-white p-4 shadow-sm transition-colors hover:bg-blue-50/70'
        >
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#3978D4]'>
            <CarFront className='h-6 w-6' />
          </div>

          <div className='min-w-0 flex-1'>
            <h3 className='text-sm font-semibold text-slate-900'>
              Kendaraan Saya
            </h3>

            <p className='mt-1 text-xs leading-5 text-slate-500'>
              Lihat dan kelola kendaraan terdaftar.
            </p>
          </div>

          <ChevronRight className='h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5' />
        </Link>

        <Link
          to='/orders'
          className='group flex items-center gap-3 rounded-2xl border border-blue-50 bg-white p-4 shadow-sm transition-colors hover:bg-blue-50/70'
        >
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#3978D4]'>
            <ReceiptText className='h-6 w-6' />
          </div>

          <div className='min-w-0 flex-1'>
            <h3 className='text-sm font-semibold text-slate-900'>
              Riwayat Pesanan
            </h3>

            <p className='mt-1 text-xs leading-5 text-slate-500'>
              Lihat status dan riwayat order WashFlow.
            </p>
          </div>

          <ChevronRight className='h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </section>

      {/* Pengaturan akun dan logout */}
      <section className='rounded-2xl border border-blue-50 bg-white p-5 shadow-sm'>
        <h2 className='text-sm font-bold text-slate-900'>Pengaturan Akun</h2>

        <p className='mt-1 text-sm leading-6 text-slate-500'>
          Keluar dari akun jika kamu sudah selesai menggunakan WashFlow.
        </p>

        <Button
          variant='outline'
          className='mt-4 h-11 w-full rounded-xl border-red-200 bg-white font-semibold text-red-600 hover:bg-red-50 hover:text-red-700'
          onClick={() => setShowLogoutConfirmation(true)}
        >
          <LogOut className='mr-2 h-4 w-4' />
          Logout
        </Button>
      </section>

      {/* Dialog konfirmasi logout */}
      {showLogoutConfirmation && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-5 backdrop-blur-sm'
          onClick={() => setShowLogoutConfirmation(false)}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='logout-title'
            className='w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600'>
              <LogOut className='h-7 w-7' />
            </div>

            <h2
              id='logout-title'
              className='mt-4 text-center text-lg font-bold text-slate-900'
            >
              Keluar dari akun?
            </h2>

            <p className='mt-2 text-center text-sm leading-6 text-slate-500'>
              Kamu perlu login kembali untuk mengakses akun dan pesananmu.
            </p>

            <div className='mt-6 flex flex-col gap-3'>
              <Button
                className='h-11 w-full rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700'
                onClick={handleLogout}
              >
                Ya, logout
              </Button>

              <Button
                variant='outline'
                className='h-11 w-full rounded-xl border-slate-200'
                onClick={() => setShowLogoutConfirmation(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Informasi aplikasi */}
      <p className='pb-2 text-center text-xs text-slate-400'>
        WashFlow Customer Web
      </p>
    </div>
  )
}

export default ProfilePage
