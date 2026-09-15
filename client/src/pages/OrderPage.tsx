import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Car,
  User,
  CalendarDays,
} from "lucide-react"

interface Customer {
  id: number
  name: string
  phone: string
}

interface Vehicle {
  id: number
  plateNumber: string
  brand: string
  model: string
  customerId: number
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  isActive: boolean
}

interface Order {
  id: number
  orderCode: string
  total: number
  status: string
  paymentStatus: string
  customer: {
    id: number
    name: string
  }
  vehicle: {
    id: number
    plateNumber: string
    brand: string
    model: string
  }
  orderItems: {
    service: Service
    quantity: number
    subtotal: number
  }[]
  createdAt: string
}

interface SelectedService {
  serviceId: number
  quantity: number
}

export default function OrderPage() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  )

  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [newCustomerAddress, setNewCustomerAddress] = useState("")
  const [showNewCustomer, setShowNewCustomer] = useState(false)

  const [newVehiclePlate, setNewVehiclePlate] = useState("")
  const [newVehicleBrand, setNewVehicleBrand] = useState("")
  const [newVehicleModel, setNewVehicleModel] = useState("")
  const [showNewVehicle, setShowNewVehicle] = useState(false)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  // =========================
  // FETCH DATA
  // =========================

  const fetchData = async () => {
    try {
      setFetching(true)
      setError("")

      const [custRes, vehRes, servRes, orderRes] = await Promise.all([
        axios.get("/customers"),
        axios.get("/vehicles"),
        axios.get("/services"),
        axios.get("/orders"),
      ])

      setCustomers(custRes.data.customers)
      setVehicles(vehRes.data.vehicles)

      const activeServices = servRes.data.services.filter(
        (s: Service) => s.isActive === true,
      )

      setServices(activeServices)
      setOrders(orderRes.data.data)
    } catch (err: any) {
      console.error("Gagal memuat data", err)

      setError(err.response?.data?.message || "Gagal memuat data order.")
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // =========================
  // FILTER VEHICLES
  // =========================

  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.customerId === Number(selectedCustomer),
  )

  // =========================
  // SERVICE TOGGLE
  // =========================

  const handleServiceToggle = (serviceId: number) => {
    if (selectedServices.some((service) => service.serviceId === serviceId)) {
      setSelectedServices(
        selectedServices.filter((service) => service.serviceId !== serviceId),
      )
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId,
          quantity: 1,
        },
      ])
    }
  }

  // =========================
  // CALCULATE TOTAL
  // =========================

  const calculatedTotal = selectedServices.reduce((sum, selected) => {
    const service = services.find(
      (service) => service.id === selected.serviceId,
    )

    return sum + (service ? Number(service.price) * selected.quantity : 0)
  }, 0)

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setSelectedCustomer("")
    setSelectedVehicle("")
    setSelectedServices([])

    setNewCustomerName("")
    setNewCustomerPhone("")
    setNewCustomerAddress("")

    setNewVehiclePlate("")
    setNewVehicleBrand("")
    setNewVehicleModel("")

    setShowNewCustomer(false)
    setShowNewVehicle(false)

    setEditingOrderId(null)
    setError("")
  }

  // =========================
  // CREATE DIALOG
  // =========================

  const openCreateDialog = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  // =========================
  // EDIT DIALOG
  // =========================

  const openEditDialog = (order: Order) => {
    setEditingOrderId(order.id)

    setSelectedCustomer(String(order.customer.id))
    setSelectedVehicle(String(order.vehicle.id))

    const servicesFromOrder = order.orderItems.map((item) => ({
      serviceId: item.service.id,
      quantity: item.quantity,
    }))

    setSelectedServices(servicesFromOrder)

    setError("")
    setEditDialogOpen(true)
  }

  // =========================
  // DELETE DIALOG
  // =========================

  const openDeleteDialog = (order: Order) => {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  // =========================
  // CREATE ORDER
  // =========================

  const handleCreateOrder = async () => {
    setLoading(true)
    setError("")

    try {
      let finalCustomerId = Number(selectedCustomer)
      let finalVehicleId = Number(selectedVehicle)

      // Create customer baru
      if (showNewCustomer) {
        const custRes = await axios.post("/customers", {
          name: newCustomerName,
          phone: newCustomerPhone,
          address: newCustomerAddress,
        })

        finalCustomerId = custRes.data.customer.id
      }

      // Create vehicle baru
      if (showNewVehicle) {
        const vehiclePayload = {
          customerId: finalCustomerId,
          plateNumber: newVehiclePlate,
          brand: newVehicleBrand,
          model: newVehicleModel,
        }

        const vehRes = await axios.post("/vehicles", vehiclePayload)

        finalVehicleId = Number(vehRes.data.vehicle.id)
      }

      // Create order
      await axios.post("/orders", {
        customerId: Number(finalCustomerId),
        vehicleId: Number(finalVehicleId),
        items: selectedServices,
      })

      setCreateDialogOpen(false)

      resetForm()

      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat order.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // UPDATE ORDER
  // =========================

  const handleUpdateOrder = async () => {
    if (!editingOrderId) return

    setLoading(true)
    setError("")

    try {
      await axios.patch(`/orders/${editingOrderId}`, {
        customerId: Number(selectedCustomer),
        vehicleId: Number(selectedVehicle),
        items: selectedServices,
      })

      setEditDialogOpen(false)

      resetForm()

      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal update order.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE ORDER
  // =========================

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return

    setLoading(true)
    setError("")

    try {
      await axios.delete(`/orders/${orderToDelete.id}`)

      setDeleteDialogOpen(false)
      setOrderToDelete(null)

      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menghapus order.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // FILTER ORDERS
  // =========================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchQuery) {
        const search = searchQuery.toLowerCase()

        const matchesSearch =
          order.customer?.name?.toLowerCase().includes(search) ||
          order.vehicle?.plateNumber?.toLowerCase().includes(search) ||
          order.orderCode?.toLowerCase().includes(search)

        if (!matchesSearch) {
          return false
        }
      }

      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false
      }

      const orderDate = new Date(order.createdAt)
      const orderDateOnly = orderDate.toISOString().split("T")[0]

      if (startDate && orderDateOnly < startDate) {
        return false
      }

      if (endDate && orderDateOnly > endDate) {
        return false
      }

      return true
    })
  }, [orders, searchQuery, statusFilter, startDate, endDate])

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage

  const paginateOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800"

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"

      case "COMPLETED":
        return "bg-green-100 text-green-800"

      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className='space-y-6'>
      {/* =========================
        HEADER
    ========================= */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Manajemen Order</h1>

          <p className='mt-1 text-sm text-gray-500'>
            Kelola order dan transaksi customer.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
          className='bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='mr-2 h-4 w-4' />
          Buat Order
        </Button>
      </div>

      {/* =========================
        GLOBAL ERROR
    ========================= */}

      {error && !createDialogOpen && !editDialogOpen && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      {/* =========================
        FILTER
    ========================= */}

      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <Filter className='h-5 w-5 text-blue-600' />

          <h2 className='font-semibold text-gray-900'>Filter & Search</h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {/* Search */}

          <div className='space-y-2'>
            <Label htmlFor='search-order'>
              Customer / Kendaraan / Order Code
            </Label>

            <div className='relative'>
              <Input
                id='search-order'
                placeholder='Cari nama, plat nomor, atau order code...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-9'
              />
            </div>
          </div>

          {/* Status */}

          <div className='space-y-2'>
            <Label htmlFor='status-filter'>Status</Label>

            <select
              id='status-filter'
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            >
              <option value='ALL'>Semua Status</option>
              <option value='WAITING'>Waiting</option>
              <option value='IN_PROGRESS'>In Progress</option>
              <option value='COMPLETED'>Completed</option>
            </select>
          </div>

          {/* Start Date */}

          <div className='space-y-2'>
            <Label htmlFor='start-date'>Tanggal Mulai</Label>

            <div className='relative'>
              <Input
                id='start-date'
                type='date'
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-9'
              />
            </div>
          </div>

          {/* End Date */}

          <div className='space-y-2'>
            <Label htmlFor='end-date'>Tanggal Akhir</Label>

            <div className='relative'>
              <Input
                id='end-date'
                type='date'
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-9'
              />
            </div>
          </div>
        </div>

        {/* Filter Info */}

        <div className='mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-gray-500'>
            Menampilkan{" "}
            <span className='font-semibold text-gray-900'>
              {filteredOrders.length}
            </span>{" "}
            dari{" "}
            <span className='font-semibold text-gray-900'>{orders.length}</span>{" "}
            order
          </p>

          {(searchQuery || statusFilter !== "ALL" || startDate || endDate) && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("ALL")
                setStartDate("")
                setEndDate("")
                setCurrentPage(1)
              }}
              className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* =========================
        ORDER TABLE
    ========================= */}

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <ClipboardList className='h-5 w-5 text-blue-600' />

            <h2 className='font-semibold text-gray-900'>Daftar Order</h2>

            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredOrders.length}
            </span>
          </div>
        </div>

        {fetching ? (
          <div className='flex items-center justify-center py-12 text-sm text-gray-500'>
            Memuat data order...
          </div>
        ) : paginateOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='mb-3 rounded-full bg-gray-100 p-3'>
              <ClipboardList className='h-6 w-6 text-gray-400' />
            </div>

            <p className='font-medium text-gray-900'>Tidak ada order</p>

            <p className='mt-1 text-sm text-gray-500'>
              Belum ada order yang sesuai dengan filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold text-gray-700'>
                  Order Code
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Customer
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Vehicle
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Services
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Total
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Payment
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Status
                </TableHead>

                <TableHead className='text-right font-semibold text-gray-700'>
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginateOrders.map((order) => (
                <TableRow key={order.id} className='hover:bg-gray-50'>
                  {/* Order Code */}

                  <TableCell>
                    <span className='font-mono text-sm font-semibold text-gray-800'>
                      {order.orderCode}
                    </span>
                  </TableCell>

                  {/* Customer */}

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                        <User className='h-4 w-4 text-blue-600' />
                      </div>

                      <span className='font-medium text-gray-700'>
                        {order.customer?.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Vehicle */}

                  <TableCell>
                    <div>
                      <div className='flex items-center gap-2'>
                        <Car className='h-4 w-4 text-gray-400' />

                        <span className='font-medium text-gray-800'>
                          {order.vehicle?.plateNumber}
                        </span>
                      </div>

                      <p className='ml-6 text-xs text-gray-500'>
                        {order.vehicle?.brand} {order.vehicle?.model}
                      </p>
                    </div>
                  </TableCell>

                  {/* Services */}

                  <TableCell>
                    <div className='max-w-55'>
                      {order.orderItems.map((item, index) => (
                        <div key={index} className='text-sm text-gray-700'>
                          {item.service.name}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* Total */}

                  <TableCell>
                    <span className='font-semibold text-gray-900'>
                      Rp {Number(order.total).toLocaleString("id-ID")}
                    </span>
                  </TableCell>

                  {/* Payment */}

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>

                  {/* Status */}

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </TableCell>

                  {/* Actions */}

                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      {/* Detail */}

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Eye className='mr-1.5 h-4 w-4' />
                        Detail
                      </Button>

                      {/* Edit */}

                      {order.status === "WAITING" && (
                        <>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => openEditDialog(order)}
                            className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                          >
                            <Edit className='mr-1.5 h-4 w-4' />
                            Edit
                          </Button>

                          {/* Delete */}

                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => openDeleteDialog(order)}
                            className='border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                          >
                            <Trash2 className='mr-1.5 h-4 w-4' />
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

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
      </div>

      {/* =====================================================
        CREATE ORDER DIALOG
    ===================================================== */}

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)

          if (!open) {
            resetForm()
          }
        }}
      >
        {/* 👇 INI YANG DILEBARIN */}
        <DialogContent className='!w-[90vw] !max-w-5xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50'>
                <Plus className='h-5 w-5 text-blue-600' />
              </div>
              Buat Order Baru
            </DialogTitle>

            <DialogDescription>
              Pilih customer, kendaraan, dan layanan untuk membuat order baru.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
              {error}
            </div>
          )}

          <div className='space-y-6'>
            {/* =========================
              CUSTOMER
          ========================= */}

            <div className='space-y-2'>
              <Label>Customer</Label>

              {!showNewCustomer ? (
                <div className='flex gap-2'>
                  <select
                    className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value)
                      setSelectedVehicle("")
                    }}
                  >
                    <option value=''>-- Pilih Customer --</option>

                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>

                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowNewCustomer(true)}
                    className='shrink-0 border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                  >
                    <Plus className='mr-1.5 h-4 w-4' />
                    Baru
                  </Button>
                </div>
              ) : (
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-blue-600' />

                      <span className='text-sm font-semibold text-gray-900'>
                        Customer Baru
                      </span>
                    </div>

                    <Button
                      type='button'
                      size='sm'
                      variant='ghost'
                      onClick={() => {
                        setShowNewCustomer(false)
                        setNewCustomerName("")
                        setNewCustomerPhone("")
                        setNewCustomerAddress("")
                      }}
                      className='text-gray-500 hover:text-gray-900'
                    >
                      Batal
                    </Button>
                  </div>

                  <div className='space-y-3'>
                    <Input
                      placeholder='Nama customer'
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                    />

                    <Input
                      placeholder='No. Telepon'
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                    />

                    <Input
                      placeholder='Alamat (opsional)'
                      value={newCustomerAddress}
                      onChange={(e) => setNewCustomerAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* =========================
              VEHICLE
          ========================= */}

            <div className='space-y-2'>
              <Label>Kendaraan</Label>

              {!showNewVehicle ? (
                <div className='flex gap-2'>
                  <select
                    className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    disabled={!selectedCustomer && !showNewCustomer}
                  >
                    <option value=''>-- Pilih Kendaraan --</option>

                    {filteredVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>

                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowNewVehicle(true)}
                    disabled={!selectedCustomer && !showNewCustomer}
                    className='shrink-0 border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                  >
                    <Plus className='mr-1.5 h-4 w-4' />
                    Baru
                  </Button>
                </div>
              ) : (
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Car className='h-4 w-4 text-blue-600' />

                      <span className='text-sm font-semibold text-gray-900'>
                        Kendaraan Baru
                      </span>
                    </div>

                    <Button
                      type='button'
                      size='sm'
                      variant='ghost'
                      onClick={() => {
                        setShowNewVehicle(false)
                        setNewVehiclePlate("")
                        setNewVehicleBrand("")
                        setNewVehicleModel("")
                      }}
                      className='text-gray-500 hover:text-gray-900'
                    >
                      Batal
                    </Button>
                  </div>

                  <div className='space-y-3'>
                    <Input
                      placeholder='Plat Nomor'
                      value={newVehiclePlate}
                      onChange={(e) => setNewVehiclePlate(e.target.value)}
                    />

                    <Input
                      placeholder='Merk'
                      value={newVehicleBrand}
                      onChange={(e) => setNewVehicleBrand(e.target.value)}
                    />

                    <Input
                      placeholder='Model'
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* =========================
              SERVICES
          ========================= */}

            <div className='space-y-2'>
              <Label>Pilih Layanan</Label>

              <p className='text-xs text-gray-500'>
                Hanya layanan yang sedang aktif yang dapat dipilih.
              </p>

              <div className='grid gap-3 pt-1 md:grid-cols-2'>
                {services.map((service) => {
                  const selected = selectedServices.find(
                    (item) => item.serviceId === service.id,
                  )

                  return (
                    <div
                      key={service.id}
                      className={`cursor-pointer rounded-lg border p-4 transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {service.name}
                          </p>

                          <p className='mt-1 flex items-center gap-1 text-xs text-gray-500'>
                            <span>{service.duration} Menit</span>
                          </p>
                        </div>

                        {selected && (
                          <span className='rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white'>
                            Dipilih
                          </span>
                        )}
                      </div>

                      <p className='mt-3 font-bold text-blue-600'>
                        Rp {Number(service.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* =========================
              TOTAL
          ========================= */}

            <div className='rounded-lg border border-blue-100 bg-blue-50 p-4'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold text-gray-700'>
                  Total Estimasi
                </span>

                <span className='text-2xl font-bold text-blue-600'>
                  Rp {calculatedTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type='button'
              onClick={handleCreateOrder}
              disabled={
                loading ||
                selectedServices.length === 0 ||
                (!selectedCustomer && !showNewCustomer) ||
                (!selectedVehicle && !showNewVehicle)
              }
              className='bg-blue-600 hover:bg-blue-700'
            >
              {loading ? "Memproses..." : "Buat Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
        EDIT ORDER DIALOG
    ===================================================== */}

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)

          if (!open) {
            resetForm()
          }
        }}
      >
        {/* 👇 INI JUGA DILEBARIN */}
        <DialogContent className='!w-[90vw] !max-w-5xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50'>
                <Edit className='h-5 w-5 text-blue-600' />
              </div>
              Edit Order
            </DialogTitle>

            <DialogDescription>
              Order hanya dapat diedit saat status masih WAITING.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
              {error}
            </div>
          )}

          <div className='space-y-6'>
            {/* Customer */}

            <div className='space-y-2'>
              <Label>Customer</Label>

              <select
                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value)
                  setSelectedVehicle("")
                }}
              >
                <option value=''>-- Pilih Customer --</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle */}

            <div className='space-y-2'>
              <Label>Kendaraan</Label>

              <select
                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                disabled={!selectedCustomer}
              >
                <option value=''>-- Pilih Kendaraan --</option>

                {filteredVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Services */}

            <div className='space-y-2'>
              <Label>Pilih Layanan</Label>

              <div className='grid gap-3 pt-1 md:grid-cols-2'>
                {services.map((service) => {
                  const selected = selectedServices.find(
                    (item) => item.serviceId === service.id,
                  )

                  return (
                    <div
                      key={service.id}
                      className={`cursor-pointer rounded-lg border p-4 transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {service.name}
                          </p>

                          <p className='mt-1 text-xs text-gray-500'>
                            {service.duration} Menit
                          </p>
                        </div>

                        {selected && (
                          <span className='rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white'>
                            Dipilih
                          </span>
                        )}
                      </div>

                      <p className='mt-3 font-bold text-blue-600'>
                        Rp {Number(service.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Total */}

            <div className='rounded-lg border border-blue-100 bg-blue-50 p-4'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold text-gray-700'>
                  Total Estimasi
                </span>

                <span className='text-2xl font-bold text-blue-600'>
                  Rp {calculatedTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setEditDialogOpen(false)
                resetForm()
              }}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type='button'
              onClick={handleUpdateOrder}
              disabled={
                loading ||
                selectedServices.length === 0 ||
                !selectedCustomer ||
                !selectedVehicle
              }
              className='bg-blue-600 hover:bg-blue-700'
            >
              {loading ? "Memproses..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
        DELETE DIALOG
    ===================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)

          if (!open) {
            setOrderToDelete(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Hapus Order</DialogTitle>

            <DialogDescription>
              Apakah kamu yakin ingin menghapus order{" "}
              <span className='font-semibold text-gray-900'>
                {orderToDelete?.orderCode}
              </span>
              ?
              <br />
              <br />
              Order akan dihapus secara permanen. Customer, kendaraan, dan
              layanan tidak akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type='button'
              onClick={handleDeleteConfirm}
              disabled={loading}
              className='bg-red-600 hover:bg-red-700'
            >
              {loading ? "Menghapus..." : "Hapus Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
