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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF")

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
        role,
      })

      const { token, user } = response.data

      login(token, user)

      if (user.role === "ADMIN") {
        navigate("/")
      } else {
        navigate("/orders")
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat login. Periksa kembali email dan password",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      <Card className='w-full max-w-md border-gray-200 shadow-sm'>
        {/* HEADER */}
        <CardHeader className='space-y-2 pb-6'>
          <CardTitle className='text-center text-2xl font-bold text-gray-900'>
            Login
          </CardTitle>

          <CardDescription className='text-center text-gray-500'>
            Masuk ke sistem WashFlow
          </CardDescription>
        </CardHeader>

        {/* CONTENT */}
        <CardContent>
          {/* ERROR */}
          {error && (
            <div className='mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* EMAIL */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            {/* ROLE */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>
                Login Sebagai
              </Label>

              <div className='grid grid-cols-2 gap-3'>
                {/* STAFF */}
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition ${
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

                  <span>STAFF</span>
                </label>

                {/* ADMIN */}
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
                    checked={role === "ADMIN"}
                    onChange={(e) =>
                      setRole(e.target.value as "STAFF" | "ADMIN")
                    }
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />

                  <span>ADMIN</span>
                </label>
              </div>
            </div>

            {/* PASSWORD */}
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
                required
                className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            {/* LOGIN BUTTON */}
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className='justify-center border-t border-gray-100 px-6 py-4'>
          <p className='text-sm text-gray-500'>
            Belum punya akun?{" "}
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
