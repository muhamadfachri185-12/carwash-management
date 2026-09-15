import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import axios from "../lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  // useState digunakan untuk menyimpan data yang bisa berubah
  // email akan menyimpan isi input email
  // setEmail digunakan untuk mengubah nilai email
  const [email, setEmail] = useState("")

  // Menyimpan password yang diketik user
  const [password, setPassword] = useState("")

  // Menyimpan pesan error jika proses login gagal
  const [error, setError] = useState("")

  // Menentukan apakah proses login sedang berjalan
  // false = tidak loading
  // true = sedang request ke backend
  const [loading, setLoading] = useState(false)

  // State untuk menyimpan role yang dipilih user
  // TypeScript membatasi nilainya hanya boleh STAFF atau ADMIN
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF")

  // Mengambil function login dari AuthContext
  // Function ini biasanya digunakan untuk menyimpan token dan user
  const { login } = useAuth()

  // useNavigate digunakan untuk berpindah halaman melalui kode
  const navigate = useNavigate()

  // Function ini dijalankan ketika form login di-submit
  const handleSubmit = async (e: React.FormEvent) => {
    // Mencegah browser melakukan reload halaman
    // Secara default submit form akan refresh halaman
    e.preventDefault()

    // Bersihkan error lama sebelum mencoba login lagi
    setError("")

    // Aktifkan loading
    setLoading(true)

    try {
      // axios.post digunakan untuk mengirim data login
      // "/auth/login" akan digabung dengan baseURL dari axios
      //
      // Misalnya baseURL:
      // http://localhost:3000/api
      //
      // Maka request akhirnya:
      // http://localhost:3000/api/auth/login
      const response = await axios.post("/auth/login", {
        email,
        password,
        role,
      })

      // Mengambil token dan user dari response backend
      //
      // Sama seperti:
      // const token = response.data.token
      // const user = response.data.user
      const { token, user } = response.data

      // Kirim token dan data user ke AuthContext
      // Biasanya di dalam login() token akan disimpan ke localStorage
      // dan user disimpan ke state authentication
      login(token, user)

      // Setelah login berhasil, cek role user
      if (user.role === "ADMIN") {
        // ADMIN diarahkan ke Dashboard
        navigate("/")
      } else {
        // STAFF diarahkan langsung ke halaman Order
        navigate("/orders")
      }
    } catch (err: any) {
      // Jika request axios gagal, masuk ke catch
      //
      // err.response?.data?.message
      // artinya:
      // ambil message dari response backend jika tersedia
      //
      // Tanda ?. disebut optional chaining.
      // Jadi kalau response tidak ada, aplikasi tidak langsung error.
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat login. Periksa kembali email dan password",
      )
    } finally {
      // finally selalu dijalankan
      // baik request berhasil maupun gagal
      //
      // Karena itu loading harus dimatikan di sini
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      <Card className='w-full max-w-md border-gray-200 shadow-sm'>
        {/* =========================
            HEADER
            =========================
            Bagian judul halaman login
        */}
        <CardHeader className='space-y-2 pb-6'>
          <CardTitle className='text-center text-2xl font-bold text-gray-900'>
            Login
          </CardTitle>

          <CardDescription className='text-center text-gray-500'>
            Masuk ke sistem WashFlow
          </CardDescription>
        </CardHeader>

        {/* =========================
            CONTENT
            =========================
        */}
        <CardContent>
          {/* 
            Conditional Rendering

            Kalau error memiliki isi, maka div ini ditampilkan.

            Kalau:
            error = ""

            maka:
            error && (...) 
            tidak menampilkan apa-apa.
          */}
          {error && (
            <div className='mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
              {error}
            </div>
          )}

          {/* 
            onSubmit menjalankan handleSubmit ketika form dikirim.

            Contohnya ketika user klik tombol Login.
          */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* =========================
                EMAIL
                =========================
            */}
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700'
              >
                Email
              </Label>

              <Input
                id='email'
                type='email'
                placeholder='admin@carwash.com'
                // value membuat input menjadi "controlled input"
                // Nilainya dikontrol oleh state React
                value={email}
                // Setiap user mengetik, event ini dijalankan
                // e.target.value = nilai terbaru dari input
                onChange={(e) => setEmail(e.target.value)}
                // Browser akan memastikan input tidak boleh kosong
                required
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            {/* =========================
                ROLE
                =========================
            */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>
                Login Sebagai
              </Label>

              <div className='grid grid-cols-2 gap-3'>
                {/* =========================
                    STAFF
                    =========================
                */}
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition ${
                    role === "STAFF"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    // value adalah nilai yang akan dikirim
                    // ketika radio ini dipilih
                    value='STAFF'
                    // checked menentukan radio mana yang aktif
                    //
                    // Kalau role === "STAFF"
                    // maka radio STAFF akan tercentang
                    checked={role === "STAFF"}
                    // Ketika user memilih STAFF,
                    // state role diubah menjadi STAFF
                    onChange={(e) =>
                      setRole(e.target.value as "STAFF" | "ADMIN")
                    }
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />

                  <span>STAFF</span>
                </label>

                {/* =========================
                    ADMIN
                    =========================
                */}
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition ${
                    role === "ADMIN"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    value='ADMIN'
                    // Radio ADMIN akan tercentang
                    // jika state role bernilai ADMIN
                    checked={role === "ADMIN"}
                    // Ketika user memilih ADMIN,
                    // state role berubah menjadi ADMIN
                    onChange={(e) =>
                      setRole(e.target.value as "STAFF" | "ADMIN")
                    }
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />

                  <span>ADMIN</span>
                </label>
              </div>
            </div>

            {/* =========================
                PASSWORD
                =========================
            */}
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-gray-700'
              >
                Password
              </Label>

              <Input
                id='password'
                type='password'
                placeholder='Masukkan password Anda'
                // Input password dikontrol oleh state password
                value={password}
                // Setiap user mengetik password,
                // state password diperbarui
                onChange={(e) => setPassword(e.target.value)}
                required
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            {/* =========================
                LOGIN BUTTON
                =========================
            */}
            <Button
              type='submit'
              // Kalau loading = true,
              // tombol tidak bisa diklik lagi
              disabled={loading}
            >
              {/* 
                Conditional Rendering menggunakan ternary

                Kalau loading true:
                "Memproses..."

                Kalau loading false:
                "Login"
              */}
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </CardContent>

        {/* =========================
            FOOTER
            =========================
        */}
        <CardFooter className='justify-center border-t border-gray-100 px-6 py-4'>
          <p className='text-sm text-gray-500'>
            Belum punya akun?{" "}
            {/* 
              Link dari React Router digunakan untuk
              berpindah halaman tanpa reload browser.

              Berbeda dengan:
              <a href="/register">

              Link lebih cocok digunakan untuk routing
              di aplikasi React.
            */}
            <Link
              to='/register'
              className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
            >
              Register di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
