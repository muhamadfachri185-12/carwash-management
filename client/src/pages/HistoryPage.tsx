// useState = menyimpan data/state di component
// useEffect = menjalankan kode tertentu ketika component dijalankan atau state berubah
import { useEffect, useState } from "react"

// Axios instance yang sudah kita buat.
// baseURL-nya sudah mengarah ke http://localhost:3000/api
import axios from "../lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { History, RotateCcw, ClipboardList } from "lucide-react"

// Interface digunakan TypeScript untuk menentukan bentuk/struktur data.
//
// Jadi setiap object Order harus punya property seperti:
// id, orderCode, total, status, customer, vehicle, dll.
interface Order {
  id: number
  orderCode: string
  total: number

  // Union Type:
  // status hanya boleh salah satu dari 3 value ini.
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED"

  // paymentStatus hanya boleh PAID atau UNPAID.
  paymentStatus: "UNPAID" | "PAID"

  // customer adalah object yang punya property name.
  customer: {
    name: string
  }

  // vehicle juga merupakan object dengan beberapa property.
  vehicle: {
    plateNumber: string
    brand: string
    model: string
  }

  // orderItems adalah array.
  //
  // Setiap item punya object service,
  // dan service punya property name.
  orderItems: {
    service: {
      name: string
    }
  }[]

  createdAt: string
}

