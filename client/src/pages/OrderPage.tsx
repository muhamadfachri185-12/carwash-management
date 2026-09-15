// useState  -> menyimpan data/state yang bisa berubah
// useEffect -> menjalankan kode ketika component pertama kali dijalankan
// useMemo   -> menyimpan hasil perhitungan agar tidak dihitung ulang
//             kalau dependency-nya tidak berubah
import { useState, useEffect, useMemo } from "react"

// useNavigate -> fungsi React Router untuk pindah halaman lewat kode
import { useNavigate } from "react-router-dom"

// axios -> instance Axios yang sudah kita buat untuk komunikasi dengan backend
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

// ============================================================
// INTERFACE / TYPE
// ============================================================

// Interface digunakan TypeScript untuk menentukan bentuk data.

// Contoh:
// Customer harus mempunyai:
// id    -> number
// name  -> string
// phone -> string

// Dengan interface, TypeScript bisa membantu kita mendeteksi
// kalau struktur data yang kita gunakan tidak sesuai.
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

  // Satu order bisa mempunyai banyak service.
  orderItems: {
    service: Service
    quantity: number
    subtotal: number
  }[]

  createdAt: string
}

// Data service yang dipilih user ketika membuat order.
//
// Contoh:
// {
//   serviceId: 1,
//   quantity: 2
// }
interface SelectedService {
  serviceId: number
  quantity: number
}

