// Import beberapa tipe dari Express.
//
// NextFunction = digunakan untuk menjalankan middleware berikutnya.
// Request = representasi request dari client.
// Response = response yang dikirim server ke client.
import { NextFunction, Request, Response } from "express"

// Library jsonwebtoken digunakan untuk
// membuat dan memverifikasi JWT.
import jwt from "jsonwebtoken"

// ======================================================
// JWT PAYLOAD
// ======================================================

// Interface ini menentukan bentuk data
// yang ada di dalam payload JWT.
//
// Payload = informasi yang disimpan di dalam token.
interface JwtPayload {
  // ID user yang sedang login.
  userId: number

  // Role user hanya boleh ADMIN atau STAFF.
  role: "ADMIN" | "STAFF"
}

// ======================================================
// AUTH REQUEST
// ======================================================

// Kita membuat tipe Request sendiri.
//
// Express Request standar tidak memiliki property "user".
// Jadi kita tambahkan property user agar nantinya
// middleware bisa menyimpan informasi user yang login.
export interface AuthRequest extends Request {
  // user bersifat optional (?) karena sebelum
  // authentication berhasil, req.user belum tentu ada.
  user?: JwtPayload
}

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

// Middleware untuk mengecek apakah request
// berasal dari user yang memiliki token JWT valid.
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Mengambil header "Authorization" dari request.
  //
  // Biasanya bentuknya:
  //
  // Authorization: Bearer eyJhbGciOi...
  const authHeader = req.headers.authorization

  // Kalau header Authorization tidak ada,
  // berarti client tidak mengirim token.
  if (!authHeader) {
    // 401 = Unauthorized.
    //
    // Artinya user belum berhasil melakukan authentication.
    return res.status(401).json({
      message: "Authentication required",
    })
  }

  // Memisahkan Authorization menjadi 2 bagian
  // berdasarkan spasi.
  //
  // "Bearer abc123"
  //
  // menjadi:
  // type  = "Bearer"
  // token = "abc123"
  const [type, token] = authHeader.split(" ")

  // Pastikan format authorization benar.
  //
  // type harus "Bearer"
  // token juga harus ada.
  if (type !== "Bearer" || !token) {
    // Kalau format salah, kirim 401.
    return res.status(401).json({
      message: "Invalid authorization format",
    })
  }

  // Mengambil JWT secret dari environment variable.
  //
  // JWT_SECRET digunakan untuk memverifikasi
  // apakah token benar-benar dibuat oleh server kita.
  const JWT_SECRET = process.env.JWT_SECRET

  // Kalau JWT_SECRET tidak tersedia di environment,
  // server tidak bisa melakukan verifikasi token.
  if (!JWT_SECRET) {
    // 500 = Internal Server Error.
    //
    // Ini bukan kesalahan user/client,
    // tetapi konfigurasi server yang bermasalah.
    return res.status(500).json({
      message: "JWT secret is not configured",
    })
  }

  // ======================================================
  // VERIFIKASI TOKEN
  // ======================================================

  try {
    // jwt.verify() digunakan untuk:
    //
    // 1. Memeriksa apakah token valid.
    // 2. Memeriksa apakah token sudah expired.
    // 3. Memverifikasi token menggunakan JWT_SECRET.
    //
    // Hasil decode kemudian dianggap memiliki
    // bentuk sesuai interface JwtPayload.
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    // Menyimpan data user dari token
    // ke dalam request.
    //
    // Setelah ini middleware/controller berikutnya
    // bisa mengakses:
    //
    // req.user?.userId
    // req.user?.role
    req.user = decoded

    // next() berarti:
    //
    // "Authentication berhasil,
    // lanjutkan request ke middleware/controller berikutnya."
    next()
  } catch {
    // Kalau jwt.verify() gagal,
    // misalnya token:
    //
    // - tidak valid
    // - sudah expired
    // - signature tidak cocok
    //
    // maka request ditolak.
    return res.status(401).json({
      message: "Invalid or expired token",
    })
  }
}
