import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"

import { registerSchema } from "../schemas/registerSchema"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import api from "@/lib/api"

function RegisterForm() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ======================================================
  // FORM
  // ======================================================
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: any) {
    // Aktifkan loading
    setServerError("")

    // Aktifkan loading
    setLoading(true)

    try {
      // Kirim data ke backend.
      //
      // confirmPassword tidak perlu dikirim
      // karena hanya digunakan untuk validasi frontend.
      await api.post("/customer/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      })

      // Kalau register berhasil,
      // arahkan user ke Login.
      navigate("/login")
    } catch (error: any) {
      // Ambil pesan error dari backend
      if (error.response?.data?.message) {
        setServerError(error.response.data.message)
      } else {
        setServerError("Terjadi kesalahan. Silakan coba lagi.")
      }
    } finally {
      // Matikan loading
      setLoading(false)
    }
  }

  return (
    <Card className='gap-0 rounded-3xl border border-blue-50 bg-white py-0 shadow-xl shadow-blue-100/50'>
      <CardHeader className='px-6 pb-2 pt-7'>
        <CardTitle className='text-xl font-bold text-slate-900'>
          Informasi Akun
        </CardTitle>

        <p className='text-sm leading-6 text-slate-500'>
          Lengkapi data berikut untuk membuat akunmu.
        </p>
      </CardHeader>

      <CardContent className='px-6 pb-7 pt-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          {/* Error dari backend */}
          {serverError && (
            <div
              role='alert'
              className='rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-600'
            >
              {serverError}
            </div>
          )}

          {/* Nama */}
          <div className='space-y-2'>
            <Label
              htmlFor='name'
              className='text-sm font-semibold text-slate-700'
            >
              Nama Lengkap
            </Label>

            <Input
              id='name'
              type='text'
              placeholder='Masukkan nama lengkap'
              autoComplete='name'
              className='h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100'
              {...register("name")}
            />

            {errors.name && (
              <p className='text-sm text-red-500'>
                {errors.name.message as string}
              </p>
            )}
          </div>

          {/* Email */}
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className='text-sm font-semibold text-slate-700'
            >
              Alamat Email
            </Label>

            <Input
              id='email'
              type='email'
              placeholder='nama@email.com'
              autoComplete='email'
              className='h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100'
              {...register("email")}
            />

            {errors.email && (
              <p className='text-sm text-red-500'>
                {errors.email.message as string}
              </p>
            )}
          </div>

          {/* Kata Sandi */}
          <div className='space-y-2'>
            <Label
              htmlFor='password'
              className='text-sm font-semibold text-slate-700'
            >
              Kata Sandi
            </Label>

            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? "text" : "password"}
                placeholder='Minimal 6 karakter'
                autoComplete='new-password'
                className='h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-24 text-base placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100'
                {...register("password")}
              />

              <button
                type='button'
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            {errors.password && (
              <p className='text-sm text-red-500'>
                {errors.password.message as string}
              </p>
            )}
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div className='space-y-2'>
            <Label
              htmlFor='confirmPassword'
              className='text-sm font-semibold text-slate-700'
            >
              Konfirmasi Kata Sandi
            </Label>

            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                placeholder='Ulangi kata sandi'
                autoComplete='new-password'
                className='h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-24 text-base placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100'
                {...register("confirmPassword")}
              />

              <button
                type='button'
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi kata sandi"
                    : "Tampilkan konfirmasi kata sandi"
                }
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'
              >
                {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className='text-sm text-red-500'>
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>

          {/* Tombol Daftar */}
          <Button
            type='submit'
            disabled={loading}
            className='h-12 w-full rounded-xl bg-[#4F8FEF] text-base font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-[#377DE0] active:scale-[0.99] disabled:opacity-60'
          >
            {loading ? "Sedang mendaftarkan..." : "Daftar Sekarang"}
          </Button>

          {/* Link Login */}
          <div className='border-t border-slate-100 pt-5 text-center'>
            <p className='text-sm text-slate-500'>
              Sudah punya akun?{" "}
              <Link
                to='/login'
                className='font-semibold text-blue-600 hover:text-blue-800 hover:underline'
              >
                Masuk sekarang
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
