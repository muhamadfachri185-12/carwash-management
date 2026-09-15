// useState  = untuk menyimpan state/data yang bisa berubah
// useEffect = untuk menjalankan side effect, misalnya mengambil data dari API
import { useState, useEffect } from "react"

// Axios instance untuk komunikasi dengan backend API.
import axios from "../lib/axios"

// useNavigate digunakan untuk pindah halaman secara programmatically.
// Contoh:
// navigate("/orders")
// berarti React akan pindah ke halaman /orders.
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

import { Wallet, Car, Clock, CheckCircle } from "lucide-react"

// =====================================================
// INTERFACE
// =====================================================

// Interface digunakan untuk menentukan bentuk data.
//
// Jadi TypeScript tahu bahwa data dashboard
// harus mempunyai property-property seperti di bawah.
interface DashboarData {
  waiting: number
  inProgress: number
  completed: number
  unpaid: number

  // Data revenue berupa number.
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  revenueYear: number

  // Object yang berisi jumlah order berdasarkan status.
  orderStatusReport: {
    WAITING: number
    IN_PROGRESS: number
    COMPLETED: number
  }

  // recentOrders adalah ARRAY of OBJECT.
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
  // useNavigate() memberikan function navigate()
  // yang bisa digunakan untuk berpindah halaman.
  const navigate = useNavigate()

  // =====================================================
  // STATE
  // =====================================================

  // State data dashboard.

  // <DashboarData | null>
  //
  // Artinya:
  // data bisa berupa object DashboarData
  // ATAU null.
  //
  // Kenapa awalnya null?
  // Karena saat component pertama kali dibuat,
  // data dari API belum tersedia.
  const [data, setData] = useState<DashboarData | null>(null)

  // State untuk loading.
  //
  // true  = sedang mengambil data
  // false = selesai mengambil data
  const [loading, setLoading] = useState(true)

  // State tanggal yang dipilih untuk report.
  //
  // String karena input type="date"
  // menghasilkan value berupa string.
  const [reportDate, setReportDate] = useState("")

  // State untuk menyimpan jumlah order
  // berdasarkan status pada tanggal yang dipilih.
  const [reportCounts, setReportCounts] = useState({
    WAITING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  })

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  // Function async digunakan karena kita akan
  // melakukan request HTTP ke backend.
  const fetchDasboard = async () => {
    try {
      // GET /dashboard
      //
      // Karena axios instance sudah punya baseURL:
      // http://localhost:3000/api
      //
      // Maka URL akhirnya:
      // http://localhost:3000/api/dashboard
      const response = await axios.get("/dashboard")

      // response.data = response dari backend
      //
      // response.data.data = data dashboard sebenarnya.
      //
      // Data tersebut kemudian disimpan ke state.
      setData(response.data.data)

      // =================================================
      // DEFAULT REPORT DATE
      // =================================================

      // Ambil tanggal hari ini.
      //
      // new Date() -> tanggal & waktu sekarang
      //
      // toISOString() contoh:
      // "2026-09-15T01:30:00.000Z"
      //
      // split("T") menghasilkan:
      // ["2026-09-15", "01:30:00.000Z"]
      //
      // [0] mengambil bagian tanggal:
      // "2026-09-15"
      const todayStr = new Date().toISOString().split("T")[0]

      // Jadikan hari ini sebagai tanggal default
      // untuk report.
      setReportDate(todayStr)

      // Gunakan data report dari backend sebagai
      // nilai awal reportCounts.
      setReportCounts(response.data.data.orderStatusReport)
    } catch (err) {
      // Kalau request API gagal,
      // error ditampilkan di console browser.
      console.error("Gagal memuat dashboard", err)
    } finally {
      // finally selalu dijalankan,
      // baik request berhasil maupun gagal.
      //
      // Setelah selesai mengambil data,
      // loading dimatikan.
      setLoading(false)
    }
  }

  // =====================================================
  // USE EFFECT
  // =====================================================

  // useEffect dengan [] hanya dijalankan
  // ketika component pertama kali muncul.
  //
  // Cocok digunakan untuk initial data fetching.
  useEffect(() => {
    fetchDasboard()
  }, [])

