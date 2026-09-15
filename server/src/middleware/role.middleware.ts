// Import NextFunction dan Response dari Express.
//
// Response = digunakan untuk mengirim response ke client.
// NextFunction = digunakan untuk melanjutkan request
// ke middleware atau controller berikutnya.
import { NextFunction, Response } from "express"

// Import AuthRequest dari auth.middleware.
// AuthRequest adalah Request custom yang sudah memiliki
// property "user" berisi userId dan role.
import { AuthRequest } from "./auth.middleware"

// ======================================================
// AUTHORIZE ROLES
// ======================================================

// Function ini digunakan untuk menentukan
// role apa saja yang diperbolehkan mengakses suatu route.
//
// ...allowedRoles = rest parameter.
//
// Contoh:
// authorizeRoles("ADMIN")
//
// maka:
// allowedRoles = ["ADMIN"]
//
// Contoh:
// authorizeRoles("ADMIN", "STAFF")
//
// maka:
// allowedRoles = ["ADMIN", "STAFF"]
export const authorizeRoles = (...allowedRoles: ("ADMIN" | "STAFF")[]) => {
  // Function ini mengembalikan middleware Express.
  //
  // Jadi authorizeRoles() bukan middleware langsung,
  // tetapi function yang menghasilkan middleware.
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // ======================================================
    // CEK AUTHENTICATION
    // ======================================================

    // Cek apakah req.user tersedia.
    //
    // req.user sebelumnya diisi oleh middleware
    // authenticate setelah JWT berhasil diverifikasi.
    if (!req.user) {
      // Kalau req.user tidak ada,
      // berarti user belum ter-authenticate.
      //
      // 401 = Unauthorized.
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    // ======================================================
    // CEK ROLE
    // ======================================================

    // allowedRoles berisi role yang diperbolehkan
    // untuk mengakses route.
    //
    // req.user.role = role user yang sedang login.
    //
    // includes() mengecek apakah role user
    // terdapat di dalam allowedRoles.
    //
    // Contoh:
    //
    // allowedRoles = ["ADMIN"]
    // req.user.role = "STAFF"
    //
    // ["ADMIN"].includes("STAFF")
    // hasilnya = false
    if (!allowedRoles.includes(req.user.role)) {
      // Kalau role user tidak diperbolehkan,
      // request ditolak.
      //
      // 403 = Forbidden.
      //
      // Bedanya:
      // 401 = belum authenticated
      // 403 = sudah authenticated tetapi tidak punya izin
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      })
    }

    // Kalau user sudah login DAN role-nya diperbolehkan,
    // lanjutkan request ke middleware/controller berikutnya.
    next()
  }
}
