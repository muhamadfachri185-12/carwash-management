import { useState, useEffect } from "react"
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

import { Car, Plus, Edit, Trash2, Search, User, Hash } from "lucide-react"

interface Customer {
  id: number
  name: string
}

interface Vehicle {
  id: number
  plateNumber: string
  brand: string
  model: string
  customer: Customer
}

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // Form state
  const [plateNumber, setPlateNumber] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [customerId, setCustomerId] = useState("")

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)

  // Loading state
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Error
  const [error, setError] = useState("")

  // Search
  const [searchPlate, setSearchPlate] = useState("")
  const [searchCustomer, setSearchCustomer] = useState("")

  // Form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // =========================
  // FETCH VEHICLES & CUSTOMERS
  // =========================

  const fetchVehicles = async () => {
    try {
      setFetching(true)
      setError("")

      const [vehicleRes, customerRes] = await Promise.all([
        axios.get("/vehicles"),
        axios.get("/customers"),
      ])

      setVehicles(vehicleRes.data.vehicles)
      setCustomers(customerRes.data.customers)
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal mengambil data kendaraan.")
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setPlateNumber("")
    setBrand("")
    setModel("")
    setCustomerId("")
    setEditingId(null)
    setError("")
  }

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAdd = () => {
    resetForm()
    setFormDialogOpen(true)
  }

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id)
    setPlateNumber(vehicle.plateNumber)
    setBrand(vehicle.brand)
    setModel(vehicle.model)
    setCustomerId(String(vehicle.customer.id))

    setError("")
    setFormDialogOpen(true)
  }

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!customerId || !plateNumber || !brand || !model) {
      setError("Semua field wajib diisi.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const payload = {
        customerId: Number(customerId),
        plateNumber,
        brand,
        model,
      }

      if (editingId) {
        await axios.patch(`/vehicles/${editingId}`, payload)
      } else {
        await axios.post("/vehicles", payload)
      }

      resetForm()
      setFormDialogOpen(false)

      await fetchVehicles()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal menyimpan data kendaraan.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // OPEN DELETE DIALOG
  // =========================

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle)
    setDeleteDialogOpen(true)
  }

  // =========================
  // DELETE VEHICLE
  // =========================

  const handleDelete = async () => {
    if (!vehicleToDelete) return

    try {
      setDeleteLoading(true)
      setError("")

      await axios.delete(`/vehicles/${vehicleToDelete.id}`)

      setDeleteDialogOpen(false)
      setVehicleToDelete(null)

      await fetchVehicles()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal menghapus kendaraan.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // =========================
  // FILTER VEHICLES
  // =========================

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesPlate = searchPlate
      ? vehicle.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
      : true

    const matchesCustomer = searchCustomer
      ? vehicle.customer?.name
          .toLowerCase()
          .includes(searchCustomer.toLowerCase())
      : true

    return matchesPlate && matchesCustomer
  })

  // =========================
  // UI
  // =========================

  return (
    <div className='space-y-6'>
      {/* =========================
          HEADER
      ========================= */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Vehicles</h1>

          <p className='mt-1 text-sm text-gray-500'>
            Kelola data kendaraan customer.
          </p>
        </div>

        <Button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-700'>
          <Plus className='mr-2 h-4 w-4' />
          Tambah Kendaraan
        </Button>
      </div>

      {/* =========================
          ERROR GLOBAL
      ========================= */}

      {error && !formDialogOpen && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      {/* =========================
          SEARCH
      ========================= */}

      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <Search className='h-5 w-5 text-blue-600' />

          <h2 className='font-semibold text-gray-900'>Cari Kendaraan</h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {/* Search Plate */}

          <div className='space-y-2'>
            <Label htmlFor='searchPlate'>Plat Nomor</Label>

            <div className='relative'>
              <Input
                id='searchPlate'
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder='Cari berdasarkan plat nomor...'
                className='pl-9'
              />
            </div>
          </div>

          {/* Search Customer */}

          <div className='space-y-2'>
            <Label htmlFor='searchCustomer'>Nama Customer</Label>

            <div className='relative'>
              <Input
                id='searchCustomer'
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder='Cari berdasarkan nama customer...'
                className='pl-9'
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          VEHICLE TABLE
      ========================= */}

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <Car className='h-5 w-5 text-blue-600' />

            <h2 className='font-semibold text-gray-900'>Daftar Kendaraan</h2>

            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredVehicles.length}
            </span>
          </div>
        </div>

        {fetching ? (
          <div className='flex items-center justify-center py-12 text-sm text-gray-500'>
            Memuat data kendaraan...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='mb-3 rounded-full bg-gray-100 p-3'>
              <Car className='h-6 w-6 text-gray-400' />
            </div>

            <p className='font-medium text-gray-900'>Tidak ada kendaraan</p>

            <p className='mt-1 text-sm text-gray-500'>
              Belum ada data kendaraan yang sesuai.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold text-gray-700'>
                  Plat Nomor
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Merk & Model
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Pemilik
                </TableHead>

                <TableHead className='text-right font-semibold text-gray-700'>
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className='hover:bg-gray-50'>
                  {/* Plate */}

                  <TableCell>
                    <div className='inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-semibold text-gray-800'>
                      {vehicle.plateNumber}
                    </div>
                  </TableCell>

                  {/* Brand & Model */}

                  <TableCell>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {vehicle.brand}
                      </p>

                      <p className='text-sm text-gray-500'>{vehicle.model}</p>
                    </div>
                  </TableCell>

                  {/* Customer */}

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                        <User className='h-4 w-4 text-blue-600' />
                      </div>

                      <span className='font-medium text-gray-700'>
                        {vehicle.customer?.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}

                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(vehicle)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Edit className='mr-1.5 h-4 w-4' />
                        Edit
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteClick(vehicle)}
                        className='border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                      >
                        <Trash2 className='mr-1.5 h-4 w-4' />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* =========================
          ADD / EDIT DIALOG
      ========================= */}

      <Dialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open)

          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Kendaraan" : "Tambah Kendaraan"}
            </DialogTitle>

            <DialogDescription>
              {editingId
                ? "Perbarui informasi kendaraan."
                : "Tambahkan kendaraan baru ke dalam sistem."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Error */}

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            {/* Customer */}

            <div className='space-y-2'>
              <Label htmlFor='customer'>Customer</Label>

              <select
                id='customer'
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              >
                <option value=''>Pilih customer</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plate Number */}

            <div className='space-y-2'>
              <Label htmlFor='plateNumber'>Plat Nomor</Label>

              <Input
                id='plateNumber'
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder='Contoh: B 1234 ABC'
              />
            </div>

            {/* Brand */}

            <div className='space-y-2'>
              <Label htmlFor='brand'>Merk</Label>

              <Input
                id='brand'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder='Contoh: Toyota'
              />
            </div>

            {/* Model */}

            <div className='space-y-2'>
              <Label htmlFor='model'>Model</Label>

              <Input
                id='model'
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder='Contoh: Avanza'
              />
            </div>

            {/* Footer */}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  resetForm()
                  setFormDialogOpen(false)
                }}
                disabled={loading}
              >
                Batal
              </Button>

              <Button
                type='submit'
                disabled={loading}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {loading
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Kendaraan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================
          DELETE DIALOG
      ========================= */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)

          if (!open) {
            setVehicleToDelete(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Hapus Kendaraan</DialogTitle>

            <DialogDescription>
              Apakah kamu yakin ingin menghapus kendaraan{" "}
              <span className='font-semibold text-gray-900'>
                {vehicleToDelete?.plateNumber}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>

            <Button
              type='button'
              onClick={handleDelete}
              disabled={deleteLoading}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleteLoading ? "Menghapus..." : "Hapus Kendaraan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
