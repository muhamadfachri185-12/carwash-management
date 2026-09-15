// Import Request dan Response dari Express.
// Request = data/request yang masuk dari client.
// Response = response yang akan dikirim kembali ke client.
import { Request, Response } from "express"

// Import prisma untuk berkomunikasi dengan database.
import { prisma } from "../lib/prisma"

// Import schema Zod untuk melakukan validasi
// data saat membuat dan mengupdate service.
import {
  createServiceSchema,
  updateServiceSchema,
} from "../schemas/service.schema"

// AuthRequest adalah Request custom yang sudah
// memiliki informasi authentication dari middleware.
import { AuthRequest } from "../middleware/auth.middleware"

// ======================================================
// GET SERVICE
// ======================================================

// Fungsi untuk mengambil semua service.
export const getService = async (_req: AuthRequest, res: Response) => {
  // findMany() = mengambil banyak data dari database.
  const services = await prisma.service.findMany({
    // Mengatur urutan data yang diambil.
    orderBy: {
      // createdAt = waktu data dibuat.
      // "desc" = descending, dari terbaru ke terlama.
      createdAt: "desc",
    }, // Diurutkan dari data terbaru
  })

  // Mengirim data services ke frontend.
  //
  // 200 = request berhasil.
  return res.status(200).json({
    // Mengirim array services dengan key "services".
    services,
  })
}

// ======================================================
// CREATE SERVICE
// ======================================================

// Fungsi untuk membuat service baru.
export const createService = async (req: AuthRequest, res: Response) => {
  // req.body = data yang dikirim oleh frontend.
  //
  // safeParse() digunakan untuk mengecek apakah
  // data tersebut sesuai dengan createServiceSchema.
  const result = createServiceSchema.safeParse(req.body)

  // Kalau validasi gagal.
  if (!result.success) {
    // 400 = Bad Request.
    // Artinya data yang dikirim client tidak valid.
    return res.status(400).json({
      // Pesan error untuk frontend.
      message: "validation error",

      // flatten() membuat error Zod lebih mudah dibaca.
      errors: result.error.flatten(),
    })
  }

  // Kalau validasi berhasil,
  // result.data berisi data yang sudah lolos validasi.
  //
  // Destructuring digunakan untuk mengambil
  // property name, duration, dan price.
  const { name, duration, price } = result.data

  // create() digunakan untuk memasukkan
  // data baru ke tabel service.
  const service = await prisma.service.create({
    // Data yang akan disimpan ke database.
    data: {
      // Nama service.
      name,

      // Durasi service.
      duration,

      // Harga service.
      price,
    },
  })

  // Mengirim response service yang baru dibuat.
  //
  // 201 = resource berhasil dibuat.
  return res.status(201).json({
    message: "Service created successfully",

    // Service hasil dari database.
    service,
  })
}

// ======================================================
// UPDATE SERVICE
// ======================================================

// Fungsi untuk mengupdate service.
export const updateService = async (req: AuthRequest, res: Response) => {
  // Mengambil id dari URL parameter.
  //
  // Contoh:
  // PATCH /services/5
  //
  // req.params.id akan berupa string "5".
  const { id } = req.params

  // Validasi data dari frontend menggunakan
  // updateServiceSchema.
  const result = updateServiceSchema.safeParse(req.body)

  // Kalau validasi gagal.
  if (!result.success) {
    // 400 = Bad Request.
    return res.status(400).json({
      message: "Validation error",

      // Menampilkan detail error dari Zod.
      errors: result.error.flatten(),
    })
  }

  // ======================================================
  // CEK APAKAH SERVICE ADA
  // ======================================================

  // findUnique() digunakan untuk mencari
  // satu service berdasarkan ID.
  const existingService = await prisma.service.findUnique({
    where: {
      // req.params.id berupa string.
      //
      // Number(id) mengubah string menjadi number.
      //
      // "5" -> 5
      id: Number(id),
    },
  })

  // Kalau service tidak ditemukan.
  if (!existingService) {
    // 404 = Not Found.
    return res.status(404).json({
      message: "Vehicle not found",
    })
  }

  // ======================================================
  // UPDATE DATA
  // ======================================================

  // update() digunakan untuk mengubah data
  // service yang sudah ada di database.
  const service = await prisma.service.update({
    // Menentukan service mana yang akan diupdate.
    where: { id: Number(id) },

    // Data baru yang sudah lolos validasi.
    data: result.data,
  })

  // Mengirim data service yang sudah diupdate.
  return res.status(200).json({
    message: "Service updated successfully",
    service,
  })
}

// ======================================================
// DELETE SERVICE
// ======================================================

// 4. Menghapus layanan berdasarkan ID

export const deleteService = async (req: AuthRequest, res: Response) => {
  // Mengambil id dari URL parameter.
  //
  // Contoh:
  // DELETE /services/5
  const { id } = req.params

  // Mengubah id dari string menjadi number.
  //
  // "5" -> 5
  const serviceId = Number(id)

  // ======================================================
  // CEK SERVICE
  // ======================================================

  // Pastikan data layanannya ada sebelum dihapus.
  //
  // findUnique() mencari satu service berdasarkan ID.
  const existingService = await prisma.service.findUnique({
    // Mencari service dengan ID yang sesuai.
    where: { id: serviceId },
  })

  // ======================================================
  // CEK RELASI DENGAN ORDER
  // ======================================================

  // Cek apakah service tersebut sudah pernah
  // digunakan di sebuah OrderItem.
  //
  // OrderItem adalah detail service di dalam order.
  const existingOrderItem = await prisma.orderItem.findFirst({
    where: {
      // Cari OrderItem yang memiliki
      // serviceId yang sedang ingin dihapus.
      serviceId: serviceId,
    },
  })

  // Kalau service sudah digunakan pada order.
  if (existingOrderItem) {
    // Jangan izinkan service dihapus.
    //
    // Tujuannya supaya service yang sudah
    // tercatat dalam history order tetap aman.
    return res.status(400).json({
      message: "Service tidak dapat dihapus karena ada di order",
    })
  }

  // Kalau service tidak ditemukan.
  if (!existingService) {
    // 404 = Not Found.
    return res.status(404).json({
      message: "Service not found",
    })
  }

  // ======================================================
  // DELETE SERVICE
  // ======================================================

  // Menghapus service dari database.
  await prisma.service.delete({
    // Menentukan service berdasarkan ID.
    where: { id: Number(id) },
  })

  // Mengirim response bahwa service
  // berhasil dihapus.
  return res.status(200).json({
    message: "Service deleted successfully",
  })
}
