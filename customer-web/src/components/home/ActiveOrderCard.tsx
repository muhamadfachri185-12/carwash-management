import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Clock3, Droplets } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { getCustomerOrders } from "@/features/orders/api/orderApi"
import type {
  CustomerOrder,
  OrderStatus,
} from "@/features/orders/types/order.types"

function ActiveOrderCard() {
  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchActiveOrder = async () => {
      try {
        const orders = await getCustomerOrders()

        const activeOrder =
          orders.find(
            (item) =>
              item.status === "IN_PROGRESS" || item.status === "WAITING",
          ) ?? null

        if (mounted) {
          setOrder(activeOrder)
        }
      } catch (error) {
        console.error("Gagal mengambil order aktif:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchActiveOrder()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <section className='space-y-3'>
        <h2 className='font-semibold text-slate-900'>Order Aktif</h2>

        <Card className='rounded-2xl border-0 shadow-sm'>
          <CardContent className='space-y-3 p-4'>
            <div className='h-4 w-32 animate-pulse rounded bg-slate-100' />
            <div className='h-3 w-48 animate-pulse rounded bg-slate-100' />
            <div className='h-2 w-full animate-pulse rounded bg-slate-100' />
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='font-semibold text-slate-900'>Order Aktif</h2>

          {order && (
            <span className='h-2 w-2 animate-pulse rounded-full bg-[#4F8FEF]' />
          )}
        </div>

        <Link
          to='/orders'
          className='flex items-center gap-1 text-sm font-medium text-[#397DDE]'
        >
          Lihat semua
          <ArrowRight className='h-4 w-4' />
        </Link>
      </div>

      {order ? (
        <ActiveOrderContent order={order} />
      ) : (
        <Card className='rounded-2xl border-0 bg-white shadow-sm'>
          <CardContent className='flex flex-col items-center px-5 py-6 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#4F8FEF]'>
              <Droplets className='h-6 w-6' />
            </div>

            <h3 className='mt-3 font-semibold text-slate-900'>
              Belum ada order aktif
            </h3>

            <p className='mt-1 max-w-[260px] text-sm leading-5 text-slate-500'>
              Kendaraanmu siap untuk dicuci? Scan QR di outlet untuk memulai
              pesanan baru.
            </p>

            <Link to='/scan' className='mt-4 block w-full'>
              <Button className='h-10 w-full rounded-xl bg-[#4F8FEF] hover:bg-blue-600'>
                Mulai Order
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function ActiveOrderContent({ order }: { order: CustomerOrder }) {
  const isWaiting = order.status === "WAITING"
  const isInProgress = order.status === "IN_PROGRESS"

  const statusLabel: Record<OrderStatus, string> = {
    WAITING: "Menunggu",
    IN_PROGRESS: "Sedang Dicuci",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  }

  const progress = isWaiting ? 1 : isInProgress ? 2 : 3

  const steps = [
    { label: "Pesanan Dibuat", completed: true },
    { label: "Menunggu", completed: progress >= 2 },
    { label: "Sedang Dicuci", completed: progress >= 3 },
  ]

  return (
    <Card className='rounded-2xl border-0 bg-white shadow-sm'>
      <CardContent className='space-y-4 p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='font-semibold text-slate-900'>#{order.orderCode}</p>

            <p className='mt-1 text-sm text-slate-500'>
              {order.vehicle.brand} {order.vehicle.model}
            </p>

            <p className='mt-0.5 font-mono text-xs text-slate-500'>
              {order.vehicle.plateNumber}
            </p>
          </div>

          <Badge
            className={
              isInProgress
                ? "shrink-0 rounded-full border-0 bg-blue-100 text-blue-700 hover:bg-blue-100"
                : "shrink-0 rounded-full border-0 bg-amber-100 text-amber-700 hover:bg-amber-100"
            }
          >
            {statusLabel[order.status]}
          </Badge>
        </div>

        <div className='space-y-2'>
          <div className='flex gap-1.5'>
            {steps.map((step, index) => (
              <div
                key={step.label}
                className={`h-1.5 flex-1 rounded-full ${
                  index < progress ? "bg-[#4F8FEF]" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          <div className='flex items-center justify-between gap-2 text-[11px]'>
            {steps.map((step, index) => (
              <span
                key={step.label}
                className={
                  index < progress
                    ? "font-medium text-[#397DDE]"
                    : "text-slate-400"
                }
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2 rounded-xl bg-[#F3F7FF] p-3'>
          {isWaiting ? (
            <Clock3 className='h-4 w-4 shrink-0 text-[#4F8FEF]' />
          ) : (
            <CheckCircle2 className='h-4 w-4 shrink-0 text-[#4F8FEF]' />
          )}

          <p className='text-sm text-slate-600'>
            {isWaiting
              ? "Pesananmu sedang menunggu giliran."
              : "Kendaraanmu sedang dalam proses pencucian."}
          </p>
        </div>

        <Link to={`/orders/${order.id}`} className='block'>
          <Button
            variant='outline'
            className='h-10 w-full rounded-xl border-blue-100 text-[#397DDE] hover:bg-blue-50'
          >
            Lihat Detail Order
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default ActiveOrderCard
