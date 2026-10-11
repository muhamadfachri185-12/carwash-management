import { Request, Response } from "express"
import crypto from "crypto"
import { PaymentMethod, PaymentStatus } from "../generated/prisma/enums"
import { prisma } from "../lib/prisma"
import { getIO } from "../lib/socket"

// Controller untuk menerima notifikasi pembayaran dari Midtrans
export const midtransWebhook = async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      fraud_status,
    } = req.body

    // Pastikan konfigurasi server key tersedia
    const serverKey = process.env.MIDTRANS_SERVER_KEY

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is not configured")
      return res.status(500).json({
        message: "Midtrans configuration error",
      })
    }

    // Validasi data wajib dari notifikasi
    if (
      !order_id ||
      !status_code ||
      !gross_amount ||
      !signature_key ||
      !transaction_status
    ) {
      return res.status(400).json({
        message: "Incomplete Midtrans notification",
      })
    }

    // Buat signature berdasarkan format resmi Midtrans
    const signatureInput = `${order_id}${status_code}${gross_amount}${serverKey}`

    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureInput)
      .digest("hex")

    // Bandingkan signature dengan aman
    const receivedSignature = String(signature_key)

    const expectedBuffer = Buffer.from(expectedSignature)
    const receivedBuffer = Buffer.from(receivedSignature)

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(403).json({
        message: "Invalid Midtrans signature",
      })
    }

    // Cari order berdasarkan ID transaksi Midtrans
    const order = await prisma.order.findUnique({
      where: {
        midtransOrderId: String(order_id),
      },
      include: {
        payment: true,
      },
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // Pastikan nominal notifikasi sama dengan total order
    const notifiedAmount = Number(gross_amount)
    const orderAmount = Number(order.total)

    if (
      !Number.isFinite(notifiedAmount) ||
      Math.abs(notifiedAmount - orderAmount) > 0.01
    ) {
      return res.status(400).json({
        message: "Payment amount does not match order total",
      })
    }

    // Tentukan apakah transaksi sudah berhasil dibayar
    const isSuccessful =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")

    // Transaksi yang masih pending belum dianggap lunas
    if (transaction_status === "pending") {
      return res.status(200).json({
        message: "Payment is still pending",
      })
    }

    // Transaksi gagal atau dibatalkan tidak boleh ditandai lunas
    const isFailed =
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire" ||
      transaction_status === "failure"

    if (!isSuccessful && !isFailed) {
      return res.status(200).json({
        message: "Notification received; no payment update applied",
      })
    }

    // Transaksi berhasil: simpan status pembayaran secara atomik
    if (isSuccessful) {
      const method: PaymentMethod =
        payment_type === "qris"
          ? "QRIS"
          : payment_type === "bank_transfer" ||
              payment_type === "echannel" ||
              payment_type === "cstore"
            ? "TRANSFER"
            : "TRANSFER"

      await prisma.$transaction(async (tx) => {
        const latestOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { payment: true },
        })

        if (!latestOrder) {
          throw new Error("Order not found during payment update")
        }

        // Jika sudah lunas, notifikasi berulang tidak membuat pembayaran baru
        if (latestOrder.paymentStatus === PaymentStatus.PAID) {
          return
        }

        // Buat satu record payment untuk order ini
        await tx.payment.upsert({
          where: { orderId: latestOrder.id },
          create: {
            orderId: latestOrder.id,
            amount: latestOrder.total,
            method,
            paidAt: new Date(),
            receivedById: null,
          },
          update: {
            amount: latestOrder.total,
            method,
            paidAt: new Date(),
            receivedById: null,
          },
        })

        await tx.order.update({
          where: { id: latestOrder.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
          },
        })
      })

      // Ambil instance socket.io yang aktif
      const io = getIO()

      // Kirim notification ke customer pemilik order
      io.to(`customer:${order.customerId}`).emit("payment:updated", {
        orderId: order.id,
        paymentStatus: "PAID",
      })

      // Kirim notifikasi ke dashboard admin
      io.emit("payment:updated", {
        orderId: order.id,
        paymentStatus: "PAID",
      })
    }

    // Untuk transaksi gagal, jangan mengubah order menjadi PAID.
    // Order tetap UNPAID agar customer dapat mencoba pembayaran lagi.
    return res.status(200).json({
      message: isSuccessful ? "Payment confirmed" : "Payment failed or expired",
    })
  } catch (error) {
    console.error("Midtrans webhook error:", error)

    return res.status(500).json({
      message: "Failed to process Midtrans notification",
    })
  }
}
