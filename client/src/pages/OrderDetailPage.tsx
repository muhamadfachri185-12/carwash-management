import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "../lib/axios"

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

interface Service {
  id: number
  name: string
  price: number
  duration: number
}

interface OrderItem {
  id: number
  service: Service
  quantity: number
  priceSnapshot: number
  durationSnapshot: number
  subtotal: number
}

interface Payment {
  id: number
  amount: number
  method: string
  paidAt: string
}

interface Order {
  id: number
  orderCode: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  totalDuration: number
  checkInTime: string
  completedAt: string | null

  customer: {
    id: number
    name: string
    phone: string
  }

  vehicle: {
    id: number
    plateNumber: string
    brand: string
    model: string
  }

  orderItems: OrderItem[]
  createdAt: string

  payment: Payment | null

  createdBy: {
    name: string
  }
}

export default function OrderDetailPage() {
  // Mengambil ID order dari URL.
  // Contoh:
  // /orders/5
  // maka id = "5"
  const { id } = useParams()

  // Digunakan untuk berpindah halaman.
  const navigate = useNavigate()

  // Menyimpan data order dari backend.
  const [order, setOrder] = useState<Order | null>(null)

  // Loading ketika mengambil data order.
  const [loading, setLoading] = useState(true)

  // Menyimpan pesan error.
  const [error, setError] = useState("")

  // Loading ketika melakukan action.
  // Misalnya update status atau pembayaran.
  const [actionLoading, setActionLoading] = useState(false)

  // Menyimpan metode pembayaran yang dipilih.
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  // Mengontrol apakah form pembayaran ditampilkan.
  const [showPayment, setShowPayment] = useState(false)

  // Menyimpan jumlah uang yang diterima dari customer.
  const [receivedAmount, setReceivedAmount] = useState(0)

  // Menyimpan nilai kembalian.
  const [change, setChange] = useState(0)

  // ======================================================
  // FETCH ORDER
  // ======================================================

  const fetchOrder = async () => {
    try {
      // Mengambil detail order berdasarkan ID.
      const response = await axios.get(`/orders/${id}`)

      // Backend mengirim:
      //
      // {
      //   data: order
      // }
      //
      // Jadi data order berada di response.data.data.
      setOrder(response.data.data)
    } catch (err: any) {
      // Kalau request gagal,
      // ambil message dari backend.
      setError(err.response?.data?.message || "Gagal memuat order")
    } finally {
      // Loading selesai baik request berhasil
      // maupun gagal.
      setLoading(false)
    }
  }

  // Jalankan fetchOrder ketika:
  // 1. Component pertama kali muncul
  // 2. ID order berubah
  useEffect(() => {
    fetchOrder()
  }, [id])

  // ======================================================
  // UPDATE STATUS ORDER
  // ======================================================

  const handleUpdateStatus = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    // Kalau order belum tersedia,
    // jangan lanjutkan proses.
    if (!order) return

    setActionLoading(true)

    try {
      // Kirim status baru ke backend.
      //
      // Contoh:
      // WAITING → IN_PROGRESS
      //
      // atau:
      // IN_PROGRESS → COMPLETED
      await axios.patch(`/orders/${order.id}/status`, {
        status: newStatus,
      })

      // Setelah berhasil update,
      // ambil ulang data order.
      //
      // Tujuannya supaya status di halaman
      // langsung berubah mengikuti database.
      await fetchOrder()
    } catch (err: any) {
      // Tampilkan error dari backend.
      alert(err.response?.data?.message || "Gagal mengubah status")
    } finally {
      // Selesai melakukan action.
      setActionLoading(false)
    }
  }

  // ======================================================
  // PAYMENT
  // ======================================================

  const handlePayment = async () => {
    // Pastikan order tersedia
    // dan metode pembayaran sudah dipilih.
    if (!order || !selectedPaymentMethod) return

    setActionLoading(true)

    try {
      // CASH:
      // gunakan uang yang benar-benar diterima.
      //
      // TRANSFER / QRIS:
      // gunakan total order.
      const paymentAmount =
        selectedPaymentMethod === "CASH" ? receivedAmount : Number(order.total)

      // Kirim data pembayaran ke backend.
      await axios.post(`/orders/${order.id}/payment`, {
        amount: paymentAmount,
        method: selectedPaymentMethod,
      })

      // Ambil ulang order setelah pembayaran berhasil.
      await fetchOrder()

      // Tutup form pembayaran.
      setShowPayment(false)

      // Reset form pembayaran.
      setSelectedPaymentMethod("")
      setReceivedAmount(0)
      setChange(0)
    } catch (err: any) {
      // Tampilkan error dari backend.
      alert(err.response?.data?.message || "Gagal memproses pembayaran")
    } finally {
      setActionLoading(false)
    }
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return <p className='p-8'>Memuat order...</p>
  }

  // ======================================================
  // ERROR / ORDER TIDAK DITEMUKAN
  // ======================================================

  if (error || !order) {
    return (
      <div className='p-8'>
        <p className='text-red-500'>{error || "Order tidak ditemukan"}</p>

        <Button onClick={() => navigate("/orders")} className='mt-4'>
          Kembali ke Orders
        </Button>
      </div>
    )
  }

  // ======================================================
  // STATUS COLORS
  // ======================================================

  // Digunakan untuk memberikan warna berbeda
  // berdasarkan status order.
  const statusColors: Record<string, string> = {
    WAITING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
  }

  // ======================================================
  // HITUNG KEMBALIAN
  // ======================================================

  const hitungChange = (amount: number) => {
    // Kembalian hanya dihitung
    // kalau metode pembayaran CASH.
    if (selectedPaymentMethod === "CASH" && amount > 0) {
      return amount - Number(order.total)
    }

    return 0
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className='p-8 space-y-6 max-w-5xl mx-auto'>
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Order Detail</h1>

          <Button
            variant='outline'
            onClick={() => navigate("/orders")}
            className='mt-2'
          >
            Kembali
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-500'>
            Order Code: <span className='font-medium'>{order.orderCode}</span>
          </span>
        </div>
      </div>

      {/* ==================================================
          ORDER SUMMARY
      ================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Order</CardTitle>
        </CardHeader>

        <CardContent className='space-y-3'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Total Estimasi</span>

            <span className='font-semibold text-gray-800'>
              Rp {Number(order.total).toLocaleString("id-ID")}
            </span>
          </div>

          <div className='flex justify-between'>
            <span className='text-gray-500'>Durasi</span>

            <span className='font-semibold'>{order.totalDuration} menit</span>
          </div>

          {order.completedAt && (
            <div className='flex justify-between'>
              <span className='text-gray-500'>Selesai</span>

              <span className='font-semibold'>
                {new Date(order.completedAt).toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================================================
          STATUS PENGERJAAN
      ================================================== */}

      <Card className='border-orange-200'>
        <CardHeader>
          <CardTitle>Status Pengerjaan</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Status order saat ini */}
          <div className='flex items-center justify-between'>
            <span className='text-gray-500'>Status Saat Ini</span>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* ==============================================
              WAITING → IN_PROGRESS
          ============================================== */}

          {order.status === "WAITING" && (
            <Button
              onClick={() => handleUpdateStatus("IN_PROGRESS")}
              disabled={actionLoading}
              className='w-full bg-blue-600 hover:bg-blue-700'
            >
              {actionLoading ? "Memproses..." : "Mulai Pengerjaan"}
            </Button>
          )}

          {/* ==============================================
              IN_PROGRESS → COMPLETED
          ============================================== */}

          {order.status === "IN_PROGRESS" && (
            <Button
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={actionLoading}
              className='w-full bg-green-600 hover:bg-green-700'
            >
              {actionLoading ? "Memproses..." : "Selesaikan Pengerjaan"}
            </Button>
          )}

          {/* ==============================================
              COMPLETED
          ============================================== */}

          {order.status === "COMPLETED" && (
            <div className='rounded-md bg-green-50 p-3 text-sm text-green-700'>
              Pengerjaan sudah selesai.
              <br />
              Pembayaran dapat dicatat.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================================================
          CUSTOMER & VEHICLE
      ================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Customer & Vehicle</CardTitle>
        </CardHeader>

        <CardContent className='space-y-3'>
          <div>
            <Label className='text-gray-500'>Customer</Label>

            <p className='font-medium text-gray-800'>{order.customer.name}</p>

            <p className='text-sm text-gray-500'>{order.customer.phone}</p>
          </div>

          <div>
            <Label className='text-gray-500'>Vehicle</Label>

            <p className='font-medium text-gray-800'>
              {order.vehicle.plateNumber} - {order.vehicle.brand}{" "}
              {order.vehicle.model}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================
          SERVICE ITEMS
      ================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Service Items</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className='text-right'>Subtotal</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {order.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.service.name}</TableCell>

                  <TableCell>{item.quantity}</TableCell>

                  <TableCell>
                    Rp {Number(item.priceSnapshot).toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell>{item.durationSnapshot} menit</TableCell>

                  <TableCell className='text-right font-semibold'>
                    Rp {Number(item.subtotal).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total */}
          <div className='mt-4 pt-4 border-t'>
            <div className='flex justify-between'>
              <span className='text-lg font-semibold'>Subtotal</span>

              <span className='font-semibold text-gray-600'>
                Rp {Number(order.subtotal).toLocaleString("id-ID")}
              </span>
            </div>

            <div className='flex justify-between text-lg'>
              <span className='font-bold'>Total</span>

              <span className='font-bold text-blue-600'>
                Rp {Number(order.total).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================
          PAYMENT INFORMATION
      ================================================== */}

      {/* Card ini hanya muncul kalau
          order sudah mempunyai payment. */}
      {order.payment && (
        <Card className='border-green-200'>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>

          <CardContent className='space-y-3'>
            <div>
              <Label className='text-gray-500'>Method</Label>

              <p className='font-medium'>{order.payment.method}</p>
            </div>

            <div>
              <Label className='text-gray-500'>Amount</Label>

              <p className='font-medium'>
                Rp {Number(order.payment.amount).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Kalau CASH,
                tampilkan kembalian. */}
            {order.payment.method === "CASH" && (
              <div>
                <Label className='text-gray-500'>Change (Kembalian)</Label>

                <p className='font-medium text-green-600'>
                  Rp{" "}
                  {Number(order.payment.amount - order.total).toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>
            )}

            <div>
              <Label className='text-gray-500'>Paid At</Label>

              <p>{new Date(order.payment.paidAt).toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================================================
          PAYMENT FORM
      ================================================== */}

      <Card className='border-blue-200'>
        <CardHeader>
          <CardTitle>Catat Pembayaran</CardTitle>
        </CardHeader>

        <CardContent>
          {/* =================================================
              PEMBAYARAN HANYA BOLEH SETELAH COMPLETED
          ================================================= */}

          {order.status !== "COMPLETED" && (
            <div className='rounded-md bg-yellow-50 p-3 text-sm text-yellow-700'>
              Pembayaran belum dapat dicatat.
              <br />
              Selesaikan pengerjaan terlebih dahulu.
            </div>
          )}

          {/* Tombol pembayaran hanya muncul kalau:
              1. Status order COMPLETED
              2. Belum dibayar
              3. Form pembayaran belum dibuka
          */}
          {order.status === "COMPLETED" &&
            order.paymentStatus === "UNPAID" &&
            !showPayment && (
              <Button
                onClick={() => setShowPayment(true)}
                className='w-full bg-green-600 hover:bg-green-700'
              >
                Catat Pembayaran
              </Button>
            )}

          {/* Kalau sudah PAID,
              tampilkan informasi sederhana. */}
          {order.status === "COMPLETED" && order.paymentStatus === "PAID" && (
            <div className='rounded-md bg-green-50 p-3 text-sm text-green-700'>
              Pembayaran sudah dilakukan.
            </div>
          )}

          {/* =================================================
              FORM PEMBAYARAN
          ================================================= */}

          {showPayment && (
            <div className='border rounded-md p-4 space-y-4'>
              <Label>Pilih Metode Pembayaran</Label>

              {/* Pilihan metode pembayaran */}
              <div className='grid grid-cols-3 gap-3 mb-4'>
                {["CASH", "TRANSFER", "QRIS"].map((method) => (
                  <button
                    key={method}
                    type='button'
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`py-2 px-4 rounded-md border text-sm font-medium transition ${
                      selectedPaymentMethod === method
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* =================================================
                  INPUT UANG CASH
              ================================================= */}

              {selectedPaymentMethod === "CASH" && (
                <div>
                  <Label>Uang Diterima</Label>

                  <Input
                    type='number'
                    value={receivedAmount || ""}
                    onChange={(e) => {
                      // Ambil nilai input.
                      const value = Number(e.target.value)

                      // Simpan uang yang diterima.
                      setReceivedAmount(value)

                      // Hitung kembalian
                      // menggunakan value terbaru.
                      setChange(hitungChange(value))
                    }}
                    placeholder='Masukkan nominal uang yang diterima'
                    className='text-lg font-semibold'
                  />

                  {/* Pesan jika uang kurang */}
                  {receivedAmount > 0 &&
                    receivedAmount < Number(order.total) && (
                      <p className='text-red-500 text-sm mt-1'>
                        Uang pembayaran kurang dari total.
                      </p>
                    )}
                </div>
              )}

              {/* =================================================
                  PAYMENT SUMMARY
              ================================================= */}

              <div className='bg-gray-50 p-3 rounded-md'>
                {/* Total Order */}
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Total Order</span>

                  <span className='font-semibold'>
                    Rp {Number(order.total).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* CASH SUMMARY */}
                {selectedPaymentMethod === "CASH" && receivedAmount > 0 && (
                  <>
                    {/* Uang diterima */}
                    <div className='flex justify-between mt-2'>
                      <span className='text-sm text-gray-600'>
                        Uang Diterima
                      </span>

                      <span className='font-semibold'>
                        Rp {receivedAmount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Kembalian */}
                    <div className='flex justify-between mt-2'>
                      <span className='text-sm text-gray-600'>Kembalian</span>

                      <span className='font-bold text-green-600'>
                        Rp {Math.max(change, 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* =================================================
                  PAYMENT ACTION BUTTON
              ================================================= */}

              <div className='flex gap-2'>
                <Button
                  onClick={handlePayment}
                  disabled={
                    actionLoading ||
                    !selectedPaymentMethod ||
                    (selectedPaymentMethod === "CASH" &&
                      (receivedAmount === 0 ||
                        receivedAmount < Number(order.total)))
                  }
                  className='flex-1'
                >
                  {actionLoading ? "Memproses..." : "Konfirmasi Pembayaran"}
                </Button>

                <Button
                  variant='outline'
                  onClick={() => {
                    // Tutup form.
                    setShowPayment(false)

                    // Reset semua data pembayaran.
                    setSelectedPaymentMethod("")
                    setReceivedAmount(0)
                    setChange(0)
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
