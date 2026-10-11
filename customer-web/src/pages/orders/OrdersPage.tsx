import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ClipboardList,
  LoaderCircle,
  Plus,
  RefreshCw,
  ScanLine,
} from "lucide-react"

import socket from "@/lib/socket"

import { Button } from "@/components/ui/button"
import OrderCard from "@/features/orders/components/OrderCard"
import { getCustomerOrders } from "@/features/orders/api/orderApi"

import type { CustomerOrder } from "@/features/orders/types/order.types"

type OrderFilter = "ALL" | "WAITING" | "IN_PROGRESS" | "COMPLETED"

const filters: { label: string; value: OrderFilter }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Menunggu", value: "WAITING" },
  { label: "Diproses", value: "IN_PROGRESS" },
  { label: "Selesai", value: "COMPLETED" },
]

export default function OrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [filter, setFilter] = useState<OrderFilter>("ALL")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError("")

      const data = await getCustomerOrders()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch customer orders:", error)
      setError("Gagal mengambil data pesanan. Periksa koneksi internetmu.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void fetchOrders()

    const handleOrderStatusUpdated = (data: {
      orderId: number
      status: CustomerOrder["status"]
      completedAt: string | null
    }) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === data.orderId
            ? {
                ...order,
                status: data.status,
                completedAt: data.completedAt,
              }
            : order,
        ),
      )
    }

    const handlePaymentUpdated = (data: {
      orderId: number
      paymentStatus: CustomerOrder["paymentStatus"]
    }) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === data.orderId
            ? {
                ...order,
                paymentStatus: data.paymentStatus,
              }
            : order,
        ),
      )
    }

    socket.on("order:status-updated", handleOrderStatusUpdated)
    socket.on("payment:updated", handlePaymentUpdated)

    return () => {
      socket.off("order:status-updated", handleOrderStatusUpdated)
      socket.off("payment:updated", handlePaymentUpdated)
    }
  }, [fetchOrders])

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders
    }

    return orders.filter((order) => order.status === filter)
  }, [orders, filter])

  const getFilterCount = (value: OrderFilter) => {
    if (value === "ALL") {
      return orders.length
    }

    return orders.filter((order) => order.status === value).length
  }

  return (
    <div className='min-h-screen bg-[#F3F7FF] px-4 pb-28 pt-6'>
      <div className='mx-auto max-w-md space-y-6'>
        {/* Header */}
        <header className='flex items-center justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.15em] text-[#4F8FEF]'>
              CarWash Customer
            </p>

            <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-900'>
              Pesanan Saya
            </h1>

            <p className='mt-1 text-sm text-slate-500'>
              Pantau status dan riwayat cuci mobilmu.
            </p>
          </div>

          <Button
            type='button'
            variant='outline'
            size='icon'
            aria-label='Muat ulang pesanan'
            disabled={loading || refreshing}
            onClick={() => void fetchOrders(true)}
            className='h-11 w-11 shrink-0 rounded-xl border-blue-100 bg-white text-[#4F8FEF] hover:bg-blue-50'
          >
            {refreshing ? (
              <LoaderCircle className='h-5 w-5 animate-spin' />
            ) : (
              <RefreshCw className='h-5 w-5' />
            )}
          </Button>
        </header>

        {/* Summary */}
        <section className='rounded-2xl border border-blue-100 bg-white p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#4F8FEF]'>
              <ClipboardList className='h-6 w-6' />
            </div>

            <div className='min-w-0 flex-1'>
              <p className='text-sm text-slate-500'>Total pesanan</p>

              <p className='mt-0.5 text-2xl font-bold text-slate-900'>
                {loading ? "—" : orders.length}
              </p>
            </div>

            <div className='rounded-xl bg-blue-50 px-3 py-2 text-right'>
              <p className='text-xs text-slate-500'>Sedang diproses</p>

              <p className='mt-1 text-lg font-bold text-[#3978D1]'>
                {loading
                  ? "—"
                  : orders.filter((order) => order.status === "IN_PROGRESS")
                      .length}
              </p>
            </div>
          </div>
        </section>

        {/* Filter */}
        <section>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-900'>
              Riwayat Pesanan
            </h2>

            <span className='text-xs text-slate-500'>
              {loading ? "Memuat..." : `${filteredOrders.length} pesanan`}
            </span>
          </div>

          <div className='-mx-4 flex gap-2 overflow-x-auto px-4 pb-2'>
            {filters.map((item) => {
              const isActive = filter === item.value

              return (
                <button
                  key={item.value}
                  type='button'
                  onClick={() => setFilter(item.value)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#4F8FEF] text-white shadow-sm"
                      : "border border-blue-100 bg-white text-slate-600 hover:bg-blue-50"
                  }`}
                >
                  {item.label}

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {loading ? "—" : getFilterCount(item.value)}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className='space-y-4'>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className='animate-pulse space-y-4 rounded-2xl border border-blue-100 bg-white p-4'
              >
                <div className='flex items-center justify-between gap-3'>
                  <div className='space-y-2'>
                    <div className='h-4 w-28 rounded bg-slate-100' />
                    <div className='h-3 w-36 rounded bg-slate-100' />
                  </div>

                  <div className='h-6 w-20 rounded-full bg-slate-100' />
                </div>

                <div className='h-16 rounded-xl bg-slate-100' />

                <div className='h-4 w-24 rounded bg-slate-100' />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className='rounded-2xl border border-red-100 bg-white px-5 py-8 text-center shadow-sm'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500'>
              <AlertCircle className='h-7 w-7' />
            </div>

            <h2 className='mt-4 font-bold text-slate-900'>
              Pesanan belum bisa dimuat
            </h2>

            <p className='mt-2 text-sm leading-6 text-slate-500'>{error}</p>

            <Button
              type='button'
              onClick={() => void fetchOrders()}
              className='mt-5 rounded-xl bg-[#4F8FEF] hover:bg-[#3978D1]'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Empty: no orders at all */}
        {!loading && !error && orders.length === 0 && (
          <div className='rounded-2xl border border-blue-100 bg-white px-5 py-10 text-center shadow-sm'>
            <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#4F8FEF]'>
              <ClipboardList className='h-9 w-9' />
            </div>

            <h2 className='mt-5 text-lg font-bold text-slate-900'>
              Belum ada pesanan
            </h2>

            <p className='mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500'>
              Pesanan yang kamu buat akan muncul di sini. Scan QR outlet untuk
              mulai memesan layanan cuci mobil.
            </p>

            <Button
              type='button'
              onClick={() => navigate("/scan")}
              className='mt-6 h-11 w-full rounded-xl bg-[#4F8FEF] font-semibold hover:bg-[#3978D1]'
            >
              <ScanLine className='mr-2 h-4 w-4' />
              Scan QR Outlet
            </Button>
          </div>
        )}

        {/* Empty: no orders in selected filter */}
        {!loading &&
          !error &&
          orders.length > 0 &&
          filteredOrders.length === 0 && (
            <div className='rounded-2xl border border-blue-100 bg-white px-5 py-8 text-center shadow-sm'>
              <ClipboardList className='mx-auto h-9 w-9 text-slate-300' />

              <h2 className='mt-3 font-semibold text-slate-800'>
                Belum ada pesanan dengan status ini
              </h2>

              <p className='mt-2 text-sm text-slate-500'>
                Coba pilih filter status yang lain.
              </p>

              <Button
                type='button'
                variant='outline'
                onClick={() => setFilter("ALL")}
                className='mt-4 rounded-xl border-blue-100'
              >
                Lihat Semua Pesanan
              </Button>
            </div>
          )}

        {/* Orders */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className='space-y-4'>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Create order shortcut */}
        {!loading && !error && orders.length > 0 && (
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate("/scan")}
            className='h-12 w-full rounded-xl border-blue-200 bg-white font-semibold text-[#3978D1] hover:bg-blue-50'
          >
            <Plus className='mr-2 h-4 w-4' />
            Buat Pesanan Baru
          </Button>
        )}
      </div>
    </div>
  )
}
