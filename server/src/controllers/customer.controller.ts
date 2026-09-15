// Request = data/request yang masuk dari client
// Response = object yang digunakan server untuk mengirim response
import { Request, Response } from "express"

// Prisma digunakan untuk berkomunikasi dengan database
import { prisma } from "../lib/prisma"

// Schema digunakan untuk validasi data
// sebelum data diproses atau disimpan ke database
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schemas/customer.schema"

// AuthRequest adalah Request custom yang biasanya
// sudah membawa informasi user dari authentication middleware
import { AuthRequest } from "../middleware/auth.middleware"

// ======================================================
// GET ALL CUSTOMERS
// ======================================================

// Fungsi untuk mengambil semua customer
export const getCustomers = async (_req: AuthRequest, res: Response) => {
  // findMany() digunakan untuk mengambil banyak data
  // dari tabel customer
  const customers = await prisma.customer.findMany({
    // Mengatur urutan data yang dikembalikan
    orderBy: {
      // Customer terbaru ditampilkan terlebih dahulu
      // desc = descending
      createdAt: "desc",
    },
  })

  // Mengirim response ke frontend
  //
  // 200 = request berhasil
  return res.status(200).json({
    // Data customer dimasukkan ke property "customers"
    customers,
  })
}

// ======================================================
// CREATE CUSTOMER
// ======================================================

// Fungsi untuk membuat customer baru
export const createCustomer = async (req: AuthRequest, res: Response) => {
  // req.body berisi data yang dikirim oleh frontend
  //
  // safeParse() digunakan untuk melakukan validasi
  // berdasarkan aturan yang ada di createCustomerSchema
  const result = createCustomerSchema.safeParse(req.body)

  // Kalau validasi gagal
  if (!result.success) {
    // 400 = Bad Request
    //
    // Artinya data dari frontend tidak sesuai
    // dengan aturan yang ditentukan schema
    return res.status(400).json({
      message: "Validation error",

      // flatten() membuat error Zod menjadi
      // lebih mudah dibaca
      errors: result.error.flatten(),
    })
  }

  // Kalau validasi berhasil,
  // result.data berisi data yang sudah lolos validasi
  //
  // Destructuring digunakan untuk mengambil
  // name, phone, dan address dari result.data
  const { name, phone, address } = result.data

  // ======================================================
  // SIMPAN CUSTOMER KE DATABASE
  // ======================================================

  // prisma.customer.create() digunakan untuk
  // membuat record customer baru
  const customer = await prisma.customer.create({
    // Data yang akan dimasukkan ke database
    data: {
      name,
      phone,
      address,
    },
  })

  // Kirim data customer yang baru dibuat
  // kembali ke frontend
  return res.status(200).json({
    message: "Customer created succesfully",
    customer,
  })
}

// ======================================================
// UPDATE CUSTOMER
// ======================================================

// Fungsi untuk mengubah data customer
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  // req.params digunakan untuk mengambil parameter
  // yang terdapat di URL
  //
  // Contoh:
  // PATCH /customers/5
  //
  // req.params.id = "5"
  const { id } = req.params

  // Validasi data yang dikirim dari frontend
  const result = updateCustomerSchema.safeParse(req.body)

  // Kalau validasi gagal
  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  // ======================================================
  // CEK CUSTOMER
  // ======================================================

  // Cari customer berdasarkan ID
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      // req.params.id berupa string,
      // sedangkan ID di database berupa number
      //
      // Number(id) mengubah:
      // "5" → 5
      id: Number(id),
    },
  })

  // Kalau customer tidak ditemukan
  if (!existingCustomer) {
    // 404 = Not Found
    return res.status(404).json({
      message: "Customer not found",
    })
  }

  // ======================================================
  // UPDATE DATA
  // ======================================================

  // update() digunakan untuk mengubah data
  // customer yang sudah ditemukan
  const customer = await prisma.customer.update({
    // Menentukan customer mana yang akan diubah
    where: {
      id: Number(id),
    },

    // result.data berisi data yang sudah lolos
    // validasi dari updateCustomerSchema
    data: result.data,
  })

  // Mengirim hasil update ke frontend
  return res.status(200).json({
    message: "Customer succesfully updated",
    customer,
  })
}

// ======================================================
// DELETE CUSTOMER
// ======================================================

// Fungsi untuk menghapus customer
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  // Mengambil ID customer dari URL
  //
  // Contoh:
  // DELETE /customers/5
  //
  // id = "5"
  const { id } = req.params

  // Mengubah ID dari string menjadi number
  //
  // "5" → 5
  const customerId = Number(id)

  // ======================================================
  // CEK CUSTOMER
  // ======================================================

  // Cari customer berdasarkan ID
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  })

  // ======================================================
  // CEK APAKAH CUSTOMER MEMILIKI ORDER
  // ======================================================

  // findFirst() digunakan untuk mencari
  // satu order yang memenuhi kondisi
  //
  // Di sini kita mencari apakah ada order
  // yang menggunakan customerId tersebut
  //
  // Tujuannya:
  // customer yang masih memiliki order
  // tidak boleh dihapus
  const existingOrder = await prisma.order.findFirst({
    where: {
      // Cari order yang customerId-nya
      // sama dengan customer yang ingin dihapus
      customerId: customerId,
    },
  })

  // Kalau ditemukan order
  if (existingOrder) {
    // Customer tidak boleh dihapus
    //
    // Ini menjaga hubungan/relasi antara
    // Customer dengan Order di database
    return res.status(400).json({
      message: "Customer tidak dapat dihapus karena memilik order",
    })
  }

  // ======================================================
  // CUSTOMER TIDAK DITEMUKAN
  // ======================================================

  // Kalau customer tidak ditemukan
  if (!existingCustomer) {
    // 404 = Not Found
    return res.status(404).json({
      message: "Customer not found",
    })
  }

  // ======================================================
  // DELETE CUSTOMER
  // ======================================================

  // Menghapus customer berdasarkan ID
  await prisma.customer.delete({
    where: {
      id: customerId,
    },
  })

  // Mengirim response bahwa customer berhasil dihapus
  return res.status(200).json({
    message: "Customer deleted succesfully",
  })
}
