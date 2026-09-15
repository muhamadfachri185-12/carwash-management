import { useEffect, useState } from "react"
import axios from "../lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { History, Search, RotateCcw, ClipboardList } from "lucide-react"

interface Order {
  id: number
  orderCode: string
  total: number
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED"
  paymentStatus: "UNPAID" | "PAID"
  customer: {
    name: string
  }
  vehicle: {
    plateNumber: string
    brand: string
    model: string
  }
  orderItems: {
    service: {
      name: string
    }
  }[]
  createdAt: string
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [fetching, setFetching] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  // =========================
  // FETCH ORDERS
  // =========================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setFetching(true)

        const response = await axios.get("/orders")

        const completedOrders = response.data.data.filter(
          (order: Order) => order.status === "COMPLETED",
        )

        setOrders(completedOrders)
        setFilteredOrders(completedOrders)
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setFetching(false)
      }
    }

    fetchOrders()
  }, [])

  // =========================
  // FILTER
  // =========================
  useEffect(() => {
    let result = [...orders]

    const keyword = search.toLowerCase().trim()

    if (keyword) {
      result = result.filter((order) => {
        return (
          order.orderCode.toLowerCase().includes(keyword) ||
          order.customer.name.toLowerCase().includes(keyword) ||
          order.vehicle.plateNumber.toLowerCase().includes(keyword)
        )
      })
    }

    if (startDate) {
      result = result.filter(
        (order) => order.createdAt.slice(0, 10) >= startDate,
      )
    }

    if (endDate) {
      result = result.filter((order) => order.createdAt.slice(0, 10) <= endDate)
    }

    setFilteredOrders(result)
    setCurrentPage(1)
  }, [search, startDate, endDate, orders])

  // =========================
  // RESET FILTER
  // =========================
  const resetFilters = () => {
    setSearch("")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage

  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // =========================
  // FORMAT CURRENCY
  // =========================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className='space-y-6'>
      {/* =========================
        HEADER
    ========================= */}

      <div>
        <h1 className='text-2xl font-bold text-gray-900'>History</h1>

        <p className='mt-1 text-sm text-gray-500'>
          Riwayat order yang sudah selesai
        </p>
      </div>

      {/* =========================
        FILTER
    ========================= */}

      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <History className='h-5 w-5 text-blue-600' />

          <h2 className='font-semibold text-gray-900'>Filter History</h2>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          {/* SEARCH */}

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Search</label>

            <div className='relative'>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Cari order, customer, atau plat...'
                className='pl-9'
              />
            </div>
          </div>

          {/* START DATE */}

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Dari Tanggal
            </label>

            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* END DATE */}

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Sampai Tanggal
            </label>

            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* RESET */}

        <div className='mt-4 flex justify-end border-t border-gray-200 pt-4'>
          <Button
            variant='outline'
            onClick={resetFilters}
            className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset Filter
          </Button>
        </div>
      </div>

      {/* =========================
        HISTORY TABLE
    ========================= */}

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <ClipboardList className='h-5 w-5 text-blue-600' />

            <h2 className='font-semibold text-gray-900'>Order History</h2>

            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredOrders.length}
            </span>
          </div>
        </div>

        {fetching ? (
          <div className='flex items-center justify-center py-12 text-sm text-gray-500'>
            Loading history...
          </div>
        ) : currentOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='mb-3 rounded-full bg-gray-100 p-3'>
              <ClipboardList className='h-6 w-6 text-gray-400' />
            </div>

            <p className='font-medium text-gray-900'>Tidak ada history order</p>

            <p className='mt-1 text-sm text-gray-500'>
              Belum ada order yang sesuai dengan filter.
            </p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50'>
                    <TableHead className='font-semibold text-gray-700'>
                      Order
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Customer
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Vehicle
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Service
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Total
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Payment
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentOrders.map((order) => (
                    <TableRow key={order.id} className='hover:bg-gray-50'>
                      {/* Order */}

                      <TableCell>
                        <span className='font-mono text-sm font-semibold text-gray-800'>
                          {order.orderCode}
                        </span>
                      </TableCell>

                      {/* Customer */}

                      <TableCell>
                        <span className='font-medium text-gray-700'>
                          {order.customer.name}
                        </span>
                      </TableCell>

                      {/* Vehicle */}

                      <TableCell>
                        <div>
                          <div className='font-medium text-gray-800'>
                            {order.vehicle.plateNumber}
                          </div>

                          <p className='text-xs text-gray-500'>
                            {order.vehicle.brand} {order.vehicle.model}
                          </p>
                        </div>
                      </TableCell>

                      {/* Service */}

                      <TableCell>
                        <div className='max-w-55'>
                          {order.orderItems.map((item, index) => (
                            <div key={index} className='text-sm text-gray-700'>
                              {item.service.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      {/* Total */}

                      <TableCell>
                        <span className='font-semibold text-gray-900'>
                          {formatCurrency(order.total)}
                        </span>
                      </TableCell>

                      {/* Payment */}

                      <TableCell>
                        {order.paymentStatus === "PAID" ? (
                          <span className='inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800'>
                            PAID
                          </span>
                        ) : (
                          <span className='inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800'>
                            UNPAID
                          </span>
                        )}
                      </TableCell>

                      {/* Date */}

                      <TableCell>
                        <span className='text-sm text-gray-700'>
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* =========================
              PAGINATION
          ========================= */}

            {totalPages > 1 && (
              <div className='flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-gray-500'>
                  Menampilkan{" "}
                  <span className='font-medium text-gray-900'>
                    {startIndex + 1}
                  </span>
                  -
                  <span className='font-medium text-gray-900'>
                    {Math.min(startIndex + itemsPerPage, filteredOrders.length)}
                  </span>{" "}
                  dari{" "}
                  <span className='font-medium text-gray-900'>
                    {filteredOrders.length}
                  </span>{" "}
                  order
                </p>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                    className='border-gray-200'
                  >
                    Sebelumnya
                  </Button>

                  <span className='rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700'>
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                    className='border-gray-200'
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