  // =====================================================
  // CHANGE REPORT DATE
  // =====================================================

  // Function ini dijalankan ketika user
  // mengganti tanggal pada input date.
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ambil value tanggal dari input.
    //
    // Contoh:
    // "2026-09-15"
    const dateStr = e.target.value

    // Simpan tanggal tersebut ke state.
    setReportDate(dateStr)

    // =================================================
    // FILTER RECENT ORDERS
    // =================================================

    // Pastikan data dashboard sudah tersedia.
    //
    // Karena data awalnya null, kita tidak boleh
    // mengakses data.recentOrders sebelum data tersedia.
    if (data) {
      // filter() digunakan untuk membuat array baru
      // yang hanya berisi data yang memenuhi kondisi.
      const filtered = data.recentOrders.filter((order) => {
        // Ambil tanggal dari createdAt.
        //
        // Contoh:
        // "2026-09-15T10:30:00.000Z"
        //
        // menjadi:
        // "2026-09-15"
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0]

        // Hanya order dengan tanggal yang sama
        // dengan tanggal yang dipilih user.
        return orderDate === dateStr
      })

      // Object untuk menampung jumlah order
      // berdasarkan status.
      //
      // Awalnya semuanya 0.
      const counts = {
        WAITING: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
      }

      // forEach() digunakan untuk menjalankan function
      // pada setiap item dalam array.
      //
      // Bedanya dengan map():
      //
      // map() biasanya menghasilkan array baru.
      // forEach() biasanya digunakan untuk melakukan aksi
      // terhadap setiap item.
      filtered.forEach((order) => {
        // "status in counts" mengecek apakah property
        // status tersebut tersedia di object counts.
        //
        // Contoh:
        // order.status = "WAITING"
        //
        // Apakah "WAITING" ada di counts?
        // YES -> lanjut.
        if (order.status in counts) {
          // keyof typeof counts membantu TypeScript
          // memahami bahwa key yang digunakan adalah
          // salah satu key dari object counts.
          //
          // Setelah itu nilainya ditambah 1.
          counts[order.status as keyof typeof counts]++
        }
      })

