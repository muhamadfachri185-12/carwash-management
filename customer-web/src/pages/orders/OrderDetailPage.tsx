import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CarFront,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  CreditCard,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { getCustomerOrderById } from "@/features/orders/api/orderApi"
import type {
  CustomerOrder,
  OrderStatus,
} from "@/features/orders/types/order.types"

import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge"
import OrderItemList from "@/features/orders/components/OrderItemList"
import OrderPaymentInfo from "@/features/orders/components/OrderPaymentInfo"

import {
  formatOrderDate,
  formatOrderPrice,
  getPaymentStatusLabel,
} from "@/features/orders/utils/order.utils"

import socket from "@/lib/socket"

const progressSteps: {
  title: string
  description: string
  status: OrderStatus
}[] = [
  {
    title: "Pesanan Dibuat",
    description: "Pesanan berhasil tercatat di sistem.",
    status: "WAITING",
  },
  {
    title: "Menunggu Giliran",
    description: "Pesanan menunggu proses pengerjaan.",
    status: "WAITING",
  },
  {
    title: "Kendaraan Sedang Dicuci",
    description: "Kendaraan sedang dalam proses pengerjaan.",
    status: "IN_PROGRESS",
  },
  {
    title: "Pencucian Selesai",
    description: "Proses pencucian kendaraan telah selesai.",
    status: "COMPLETED",
  },
]

function getProgressStep(status: OrderStatus) {
  switch (status) {
    case "WAITING":
      return 1
    case "IN_PROGRESS":
      return 2
    case "COMPLETED":
      return 3
    case "CANCELLED":
      return -1
    default:
      return 0
  }
}

