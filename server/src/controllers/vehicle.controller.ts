// Import Request dan Response dari Express.
// Request = data/request yang dikirim client.
// Response = response yang dikirim kembali oleh server.
import { Request, Response } from "express"

// Import prisma untuk berkomunikasi dengan database.
import { prisma } from "../lib/prisma"

// Import schema Zod untuk validasi
// saat membuat dan mengupdate vehicle.
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../schemas/vehicle.schema"

// Import AuthRequest.
// AuthRequest adalah Request custom yang memiliki
// informasi user hasil dari authentication middleware.
import { AuthRequest } from "../middleware/auth.middleware"

// ======================================================
// GET ALL VEHICLES
// ======================================================

// Fungsi untuk mengambil semua kendaraan.
export const getVehicles = async (_req: AuthRequest, res: Response) => {
  // findMany() = mengambil banyak data dari database.
  const vehicles = await prisma.vehicle.findMany({
    // include digunakan untuk mengambil data
    // dari tabel/relasi lain yang berhubungan.
    include: {
      // Vehicle memiliki relasi dengan Customer.
      //
      // Dengan customer: true, response juga akan
      // mendapatkan informasi customer pemilik kendaraan.
      customer: true,
    },

    // Mengurutkan kendaraan berdasarkan waktu dibuat.
    orderBy: {
      // desc = descending.
      // Data terbaru ditampilkan terlebih dahulu.
      createdAt: "desc",
    },
  })

  // Mengirim data kendaraan ke frontend.
  //
  // 200 = request berhasil.
  return res.status(200).json({
    vehicles,
  })
}

// ======================================================
// CREATE VEHICLE
// ======================================================

// Fungsi untuk membuat kendaraan baru.
export const createVehicle = async (req: AuthRequest, res: Response) => {
  // req.body berisi data yang dikirim dari frontend.
  //
  // safeParse() digunakan untuk mengecek
  // apakah data sesuai dengan createVehicleSchema.
  const result = createVehicleSchema.safeParse(req.body)

  // Kalau validasi gagal.
  if (!result.success) {
    // 400 = Bad Request.
    return res.status(400).json({
      message: "Validation error",

      // Mengambil detail error dari Zod.
      errors: result.error.flatten(),
    })
  }

  // Kalau validasi berhasil,
  // result.data berisi data yang sudah valid.
  //
  // Destructuring digunakan untuk mengambil
  // customerId, plateNumber, brand, dan model.
  const { customerId, plateNumber, brand, model } = result.data

  // ======================================================
  // CEK CUSTOMER
  // ======================================================

  // Sebelum membuat vehicle,
  // kita harus memastikan customer yang dipilih
  // memang ada di database.
  const customer = await prisma.customer.findUnique({
    where: {
      // customerId dari request bisa berupa string,
      // sehingga diubah menjadi number.
      //
      // Contoh:
      // "1" -> 1
      id: Number(customerId),
    },
  })

  // Kalau customer tidak ditemukan.
  if (!customer) {
    // 404 = Not Found.
    return res.status(404).json({
      message: "Customer not found",
    })
  }

  // ======================================================
  // CREATE VEHICLE
  // ======================================================

  // Membuat data vehicle baru di database.
  const vehicle = await prisma.vehicle.create({
    data: {
      // Menghubungkan vehicle dengan customer.
      customerId: Number(customerId),

      // Nomor polisi kendaraan.
      plateNumber,

      // Merek kendaraan.
      brand,

      // Model kendaraan.
      model,
    },
  })

  // Mengirim vehicle yang baru dibuat
  // kembali ke frontend.
  //
  // 201 = resource berhasil dibuat.
  return res.status(201).json({
    message: "Vehicle created succesfully",
    vehicle,
  })
}

// ======================================================
// UPDATE VEHICLE
// ======================================================

// Fungsi untuk mengupdate vehicle.
export const updateVehicle = async (req: AuthRequest, res: Response) => {
  // Mengambil ID vehicle dari URL parameter.
  //
  // Contoh:
  // PUT /vehicles/5
  //
  // req.params.id = "5"
  const { id } = req.params

  // Validasi data dari frontend.
  const result = updateVehicleSchema.safeParse(req.body)

  // Kalau validasi gagal.
  if (!result.success) {
    // 400 = Bad Request.
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  // ======================================================
  // CEK VEHICLE
  // ======================================================

  // Cari vehicle berdasarkan ID.
  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      // Ubah ID dari string menjadi number.
      id: Number(id),
    },
  })

  // Kalau vehicle tidak ditemukan.
  if (!existingVehicle) {
    // 404 = Not Found.
    return res.status(404).json({
      message: "Vehicle not found",
    })
  }

  // ======================================================
  // CEK CUSTOMER BARU
  // ======================================================

  // Kalau request ingin mengganti customer,
  // pastikan customer baru tersebut benar-benar ada.
  if (result.data.customerId) {
    // Cari customer berdasarkan customerId baru.
    const customer = await prisma.customer.findUnique({
      where: {
        // customerId diubah menjadi number.
        id: Number(result.data.customerId),
      },
    })

    // Kalau customer baru tidak ditemukan.
    if (!customer) {
      // 400 = data yang dikirim tidak valid.
      return res.status(400).json({
        message: "Customer not found",
      })
    }
  }

  // ======================================================
  // UPDATE VEHICLE
  // ======================================================

  // Mengupdate vehicle di database.
  const vehicle = await prisma.vehicle.update({
    // Menentukan vehicle mana yang akan diupdate.
    where: {
      id: Number(id),
    },

    data: {
      // Spread operator (...) memasukkan semua data
      // yang ada di result.data.
      //
      // Contohnya:
      // plateNumber
      // brand
      // model
      // customerId
      ...result.data,

      // Kalau customerId dikirim,
      // ubah menjadi number terlebih dahulu.
      //
      // Kalau customerId tidak dikirim,
      // gunakan undefined sehingga field tersebut
      // tidak diubah.
      customerId: result.data.customerId
        ? Number(result.data.customerId)
        : undefined,
    },
  })

  // Mengirim vehicle yang sudah diperbarui.
  return res.status(200).json({
    message: "Vehicle succesfully updated",
    vehicle,
  })
}

// ======================================================
// DELETE VEHICLE
// ======================================================

// Fungsi untuk menghapus vehicle.
export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  // Mengambil ID vehicle dari URL parameter.
  //
  // Contoh:
  // DELETE /vehicles/5
  const { id } = req.params

  // ======================================================
  // CEK VEHICLE
  // ======================================================

  // Cari vehicle terlebih dahulu
  // untuk memastikan datanya memang ada.
  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      // Ubah ID dari string menjadi number.
      id: Number(id),
    },
  })

  // Kalau vehicle tidak ditemukan.
  if (!existingVehicle) {
    // 404 = Not Found.
    return res.status(404).json({
      message: "Vehicle not found",
    })
  }

  // ======================================================
  // DELETE VEHICLE
  // ======================================================

  // Menghapus vehicle berdasarkan ID.
  await prisma.vehicle.delete({
    where: {
      // Menentukan vehicle yang akan dihapus.
      id: Number(id),
    },
  })

  // Mengirim response bahwa vehicle
  // berhasil dihapus.
  return res.status(200).json({
    message: "Vehicle deleted succesfully",
  })
}