      // Simpan hasil jumlah order ke state.
      setReportCounts(counts)
    }
  }

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  // Function helper untuk mengubah angka
  // menjadi format Rupiah.
  //
  // Contoh:
  // 50000
  // ->
  // Rp 50.000
  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID")

  // =====================================================
  // FORMAT DATE
  // =====================================================

  // Function helper untuk mengubah string tanggal
  // menjadi format yang lebih mudah dibaca.
  //
  // Contoh:
  // "2026-09-15"
  //
  // menjadi:
  // "Selasa, 15 September 2026"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)

    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // =====================================================
  // STATUS COLORS
  // =====================================================

  // Record<string, string> artinya:
  //
  // object ini mempunyai:
  // key   = string
  // value = string
  //
  // Contoh:
  // statusColors["WAITING"]
  //
  // hasilnya:
  // "bg-yellow-100 text-yellow-800"
  const statusColors: Record<string, string> = {
    WAITING: "bg-yellow-100 text-yellow-800",

    IN_PROGRESS: "bg-blue-100 text-blue-800",

    COMPLETED: "bg-green-100 text-green-800",
  }

  // Mapping warna untuk payment status.
  const paymentColors: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-800",

    PAID: "bg-green-100 text-green-800",
  }

  // =====================================================
  // LOADING STATE
  // =====================================================

  // Kalau loading masih true,
  // jangan tampilkan dashboard dulu.
  //
  // return di sini menyebabkan component
  // langsung mengembalikan UI loading.
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

  // =====================================================
  // ERROR / DATA NULL STATE
  // =====================================================

  // Setelah loading selesai,
  // ternyata data tetap null.
  //
  // Berarti kemungkinan request API gagal.
  //
  // Tampilkan error state.
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
            // User bisa mencoba request API lagi
            // dengan memanggil fetchDasboard().
            onClick={() => fetchDasboard()}
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  // Sampai titik ini TypeScript sudah tahu bahwa
  // data bukan null.
  //
  // Karena sebelumnya sudah ada:
  // if (!data) return ...
  //
  // Jadi kita sekarang aman menggunakan:
  // data.revenueToday
  // data.recentOrders
  // dll.
  return (
    <div className='space-y-6'>
      {/* ==========================
          PAGE HEADER
      ========================== */}

      <div className='page-header'>
        <h1 className='page-title'>Dashboard</h1>

        <div className='text-sm text-gray-500'>
          {/* Menampilkan tanggal hari ini. */}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ==========================
          1. REVENUE SUMMARY
      ========================== */}

      <div className='grid grid-cols-4 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* REVENUE TODAY */}

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
              {/* 
                Data dari backend:
                data.revenueToday

                Kemudian dikirim ke helper
                formatRupiah().
              */}
              {formatRupiah(data.revenueToday)}
            </p>

            <p className='text-xs text-gray-500 mt-1'>Pendapatan hari ini</p>
          </CardContent>
        </Card>

        {/* WEEK REVENUE */}

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

        {/* MONTH REVENUE */}

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

        {/* YEAR REVENUE */}

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

      {/* ==========================
          2. ORDER STATUS REPORT
      ========================== */}

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
                // Input mengambil value dari state.
                value={reportDate}
                // Ketika tanggal berubah,
                // jalankan handleDateChange().
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

                  {/* Jumlah WAITING dari state reportCounts. */}
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

      {/* ==========================
          3. RECENT ORDERS
      ========================== */}

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
                {/*
                  Conditional Rendering.

                  Kalau tidak ada recentOrders:
                  tampilkan pesan "Tidak ada order".

                  Kalau ada:
                  tampilkan semua order dengan map().
                */}
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
                  /*
                    map() digunakan untuk membuat
                    satu TableRow untuk setiap order.

                    Contoh:
                    recentOrders = [order1, order2, order3]

                    map() menghasilkan:
                    <TableRow> order1 </TableRow>
                    <TableRow> order2 </TableRow>
                    <TableRow> order3 </TableRow>
                  */
                  data.recentOrders.map((order) => (
                    // key harus unik agar React dapat
                    // mengidentifikasi setiap row.
                    <TableRow key={order.id}>
                      {/* ORDER CODE */}

                      <TableCell className='font-medium'>
                        {order.orderCode}
                      </TableCell>

                      {/* CUSTOMER */}

                      <TableCell>{order.customerName}</TableCell>

                      {/* VEHICLE */}

                      <TableCell>
                        {/*
                          Menggabungkan beberapa property
                          menjadi satu tampilan.

                          Contoh:
                          B 1234 ABC - Toyota Avanza
                        */}
                        {order.vehiclePlate} - {order.vehicleBrand}{" "}
                        {order.vehicleModel}
                      </TableCell>

                      {/* TOTAL */}

                      <TableCell>
                        {/*
                          toLocaleString("id-ID")
                          membuat angka menggunakan
                          format Indonesia.

                          Contoh:
                          50000 -> 50.000
                        */}
                        Rp {order.total.toLocaleString("id-ID")}
                      </TableCell>

                      {/* PAYMENT */}

                      <TableCell>
                        <span
                          className={`
                            px-2 py-1
                            rounded-full
                            text-xs
                            font-semibold

                            ${
                              // Ambil class berdasarkan
                              // payment status.
                              //
                              // Contoh:
                              // paymentColors["PAID"]
                              // -> "bg-green-100 text-green-800"
                              paymentColors[order.paymentStatus] ||
                              // Kalau status tidak ditemukan
                              // gunakan warna default.
                              "bg-gray-100 text-gray-800"
                            }
                          `}
                        >
                          {order.paymentStatus}
                        </span>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <span
                          className={`
                            px-2 py-1
                            rounded-full
                            text-xs
                            font-semibold

                            ${
                              // Ambil class berdasarkan status order.
                              statusColors[order.status] ||
                              // Fallback kalau status tidak ditemukan.
                              "bg-gray-100 text-gray-800"
                            }
                          `}
                        >
                          {order.status}
                        </span>
                      </TableCell>

                      {/* DATE */}

                      <TableCell>
                        {/* Gunakan helper formatDate()
                            agar tanggal lebih readable. */}
                        {formatDate(order.createdAt)}
                      </TableCell>
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
