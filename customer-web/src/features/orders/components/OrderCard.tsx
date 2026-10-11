import { useNavigate } from "react-router-dom"
import { ArrowRight, CarFront, Clock3 } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import type { CustomerOrder } from "../types/order.types"

import {
  formatOrderDate,
  formatOrderPrice,
  getPaymentStatusClass,
  getPaymentStatusLabel,
} from "../utils/order.utils"

import OrderItemList from "./OrderItemList"
import OrderStatusBadge from "./OrderStatusBadge"

interface OrderCardProps {
  order: CustomerOrder
}

export default function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate()

  const isInProgress = order.status === "IN_PROGRESS"
  const isWaiting = order.status === "WAITING"

  return (
    <Card
      role='button'
      tabIndex={0}
      aria-label={`Lihat detail pesanan ${order.orderCode}`}
      onClick={() => navigate(`/orders/${order.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          navigate(`/orders/${order.id}`)
        }
      }}
      className='relative cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8FEF]'
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isInProgress
            ? "bg-[#4F8FEF]"
            : isWaiting
              ? "bg-amber-400"
              : "bg-emerald-400"
        }`}
      />

      <CardHeader className='space-y-3 pb-3 pt-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='break-words text-sm font-bold text-slate-900'>
              {order.orderCode}
            </p>

            <p className='mt-1 flex items-center gap-1.5 text-xs text-slate-500'>
              <Clock3 className='h-3.5 w-3.5 shrink-0' />
              {formatOrderDate(order.createdAt)}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Vehicle */}
        <div className='flex items-start gap-3 rounded-xl bg-[#F3F7FF] p-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4F8FEF]'>
            <CarFront className='h-5 w-5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='break-words text-sm font-semibold text-slate-900'>
              {order.vehicle.brand} {order.vehicle.model}
            </p>

            <p className='mt-1 text-xs font-medium tracking-wide text-slate-500'>
              {order.vehicle.plateNumber}
            </p>
          </div>
        </div>

        {/* Services */}
        <div>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>
            Layanan
          </p>

          <OrderItemList items={order.orderItems} />
        </div>

        {/* Payment and total */}
        <div className='border-t border-dashed border-slate-200 pt-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='min-w-0'>
              <p
                className={`text-xs font-semibold ${getPaymentStatusClass(
                  order.paymentStatus,
                )}`}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </p>

              <p className='mt-1 text-xs text-slate-400'>Total pesanan</p>
            </div>

            <p className='shrink-0 text-base font-bold text-[#3978D1]'>
              {formatOrderPrice(order.total)}
            </p>
          </div>
        </div>

        {/* Detail link */}
        <div className='-mx-4 -mb-4 flex items-center justify-between border-t border-blue-50 bg-blue-50/60 px-4 py-3'>
          <span className='text-xs font-semibold text-[#3978D1]'>
            Lihat Detail Pesanan
          </span>

          <ArrowRight className='h-4 w-4 text-[#3978D1]' />
        </div>
      </CardContent>
    </Card>
  )
}
