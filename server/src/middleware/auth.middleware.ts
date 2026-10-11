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
  role: "ADMIN" | "STAFF" | "CUSTOMER"
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

type UserRole = "ADMIN" | "STAFF" | "CUSTOMER"
export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "ou do not have permission to access this resource",
      })
    }
    next()
  }
}


// ======================================================
// OUTLET ACCESS TOKEN
// ======================================================

// Bentuk payload khusus untuk token
// yang diberikan setelah customer berhasil
// melakukan scan QR outlet.
interface OutletAccessPayload {
  // ID user customer.
  userId: number

  // Role harus CUSTOMER.
  role: "CUSTOMER"

  // Menandakan bahwa token ini
  // memang digunakan untuk akses order outlet.
  purpose: "OUTLET_ORDER"

  // Karena project kita hanya memiliki
  // satu outlet.
  outlet: "MAIN"
}

// ======================================================
// OUTLET ACCESS MIDDLEWARE
// ======================================================

// Middleware ini digunakan untuk memastikan
// customer sudah berhasil melakukan verifikasi
// QR outlet sebelum membuat order.
export const requireOutletAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Pastikan user sudah login terlebih dahulu.
  //
  // Middleware ini nantinya dipasang setelah
  // middleware authenticate.
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    })
  }

  // Ambil outlet access token dari custom header.
  //
  // Frontend nantinya mengirim:
  //
  // X-Outlet-Access-Token: eyJhbGciOi...
  const outletToken = req.headers["x-outlet-access-token"]

  // Header bisa memiliki tipe string atau array.
  //
  // Kita hanya menerima satu token dalam bentuk string.
  if (typeof outletToken !== "string" || !outletToken) {
    return res.status(403).json({
      message: "Outlet access required",
    })
  }

  // Ambil JWT secret yang sama
  // dengan authentication JWT.
  const JWT_SECRET = process.env.JWT_SECRET

  // Pastikan JWT secret tersedia.
  if (!JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret is not configured",
    })
  }

  try {
    // Verifikasi outlet access token.
    //
    // jwt.verify() juga otomatis mengecek
    // apakah token sudah expired.
    const decoded = jwt.verify(
      outletToken,
      JWT_SECRET,
    ) as OutletAccessPayload

    // Pastikan token memang untuk CUSTOMER.
    if (decoded.role !== "CUSTOMER") {
      return res.status(403).json({
        message: "Customer outlet access required",
      })
    }

    // Pastikan token memang dibuat
    // khusus untuk akses order outlet.
    if (decoded.purpose !== "OUTLET_ORDER") {
      return res.status(403).json({
        message: "Invalid outlet access token",
      })
    }

    // Pastikan token memang untuk outlet utama.
    if (decoded.outlet !== "MAIN") {
      return res.status(403).json({
        message: "Invalid outlet",
      })
    }

    // Pastikan outlet token dimiliki
    // oleh user yang sedang login.
    //
    // Contoh:
    //
    // Login JWT:
    // userId = 123
    //
    // Outlet JWT:
    // userId = 123
    //
    // → valid
    //
    // Kalau:
    //
    // Login JWT:
    // userId = 123
    //
    // Outlet JWT:
    // userId = 456
    //
    // → ditolak.
    if (decoded.userId !== req.user.userId) {
      return res.status(403).json({
        message: "Outlet access does not belong to this user",
      })
    }

    // Semua pengecekan berhasil.
    //
    // Lanjutkan ke controller berikutnya.
    next()
  } catch {
    // Token tidak valid atau sudah expired.
    return res.status(403).json({
      message: "Invalid or expired outlet access token",
    })
  }
}