export default function HistoryPage() {
  // Menyimpan SEMUA order yang sudah COMPLETED.
  //
  // <Order[]> artinya state ini berupa array yang isinya object Order.
  const [orders, setOrders] = useState<Order[]>([])

  // Menyimpan order yang sudah melewati proses filter.
  //
  // Awalnya array kosong.
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])

  // State untuk input pencarian.
  const [search, setSearch] = useState("")

  // State untuk tanggal awal filter.
  const [startDate, setStartDate] = useState("")

  // State untuk tanggal akhir filter.
  const [endDate, setEndDate] = useState("")

  // Menentukan apakah data sedang diambil dari backend.
  const [fetching, setFetching] = useState(true)

  // Menyimpan nomor halaman pagination saat ini.
  const [currentPage, setCurrentPage] = useState(1)

  // Jumlah data yang ditampilkan dalam satu halaman.
  const itemsPerPage = 10

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  // useEffect digunakan untuk menjalankan fetchOrders
  // ketika component pertama kali dibuka.
  //
  // [] = dependency kosong
  // Artinya effect hanya dijalankan 1 kali saat component mount.
  useEffect(() => {
    // Function async untuk mengambil data dari backend.
    const fetchOrders = async () => {
      try {
        // Sebelum request dimulai, tampilkan loading.
        setFetching(true)

        // GET /orders
        //
        // Karena axios baseURL sudah /api,
        // hasil akhirnya:
        // http://localhost:3000/api/orders
        const response = await axios.get("/orders")

        // Backend mengembalikan semua order.
        //
        // Kita hanya mengambil order dengan status COMPLETED
        // karena halaman ini adalah History.
        const completedOrders = response.data.data.filter(
          (order: Order) => order.status === "COMPLETED",
        )

        // Simpan hasil order COMPLETED ke state utama.
        setOrders(completedOrders)

        // Untuk pertama kali, hasil filter sama dengan
        // semua completed orders.
        setFilteredOrders(completedOrders)
      } catch (error) {
        // Kalau request gagal, tampilkan error di console.
        console.error("Failed to fetch history:", error)
      } finally {
        // finally SELALU dijalankan,
        // baik request berhasil maupun gagal.
        //
        // Jadi loading harus dimatikan di sini.
        setFetching(false)
      }
    }

    // Jalankan function fetchOrders.
    fetchOrders()
  }, [])

  // =====================================================
  // FILTER
  // =====================================================

  // Effect ini dijalankan setiap kali:
  // search berubah
  // startDate berubah
  // endDate berubah
  // orders berubah
  //
  // Jadi filter otomatis berjalan ketika user mengetik
  // atau mengganti tanggal.
  useEffect(() => {
    // [...orders] membuat COPY dari array orders.
    //
    // Kita tidak langsung memodifikasi state orders.
    // Ini penting karena state React sebaiknya tidak dimutasi langsung.
    let result = [...orders]

    // Ubah keyword menjadi lowercase dan hapus spasi
    // di awal/akhir.
    //
    // Contoh:
    // "  B 1234 ABC  " -> "b 1234 abc"
    const keyword = search.toLowerCase().trim()

    // Kalau user memasukkan keyword,
    // baru jalankan filter pencarian.
    if (keyword) {
      result = result.filter((order) => {
        // Order akan tetap masuk kalau salah satu kondisi TRUE:
        //
        // 1. orderCode cocok
        // ATAU
        // 2. nama customer cocok
        // ATAU
        // 3. plat nomor cocok
        return (
          order.orderCode.toLowerCase().includes(keyword) ||
          order.customer.name.toLowerCase().includes(keyword) ||
          order.vehicle.plateNumber.toLowerCase().includes(keyword)
        )
      })
    }

    // Kalau user mengisi tanggal mulai,
    // hanya ambil order dengan tanggal >= startDate.
    if (startDate) {
      result = result.filter(
        (order) => order.createdAt.slice(0, 10) >= startDate,
      )
    }

    // Kalau user mengisi tanggal akhir,
    // hanya ambil order dengan tanggal <= endDate.
    if (endDate) {
      result = result.filter((order) => order.createdAt.slice(0, 10) <= endDate)
    }

    // Simpan hasil filter ke state.
    setFilteredOrders(result)

    // Setelah filter berubah, kembali ke halaman pertama.
    //
    // Contoh:
    // user sedang di page 3 lalu melakukan search.
    // Kita tidak ingin tetap di page 3.
    setCurrentPage(1)
  }, [search, startDate, endDate, orders])

  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetFilters = () => {
    // Mengosongkan semua filter.
    setSearch("")
    setStartDate("")
    setEndDate("")

    // Kembali ke halaman pertama.
    setCurrentPage(1)
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  // Menghitung jumlah halaman.
  //
  // Math.ceil() digunakan supaya angka dibulatkan ke atas.
  //
  // Contoh:
  // 25 data / 10 = 2.5
  // ceil(2.5) = 3 halaman
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  // Menentukan index awal data untuk halaman saat ini.
  //
  // Page 1:
  // (1 - 1) * 10 = 0
  //
  // Page 2:
  // (2 - 1) * 10 = 10
  //
  // Page 3:
  // (3 - 1) * 10 = 20
  const startIndex = (currentPage - 1) * itemsPerPage

  // slice() mengambil sebagian data dari array.
  //
  // Contoh page 2:
  // slice(10, 20)
  //
  // Artinya ambil data index 10 sampai sebelum index 20.
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  // =====================================================
  // FORMAT DATE
  // =====================================================

  // Function helper untuk mengubah format tanggal.
  //
  // Contoh:
  // "2026-09-15T10:00:00"
  //
  // menjadi:
  // "15 Sep 2026"
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  // Function helper untuk mengubah angka menjadi format Rupiah.
  //
  // Contoh:
  // 50000
  //
  // menjadi:
  // "Rp50.000"
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // =====================================================
  // UI
  // =====================================================

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
              {/* 
                Controlled Input.

                value berasal dari state "search".
                onChange mengubah state ketika user mengetik.

                Alurnya:
                User mengetik
                    ↓
                onChange
                    ↓
                setSearch()
                    ↓
                search berubah
                    ↓
                useEffect filter berjalan
              */}
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
              // e.target.value berisi tanggal yang dipilih user.
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
            // Ketika button diklik, jalankan resetFilters().
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

            {/* Menampilkan jumlah order setelah filter. */}
            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredOrders.length}
            </span>
          </div>
        </div>

        {/*
          Conditional Rendering menggunakan ternary.

          Bentuk dasarnya:

          kondisi ? tampilkan A : tampilkan B

          Di sini ada 3 kemungkinan:

          1. fetching = true
             → tampilkan Loading

          2. fetching selesai DAN data kosong
             → tampilkan "Tidak ada history"

          3. selain itu
             → tampilkan Table
        */}

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
          // Fragment <> digunakan untuk membungkus beberapa element
          // tanpa membuat element HTML tambahan.
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
                  {/*
                    .map() digunakan untuk mengubah setiap data
                    dalam array menjadi JSX.

                    Misalnya ada 3 order:
                    orders = [order1, order2, order3]

                    map() akan membuat:
                    <TableRow> order1 </TableRow>
                    <TableRow> order2 </TableRow>
                    <TableRow> order3 </TableRow>
                  */}
                  {currentOrders.map((order) => (
                    // key harus unik untuk membantu React
                    // mengetahui item mana yang berubah.
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
                          {/*
                            order.orderItems juga berupa array,
                            jadi kita gunakan map() lagi.

                            Satu order bisa memiliki beberapa service.
                          */}
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
                          {/*
                            order.total adalah number.

                            Kita kirim ke function helper
                            formatCurrency() agar tampil sebagai Rupiah.
                          */}
                          {formatCurrency(order.total)}
                        </span>
                      </TableCell>

                      {/* Payment */}

                      <TableCell>
                        {/*
                          Conditional Rendering lagi.

                          Kalau paymentStatus === "PAID"
                          → badge hijau.

                          Kalau tidak
                          → badge merah.
                        */}
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
                          {/* Format tanggal sebelum ditampilkan. */}
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

            {/*
              Pagination hanya ditampilkan kalau
              jumlah halaman lebih dari 1.

              Kalau hanya ada 10 data:
              totalPages = 1
              → pagination tidak perlu ditampilkan.
            */}
            {totalPages > 1 && (
              <div className='flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-gray-500'>
                  Menampilkan {/* Index awal data yang sedang ditampilkan. */}
                  <span className='font-medium text-gray-900'>
                    {startIndex + 1}
                  </span>
                  -
                  {/* 
                    Math.min() digunakan agar angka terakhir
                    tidak melebihi jumlah data.

                    Contoh:
                    total data = 23
                    page terakhir = data 21 - 23

                    Bukan:
                    data 21 - 30
                  */}
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
                  {/* BUTTON PREVIOUS */}

                  <Button
                    variant='outline'
                    size='sm'
                    // Disable button kalau sudah berada di page 1.
                    disabled={currentPage === 1}
                    /*
                      Functional State Update.

                      page adalah nilai state currentPage sebelumnya.

                      Contoh:
                      currentPage = 3
                      → page - 1
                      → 2

                      Bentuk seperti ini aman ketika
                      perubahan state bergantung pada nilai sebelumnya.
                    */
                    onClick={() => setCurrentPage((page) => page - 1)}
                    className='border-gray-200'
                  >
                    Sebelumnya
                  </Button>

                  {/* CURRENT PAGE */}

                  <span className='rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700'>
                    {/*
                      Menampilkan:
                      halaman sekarang / total halaman

                      Contoh:
                      2 / 5
                    */}
                    {currentPage} / {totalPages}
                  </span>

                  {/* BUTTON NEXT */}

                  <Button
                    variant='outline'
                    size='sm'
                    // Disable kalau sudah berada di halaman terakhir.
                    disabled={currentPage === totalPages}
                    // Naikkan currentPage sebanyak 1.
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