export default function OrderPage() {
  // useNavigate digunakan untuk berpindah halaman.
  //
  // Contoh:
  // navigate("/orders/10")
  //
  // berarti browser pindah ke halaman detail order ID 10.
  const navigate = useNavigate()

  // ============================================================
  // STATE DATA
  // ============================================================

  // Array customer dari backend.
  //
  // useState<Customer[]>([])
  // artinya:
  // state ini berupa array yang setiap item-nya harus mengikuti
  // interface Customer.
  const [customers, setCustomers] = useState<Customer[]>([])

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // ============================================================
  // STATE DIALOG
  // ============================================================

  // Boolean digunakan untuk menentukan apakah Dialog terbuka.
  //
  // false -> dialog tertutup
  // true  -> dialog terbuka
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // editingOrderId digunakan untuk mengetahui order mana
  // yang sedang diedit.
  //
  // number | null berarti:
  // - bisa berupa number
  // - bisa juga null
  //
  // null = tidak sedang edit order.
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)

  // Menyimpan object order yang akan dihapus.
  //
  // Kenapa bukan cuma ID?
  // Karena kita juga membutuhkan orderCode untuk ditampilkan
  // di confirmation dialog.
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  // ============================================================
  // STATE FORM ORDER
  // ============================================================

  // Value dari <select> biasanya berupa string.
  //
  // Jadi walaupun ID customer sebenarnya number,
  // state-nya kita simpan sebagai string.
  const [selectedCustomer, setSelectedCustomer] = useState("")

  const [selectedVehicle, setSelectedVehicle] = useState("")

  // Array service yang dipilih user.
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  )

  // ============================================================
  // STATE CUSTOMER BARU
  // ============================================================

  // State ini digunakan ketika user memilih
  // "Customer Baru".
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [newCustomerAddress, setNewCustomerAddress] = useState("")

  // true  -> form customer baru ditampilkan
  // false -> select customer lama ditampilkan
  const [showNewCustomer, setShowNewCustomer] = useState(false)

  // ============================================================
  // STATE VEHICLE BARU
  // ============================================================

  const [newVehiclePlate, setNewVehiclePlate] = useState("")
  const [newVehicleBrand, setNewVehicleBrand] = useState("")
  const [newVehicleModel, setNewVehicleModel] = useState("")

  const [showNewVehicle, setShowNewVehicle] = useState(false)

  // ============================================================
  // STATE LOADING & ERROR
  // ============================================================

  // loading digunakan ketika sedang melakukan proses
  // create / update / delete.
  //
  // true  -> proses sedang berjalan
  // false -> proses selesai
  const [loading, setLoading] = useState(false)

  // fetching khusus digunakan ketika mengambil data awal.
  const [fetching, setFetching] = useState(true)

  // Menyimpan pesan error yang akan ditampilkan ke user.
  const [error, setError] = useState("")

  // ============================================================
  // STATE FILTER
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("")

  // "ALL" berarti tidak memfilter berdasarkan status.
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // ============================================================
  // PAGINATION
  // ============================================================

  // Menyimpan halaman yang sedang dibuka.
  //
  // Contoh:
  // currentPage = 1 -> halaman pertama
  // currentPage = 2 -> halaman kedua
  const [currentPage, setCurrentPage] = useState(1)

  // Jumlah data yang ditampilkan dalam satu halaman.
  const itemsPerPage = 10

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = async () => {
    try {
      setFetching(true)
      setError("")

      // Promise.all menjalankan beberapa request API
      // secara bersamaan.
      //
      // Tanpa Promise.all:
      // request customer selesai dulu
      // lalu vehicle
      // lalu service
      // lalu order
      //
      // Dengan Promise.all, semuanya bisa berjalan bersamaan.
      const [custRes, vehRes, servRes, orderRes] = await Promise.all([
        axios.get("/customers"),
        axios.get("/vehicles"),
        axios.get("/services"),
        axios.get("/orders"),
      ])

      // Menyimpan hasil response backend ke state.
      setCustomers(custRes.data.customers)
      setVehicles(vehRes.data.vehicles)

      // Kita hanya membutuhkan service yang aktif.
      //
      // filter() menghasilkan array BARU.
      //
      // s: Service memberi tahu TypeScript bahwa
      // setiap item adalah object Service.
      const activeServices = servRes.data.services.filter(
        (s: Service) => s.isActive === true,
      )

      setServices(activeServices)

      setOrders(orderRes.data.data)
    } catch (err: any) {
      // catch dijalankan kalau request API gagal.
      console.error("Gagal memuat data", err)

      // Optional chaining (?.)
      //
      // err.response?.data?.message
      //
      // artinya:
      // "ambil message kalau response dan data memang ada."
      //
      // Kalau tidak ada, gunakan pesan default.
      setError(err.response?.data?.message || "Gagal memuat data order.")
    } finally {
      // finally SELALU dijalankan setelah try/catch selesai.
      //
      // Jadi walaupun request berhasil atau gagal,
      // loading fetching harus dimatikan.
      setFetching(false)
    }
  }

  // useEffect dengan [] dijalankan ketika component
  // pertama kali muncul.
  //
  // Cocok digunakan untuk mengambil data awal dari API.
  useEffect(() => {
    fetchData()
  }, [])

  // ============================================================
  // FILTER VEHICLES BERDASARKAN CUSTOMER
  // ============================================================

  // User memilih customer -> hanya kendaraan milik customer
  // tersebut yang ditampilkan.
  //
  // Number(selectedCustomer)
  // diperlukan karena selectedCustomer berasal dari <select>
  // sehingga bentuknya string.
  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.customerId === Number(selectedCustomer),
  )

  // ============================================================
  // SERVICE TOGGLE
  // ============================================================

  const handleServiceToggle = (serviceId: number) => {
    // some() digunakan untuk mengecek apakah service
    // sudah ada di selectedServices.
    //
    // return true  -> sudah dipilih
    // return false -> belum dipilih.
    if (selectedServices.some((service) => service.serviceId === serviceId)) {
      // Kalau service sudah dipilih,
      // filter() digunakan untuk menghapus service tersebut.
      setSelectedServices(
        selectedServices.filter((service) => service.serviceId !== serviceId),
      )
    } else {
      // Kalau belum dipilih,
      // masukkan service baru ke array.
      //
      // ...selectedServices
      // disebut spread operator.
      //
      // Artinya: masukkan semua isi array lama
      // lalu tambahkan object baru.
      setSelectedServices([
        ...selectedServices,
        {
          serviceId,
          quantity: 1,
        },
      ])
    }
  }

  // ============================================================
  // CALCULATE TOTAL
  // ============================================================

  // reduce() digunakan untuk menghitung total dari banyak data.
  //
  // sum = total sementara
  // selected = service yang sedang diproses
  //
  // Contoh:
  // service A = 20.000
  // service B = 30.000
  //
  // hasil:
  // 50.000
  const calculatedTotal = selectedServices.reduce(
    (sum, selected) => {
      // Cari data service berdasarkan ID.
      const service = services.find(
        (service) => service.id === selected.serviceId,
      )

      // Kalau service ditemukan,
      // harga × quantity ditambahkan ke total.
      //
      // Kalau service tidak ditemukan,
      // tambahkan 0.
      return sum + (service ? Number(service.price) * selected.quantity : 0)
    },
    0, // Nilai awal reduce.
  )

  // ============================================================
  // RESET FORM
  // ============================================================

  // Fungsi ini mengembalikan semua state form
  // ke kondisi awal.
  //
  // Biasanya dipanggil setelah:
  // - create selesai
  // - edit selesai
  // - dialog ditutup
  // - user membatalkan form
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

  // ============================================================
  // CREATE DIALOG
  // ============================================================

  const openCreateDialog = () => {
    // Pastikan form kosong sebelum dibuka.
    resetForm()

    // Buka dialog.
    setCreateDialogOpen(true)
  }

  // ============================================================
  // EDIT DIALOG
  // ============================================================

  const openEditDialog = (order: Order) => {
    // Simpan ID order yang sedang diedit.
    setEditingOrderId(order.id)

    // Isi form berdasarkan data order yang dipilih.
    //
    // String() digunakan karena value <select>
    // berbentuk string.
    setSelectedCustomer(String(order.customer.id))
    setSelectedVehicle(String(order.vehicle.id))

    // Order mempunyai orderItems.
    //
    // map() digunakan untuk mengubah bentuk data dari backend
    // menjadi bentuk yang dibutuhkan oleh selectedServices.
    const servicesFromOrder = order.orderItems.map((item) => ({
      serviceId: item.service.id,
      quantity: item.quantity,
    }))

    setSelectedServices(servicesFromOrder)

    setError("")

    // Buka dialog edit.
    setEditDialogOpen(true)
  }

  // ============================================================
  // DELETE DIALOG
  // ============================================================

  const openDeleteDialog = (order: Order) => {
    // Simpan order yang mau dihapus.
    setOrderToDelete(order)

    // Baru kemudian tampilkan confirmation dialog.
    setDeleteDialogOpen(true)
  }

  // ============================================================
  // CREATE ORDER
  // ============================================================

  const handleCreateOrder = async () => {
    setLoading(true)
    setError("")

    try {
      // Karena value dari select berupa string,
      // ubah menjadi number sebelum dikirim ke backend.
      let finalCustomerId = Number(selectedCustomer)
      let finalVehicleId = Number(selectedVehicle)

      // ========================================================
      // CREATE CUSTOMER BARU
      // ========================================================

      if (showNewCustomer) {
        // Request POST digunakan untuk membuat data baru.
        const custRes = await axios.post("/customers", {
          name: newCustomerName,
          phone: newCustomerPhone,
          address: newCustomerAddress,
        })

        // Ambil ID customer yang baru dibuat.
        //
        // ID ini nantinya digunakan untuk membuat vehicle
        // dan order.
        finalCustomerId = custRes.data.customer.id
      }

      // ========================================================
      // CREATE VEHICLE BARU
      // ========================================================

      if (showNewVehicle) {
        // Customer ID digunakan sebagai pemilik vehicle.
        const vehiclePayload = {
          customerId: finalCustomerId,
          plateNumber: newVehiclePlate,
          brand: newVehicleBrand,
          model: newVehicleModel,
        }

        const vehRes = await axios.post("/vehicles", vehiclePayload)

        // Ambil ID vehicle yang baru dibuat.
        finalVehicleId = Number(vehRes.data.vehicle.id)
      }

      // ========================================================
      // CREATE ORDER
      // ========================================================

      // Setelah customer dan vehicle siap,
      // baru kita membuat order.
      await axios.post("/orders", {
        customerId: Number(finalCustomerId),
        vehicleId: Number(finalVehicleId),
        items: selectedServices,
      })

      // Kalau berhasil:
      // 1. tutup dialog
      // 2. reset form
      // 3. ambil data terbaru
      setCreateDialogOpen(false)

      resetForm()

      await fetchData()
    } catch (err: any) {
      // Kalau salah satu request gagal,
      // proses akan masuk ke catch.
      setError(err.response?.data?.message || "Gagal membuat order.")
    } finally {
      // Matikan loading setelah proses selesai.
      setLoading(false)
    }
  }

  // ============================================================
  // UPDATE ORDER
  // ============================================================

  const handleUpdateOrder = async () => {
    // Kalau tidak ada ID order yang sedang diedit,
    // jangan lanjut.
    if (!editingOrderId) return

    setLoading(true)
    setError("")

    try {
      // PATCH digunakan untuk mengubah data yang sudah ada.
      //
      // URL:
      // /orders/10
      //
      // berarti update order dengan ID 10.
      await axios.patch(`/orders/${editingOrderId}`, {
        customerId: Number(selectedCustomer),
        vehicleId: Number(selectedVehicle),
        items: selectedServices,
      })

      setEditDialogOpen(false)

      resetForm()

      // Ambil ulang data agar tabel menampilkan
      // data terbaru dari database.
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal update order.")
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // DELETE ORDER
  // ============================================================

  const handleDeleteConfirm = async () => {
    // Tidak ada order yang dipilih -> jangan lakukan apa-apa.
    if (!orderToDelete) return

    setLoading(true)
    setError("")

    try {
      // DELETE digunakan untuk menghapus data.
      await axios.delete(`/orders/${orderToDelete.id}`)

      // Setelah berhasil:
      // tutup dialog dan kosongkan order yang dipilih.
      setDeleteDialogOpen(false)
      setOrderToDelete(null)

      // Refresh data tabel.
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menghapus order.")
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // FILTER ORDERS
  // ============================================================

  // useMemo digunakan supaya hasil filtering dihitung ulang
  // hanya ketika dependency berubah.
  //
  // Dependency:
  // orders
  // searchQuery
  // statusFilter
  // startDate
  // endDate
  //
  // Kalau salah satunya berubah -> filtering dijalankan lagi.
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // ========================================================
      // SEARCH
      // ========================================================

      if (searchQuery) {
        // Ubah keyword menjadi lowercase supaya
        // pencarian tidak sensitif terhadap huruf besar/kecil.
        const search = searchQuery.toLowerCase()

        // Search bisa dilakukan berdasarkan:
        // - nama customer
        // - plat kendaraan
        // - order code
        const matchesSearch =
          order.customer?.name?.toLowerCase().includes(search) ||
          order.vehicle?.plateNumber?.toLowerCase().includes(search) ||
          order.orderCode?.toLowerCase().includes(search)

        // Kalau tidak cocok dengan SATUPUN pencarian,
        // order tidak dimasukkan ke hasil.
        if (!matchesSearch) {
          return false
        }
      }

      // ========================================================
      // STATUS FILTER
      // ========================================================

      // Kalau statusFilter bukan ALL,
      // maka order harus mempunyai status yang dipilih.
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false
      }

      // ========================================================
      // DATE FILTER
      // ========================================================

      const orderDate = new Date(order.createdAt)

      // Kita ambil hanya bagian tanggal:
      // YYYY-MM-DD
      const orderDateOnly = orderDate.toISOString().split("T")[0]

      // Kalau ada startDate dan tanggal order lebih kecil,
      // order tidak ditampilkan.
      if (startDate && orderDateOnly < startDate) {
        return false
      }

      // Kalau ada endDate dan tanggal order lebih besar,
      // order tidak ditampilkan.
      if (endDate && orderDateOnly > endDate) {
        return false
      }

      // Kalau lolos semua filter,
      // return true berarti order masuk hasil filter.
      return true
    })
  }, [orders, searchQuery, statusFilter, startDate, endDate])

  // ============================================================
  // PAGINATION
  // ============================================================

  // Contoh:
  // filteredOrders = 25 data
  // itemsPerPage = 10
  //
  // Math.ceil(25 / 10) = 3 halaman
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  // Menentukan index awal data yang ditampilkan.
  //
  // page 1:
  // (1 - 1) × 10 = 0
  //
  // page 2:
  // (2 - 1) × 10 = 10
  //
  // page 3:
  // (3 - 1) × 10 = 20
  const startIndex = (currentPage - 1) * itemsPerPage

  // slice() mengambil sebagian data dari array.
  //
  // Contoh:
  // page 1 -> data index 0 sampai 9
  // page 2 -> data index 10 sampai 19
  const paginateOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  // ============================================================
  // STATUS STYLE
  // ============================================================

  // Fungsi ini menentukan class Tailwind berdasarkan status.
  const getStatusClass = (status: string) => {
    // switch cocok digunakan ketika satu value
    // mempunyai beberapa kemungkinan.
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800"

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"

      case "COMPLETED":
        return "bg-green-100 text-green-800"

      // Kalau status tidak dikenal,
      // gunakan style default.
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // ============================================================
  // RETURN / UI
  // ============================================================

  return (
    <div className='space-y-6'>
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Manajemen Order</h1>

          <p className='mt-1 text-sm text-gray-500'>
            Kelola order dan transaksi customer.
          </p>
        </div>

        {/* onClick menerima function yang akan dijalankan
            ketika button diklik. */}
        <Button
          onClick={openCreateDialog}
          className='bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='mr-2 h-4 w-4' />
          Buat Order
        </Button>
      </div>

      {/* =========================================================
          GLOBAL ERROR
      ========================================================= */}

      {/* Conditional rendering:
          
          error && kondisi
          
          Kalau error berisi string dan dialog tidak terbuka,
          tampilkan error.
      */}
      {error && !createDialogOpen && !editDialogOpen && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      {/* =========================================================
          FILTER
      ========================================================= */}

      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <Filter className='h-5 w-5 text-blue-600' />

          <h2 className='font-semibold text-gray-900'>Filter & Search</h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {/* SEARCH */}

          <div className='space-y-2'>
            <Label htmlFor='search-order'>
              Customer / Kendaraan / Order Code
            </Label>

            <div className='relative'>
              <Input
                id='search-order'
                placeholder='Cari nama, plat nomor, atau order code...'
                // Controlled component.
                //
                // value berasal dari React state.
                value={searchQuery}
                // Ketika user mengetik,
                // state diperbarui.
                onChange={(e) => {
                  setSearchQuery(e.target.value)

                  // Setelah filter berubah,
                  // kembali ke halaman pertama.
                  setCurrentPage(1)
                }}
                className='pl-9'
              />
            </div>
          </div>

          {/* STATUS */}

          <div className='space-y-2'>
            <Label htmlFor='status-filter'>Status</Label>

            <select
              id='status-filter'
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)

                // Filter berubah -> kembali ke page 1.
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

          {/* START DATE */}

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

          {/* END DATE */}

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

        {/* =======================================================
            FILTER INFO
        ======================================================= */}

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

          {/* Kalau minimal satu filter aktif,
              tombol Reset Filter ditampilkan. */}
          {(searchQuery || statusFilter !== "ALL" || startDate || endDate) && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("ALL")
                setStartDate("")
                setEndDate("")

                // Setelah reset -> page 1.
                setCurrentPage(1)
              }}
              className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* =========================================================
          ORDER TABLE
      ========================================================= */}

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

        {/* =======================================================
            CONDITIONAL RENDERING TABLE
        ======================================================= */}

        {/* Bentuk sederhananya:

            fetching
              ? tampilkan loading
              : tidak ada data
                ? tampilkan empty state
                : tampilkan table
        */}

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
              {/* map() digunakan untuk mengubah setiap
                  object order menjadi satu TableRow. */}
              {paginateOrders.map((order) => (
                // key wajib diberikan ketika render array.
                //
                // React menggunakan key untuk mengetahui
                // item mana yang berubah / ditambah / dihapus.
                <TableRow key={order.id} className='hover:bg-gray-50'>
                  {/* ORDER CODE */}

                  <TableCell>
                    <span className='font-mono text-sm font-semibold text-gray-800'>
                      {order.orderCode}
                    </span>
                  </TableCell>

                  {/* CUSTOMER */}

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                        <User className='h-4 w-4 text-blue-600' />
                      </div>

                      {/* ?. = optional chaining.
                          
                          Kalau order.customer tidak ada,
                          React tidak akan langsung error. */}
                      <span className='font-medium text-gray-700'>
                        {order.customer?.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* VEHICLE */}

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

                  {/* SERVICES */}

                  <TableCell>
                    <div className='max-w-55'>
                      {/* Satu order bisa memiliki banyak service,
                          jadi kita map lagi orderItems. */}
                      {order.orderItems.map((item, index) => (
                        <div key={index} className='text-sm text-gray-700'>
                          {item.service.name}

                          {/* Kalau quantity > 1,
                              tampilkan "× 2", "× 3", dst. */}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* TOTAL */}

                  <TableCell>
                    <span className='font-semibold text-gray-900'>
                      {/* Number() memastikan nilai diperlakukan
                          sebagai number sebelum format. */}
                      Rp {Number(order.total).toLocaleString("id-ID")}
                    </span>
                  </TableCell>

                  {/* PAYMENT */}

                  <TableCell>
                    {/* Ternary operator:
                        
                        kondisi ? hasilJikaTrue : hasilJikaFalse
                        
                        PAID -> hijau
                        selain PAID -> merah
                    */}
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

                  {/* STATUS */}

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </TableCell>

                  {/* ACTIONS */}

                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      {/* DETAIL */}

                      <Button
                        size='sm'
                        variant='outline'
                        // navigate() digunakan untuk pindah
                        // ke halaman detail.
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Eye className='mr-1.5 h-4 w-4' />
                        Detail
                      </Button>

                      {/* EDIT & DELETE */}

                      {/* Edit dan delete hanya boleh dilakukan
                          kalau status masih WAITING. */}
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

        {/* =======================================================
            PAGINATION
        ======================================================= */}

        {/* Pagination hanya ditampilkan kalau
            jumlah halaman lebih dari 1. */}
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
              {/* Tombol sebelumnya disabled ketika
                  sudah berada di halaman pertama. */}
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

              {/* Tombol berikutnya disabled ketika
                  sudah berada di halaman terakhir. */}
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

      {/* =========================================================
          CREATE ORDER DIALOG
      ========================================================= */}

      <Dialog
        open={createDialogOpen}
        // onOpenChange dipanggil ketika status dialog berubah.
        onOpenChange={(open) => {
          setCreateDialogOpen(open)

          // Kalau dialog ditutup,
          // bersihkan form.
          if (!open) {
            resetForm()
          }
        }}
      >
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

          {/* Error khusus dialog */}
          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
              {error}
            </div>
          )}

          <div className='space-y-6'>
            {/* ===================================================
                CUSTOMER
            =================================================== */}

            <div className='space-y-2'>
              <Label>Customer</Label>

              {/* Kalau showNewCustomer false,
                  tampilkan select customer lama. */}
              {!showNewCustomer ? (
                <div className='flex gap-2'>
                  <select
                    className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value)

                      // Customer berubah -> kendaraan harus dipilih ulang.
                      setSelectedVehicle("")
                    }}
                  >
                    <option value=''>-- Pilih Customer --</option>

                    {/* map customer menjadi option */}
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>

                  <Button
                    type='button'
                    variant='outline'
                    // Ubah mode dari customer lama
                    // menjadi customer baru.
                    onClick={() => setShowNewCustomer(true)}
                    className='shrink-0 border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                  >
                    <Plus className='mr-1.5 h-4 w-4' />
                    Baru
                  </Button>
                </div>
              ) : (
                // Kalau true, tampilkan form customer baru.
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

                        // Bersihkan data customer baru.
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
                    {/* Controlled input:
                        value berasal dari state,
                        onChange mengubah state. */}

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

            {/* ===================================================
                VEHICLE
            =================================================== */}

            <div className='space-y-2'>
              <Label>Kendaraan</Label>

              {!showNewVehicle ? (
                <div className='flex gap-2'>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    // Vehicle belum bisa dipilih
                    // kalau customer belum dipilih.
                    disabled={!selectedCustomer && !showNewCustomer}
                    className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  >
                    <option value=''>-- Pilih Kendaraan --</option>

                    {/* filteredVehicles sudah difilter
                        berdasarkan customer yang dipilih. */}
                    {filteredVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>

                  <Button
                    type='button'
                    variant='outline'
                    // Customer harus ada dulu sebelum
                    // vehicle baru dibuat.
                    disabled={!selectedCustomer && !showNewCustomer}
                    onClick={() => setShowNewVehicle(true)}
                    className='shrink-0 border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                  >
                    <Plus className='mr-1.5 h-4 w-4' />
                    Baru
                  </Button>
                </div>
              ) : (
                // Form vehicle baru.
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

            {/* ===================================================
                SERVICES
            =================================================== */}

            <div className='space-y-2'>
              <Label>Pilih Layanan</Label>

              <p className='text-xs text-gray-500'>
                Hanya layanan yang sedang aktif yang dapat dipilih.
              </p>

              <div className='grid gap-3 pt-1 md:grid-cols-2'>
                {/* Render semua service aktif */}
                {services.map((service) => {
                  // Cari apakah service ini sudah dipilih.
                  //
                  // find() mengembalikan object kalau ditemukan,
                  // atau undefined kalau tidak ditemukan.
                  const selected = selectedServices.find(
                    (item) => item.serviceId === service.id,
                  )

                  return (
                    <div
                      key={service.id}
                      // Kalau selected ada -> style dipilih.
                      // Kalau tidak -> style normal.
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

                        {/* && juga bisa digunakan
                            untuk conditional rendering. */}
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

            {/* ===================================================
                TOTAL
            =================================================== */}

            <div className='rounded-lg border border-blue-100 bg-blue-50 p-4'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold text-gray-700'>
                  Total Estimasi
                </span>

                {/* calculatedTotal otomatis berubah
                    ketika selectedServices berubah. */}
                <span className='text-2xl font-bold text-blue-600'>
                  Rp {calculatedTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* =======================================================
              CREATE DIALOG FOOTER
          ======================================================= */}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setCreateDialogOpen(false)

                resetForm()
              }}
              // User tidak bisa menekan tombol
              // selama request masih berjalan.
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type='button'
              onClick={handleCreateOrder}
              // Button disabled kalau:
              // - sedang loading
              // - belum memilih service
              // - customer belum dipilih
              // - vehicle belum dipilih
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

      {/* =========================================================
          EDIT ORDER DIALOG
      ========================================================= */}

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)

          if (!open) {
            resetForm()
          }
        }}
      >
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
            {/* ===================================================
                EDIT CUSTOMER
            =================================================== */}

            <div className='space-y-2'>
              <Label>Customer</Label>

              <select
                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value)

                  // Customer berubah -> vehicle harus dipilih ulang.
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

            {/* ===================================================
                EDIT VEHICLE
            =================================================== */}

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

            {/* ===================================================
                EDIT SERVICES
            =================================================== */}

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

            {/* ===================================================
                EDIT TOTAL
            =================================================== */}

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

      {/* =========================================================
          DELETE DIALOG
      ========================================================= */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)

          // Dialog ditutup -> hapus object
          // order yang sedang dipilih.
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
              {/* ?. karena orderToDelete bisa null. */}
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
