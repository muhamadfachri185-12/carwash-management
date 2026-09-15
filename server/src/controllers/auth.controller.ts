// Request = object yang berisi data dari client
// Response = object yang digunakan server untuk mengirim response ke client
import { Request, Response } from "express"

// bcrypt digunakan untuk:
// 1. melakukan hash password saat register
// 2. membandingkan password saat login
import bcrypt from "bcrypt"

// prisma digunakan untuk berkomunikasi dengan database
import { prisma } from "../lib/prisma"

// Schema Zod untuk memvalidasi data register dan login
import { loginSchema, registerSchema } from "../schemas/auth.schema"

// Fungsi untuk membuat JWT token
import { generateToken } from "../utils/jwt"

// AuthRequest adalah Request custom yang sudah memiliki req.user
// req.user biasanya diisi oleh middleware authentication
import { AuthRequest } from "../middleware/auth.middleware"

// IMPORT INI SEBENARNYA TIDAK DIGUNAKAN DI FILE INI
// Bisa dihapus:
// import { error } from "node:console"

// ======================================================
// REGISTER
// ======================================================

// Endpoint untuk membuat akun baru
export const register = async (req: Request, res: Response) => {
  // safeParse digunakan untuk mengecek apakah req.body
  // sesuai dengan aturan yang dibuat di registerSchema.
  //
  // Berbeda dengan parse():
  // safeParse() tidak langsung throw error,
  // tetapi mengembalikan object success true/false.
  const result = registerSchema.safeParse(req.body)

  // Kalau validasi gagal
  if (!result.success) {
    // Kirim status 400 = Bad Request
    return res.status(400).json({
      message: "Validation error",

      // flatten() membuat error Zod lebih mudah dibaca
      // terutama error berdasarkan field.
      errors: result.error.flatten(),
    })
  }

  // Kalau validasi berhasil,
  // result.data berisi data yang sudah lolos validasi.
  //
  // Destructuring:
  // mengambil property name, email, password, dan role
  // dari result.data.
  const { name, email, password, role } = result.data

  // ======================================================
  // CEK EMAIL SUDAH TERDAFTAR ATAU BELUM
  // ======================================================

  // findUnique digunakan untuk mencari satu data
  // berdasarkan field yang unique.
  //
  // Dalam kasus ini email harus unique di database.
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  // Kalau user dengan email tersebut sudah ada
  if (existingUser) {
    // 409 = Conflict
    //
    // Artinya request sebenarnya valid,
    // tetapi bentrok dengan data yang sudah ada.
    return res.status(409).json({
      message: "Email already registered",
    })
  }

  // ======================================================
  // HASH PASSWORD
  // ======================================================

  // Jangan pernah menyimpan password asli ke database.
  //
  // bcrypt.hash(password, 10)
  // → mengubah password asli menjadi password hash.
  //
  // Angka 10 adalah salt rounds.
  const passwordHash = await bcrypt.hash(password, 10)

  // ======================================================
  // SIMPAN USER KE DATABASE
  // ======================================================

  const user = await prisma.user.create({
    // Data yang akan dimasukkan ke tabel User
    data: {
      name,
      email,

      // Yang disimpan adalah HASH,
      // bukan password asli.
      passwordHash,

      role,
    },

    // select digunakan untuk menentukan field
    // apa saja yang boleh dikembalikan.
    //
    // Password hash sengaja tidak dikembalikan.
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  // ======================================================
  // RESPONSE REGISTER
  // ======================================================

  // 201 = Created
  // Biasanya digunakan ketika berhasil membuat resource baru.
  return res.status(201).json({
    message: "Registration succesful",
    user,
  })
}

// ======================================================
// LOGIN
// ======================================================

// Endpoint untuk login
export const login = async (req: Request, res: Response) => {
  // Validasi data login menggunakan Zod
  const result = loginSchema.safeParse(req.body)

  // Kalau data login tidak sesuai schema
  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  // Ambil data yang sudah lolos validasi
  const { email, password, role } = result.data

  // ======================================================
  // CARI USER
  // ======================================================

  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  // Kalau email tidak ditemukan
  if (!user) {
    // 401 = Unauthorized
    //
    // Artinya user belum berhasil melakukan authentication.
    return res.status(401).json({
      message: "Invalid email or password",
    })
  }

  // ======================================================
  // VALIDASI ROLE
  // ======================================================

  // Pastikan role yang dipilih saat login
  // sama dengan role yang tersimpan di database.
  //
  // Contoh:
  // Database → STAFF
  // Login memilih → ADMIN
  //
  // Maka login ditolak.
  if (user.role !== role) {
    // 403 = Forbidden
    //
    // User dikenal oleh sistem,
    // tetapi tidak sesuai dengan role yang diminta.
    return res.status(403).json({
      message: `Akun ini terdaftar sebagai ${user.role}, bukan ${role}`,
    })
  }

  // ======================================================
  // CEK PASSWORD
  // ======================================================

  // bcrypt.compare() membandingkan:
  //
  // password
  //     ↓
  // password yang diketik user
  //
  // user.passwordHash
  //     ↓
  // hash yang tersimpan di database
  //
  // Hasilnya berupa true atau false.
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  // Kalau password salah
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Password invalid",
    })
  }

  // ======================================================
  // BUAT JWT TOKEN
  // ======================================================

  // Kalau sampai sini berarti:
  //
  // 1. Email ditemukan
  // 2. Role sesuai
  // 3. Password benar
  //
  // Sekarang server membuat JWT token.
  const token = generateToken({
    userId: user.id,
    role: user.role,
  })

  // ======================================================
  // RESPONSE LOGIN
  // ======================================================

  // Kirim token + informasi user ke frontend.
  return res.status(200).json({
    message: "Login succesfull",

    // Frontend nantinya menyimpan token ini
    // dan menggunakannya untuk request ke endpoint protected.
    token,

    // Data user yang aman untuk dikirim ke frontend.
    //
    // Password/passwordHash tidak dikirim.
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

// ======================================================
// ME
// ======================================================

// Endpoint /auth/me biasanya digunakan untuk:
// "Siapa user yang sedang login?"
//
// Request menggunakan AuthRequest karena middleware
// authentication sudah menambahkan informasi user
// ke req.user.
export const me = async (req: AuthRequest, res: Response) => {
  // ======================================================
  // 1. CEK req.user
  // ======================================================

  // Kalau req.user tidak ada,
  // berarti request belum berhasil diauthenticate.
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    })
  }

  // ======================================================
  // 2. CARI USER BERDASARKAN ID DARI TOKEN
  // ======================================================

  // req.user.userId berasal dari JWT
  // yang sebelumnya diverifikasi oleh auth middleware.
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },

    // Ambil hanya data yang aman untuk dikirim.
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  // ======================================================
  // 3. USER TIDAK DITEMUKAN
  // ======================================================

  if (!user) {
    // 404 = Not Found
    //
    // Token mungkin valid,
    // tetapi user dengan ID tersebut sudah tidak ada
    // di database.
    return res.status(404).json({
      message: "User not found",
    })
  }

  // ======================================================
  // 4. USER DITEMUKAN
  // ======================================================

  // Kirim informasi user ke frontend.
  return res.status(200).json({
    user,
  })
}
