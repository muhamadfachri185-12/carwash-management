import { useState, useEffect } from "react"
import axios from "../lib/axios"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Wallet,
  Calendar,
  Users,
  Car,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface DashboarData {
  waiting: number
  inProgress: number
  completed: number
  unpaid: number
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  revenueYear: number
  orderStatusReport: {
    WAITING: number
    IN_PROGRESS: number
    COMPLETED: number
  }
  recentOrders: {
    id: number
    orderCode: string
    customerName: string
    vehiclePlate: string
    vehicleBrand: string
    vehicleModel: string
    total: number
    paymentStatus: string
    status: string
    createdAt: string
  }[]
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboarData | null>(null)
  const [loading, setLoading] = useState(true)

  const [reportDate, setReportDate] = useState("")
  const [reportCounts, setReportCounts] = useState({
    WAITING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  })

  const fetchDasboard = async () => {
    try {
      const response = await axios.get("/dashboard")
      setData(response.data.data)

      // Default report date = today
      const todayStr = new Date().toISOString().split("T")[0]
      setReportDate(todayStr)
      setReportCounts(response.data.data.orderStatusReport)
    } catch (err) {
      console.error("Gagal memuat dashboard", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDasboard()
  }, [])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    setReportDate(dateStr)

    // Filter recentOrders berdasarkan tanggal yang dipilih
    if (data) {
      const filtered = data.recentOrders.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0]
        return orderDate === dateStr
      })

      const counts = { WAITING: 0, IN_PROGRESS: 0, COMPLETED: 0 }
      filtered.forEach((order) => {
        if (order.status in counts) {
          counts[order.status as keyof typeof counts]++
        }
      })
      setReportCounts(counts)
    }
  }

  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID")

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const statusColors: Record<string, string> = {
    WAITING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
  }

  const paymentColors: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-800",
    PAID: "bg-green-100 text-green-800",
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3'>
            <p className='text-sm text-gray-500'>Memuat dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='p-6'>
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <h2 className='text-lg font-semibold text-red-800 mb-2'>
            Gagal memuat dashboard
          </h2>
          <p className='text-sm text-red-600'>
            Terjadi kesalahan saat memuat data dashboard.
          </p>
          <Button
            variant='outline'
            className='mt-3'
            onClick={() => fetchDasboard()}
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='page-header'>
        <h1 className='page-title'>Dashboard</h1>
        <div className='text-sm text-gray-500'>
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ========================== */}
      {/* 1. REVENUE SUMMARY         */}
      {/* ========================== */}
      <div className='grid grid-cols-4 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-gray-500'>
                Revenue Today
              </CardTitle>
              <div className='h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Wallet className='h-4 w-4 text-blue-600' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='text-2xl font-bold text-gray-800'>
            <p className='text-2xl font-bold'>
              {formatRupiah(data.revenueToday)}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Pendapatan hari ini</p>
          </CardContent>
        </Card>

        {/* Week Revenue */}
        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Revenue This Week
              </CardTitle>
              <div className='h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Wallet className='h-4 w-4 text-blue-600' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>
              {formatRupiah(data.revenueWeek)}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Pendapatan Minggu ini</p>
          </CardContent>
        </Card>

        {/* Month Revenue */}
        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-mediun text-gray-600'>
                Revenue This Month
              </CardTitle>
              <div className='h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Wallet className='h-4 w-4 text-blue-600' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>
              {formatRupiah(data.revenueMonth)}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Pendapatan Bulan ini</p>
          </CardContent>
        </Card>

        {/* Year Revenue */}
        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-gray-500'>
                Revenue This Year
              </CardTitle>
              <div className='h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Wallet className='h-4 w-4 text-blue-600' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-gray-800'>
              {formatRupiah(data.revenueYear)}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Pendapatan Tahun ini</p>
          </CardContent>
        </Card>
      </div>

      {/* ========================== */}
      {/* 2. ORDER STATUS REPORT     */}
      {/* ========================== */}
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-800'>
              Order Status Report
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Label className='text-sm text-gray-600'>Pilih Tanggal</Label>
              <Input
                type='date'
                value={reportDate}
                onChange={handleDateChange}
                className='w-40'
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-gray-600 mb-4'>
            Order Status — {formatDate(reportDate)}
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* WAITING */}
            <div className='border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center'>
                  <Clock className='h-5 w-5 text-yellow-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>WAITING</p>
                  <p className='text-2xl font-bold text-gray-800'>
                    {reportCounts.WAITING}
                  </p>
                </div>
              </div>
              <p className='text-xs text-gray-500'>Order menunggu proses</p>
            </div>

            {/* IN_PROGRESS */}
            <div className='border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <Car className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    IN_PROGRESS
                  </p>
                  <p className='text-2xl font-bold text-gray-800'>
                    {reportCounts.IN_PROGRESS}
                  </p>
                </div>
              </div>
              <p className='text-xs text-gray-500'>Sedang dikerjakan</p>
            </div>

            {/* COMPLETED */}
            <div className='border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>COMPLETED</p>
                  <p className='text-2xl font-bold text-gray-800'>
                    {reportCounts.COMPLETED}
                  </p>
                </div>
              </div>
              <p className='text-xs text-gray-500'>Sudah selesai</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================== */}
      {/* 3. RECENT ORDERS           */}
      {/* ========================== */}
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='h-24 text-center text-muted-foreground'
                    >
                      Tidak ada order.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='font-medium'>
                        {order.orderCode}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        {order.vehiclePlate} - {order.vehicleBrand}{" "}
                        {order.vehicleModel}
                      </TableCell>
                      <TableCell>
                        Rp {order.total.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            paymentColors[order.paymentStatus] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
