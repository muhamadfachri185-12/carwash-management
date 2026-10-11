import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"

import { loginSchema } from "../schemas/loginschema"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

function LoginForm() {
  const navigate = useNavigate()

  // Ambil fungsi login dari AuthContext
  const { login } = useAuth()

  // State untuk loading
  const [loading, setLoading] = useState(false)

  // State untuk error dari backend
  const [serverError, setServerError] = useState("")

  // State untuk show password
  const [showPassword, setShowPassword] = useState(false)

  // useForm digunakan untuk mengatur form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  // ======================================================
  // SUBMIT LOGIN
  // ======================================================

  // Fungsi ini akan dijalankan
  // ketika form berhasil melewati validation
  async function onSubmit(data: any) {
    // Hapus error sebelumnya
    setServerError("")

    // Loading state
    setLoading(true)

    try {
      // Kirim email dan password ke backend
      // Tidak perlu mengirim role.
      // Backend otomatis menangani CUSTOMER.
      const response = await api.post("/customer/auth/login", {
        email: data.email,
        password: data.password,
      })

      // Ambil token dan user dari response backend
      const { token, user } = response.data
      // Simpan login ke AuthContext
      login(token, user)

      // Setelah berhasil login
      // masuk ke halaman customer
      navigate("/")
    } catch (error: any) {
      // ==================================================
      // ERROR BACKEND
      // ==================================================
      if (error.response?.data?.message) {
        setServerError(error.response.data.message)
      } else {
        setServerError("Terjadi kesalahan. Silakan coba lagi")
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
          Masuk ke Akun
        </CardTitle>

        <p className='text-sm leading-6 text-slate-500'>
          Masukkan email dan kata sandi yang terdaftar.
        </p>
      </CardHeader>

      <CardContent className='px-6 pb-7 pt-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          {/* Pesan error backend */}
          {serverError && (
            <div
              role='alert'
              className='rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-600'
            >
              {serverError}
            </div>
          )}

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
              className='h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base transition-colors placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100'
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
            <div className='flex items-center justify-between gap-3'>
              <Label
                htmlFor='password'
                className='text-sm font-semibold text-slate-700'
              >
                Kata Sandi
              </Label>
            </div>

            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? "text" : "password"}
                placeholder='Masukkan kata sandi'
                autoComplete='current-password'
                className='h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-24 text-base transition-colors placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100'
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

          {/* Tombol Masuk */}
          <Button
            type='submit'
            disabled={loading}
            className='h-12 w-full rounded-xl bg-[#4F8FEF] text-base font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-[#377DE0] active:scale-[0.99] disabled:opacity-60'
          >
            {loading ? "Sedang masuk..." : "Masuk ke Akun"}
          </Button>

          {/* Link Register */}
          <div className='border-t border-slate-100 pt-5 text-center'>
            <p className='text-sm text-slate-500'>
              Belum punya akun?{" "}
              <Link
                to='/register'
                className='font-semibold text-blue-600 hover:text-blue-800 hover:underline'
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default LoginForm
