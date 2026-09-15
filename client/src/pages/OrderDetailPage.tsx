import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "../lib/axios"

import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"

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
  payment: {
    id: number
    method: string
    amount: number
    paidAt: string
  } | null
  createdBy: {
    name: string
  }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [showPayment, setShowPayment] = useState(false)

  const [receivedAmount, setReceivedAmount] = useState(0)
  const [change, setChange] = useState(0)

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/orders/${id}`)
      setOrder(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat order")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    if (!order) return

    setActionLoading(true)

    try {
      await axios.patch(`/orders/${order.id}/status`, {
        status: newStatus,
      })

      await fetchOrder()
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengubah status")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order || !selectedPaymentMethod) return

    setActionLoading(true)

    try {
      const paymentAmount =
        selectedPaymentMethod === "CASH" ? receivedAmount : Number(order.total)

      await axios.post(`/orders/${order.id}/payment`, {
        amount: paymentAmount,
        method: selectedPaymentMethod,
      })

      await fetchOrder()

      setShowPayment(false)
      setSelectedPaymentMethod("")
      setReceivedAmount(0)
      setChange(0)
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memproses pembayaran")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='p-8 max-w-6xl mx-auto'>
        <p className='text-sm text-gray-500'>Memuat order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='p-8 max-w-6xl mx-auto'>
        <Card className='border-gray-200 shadow-sm'>
          <CardContent className='p-6'>
            <p className='text-red-500'>{error || "Order tidak ditemukan"}</p>

            <Button onClick={() => navigate("/orders")} className='mt-4'>
              Kembali ke Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-8 space-y-8 max-w-6xl mx-auto'>
      {/* PAGE HEADER */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Order Detail</h1>

          <p className='text-sm text-gray-500 mt-1'>
            Detail informasi dan proses order
          </p>
        </div>

        <Button
          variant='outline'
          onClick={() => navigate("/orders")}
          className='border-gray-300'
        >
          Kembali
        </Button>
      </div>

      {/* ORDER INFORMATION */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* ORDER INFO */}
        <Card className='border-gray-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-xl'>Informasi Order</CardTitle>
          </CardHeader>

          <CardContent className='space-y-5'>
            <div>
              <Label className='text-sm text-gray-500'>Order Code</Label>

              <p className='mt-1 font-semibold text-gray-900'>
                {order.orderCode}
              </p>
            </div>

            <div>
              <Label className='text-sm text-gray-500'>Status</Label>

              <div className='mt-1'>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                    order.status === "WAITING"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div>
              <Label className='text-sm text-gray-500'>Payment Status</Label>

              <div className='mt-1'>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === "UNPAID"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div>
              <Label className='text-sm text-gray-500'>Check-in Time</Label>

              <p className='mt-1 text-gray-700'>
                {new Date(order.checkInTime).toLocaleString("id-ID")}
              </p>
            </div>

            {order.completedAt && (
              <div>
                <Label className='text-sm text-gray-500'>Completed At</Label>

                <p className='mt-1 text-gray-700'>
                  {new Date(order.completedAt).toLocaleString("id-ID")}
                </p>
              </div>
            )}

            <div>
              <Label className='text-sm text-gray-500'>Created By</Label>

              <p className='mt-1 text-gray-700'>{order.createdBy.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER & VEHICLE */}
        <Card className='border-gray-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-xl'>Customer & Vehicle</CardTitle>
          </CardHeader>

          <CardContent className='space-y-5'>
            <div>
              <Label className='text-sm text-gray-500'>Customer</Label>

              <p className='mt-1 font-semibold text-gray-900'>
                {order.customer.name}
              </p>

              <p className='text-sm text-gray-500 mt-1'>
                {order.customer.phone}
              </p>
            </div>

            <div>
              <Label className='text-sm text-gray-500'>Vehicle</Label>

              <p className='mt-1 font-semibold text-gray-900'>
                {order.vehicle.plateNumber}
              </p>

              <p className='text-sm text-gray-500 mt-1'>
                {order.vehicle.brand} {order.vehicle.model}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SERVICE ITEMS */}
      <Card className='border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-xl'>Service Items</CardTitle>
        </CardHeader>

        <CardContent>
          <div className='rounded-md border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50 hover:bg-gray-50'>
                    <TableHead className='font-semibold text-gray-700'>
                      Service
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Quantity
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Price
                    </TableHead>

                    <TableHead className='font-semibold text-gray-700'>
                      Duration
                    </TableHead>

                    <TableHead className='text-right font-semibold text-gray-700'>
                      Subtotal
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.id} className='hover:bg-gray-50'>
                      <TableCell className='font-medium text-gray-900'>
                        {item.service.name}
                      </TableCell>

                      <TableCell className='text-gray-700'>
                        {item.quantity}
                      </TableCell>

                      <TableCell className='text-gray-700'>
                        Rp {Number(item.priceSnapshot).toLocaleString("id-ID")}
                      </TableCell>

                      <TableCell className='text-gray-700'>
                        {item.durationSnapshot} menit
                      </TableCell>

                      <TableCell className='text-right font-semibold text-gray-900'>
                        Rp {Number(item.subtotal).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className='mt-6 space-y-3 border-t border-gray-200 pt-5'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Subtotal</span>

              <span className='font-semibold text-gray-900'>
                Rp {Number(order.subtotal).toLocaleString("id-ID")}
              </span>
            </div>

            <div className='flex justify-between'>
              <span className='text-gray-500'>Total Duration</span>

              <span className='font-semibold text-gray-900'>
                {order.totalDuration} menit
              </span>
            </div>

            <div className='flex justify-between items-center pt-2'>
              <span className='text-lg font-bold text-gray-900'>Total</span>

              <span className='text-xl font-bold text-blue-600'>
                Rp {Number(order.total).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PAYMENT INFORMATION */}
      {order.payment && (
        <Card className='border-green-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-xl'>Payment Information</CardTitle>
          </CardHeader>

          <CardContent className='space-y-5'>
            <div>
              <Label className='text-sm text-gray-500'>Method</Label>

              <p className='mt-1 font-semibold text-gray-900'>
                {order.payment.method}
              </p>
            </div>

            <div>
              <Label className='text-sm text-gray-500'>Amount Received</Label>

              <p className='mt-1 font-semibold text-gray-900'>
                Rp {Number(order.payment.amount).toLocaleString("id-ID")}
              </p>
            </div>

            <div>
              <Label className='text-sm text-gray-500'>Paid At</Label>

              <p className='mt-1 text-gray-700'>
                {new Date(order.payment.paidAt).toLocaleString("id-ID")}
              </p>
            </div>

            {order.payment.method === "CASH" && (
              <div>
                <Label className='text-sm text-gray-500'>
                  Change (Kembalian)
                </Label>

                <p className='mt-1 font-semibold text-green-600'>
                  Rp{" "}
                  {(
                    Number(order.payment.amount) - Number(order.total)
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ACTIONS */}
      <Card className='border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-xl'>Actions</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* WAITING → IN PROGRESS */}
          {order.status === "WAITING" && (
            <Button
              onClick={() => handleUpdateStatus("IN_PROGRESS")}
              disabled={actionLoading}
              className='w-full'
            >
              {actionLoading ? "Memproses..." : "Mulai Cuci (IN_PROGRESS)"}
            </Button>
          )}

          {/* IN PROGRESS → COMPLETED */}
          {order.status === "IN_PROGRESS" && (
            <Button
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={actionLoading}
              className='w-full'
            >
              {actionLoading ? "Memproses..." : "Selesaikan (COMPLETED)"}
            </Button>
          )}

          {/* PAYMENT BUTTON */}
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

          {/* PAYMENT FORM */}
          {showPayment && (
            <div className='rounded-md border border-gray-200 p-5 space-y-5'>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Pilih Metode Pembayaran
                </Label>

                <div className='grid grid-cols-3 gap-3 mt-2'>
                  {["CASH", "TRANSFER", "QRIS"].map((method) => (
                    <button
                      key={method}
                      type='button'
                      onClick={() => {
                        setSelectedPaymentMethod(method)

                        if (method !== "CASH") {
                          setReceivedAmount(Number(order?.total || 0))
                        }
                      }}
                      className={`py-2 px-4 rounded-md border text-sm font-medium transition ${
                        selectedPaymentMethod === method
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* CASH */}
              {selectedPaymentMethod === "CASH" && (
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>
                    Uang Diterima (Cash)
                  </Label>

                  <Input
                    type='number'
                    value={receivedAmount || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value)

                      setReceivedAmount(value)

                      setChange(value - Number(order?.total || 0))
                    }}
                    placeholder='Masukkan nominal uang yang diterima'
                    className='text-lg font-semibold border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  />

                  {receivedAmount > 0 &&
                    receivedAmount < Number(order?.total || 0) && (
                      <p className='text-red-500 text-sm'>
                        Uang pembayaran kurang dari total
                      </p>
                    )}

                  {/* CASH SUMMARY */}
                  <div className='bg-gray-50 border border-gray-200 p-4 rounded-md space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>Total Order</span>

                      <span className='font-semibold text-gray-900'>
                        Rp {Number(order?.total || 0).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {receivedAmount > 0 && (
                      <>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Uang Diterima</span>

                          <span className='font-semibold text-gray-900'>
                            Rp {receivedAmount.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Kembalian</span>

                          <span
                            className={`font-bold ${
                              change >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            Rp {Math.abs(change).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* PAYMENT TOTAL */}
              <div className='bg-gray-50 border border-gray-200 p-4 rounded-md'>
                <p className='text-sm text-gray-500'>Total</p>

                <p className='text-xl font-bold text-gray-900'>
                  Rp {Number(order.total).toLocaleString("id-ID")}
                </p>
              </div>

              {/* PAYMENT ACTION */}
              <div className='flex gap-2'>
                <Button
                  onClick={handlePayment}
                  disabled={actionLoading || !selectedPaymentMethod}
                  className='flex-1'
                >
                  {actionLoading ? "Memproses..." : "Konfirmasi Pembayaran"}
                </Button>

                <Button
                  variant='outline'
                  onClick={() => {
                    setShowPayment(false)
                    setSelectedPaymentMethod("")
                  }}
                  className='border-gray-300'
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
