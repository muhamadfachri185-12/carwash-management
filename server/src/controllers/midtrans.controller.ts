import { Response } from "express"
import { prisma } from "../lib/prisma"
import snap from "../lib/midtrans"
import { AuthRequest } from "../middleware/auth.middleware"

// Membuat transaksi pembayaran Midtrans untuk order customer.
export const createSnapTransaction = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    // ID order diambil dari URL, misalnya /orders/12/pay.
    const orderId = Number(req.params.orderId)

    // Pastikan ID berupa angka yang valid.
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      })
    }

    // Pastikan customer sudah login.
    if (!req.user || req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        message: "Customer access required",
      })
    }

    // Cari order sekaligus data customer dan item layanannya.
    // Pengecekan userId memastikan order milik customer yang login.
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customer: {
          userId: req.user.userId,
        },
      },
      include: {
        orderItems: {
          include: {
            service: true,
          },
        },
        customer: true,
        vehicle: true,
      },
    })

    // Order tidak ditemukan atau bukan milik customer ini.
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // Jangan buat transaksi baru untuk order yang sudah lunas.
    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "This order has already been paid",
      })
    }

    // Cek konfigurasi Midtrans agar error-nya jelas.
    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
      return res.status(500).json({
        message: "Midtrans keys are not configured",
      })
    }

    // Gunakan ID transaksi yang stabil untuk order ini.
    // Jika endpoint dipanggil lagi, referensi order tetap sama.
    // Buat ID transaksi unik setiap kali customer mencoba membayar lagi.
    // Contoh: CARWASH-7-1791642000000
    const midtransOrderId = `CARWASH-${order.id}-${Date.now()}`

    // Midtrans membutuhkan nominal integer dalam rupiah.
    const grossAmount = Number(order.total)

    if (!Number.isSafeInteger(grossAmount) || grossAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order total",
      })
    }

    // Susun rincian layanan berdasarkan snapshot order.
    const itemDetails = order.orderItems.map((item) => ({
      id: String(item.serviceId),
      price: Number(item.priceSnapshot),
      quantity: item.quantity,
      name: item.service.name.slice(0, 50),
    }))

    const itemDetailsTotal = itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    )

    if (itemDetailsTotal !== grossAmount) {
      return res.status(400).json({
        message: "Order items total does not match order total",
      })
    }

    // Minta Midtrans membuat transaksi Snap.
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: order.customer.name,
        email: req.user.userId
          ? ((
              await prisma.user.findUnique({
                where: { id: req.user.userId },
                select: { email: true },
              })
            )?.email ?? "")
          : "",
        phone: order.customer.phone,
      },
    })

    // Simpan referensi transaksi dan token Snap.
    // Status pembayaran tetap UNPAID.
    await prisma.order.update({
      where: { id: order.id },
      data: {
        midtransOrderId,
        snaptoken: transaction.token,
      },
    })

    // Kirim URL pembayaran ke frontend.
    return res.status(200).json({
      message: "Midtrans transaction created",
      redirect_url: transaction.redirect_url,
      snap_token: transaction.token,
    })
  } catch (error) {
    console.error("Create Midtrans transaction error:", error)

    return res.status(500).json({
      message: "Failed to create Midtrans transaction",
    })
  }
}
