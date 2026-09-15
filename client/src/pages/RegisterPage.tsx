// useState digunakan untuk menyimpan data yang bisa berubah
// selama component berjalan.
import { useState } from "react"

// useNavigate → navigasi menggunakan JavaScript
// Link        → navigasi menggunakan elemen Link
import { useNavigate, Link } from "react-router-dom"

// Axios instance untuk komunikasi dengan backend
import axios from "../lib/axios"

// Import komponen shadcn
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

export default function RegisterPage() {
  // =========================================================
  // FORM STATE
  // =========================================================

  // State digunakan untuk menyimpan isi input form.

  // name = nilai input nama
  // setName = function untuk mengubah name
  const [name, setName] = useState("")

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [confirmPassword, setConfirmPassword] = useState("")

  // Menyimpan pesan error yang akan ditampilkan ke user.
  const [error, setError] = useState("")

  // loading digunakan untuk mengetahui apakah request
  // register sedang berjalan.
  //
  // false → tidak sedang request
  // true  → sedang request
  const [loading, setLoading] = useState(false)

  // =========================================================
  // UNION TYPE
  // =========================================================

  // Ini adalah TypeScript Union Type.
  //
  // Artinya nilai "role" HANYA boleh:
  //
  // "STAFF" atau "ADMIN"
  //
  // Tidak boleh:
  // "USER"
  // "MANAGER"
  // "abc"
  //
  // Default value = "STAFF"
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF")

  // useNavigate digunakan untuk pindah halaman
  // melalui JavaScript.
  const navigate = useNavigate()

  // =========================================================
  // HANDLE FORM SUBMIT
  // =========================================================

  // Function ini dipanggil ketika form di-submit.
  //
  // React.FormEvent = tipe event dari form HTML.
  const handleSubmit = async (e: React.FormEvent) => {
    // Secara default form HTML akan melakukan reload halaman.
    //
    // preventDefault() mencegah reload tersebut.
    e.preventDefault()

    // Hapus error lama sebelum melakukan validasi/request baru.
    setError("")

    // =======================================================
    // VALIDASI PASSWORD
    // =======================================================

    // Cek apakah password dan confirm password sama.
    if (password !== confirmPassword) {
      // Kalau tidak sama → tampilkan error.
      setError("Password dan Konfirmasi password tidak sesuai")

      // return = hentikan function di sini.
      //
      // Jadi request POST ke backend TIDAK akan dijalankan.
      return
    }

    // =======================================================
    // MULAI LOADING
    // =======================================================

    setLoading(true)

    // =======================================================
    // REQUEST REGISTER
    // =======================================================

    try {
      // await membuat JavaScript menunggu request selesai
      // sebelum melanjutkan ke baris berikutnya.
      //
      // POST digunakan untuk membuat data baru.
      await axios.post("/auth/register", {
        // Data berikut dikirim ke backend.
        name,
        email,
        password,
        role,
      })

      // Kalau request berhasil:
      // pindahkan user ke halaman login.
      //
      // Contoh alurnya:
      //
      // Register berhasil
      //       ↓
      // navigate("/login")
      //       ↓
      // halaman Login dibuka
      navigate("/login")
    } catch (err: any) {
      // Kalau request gagal, kode masuk ke catch.
      //
      // Contohnya:
      // - email sudah terdaftar
      // - password tidak valid
      // - server error
      // - validation error dari backend

      // Optional chaining (?.) digunakan supaya tidak error
      // kalau response/data/message tidak tersedia.
      //
      // Kalau backend mengirim message:
      // gunakan message dari backend.
      //
      // Kalau tidak:
      // gunakan pesan default.
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat register. Masukkan form register yang sesuai",
      )
    } finally {
      // finally selalu dijalankan setelah try/catch selesai.
      //
      // Jadi walaupun request berhasil ATAU gagal,
      // loading harus dikembalikan menjadi false.
      setLoading(false)
    }
  }

  // =========================================================
  // RENDER PAGE
  // =========================================================

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      <Card className='w-full max-w-md border-gray-200 shadow-sm'>
        <CardHeader className='space-y-2 pb-6 text-center'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Register
          </CardTitle>

          <CardDescription>
            Buat akun baru untuk menggunakan sistem WashFlow
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {/* Conditional rendering menggunakan &&
          
              Artinya:
              
              kalau error ada/berisi string
              ↓
              tampilkan div error
              
              kalau error = ""
              ↓
              div tidak ditampilkan
          */}
          {error && (
            <div className='mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700'>
              {error}
            </div>
          )}

          {/* =================================================
              REGISTER FORM
          ================================================= */}

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* =================================================
                NAME
            ================================================= */}

            <div className='space-y-2'>
              <Label
                htmlFor='name'
                className='text-sm font-medium text-gray-700'
              >
                Name
              </Label>

              <Input
                id='name'
                type='text'
                placeholder='Nama Karyawan Washflow'
                // Controlled Input
                //
                // value diambil dari state "name".
                value={name}
                // Ketika user mengetik:
                //
                // e.target.value
                //        ↓
                // nilai terbaru dari input
                //        ↓
                // setName()
                //
                // sehingga state selalu mengikuti input.
                onChange={(e) => setName(e.target.value)}
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                // required = browser tidak mengizinkan
                // form dikirim kalau input kosong.
                required
              />
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

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
                placeholder='staff@carwash.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                required
              />
            </div>

            {/* =================================================
                ROLE
            ================================================= */}

            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>Role</Label>

              <div className='grid grid-cols-2 gap-3'>
                {/* =================================================
                    STAFF
                ================================================= */}

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                    // Ternary operator:
                    //
                    // condition
                    //    ?
                    // value kalau true
                    //    :
                    // value kalau false
                    role === "STAFF"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    // value adalah nilai yang akan digunakan
                    // ketika radio ini dipilih.
                    value='STAFF'
                    // checked menentukan radio mana yang aktif.
                    //
                    // Kalau role = "STAFF"
                    // maka radio STAFF dicentang.
                    checked={role === "STAFF"}
                    // Ketika radio dipilih,
                    // ubah state role menjadi STAFF.
                    onChange={(e) =>
                      // e.target.value sebenarnya bertipe string.
                      //
                      // Karena kita sudah tahu bahwa nilai ini hanya
                      // STAFF atau ADMIN, kita beri tahu TypeScript
                      // menggunakan "as".
                      setRole(e.target.value as "STAFF" | "ADMIN")
                    }
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />

                  <span className='text-sm font-medium'>STAFF</span>
                </label>

                {/* =================================================
                    ADMIN
                ================================================= */}

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                    // Kalau role sekarang ADMIN,
                    // gunakan style active.
                    role === "ADMIN"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    value='ADMIN'
                    checked={role === "ADMIN"}
                    onChange={(e) =>
                      setRole(e.target.value as "STAFF" | "ADMIN")
                    }
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />

                  <span className='text-sm font-medium'>ADMIN</span>
                </label>
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                required
              />
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div className='space-y-2'>
              <Label
                htmlFor='confirmPassword'
                className='text-sm font-medium text-gray-700'
              >
                Confirm Password
              </Label>

              <Input
                id='confirmPassword'
                type='password'
                placeholder='Konfirmasi password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                required
              />
            </div>

            {/* =================================================
                REGISTER BUTTON
            ================================================= */}

            <Button
              type='submit'
              // Kalau loading = true,
              // tombol menjadi disabled.
              //
              // Tujuannya supaya user tidak klik Register
              // berkali-kali saat request masih berjalan.
              disabled={loading}
              className='w-full'
            >
              {/* Conditional rendering dengan ternary:
              
                  loading = true
                  → "Memproses..."
                  
                  loading = false
                  → "Register"
              */}
              {loading ? "Memproses..." : "Register"}
            </Button>
          </form>
        </CardContent>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <CardFooter className='flex justify-center border-t border-gray-100 p-4'>
          <p className='text-sm text-muted-foreground'>
            Sudah punya akun?{" "}
            {/* 
              Link digunakan untuk navigasi antar route
              menggunakan React Router.

              Berbeda dengan <a href="">,
              Link tidak melakukan full page reload.
            */}
            <Link
              to='/login'
              className='font-medium text-primary hover:underline'
            >
              Login di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
