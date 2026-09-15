// randomUUID digunakan untuk membuat ID unik secara random.
// Di sini dipakai sebagai bagian dari orderCode.
import { randomUUID } from "node:crypto"

// Request = request dari client
// Response = response yang dikirim server ke client
import { Request, Response } from "express"

// Prisma digunakan untuk berkomunikasi dengan database
import { prisma } from "../lib/prisma"

// Schema untuk validasi data saat:
// 1. membuat order
// 2. mengubah status order
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema"

// Schema khusus untuk validasi pembayaran
import { paymentSchema } from "../schemas/payment.schema"

// AuthRequest = Request custom yang memiliki informasi user
// dari authentication middleware
import { AuthRequest } from "../middleware/auth.middleware"

// ======================================================
// ORDER INCLUDE
// ======================================================

// Object ini dibuat supaya konfigurasi "include"
// untuk Order bisa digunakan berulang kali.
//
// Daripada menulis include yang sama di banyak fungsi,
// kita buat satu object dan tinggal digunakan kembali.
const orderInclude = {
  // Ambil data customer yang berhubungan dengan order
  customer: true,

  // Ambil data vehicle yang berhubungan dengan order
  vehicle: true,

  // Ambil user yang membuat order
  createdBy: {
    select: {
      // Hanya mengambil field yang diperlukan
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },

  // Ambil semua OrderItem
  orderItems: {
    include: {
      // Setiap OrderItem juga mengambil
      // data Service yang digunakan
      service: true,
    },
  },

  // Ambil data payment yang berhubungan dengan order
  payment: true,

  // as const membuat property object menjadi
  // lebih spesifik/read-only untuk kebutuhan TypeScript
} as const

// ======================================================
// GET ALL ORDERS
// ======================================================

export const getOrders = async (_req: Request, res: Response) => {
  // try digunakan untuk menangani error
  // yang mungkin terjadi saat query database
  try {
    // findMany() = mengambil banyak order
    const orders = await prisma.order.findMany({
      // Order terbaru ditampilkan terlebih dahulu
      orderBy: {
        createdAt: "desc",
      },

      // Mengambil relasi yang sudah didefinisikan
      // di orderInclude
      include: {
        ...orderInclude,
      },
    })

    // Kirim data order ke frontend
    res.status(200).json({
      data: orders,
    })

    // Kalau terjadi error di dalam try
  } catch (error) {
    // Tampilkan error di terminal
    console.error(error)

    // 500 = Internal Server Error
    res.status(500).json({
      message: "Failed to get orders",
    })
  }
}

// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder = async (req: AuthRequest, res: Response) => {
  // Validasi req.body menggunakan createOrderSchema
  //
  // req.body berisi data order yang dikirim frontend.
  const validation = createOrderSchema.safeParse(req.body)

  // Kalau validasi gagal
  if (!validation.success) {
    // 400 = Bad Request
    return res.status(400).json({
      message: "Validation error",

      // flatten() membuat error Zod lebih mudah dibaca
      errors: validation.error.flatten(),
    })
  }

  // Kalau validasi berhasil,
  // validation.data berisi data yang sudah lolos validasi.
  //
  // Destructuring digunakan untuk mengambil
  // customerId, vehicleId, dan items.
  const { customerId, vehicleId, items } = validation.data

  try {
    // ==================================================
    // CEK CUSTOMER, VEHICLE, DAN SERVICE
    // ==================================================

    // Ketiga query ini tidak saling bergantung,
    // jadi bisa dijalankan bersamaan menggunakan Promise.all().
    const [customer, vehicle, services] = await Promise.all([
      // Cari customer berdasarkan ID
      prisma.customer.findUnique({
        where: { id: customerId },
      }),

      // Cari vehicle berdasarkan ID
      prisma.vehicle.findUnique({
        where: { id: vehicleId },
      }),

      // Cari semua service yang dipilih
      prisma.service.findMany({
        where: {
          // "in" berarti ID service harus termasuk
          // dalam daftar service yang dipilih.
          //
          // items.map() mengambil semua serviceId
          // dari items.
          id: { in: items.map((item) => item.serviceId) },

          // Hanya service yang masih aktif
          // yang boleh digunakan untuk order.
          isActive: true,
        },
      }),
    ])

    // ==================================================
    // VALIDASI CUSTOMER
    // ==================================================

    // Kalau customer tidak ditemukan
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      })
    }

    // ==================================================
    // VALIDASI VEHICLE
    // ==================================================

    // Ada dua kemungkinan error:
    //
    // 1. vehicle tidak ditemukan
    // 2. vehicle ditemukan tetapi bukan milik customer
    //
    // vehicle.customerId !== customerId digunakan
    // untuk memastikan kendaraan memang milik customer
    // yang dipilih.
    if (!vehicle || vehicle.customerId !== customerId) {
      return res.status(400).json({
        message: "Vehicle does not belong to the selected customer",
      })
    }

    // ==================================================
    // VALIDASI SERVICE
    // ==================================================

    // Jumlah service yang ditemukan harus sama
    // dengan jumlah service yang dipilih user.
    //
    // Kalau berbeda berarti ada service yang:
    // - tidak ditemukan
    // - tidak aktif
    if (services.length !== items.length) {
      return res.status(400).json({
        message: "One or more selected services are unavailable",
      })
    }

    // ==================================================
    // MEMBUAT MAP SERVICE BERDASARKAN ID
    // ==================================================

    // Map digunakan supaya service bisa dicari
    // berdasarkan service.id dengan cepat.
    //
    // Contoh:
    // service ID 1 → object service
    // service ID 2 → object service
    const servicesById = new Map(
      services.map((service) => [service.id, service]),
    )

    // ==================================================
    // MEMBUAT ORDER ITEMS
    // ==================================================

    // map() digunakan untuk mengubah setiap item
    // dari request menjadi format yang akan disimpan
    // ke tabel OrderItem.
    const orderItems = items.map((item) => {
      // Ambil service berdasarkan serviceId
      // dari item yang sedang diproses.
      //
      // ! memberitahu TypeScript bahwa service
      // dianggap pasti ditemukan.
      const service = servicesById.get(item.serviceId)!

      // Harga dari Prisma Decimal dikonversi
      // menjadi JavaScript number.
      const price = Number(service.price)

      // Setiap item menghasilkan object OrderItem
      return {
        serviceId: service.id,

        // Jumlah service yang dipilih
        quantity: item.quantity,

        // Snapshot harga saat order dibuat.
        //
        // Ini penting karena harga Service
        // bisa berubah di masa depan.
        priceSnapshot: price,

        // Snapshot durasi saat order dibuat.
        durationSnapshot: service.duration,

        // Harga x jumlah
        subtotal: price * item.quantity,
      }
    })

    // ==================================================
    // HITUNG SUBTOTAL
    // ==================================================

    // reduce() digunakan untuk menjumlahkan
    // subtotal seluruh order item.
    //
    // sum = total sementara
    // item = item yang sedang diproses
    //
    // 0 adalah nilai awal sum.
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

    // ==================================================
    // HITUNG TOTAL DURASI
    // ==================================================

    // Menjumlahkan durasi seluruh service.
    //
    // durationSnapshot * quantity
    // berarti durasi service dikali jumlah service.
    const totalDuration = orderItems.reduce(
      (sum, item) => sum + item.durationSnapshot * item.quantity,
      0,
    )

    // ==================================================
    // SIMPAN ORDER
    // ==================================================

    const order = await prisma.order.create({
      data: {
        // Membuat kode order unik.
        //
        // Date.now() = timestamp saat ini
        //
        // randomUUID() = ID random
        //
        // slice(0, 8) = mengambil 8 karakter pertama
        //
        // toUpperCase() = mengubah menjadi huruf besar
        orderCode: `ORD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,

        customerId,
        vehicleId,

        // req.user berasal dari AuthRequest.
        //
        // ! digunakan karena kita menganggap
        // req.user sudah tersedia setelah middleware auth.
        //
        // userId digunakan untuk mencatat
        // siapa yang membuat order.
        createdById: req.user!.userId,

        // Total durasi semua service
        totalDuration,

        // Total harga sebelum pembayaran
        subtotal,

        // Untuk saat ini total sama dengan subtotal
        total: subtotal,

        // Nested create Prisma
        //
        // Artinya Order dibuat sekaligus
        // dengan OrderItem yang dimilikinya.
        orderItems: {
          create: orderItems,
        },
      },

      // Setelah order dibuat,
      // ambil juga data relasinya.
      include: orderInclude,
    })

    // 201 = resource berhasil dibuat
    return res.status(201).json({
      message: "Order created successfully",
      data: order,
    })
  } catch (error) {
    // Tampilkan error untuk debugging
    console.error(error)

    return res.status(500).json({
      message: "Failed to create order",
    })
  }
}

// ======================================================
// GET ORDER BY ID
// ======================================================

export const getOrderById = async (req: Request, res: Response) => {
  try {
    // Ambil ID dari URL.
    //
    // Contoh:
    // GET /orders/10
    //
    // req.params.id = "10"
    const { id } = req.params

    // Cari satu order berdasarkan ID
    const order = await prisma.order.findUnique({
      where: {
        // req.params berupa string,
        // sedangkan ID database berupa number.
        //
        // Number("10") → 10
        id: Number(id),
      },

      // Ambil juga semua relasi order
      include: {
        ...orderInclude,
      },
    })

    // Kalau order tidak ditemukan
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // Kirim order ke frontend
    res.status(200).json({
      data: order,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to get order",
    })
  }
}

// ======================================================
// UPDATE ORDER STATUS
// ======================================================

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    // Ambil ID order dari URL
    const { id } = req.params

    // Validasi body request
    //
    // Contohnya body:
    // { "status": "IN_PROGRESS" }
    const validation = updateOrderStatusSchema.safeParse(req.body)

    // Kalau status tidak sesuai schema
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid status",
        errors: validation.error.flatten(),
      })
    }

    // Ambil status yang sudah lolos validasi
    const { status } = validation.data

    // Cari order berdasarkan ID
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
    })

    // Kalau order tidak ditemukan
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // ==================================================
    // VALIDASI PERPINDAHAN STATUS
    // ==================================================

    // Kita tidak boleh membiarkan status berpindah
    // sembarangan.
    //
    // Status yang diperbolehkan:
    //
    // WAITING → IN_PROGRESS
    //
    // IN_PROGRESS → COMPLETED
    const validTransition =
      (order.status === "WAITING" && status === "IN_PROGRESS") ||
      (order.status === "IN_PROGRESS" && status === "COMPLETED")

    // Kalau perpindahan status tidak diperbolehkan
    if (!validTransition) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      })
    }

    // ==================================================
    // UPDATE STATUS
    // ==================================================

    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },

      data: {
        // Update status order
        status,

        // Kalau status berubah menjadi COMPLETED,
        // simpan waktu selesai.
        //
        // Kalau bukan COMPLETED,
        // completedAt tidak diubah.
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      },
    })

    return res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Failed to update order status",
    })
  }
}

// ======================================================
// RECORD PAYMENT
// ======================================================

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    // Ambil ID order dari URL
    const { id } = req.params

    // Validasi data pembayaran
    //
    // Contoh:
    // {
    //   amount: 50000,
    //   method: "CASH"
    // }
    const validation = paymentSchema.safeParse(req.body)

    // Kalau data pembayaran tidak valid
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      })
    }

    // Ambil amount dan method dari data yang sudah valid
    const { amount, method } = validation.data

    // Cari order sekaligus data payment-nya
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },

      // include payment supaya informasi payment
      // yang berhubungan dengan order ikut diambil
      include: { payment: true },
    })

    // Kalau order tidak ditemukan
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // Kalau order sudah dibayar,
    // jangan izinkan pembayaran kedua.
    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Order already paid",
      })
    }

    // ==================================================
    // VALIDASI JUMLAH PEMBAYARAN
    // ==================================================

    // Convert amount dari hasil schema
    // menjadi number.
    const orderAmount = Number(amount)

    // Convert Decimal Prisma menjadi number.
    const orderTotal = Number(order.total)

    // ==================================================
    // PEMBAYARAN CASH
    // ==================================================

    if (method === "CASH") {
      // Untuk CASH:
      //
      // uang yang diterima boleh lebih besar
      // dari total order.
      //
      // Contoh:
      // Total = 40.000
      // Uang = 50.000
      //
      // Valid karena nanti ada kembalian.
      if (orderAmount < orderTotal) {
        return res.status(400).json({
          message: `Uang pembayaran kurang. Total: Rp${orderTotal.toLocaleString("id-ID")}, Diterima: Rp${orderAmount.toLocaleString("id-ID")}`,
        })
      }
    } else {
      // ==================================================
      // TRANSFER / QRIS
      // ==================================================

      // Untuk TRANSFER dan QRIS,
      // jumlah pembayaran harus sama persis
      // dengan total order.
      if (orderAmount !== orderTotal) {
        return res.status(400).json({
          message: `Untuk ${method}, amount harus sama dengan order total (Rp${orderTotal})`,
        })
      }
    }

    // ==================================================
    // SIMPAN PAYMENT
    // ==================================================

    // Membuat record payment baru
    const payment = await prisma.payment.create({
      data: {
        // Hubungkan payment dengan order
        orderId: order.id,

        // Jumlah uang yang diterima
        amount: orderAmount,

        // Metode pembayaran
        //
        // as digunakan untuk memberitahu TypeScript
        // bahwa method merupakan salah satu dari
        // CASH | TRANSFER | QRIS.
        method: method as "CASH" | "TRANSFER" | "QRIS",

        // Simpan ID user yang menerima pembayaran
        receivedById: req.user!.userId,
      },
    })

    // ==================================================
    // UPDATE STATUS PEMBAYARAN ORDER
    // ==================================================

    // Setelah payment berhasil dibuat,
    // ubah paymentStatus order menjadi PAID.
    await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        paymentStatus: "PAID",
      },
    })

    // ==================================================
    // HITUNG KEMBALIAN
    // ==================================================

    // Kembalian hanya berlaku untuk CASH.
    //
    // Kalau CASH:
    // amount - total
    //
    // Kalau TRANSFER/QRIS:
    // 0
    const change = method === "CASH" ? orderAmount - orderTotal : 0

    return res.status(200).json({
      message: "Payment recorded successfully",

      data: {
        payment,

        // Order yang ditemukan sebelumnya
        order,

        // Jumlah kembalian
        change,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Failed to record payment",
    })
  }
}

// ======================================================
// UPDATE ORDER
// ======================================================

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    // Ambil ID order dari URL
    const { id } = req.params

    // Validasi data order yang baru
    const validation = createOrderSchema.safeParse(req.body)

    // Kalau data tidak valid
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      })
    }

    // Ambil data yang sudah lolos validasi
    const { customerId, vehicleId, items } = validation.data

    // Cari order yang ingin diubah
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
    })

    // Kalau order tidak ditemukan
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // ==================================================
    // HANYA ORDER WAITING YANG BOLEH DI-EDIT
    // ==================================================

    // Order yang sudah IN_PROGRESS atau COMPLETED
    // tidak boleh diubah lagi.
    if (order.status !== "WAITING") {
      return res.status(400).json({
        message: "Only WAITING orders can be edited",
      })
    }

    // ==================================================
    // VALIDASI CUSTOMER, VEHICLE, SERVICE
    // ==================================================

    // Ketiga query dijalankan bersamaan.
    const [customer, vehicle, services] = await Promise.all([
      // Cari customer
      prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      }),

      // Cari vehicle
      prisma.vehicle.findUnique({
        where: {
          id: vehicleId,
        },
      }),

      // Cari service yang dipilih
      prisma.service.findMany({
        where: {
          id: {
            in: items.map((item) => item.serviceId),
          },

          // Hanya service aktif
          isActive: true,
        },
      }),
    ])

    // Customer harus ditemukan
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      })
    }

    // Vehicle harus ditemukan
    // dan harus milik customer tersebut.
    if (!vehicle || vehicle.customerId !== customerId) {
      return res.status(400).json({
        message: "Vehicle does not belong to the selected customer",
      })
    }

    // Semua service yang dipilih harus tersedia
    if (services.length !== items.length) {
      return res.status(400).json({
        message: "One or more selected services are unavailable",
      })
    }

    // ==================================================
    // MEMBUAT MAP SERVICE
    // ==================================================

    // Supaya service bisa dicari berdasarkan ID
    const servicesById = new Map(
      services.map((service) => [service.id, service]),
    )

    // Membuat OrderItem baru berdasarkan
    // data service yang ditemukan.
    const orderItems = items.map((item) => {
      // Ambil service berdasarkan ID
      const service = servicesById.get(item.serviceId)!

      // Ubah harga Prisma Decimal menjadi number
      const price = Number(service.price)

      return {
        // ID service
        serviceId: service.id,

        // Jumlah service
        quantity: item.quantity,

        // Simpan harga saat order dibuat/diubah
        priceSnapshot: price,

        // Simpan durasi saat order dibuat/diubah
        durationSnapshot: service.duration,

        // Hitung subtotal item
        subtotal: price * item.quantity,
      }
    })

    // ==================================================
    // HITUNG ULANG TOTAL
    // ==================================================

    // Jumlahkan seluruh subtotal item
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

    // Jumlahkan seluruh durasi service
    const totalDuration = orderItems.reduce(
      (sum, item) => sum + item.durationSnapshot * item.quantity,
      0,
    )

    // ==================================================
    // HAPUS ORDER ITEM LAMA
    // ==================================================

    // Sebelum membuat OrderItem baru,
    // semua OrderItem lama dihapus terlebih dahulu.
    //
    // Setelah itu nanti dibuat OrderItem berdasarkan
    // data terbaru.
    await prisma.orderItem.deleteMany({
      where: {
        orderId: Number(id),
      },
    })

    // ==================================================
    // UPDATE ORDER
    // ==================================================

    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },

      data: {
        // Customer baru
        customerId,

        // Vehicle baru
        vehicleId,

        // Total durasi terbaru
        totalDuration,

        // Subtotal terbaru
        subtotal,

        // Total terbaru
        total: subtotal,

        // Buat kembali OrderItem berdasarkan
        // data terbaru.
        orderItems: {
          create: orderItems,
        },
      },

      // Setelah update, ambil semua relasi order
      include: orderInclude,
    })

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Failed to update order",
    })
  }
}

// ======================================================
// DELETE ORDER
// ======================================================

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    // Ambil ID dari URL
    const { id } = req.params

    // Cari order berdasarkan ID
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
    })

    // Kalau order tidak ditemukan
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // ==================================================
    // CEK STATUS ORDER
    // ==================================================

    // Hanya order WAITING yang boleh dihapus.
    //
    // Kalau sudah IN_PROGRESS atau COMPLETED,
    // penghapusan ditolak.
    if (order.status !== "WAITING") {
      return res.status(400).json({
        message: "Only WAITING orders can be deleted",
      })
    }

    // ==================================================
    // DELETE ORDER
    // ==================================================

    // Hapus order berdasarkan ID
    await prisma.order.delete({
      where: {
        id: Number(id),
      },
    })

    // Kirim response bahwa order berhasil dihapus
    return res.status(200).json({
      message: "Order deleted successfully",
    })
  } catch (error) {
    // Tampilkan error ke terminal
    console.error(error)

    // Kirim response error ke frontend
    return res.status(500).json({
      message: "Failed to delete order",
    })
  }
}
