import { useState } from "react"
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { CustomerOrder } from "../types/order.types"

import {
  formatOrderDate,
  formatOrderPrice,
  getPaymentStatusClass,
  getPaymentStatusLabel,
} from "@/features/orders/utils/order.utils"

import { createSnapTransaction } from "../api/orderApi"

interface OrderPaymentInfoProps {
  order: CustomerOrder
}

export default function OrderPaymentInfo({ order }: OrderPaymentInfoProps) {
  const [isPaying, setIsPaying] = useState(false)
  const [message, setMessage] = useState("")

  const isPaid = order.paymentStatus === "PAID"

  const handlePayment = async () => {
    try {
      setIsPaying(true)
      setMessage("")

      if (!window.snap) {
        throw new Error(
          "Midtrans belum dimuat. Silakan refresh halaman dan coba lagi.",
        )
      }

      const result = await createSnapTransaction(order.id)

      window.snap.pay(result.snap_token, {
        onSuccess: () => {
          setMessage(
            "Pembayaran berhasil diproses. Menunggu konfirmasi dari server.",
          )
          setIsPaying(false)
        },
        onPending: () => {
          setMessage("Pembayaran masih menunggu penyelesaian.")
          setIsPaying(false)
        },
        onError: () => {
          setMessage("Pembayaran gagal diproses. Silakan coba lagi.")
          setIsPaying(false)
        },
        onClose: () => {
          setMessage(
            "Popup pembayaran ditutup. Kamu bisa mencoba membayar lagi.",
          )
          setIsPaying(false)
        },
      })
    } catch (error: unknown) {
      console.error("Gagal membuat transaksi Midtrans:", error)

      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyiapkan pembayaran.",
      )

      setIsPaying(false)
    }
  }

  return (
    <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-sm'>
      <CardContent className='p-4'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
            <CreditCard className='size-5' />
          </div>

          <div className='flex-1'>
            <h2 className='font-semibold text-slate-900'>Pembayaran</h2>
            <p className='text-xs text-slate-500'>
              Informasi pembayaran pesanan
            </p>
          </div>

          {isPaid && <CheckCircle2 className='size-5 text-green-600' />}
        </div>

        <div className='rounded-xl bg-[#F3F7FF] p-4'>
          <p className='text-xs text-slate-500'>Total Pembayaran</p>

          <p className='mt-1 text-2xl font-bold tracking-tight text-[#3579D3]'>
            {formatOrderPrice(order.total)}
          </p>

          <div className='mt-3 flex items-center justify-between gap-3'>
            <span className='text-sm text-slate-500'>Status</span>

            <Badge
              variant='outline'
              className={`border-0 ${getPaymentStatusClass(order.paymentStatus)}`}
            >
              {getPaymentStatusLabel(order.paymentStatus)}
            </Badge>
          </div>
        </div>

        {order.payment && (
          <div className='mt-4 space-y-3'>
            <div className='flex items-center justify-between gap-3 text-sm'>
              <span className='text-slate-500'>Metode Pembayaran</span>
              <span className='font-medium text-slate-800'>
                {order.payment.method}
              </span>
            </div>

            <div className='flex items-center justify-between gap-3 text-sm'>
              <span className='text-slate-500'>Jumlah Dibayar</span>
              <span className='font-semibold text-slate-800'>
                {formatOrderPrice(order.payment.amount)}
              </span>
            </div>

            {order.payment.paidAt && (
              <div className='flex items-center justify-between gap-3 text-sm'>
                <span className='text-slate-500'>Tanggal Pembayaran</span>
                <span className='text-right font-medium text-slate-800'>
                  {formatOrderDate(order.payment.paidAt)}
                </span>
              </div>
            )}
          </div>
        )}

        {!isPaid && order.status !== "CANCELLED" && (
          <div className='mt-4 space-y-3'>
            <Button
              type='button'
              className='h-12 w-full rounded-xl bg-[#4F8FEF] font-semibold text-white shadow-sm hover:bg-blue-600'
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <LoaderCircle className='mr-2 size-4 animate-spin' />
                  Menyiapkan Pembayaran...
                </>
              ) : (
                <>
                  <ShieldCheck className='mr-2 size-4' />
                  Bayar Sekarang
                </>
              )}
            </Button>

            <p className='text-center text-xs leading-relaxed text-slate-500'>
              Pembayaran diproses melalui Midtrans Snap.
            </p>
          </div>
        )}

        {isPaid && (
          <div className='mt-4 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700'>
            <CheckCircle2 className='mt-0.5 size-4 shrink-0' />
            <p>Pembayaran pesanan ini sudah dikonfirmasi.</p>
          </div>
        )}

        {message && (
          <p
            role='status'
            aria-live='polite'
            className='mt-3 rounded-xl bg-blue-50 p-3 text-sm leading-relaxed text-blue-700'
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
