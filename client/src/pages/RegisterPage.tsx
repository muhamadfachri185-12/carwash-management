import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF")

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validasi kecocokan password
    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi password tidak sesuai")
      return
    }

    setLoading(true)

    try {
      await axios.post("/auth/register", {
        name,
        email,
        password,
        role,
      })

      navigate("/login")
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat register. Masukkan form register yang sesuai",
      )
    } finally {
      setLoading(false)
    }
  }

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
          {error && (
            <div className='mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Name */}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                required
              />
            </div>

            {/* Email */}
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

            {/* Role */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>Role</Label>

              <div className='grid grid-cols-2 gap-3'>
                {/* STAFF */}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                    role === "STAFF"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    value='STAFF'
                    checked={role === "STAFF"}
                    onChange={(e) =>
                      setRole(e.target.value as "STAFF" | "ADMIN")
                    }
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />

                  <span className='text-sm font-medium'>STAFF</span>
                </label>

                {/* ADMIN */}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
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

            {/* Password */}
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

            {/* Confirm Password */}
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

            {/* Register Button */}
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? "Memproses..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex justify-center border-t border-gray-100 p-4'>
          <p className='text-sm text-muted-foreground'>
            Sudah punya akun?{" "}
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