function OrderProgressTracker({ order }: { order: CustomerOrder }) {
  const currentStep = getProgressStep(order.status)
  const isCancelled = order.status === "CANCELLED"
  const progressPercent =
    currentStep < 0 ? 0 : Math.round((currentStep / 3) * 100)

  const steps = [
    {
      title: "Pesanan Dibuat",
      description: "Pesanan tercatat di sistem.",
      date: order.createdAt,
      completed: true,
    },
    {
      title: "Menunggu Giliran",
      description: "Pesanan menunggu proses pengerjaan.",
      date: null,
      completed: currentStep >= 1 && !isCancelled,
    },
    {
      title: "Kendaraan Sedang Dicuci",
      description: "Pesanan sedang dikerjakan oleh petugas.",
      date: null,
      completed: currentStep >= 2 && !isCancelled,
    },
    {
      title: "Pencucian Selesai",
      description: "Seluruh proses pencucian telah selesai.",
      date: order.completedAt,
      completed: order.status === "COMPLETED",
    },
  ]

  return (
    <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-sm'>
      <CardContent className='p-5'>
        <div className='mb-5 flex items-center justify-between gap-3'>
          <div>
            <h2 className='font-semibold text-slate-900'>Progres Pesanan</h2>
            <p className='mt-1 text-xs text-slate-500'>
              Pantau status pencucian kendaraanmu
            </p>
          </div>

          {!isCancelled && (
            <span className='shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600'>
              {progressPercent}%
            </span>
          )}
        </div>

        {isCancelled ? (
          <div className='rounded-xl border border-red-100 bg-red-50 p-4'>
            <p className='font-semibold text-red-700'>Pesanan dibatalkan</p>
            <p className='mt-1 text-sm text-red-600'>
              Pesanan ini sudah berstatus dibatalkan.
            </p>
          </div>
        ) : (
          <>
            <div className='mb-6 h-2 overflow-hidden rounded-full bg-blue-50'>
              <div
                className='h-full rounded-full bg-[#4F8FEF] transition-all duration-500'
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className='space-y-5'>
              {steps.map((step, index) => {
                const isCurrent =
                  !step.completed &&
                  ((order.status === "WAITING" && index === 1) ||
                    (order.status === "IN_PROGRESS" && index === 2))

                return (
                  <div key={step.title} className='relative flex gap-3'>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-8 h-[calc(100%+4px)] w-0.5 ${
                          step.completed ? "bg-blue-400" : "bg-slate-100"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${
                        step.completed
                          ? "bg-[#4F8FEF] text-white"
                          : isCurrent
                            ? "bg-blue-50 text-blue-600 ring-4 ring-blue-50"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.completed ? (
                        <Check className='size-4' />
                      ) : (
                        <span className='text-xs font-bold'>{index + 1}</span>
                      )}
                    </div>

                    <div className='min-w-0 flex-1 pb-1'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <p
                          className={`text-sm font-semibold ${
                            step.completed || isCurrent
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </p>

                        {step.date && (
                          <span className='text-[11px] text-slate-400'>
                            {formatOrderDate(step.date)}
                          </span>
                        )}
                      </div>

                      <p className='mt-1 text-xs leading-relaxed text-slate-500'>
                        {step.description}
                      </p>

                      {isCurrent && (
                        <span className='mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600'>
                          <Clock3 className='size-3' />
                          Status saat ini
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!id || !Number.isFinite(Number(id))) {
      setError("ID pesanan tidak valid.")
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      setError("")

      const data = await getCustomerOrderById(Number(id))
      setOrder(data)
    } catch (err) {
      console.error("Failed to fetch customer order:", err)
      setError("Gagal mengambil detail pesanan. Silakan coba lagi.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    setLoading(true)
    void fetchOrder()
  }, [fetchOrder])

  useEffect(() => {
    const handleOrderStatusUpdated = (data: {
      orderId: number
      status: CustomerOrder["status"]
      completedAt: string | null
    }) => {
      if (data.orderId !== Number(id)) return

      setOrder((current) => {
        if (!current) return current

        return {
          ...current,
          status: data.status,
          completedAt: data.completedAt,
        }
      })
    }

    socket.on("order:status-updated", handleOrderStatusUpdated)

    return () => {
      socket.off("order:status-updated", handleOrderStatusUpdated)
    }
  }, [id])

  useEffect(() => {
    const handlePaymentUpdated = (data: {
      orderId: number
      paymentStatus: CustomerOrder["paymentStatus"]
    }) => {
      if (data.orderId !== Number(id)) return
      void fetchOrder()
    }

    socket.on("payment:updated", handlePaymentUpdated)

    return () => {
      socket.off("payment:updated", handlePaymentUpdated)
    }
  }, [id, fetchOrder])

  const handleRefresh = () => {
    setRefreshing(true)
    void fetchOrder()
  }

  const handleCopyOrderCode = async () => {
    if (!order) return

    try {
      await navigator.clipboard.writeText(order.orderCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError("Kode pesanan tidak dapat disalin dari browser ini.")
    }
  }

  if (loading) {
    return (
      <div className='space-y-4 bg-[#F3F7FF] px-4 py-6 pb-24'>
        <div className='h-10 w-40 animate-pulse rounded-lg bg-blue-100' />
        <div className='h-32 animate-pulse rounded-2xl bg-white' />
        <div className='h-64 animate-pulse rounded-2xl bg-white' />
        <div className='h-40 animate-pulse rounded-2xl bg-white' />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='space-y-4 bg-[#F3F7FF] px-4 py-6 pb-24'>
        <Button
          variant='ghost'
          className='-ml-3'
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className='mr-2 size-4' />
          Kembali ke Pesanan
        </Button>

        <Alert variant='destructive'>
          <AlertDescription>
            {error || "Pesanan tidak ditemukan."}
          </AlertDescription>
        </Alert>

        <Button
          className='w-full rounded-xl bg-[#4F8FEF] hover:bg-blue-600'
          onClick={() => {
            setLoading(true)
            void fetchOrder()
          }}
        >
          <RefreshCw className='mr-2 size-4' />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className='min-h-full space-y-4 bg-[#F3F7FF] px-4 py-5 pb-28'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Kembali ke pesanan'
          className='size-10 shrink-0 rounded-xl bg-white text-slate-700 shadow-sm hover:bg-blue-50'
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className='size-5' />
        </Button>

        <div className='min-w-0 flex-1'>
          <h1 className='text-xl font-bold tracking-tight text-slate-900'>
            Detail Pesanan
          </h1>
          <p className='mt-0.5 text-xs text-slate-500'>
            Dibuat {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <Button
          variant='ghost'
          size='icon'
          aria-label='Muat ulang detail pesanan'
          className='size-10 shrink-0 rounded-xl bg-white text-slate-600 shadow-sm hover:bg-blue-50'
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Order code */}
      <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-sm'>
        <CardContent className='flex items-center gap-3 p-4'>
          <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
            <ClipboardList className='size-5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-xs text-slate-500'>Kode Pesanan</p>
            <p className='mt-1 break-all font-bold text-slate-900'>
              {order.orderCode}
            </p>
          </div>

          <Button
            variant='ghost'
            size='icon'
            aria-label='Salin kode pesanan'
            className='size-9 shrink-0 rounded-lg text-blue-600 hover:bg-blue-50'
            onClick={handleCopyOrderCode}
          >
            {copied ? (
              <Check className='size-4' />
            ) : (
              <Copy className='size-4' />
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className='rounded-2xl border-0 bg-white shadow-sm'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='min-w-0 rounded-xl bg-[#F3F7FF] p-3'>
              <div className='mb-2 flex items-center gap-1.5 text-xs text-slate-500'>
                <CarFront className='size-4 text-blue-500' />
                Status Pesanan
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className='min-w-0 rounded-xl bg-[#F3F7FF] p-3'>
              <div className='mb-2 flex items-center gap-1.5 text-xs text-slate-500'>
                <CreditCard className='size-4 text-blue-500' />
                Status Pembayaran
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracker from actual backend status */}
      <OrderProgressTracker order={order} />

      {/* Vehicle */}
      <Card className='rounded-2xl border-0 bg-white shadow-sm'>
        <CardContent className='p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
              <CarFront className='size-5' />
            </div>
            <h2 className='font-semibold text-slate-900'>Kendaraan</h2>
          </div>

          <div className='flex items-center gap-3 rounded-xl bg-[#F3F7FF] p-3'>
            <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500'>
              <CarFront className='size-6' />
            </div>

            <div className='min-w-0 flex-1'>
              <p className='truncate font-semibold text-slate-900'>
                {order.vehicle.brand} {order.vehicle.model}
              </p>
              <p className='mt-1 inline-flex rounded-md bg-white px-2 py-1 text-xs font-bold tracking-wider text-slate-700'>
                {order.vehicle.plateNumber}
              </p>
            </div>
          </div>

          <div className='mt-3 flex items-center justify-between gap-3 text-sm'>
            <span className='text-slate-500'>Check-in</span>
            <span className='text-right font-medium text-slate-700'>
              {formatOrderDate(order.checkInTime)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card className='rounded-2xl border-0 bg-white shadow-sm'>
        <CardContent className='p-4'>
          <div className='mb-4 flex items-center gap-2'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
              <Sparkles className='size-5' />
            </div>
            <div>
              <h2 className='font-semibold text-slate-900'>
                Layanan yang Dipilih
              </h2>
              <p className='text-xs text-slate-500'>
                {order.orderItems.length} item layanan
              </p>
            </div>
          </div>

          <OrderItemList items={order.orderItems} />

          <div className='mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4'>
            <div className='flex items-center justify-between gap-3 text-sm'>
              <span className='text-slate-500'>Subtotal</span>
              <span className='font-medium text-slate-700'>
                {formatOrderPrice(order.subtotal)}
              </span>
            </div>

            <div className='flex items-center justify-between gap-3 rounded-xl bg-blue-50 p-3'>
              <span className='font-semibold text-slate-800'>
                Total Pesanan
              </span>
              <span className='text-lg font-bold text-[#3579D3]'>
                {formatOrderPrice(order.total)}
              </span>
            </div>

            <p className='text-right text-xs text-slate-500'>
              Estimasi durasi layanan: {order.totalDuration} menit
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Existing Midtrans payment flow */}
      <OrderPaymentInfo order={order} />

      <Button
        variant='outline'
        className='w-full rounded-xl border-blue-100 bg-white text-slate-700 hover:bg-blue-50'
        onClick={() => navigate("/orders")}
      >
        <ArrowLeft className='mr-2 size-4' />
        Kembali ke Daftar Pesanan
      </Button>
    </div>
  )
}
