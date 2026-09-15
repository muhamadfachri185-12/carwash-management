import { Request, Response } from "express"
import { prisma } from "../lib/prisma"

// ======================================================
// GET DASHBOARD
// ======================================================

// Endpoint untuk mengambil seluruh data yang dibutuhkan
// oleh halaman Dashboard.
export const getDashboard = async (_req: Request, res: Response) => {
  // try digunakan untuk menangani kemungkinan error
  // yang terjadi selama proses mengambil data dari database.
  try {
    // Promise.all() digunakan untuk menjalankan beberapa
    // query secara bersamaan.
    //
    // Daripada:
    // query 1 selesai → query 2 → query 3 → query 4
    //
    // Promise.all():
    // query 1
    // query 2    → berjalan bersamaan
    // query 3
    // query 4
    //
    // Hasilnya berupa array yang kemudian
    // langsung di-destructuring.
    const [waiting, inProgress, completed, unpaid] = await Promise.all([
      // count() = menghitung jumlah data
      // yang memenuhi kondisi tertentu.
      prisma.order.count({
        where: { status: "WAITING" },
      }),

      // Menghitung jumlah order yang sedang dikerjakan.
      prisma.order.count({
        where: { status: "IN_PROGRESS" },
      }),

      // Menghitung jumlah order yang sudah selesai.
      prisma.order.count({
        where: { status: "COMPLETED" },
      }),

      // Menghitung jumlah order yang belum dibayar.
      prisma.order.count({
        where: { paymentStatus: "UNPAID" },
      }),
    ])

    // ======================================================
    // MENGHITUNG AWAL HARI
    // ======================================================

    // Membuat object Date yang berisi tanggal dan waktu sekarang.
    const today = new Date()

    // Mengubah waktu menjadi 00:00:00.000
    //
    // Jadi "today" sekarang merepresentasikan
    // awal hari ini.
    today.setHours(0, 0, 0, 0)

    // Membuat salinan dari object today.
    //
    // new Date(today) digunakan agar kita tidak
    // mengubah object "today" secara langsung.
    const startOfWeek = new Date(today)

    // ======================================================
    // PERHITUNGAN MENDAPATKAN AWAL WEEK
    // ======================================================

    // getDay() mengambil hari dalam bentuk angka:
    //
    // 0 = Minggu
    // 1 = Senin
    // 2 = Selasa
    // 3 = Rabu
    // 4 = Kamis
    // 5 = Jumat
    // 6 = Sabtu
    const dayOfWeek = startOfWeek.getDay()

    // Menghitung berapa hari yang harus dikurangi
    // supaya mendapatkan hari Senin.
    //
    // Kalau hari ini Minggu (0):
    // harus mundur 6 hari → Senin
    //
    // Kalau hari ini Senin (1):
    // mundur 0 hari
    //
    // Kalau hari ini Selasa (2):
    // mundur 1 hari
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    // Mundurkan tanggal sebanyak diffToMonday.
    //
    // getDate() = mengambil tanggal
    // setDate() = mengubah tanggal
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday)

    // Pastikan waktu kembali ke awal hari.
    startOfWeek.setHours(0, 0, 0, 0)

    // ======================================================
    // PERHITUNGAN MENDAPATKAN AWAL MONTH
    // ======================================================

    // getFullYear() = mengambil tahun
    // getMonth() = mengambil bulan
    //
    // Perhatikan:
    // getMonth() dimulai dari 0.
    //
    // 0 = Januari
    // 1 = Februari
    // ...
    // 11 = Desember
    //
    // Angka 1 pada parameter terakhir berarti
    // tanggal pertama bulan tersebut.
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Set waktu menjadi 00:00:00
    startOfMonth.setHours(0, 0, 0, 0)

    // ======================================================
    // PERHITUNGAN MENDAPATKAN AWAL YEAR
    // ======================================================

    // Bulan 0 = Januari
    //
    // Jadi:
    // new Date(2026, 0, 1)
    //
    // berarti:
    // 1 Januari 2026
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    // Set waktu menjadi awal hari.
    startOfYear.setHours(0, 0, 0, 0)

    // ======================================================
    // REVENUE SUMMARY
    // ======================================================

    // Mengambil total revenue:
    // - hari ini
    // - minggu ini
    // - bulan ini
    // - tahun ini
    //
    // Lagi-lagi Promise.all digunakan supaya
    // keempat query berjalan secara bersamaan.
    const [revenueToday, revenueWeek, revenueMonth, revenueYear] =
      await Promise.all([
        // ==================================================
        // REVENUE TODAY
        // ==================================================

        // aggregate() digunakan untuk melakukan
        // perhitungan terhadap sekumpulan data.
        //
        // _sum.total berarti:
        // jumlahkan semua nilai "total".
        prisma.order.aggregate({
          where: {
            // Hanya order yang sudah dibayar.
            paymentStatus: "PAID",

            // Hanya order mulai dari awal hari ini.
            checkInTime: { gte: today },
          },

          _sum: { total: true },
        }),

        // ==================================================
        // REVENUE WEEK
        // ==================================================

        prisma.order.aggregate({
          where: {
            // Hanya order yang sudah dibayar.
            paymentStatus: "PAID",

            // Mulai dari awal minggu.
            gte: startOfWeek,
          },

          _sum: { total: true },
        }),

        // ==================================================
        // REVENUE MONTH
        // ==================================================

        prisma.order.aggregate({
          where: {
            // Hanya order yang sudah dibayar.
            paymentStatus: "PAID",

            // Mulai dari awal bulan.
            gte: startOfMonth,
          },

          _sum: { total: true },
        }),

        // ==================================================
        // REVENUE YEAR
        // ==================================================

        prisma.order.aggregate({
          where: {
            // Hanya order yang sudah dibayar.
            paymentStatus: "PAID",

            // Mulai dari awal tahun.
            gte: startOfYear,
          },

          _sum: { total: true },
        }),
      ])

    // ======================================================
    // ORDER STATUS REPORT BY DATE
    // ======================================================

    // groupBy() digunakan untuk mengelompokkan data.
    //
    // by: ["status"]
    //
    // Artinya order dikelompokkan berdasarkan status:
    //
    // WAITING
    // IN_PROGRESS
    // COMPLETED
    const orderStatusReport = await prisma.order.groupBy({
      by: ["status"],

      where: {
        // Hanya mengambil order yang dibuat
        // mulai dari hari ini.
        createdAt: {
          // gte = greater than or equal
          // Artinya >= tanggal awal hari ini.
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),

          // lt = less than
          // Artinya < awal hari berikutnya.
          //
          // Dengan menggunakan batas atas seperti ini,
          // kita mendapatkan seluruh order hari ini.
          lt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1,
          ),
        },
      },

      // Menghitung jumlah ID pada setiap group.
      _count: { id: true },
    })

    // ======================================================
    // DEFAULT REPORT DATA
    // ======================================================

    // Membuat object awal dengan nilai 0.
    //
    // Ini berguna supaya response API selalu memiliki
    // tiga status tersebut.
    //
    // Misalnya hari ini tidak ada order WAITING,
    // tetap akan menghasilkan:
    //
    // WAITING: 0
    const reportData = {
      WAITING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    }

    // forEach() digunakan untuk melakukan sesuatu
    // terhadap setiap item di dalam array.
    orderStatusReport.forEach((item) => {
      // "in" digunakan untuk mengecek apakah
      // sebuah property ada di dalam object.
      //
      // Contoh:
      // "WAITING" in reportData → true
      if (item.status in reportData) {
        // Mengambil property reportData berdasarkan
        // status yang didapat dari database.
        //
        // keyof typeof reportData digunakan TypeScript
        // untuk memastikan key yang digunakan
        // memang merupakan key dari reportData.
        //
        // Contoh:
        // reportData["WAITING"] = 5
        reportData[item.status as keyof typeof reportData] = item._count.id
      }
    })

    // ======================================================
    // RECENT ORDERS
    // ======================================================

    // Mengambil 10 order terbaru.
    const recentOrders = await prisma.order.findMany({
      // Hanya mengambil 10 data.
      take: 10,

      // Urutkan berdasarkan createdAt terbaru.
      orderBy: { createdAt: "desc" },

      // include digunakan untuk mengambil
      // data dari relasi yang berhubungan dengan Order.
      include: {
        // Dari Order, ambil data Customer.
        //
        // select digunakan agar hanya field name
        // yang diambil.
        customer: {
          select: {
            name: true,
          },
        },

        // Dari Order, ambil data Vehicle.
        //
        // Hanya mengambil plateNumber, brand, dan model.
        vehicle: {
          select: {
            plateNumber: true,
            brand: true,
            model: true,
          },
        },
      },
    })

    // ======================================================
    // RESPONSE KE FRONTEND
    // ======================================================

    res.status(200).json({
      data: {
        // Jumlah order berdasarkan status.
        waiting,
        inProgress,
        completed,

        // Jumlah order yang belum dibayar.
        unpaid,

        // ==================================================
        // REVENUE SUMMARY
        // ==================================================

        // Prisma Decimal perlu dikonversi menjadi Number
        // supaya frontend menerima angka biasa.
        //
        // || 0
        // digunakan sebagai fallback kalau hasil _sum.total
        // bernilai null.
        revenueToday: Number(revenueToday._sum.total || 0),
        revenueWeek: Number(revenueWeek._sum.total || 0),
        revenueMonth: Number(revenueMonth._sum.total || 0),
        revenueYear: Number(revenueYear._sum.total || 0),

        // ==================================================
        // ORDER STATUS REPORT BY TODAY'S DATE
        // ==================================================

        // reportData berisi jumlah order:
        // WAITING
        // IN_PROGRESS
        // COMPLETED
        orderStatusReport: reportData,

        // ==================================================
        // RECENT ORDERS
        // ==================================================

        // map() digunakan untuk mengubah setiap object
        // order menjadi format data yang lebih sederhana
        // untuk dikirim ke frontend.
        recentOrders: recentOrders.map((order) => ({
          // ID order
          id: order.id,

          // Kode order
          orderCode: order.orderCode,

          // name berasal dari relasi customer
          customerName: order.customer.name,

          // plateNumber berasal dari relasi vehicle
          vehiclePlate: order.vehicle.plateNumber,

          // Informasi kendaraan
          vehicleBrand: order.vehicle.brand,
          vehicleModel: order.vehicle.model,

          // Konversi Decimal Prisma menjadi Number
          total: Number(order.total),

          // Status pembayaran
          paymentStatus: order.paymentStatus,

          // Status order
          status: order.status,

          // Waktu order dibuat
          createdAt: order.createdAt,
        })),
      },
    })

    // ======================================================
    // ERROR HANDLING
    // ======================================================
  } catch (error) {
    // Menampilkan detail error di terminal/server console
    // agar developer bisa mengetahui penyebab error.
    console.error(error)

    // 500 = Internal Server Error
    //
    // Digunakan ketika terjadi error di sisi server.
    res.status(500).json({
      message: "Failed to get dashboard",
    })
  }
}
