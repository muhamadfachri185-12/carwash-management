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

import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  CircleDollarSign,
} from "lucide-react"

interface Service {
  id: number
  name: string
  duration: number
  price: number
  isActive: boolean
}

export default function ServicePage() {
  const [services, setServices] = useState<Service[]>([])

  // =========================
  // FORM STATE
  // =========================

  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState("")

  // =========================
  // EDIT STATE
  // =========================

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editPrice, setEditPrice] = useState("")

  // =========================
  // LOADING & ERROR
  // =========================

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  // =========================
  // SEARCH & FILTER
  // =========================

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // =========================
  // FORM DIALOG
  // =========================

  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // =========================
  // DELETE DIALOG
  // =========================

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // =========================
  // FETCH SERVICES
  // =========================

  const fetchServices = async () => {
    try {
      setFetching(true)

      const res = await axios.get("/services")

      setServices(res.data.services)
    } catch (err: any) {
      console.error("Gagal memuat data layanan", err)

      setError(err.response?.data?.message || "Gagal memuat data layanan.")
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("")
    setDuration("")
    setPrice("")

    setEditName("")
    setEditDuration("")
    setEditPrice("")

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
  // CREATE SERVICE
  // =========================

  const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      await axios.post("/services", {
        name,
        duration: Number(duration),
        price: Number(price),
      })

      resetForm()
      setFormDialogOpen(false)

      await fetchServices()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal menambah layanan.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditStart = (service: Service) => {
    setEditingId(service.id)

    setEditName(service.name)
    setEditDuration(String(service.duration))
    setEditPrice(String(service.price))

    setError("")
    setFormDialogOpen(true)
  }

  // =========================
  // SAVE EDIT
  // =========================

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editingId) return

    setLoading(true)
    setError("")

    try {
      await axios.patch(`/services/${editingId}`, {
        name: editName,
        duration: Number(editDuration),
        price: Number(editPrice),
      })

      resetForm()
      setFormDialogOpen(false)

      await fetchServices()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal update layanan.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // CANCEL FORM
  // =========================

  const handleFormCancel = () => {
    resetForm()
    setFormDialogOpen(false)
  }

  // =========================
  // TOGGLE ACTIVE / INACTIVE
  // =========================

  const handleToggleActive = async (service: Service) => {
    try {
      await axios.patch(`/services/${service.id}`, {
        isActive: !service.isActive,
      })

      await fetchServices()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal mengubah status layanan.")
    }
  }

  // =========================
  // OPEN DELETE DIALOG
  // =========================

  const openDeleteDialog = (service: Service) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  // =========================
  // DELETE SERVICE
  // =========================

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return

    setDeleteLoading(true)
    setError("")

    try {
      await axios.delete(`/services/${serviceToDelete.id}`)

      setDeleteDialogOpen(false)
      setServiceToDelete(null)

      await fetchServices()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal menghapus layanan.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // =========================
  // FILTER & SEARCH
  // =========================

  const filteredServices = services.filter((service) => {
    if (searchQuery) {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      if (!matchesSearch) {
        return false
      }
    }

    if (statusFilter === "ACTIVE" && !service.isActive) {
      return false
    }

    if (statusFilter === "INACTIVE" && service.isActive) {
      return false
    }

    return true
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
          <h1 className='text-2xl font-bold text-gray-900'>
            Manajemen Layanan
          </h1>

          <p className='mt-1 text-sm text-gray-500'>
            Kelola paket layanan car wash.
          </p>
        </div>

        <Button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-700'>
          <Plus className='mr-2 h-4 w-4' />
          Tambah Layanan
        </Button>
      </div>

      {/* =========================
          GLOBAL ERROR
      ========================= */}

      {error && !formDialogOpen && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      {/* =========================
          SEARCH & FILTER
      ========================= */}

      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <Search className='h-5 w-5 text-blue-600' />

          <h2 className='font-semibold text-gray-900'>Cari Layanan</h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {/* Search */}

          <div className='space-y-2'>
            <Label htmlFor='search-service'>Nama Layanan</Label>

            <div className='relative'>
              <Input
                id='search-service'
                placeholder='Cari nama layanan...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>
          </div>

          {/* Status */}

          <div className='space-y-2'>
            <Label htmlFor='status-filter'>Status Layanan</Label>

            <select
              id='status-filter'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            >
              <option value='ALL'>Semua Status</option>

              <option value='ACTIVE'>Aktif</option>

              <option value='INACTIVE'>Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Result Info */}

        <div className='mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-gray-500'>
            Menampilkan{" "}
            <span className='font-semibold text-gray-900'>
              {filteredServices.length}
            </span>{" "}
            dari{" "}
            <span className='font-semibold text-gray-900'>
              {services.length}
            </span>{" "}
            layanan
          </p>

          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("ALL")
              }}
              className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* =========================
          SERVICE TABLE
      ========================= */}

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <Wrench className='h-5 w-5 text-blue-600' />

            <h2 className='font-semibold text-gray-900'>Daftar Layanan</h2>

            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredServices.length}
            </span>
          </div>
        </div>

        {fetching ? (
          <div className='flex items-center justify-center py-12 text-sm text-gray-500'>
            Memuat data layanan...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='mb-3 rounded-full bg-gray-100 p-3'>
              <Wrench className='h-6 w-6 text-gray-400' />
            </div>

            <p className='font-medium text-gray-900'>Tidak ada layanan</p>

            <p className='mt-1 text-sm text-gray-500'>
              Belum ada data layanan yang sesuai.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold text-gray-700'>
                  ID
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Nama Layanan
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Durasi
                </TableHead>

                <TableHead className='font-semibold text-gray-700'>
                  Harga
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
              {filteredServices.map((service) => (
                <TableRow key={service.id} className='hover:bg-gray-50'>
                  {/* ID */}

                  <TableCell>
                    <span className='font-mono text-sm font-medium text-gray-600'>
                      #{service.id}
                    </span>
                  </TableCell>

                  {/* Name */}

                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50'>
                        <Wrench className='h-4 w-4 text-blue-600' />
                      </div>

                      <span className='font-medium text-gray-900'>
                        {service.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Duration */}

                  <TableCell>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Clock className='h-4 w-4 text-gray-400' />

                      <span>{service.duration} Menit</span>
                    </div>
                  </TableCell>

                  {/* Price */}

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <CircleDollarSign className='h-4 w-4 text-gray-400' />

                      <span className='font-medium text-gray-800'>
                        Rp {Number(service.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        service.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                  {/* Actions */}

                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      {/* Edit */}

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditStart(service)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Edit className='mr-1.5 h-4 w-4' />
                        Edit
                      </Button>

                      {/* Toggle */}

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleToggleActive(service)}
                        className={
                          service.isActive
                            ? "border-gray-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                            : "border-gray-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                        }
                      >
                        {service.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      {/* Delete */}

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => openDeleteDialog(service)}
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
          ADD / EDIT SERVICE DIALOG
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
              {editingId ? "Edit Layanan" : "Tambah Layanan"}
            </DialogTitle>

            <DialogDescription>
              {editingId
                ? "Perbarui informasi layanan yang dipilih."
                : "Tambahkan paket layanan baru ke sistem."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editingId ? handleEditSave : handleCreateService}
            className='space-y-5'
          >
            {/* Error */}

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            {/* Name */}

            <div className='space-y-2'>
              <Label htmlFor='service-name'>Nama Layanan</Label>

              <Input
                id='service-name'
                value={editingId ? editName : name}
                onChange={(e) => {
                  if (editingId) {
                    setEditName(e.target.value)
                  } else {
                    setName(e.target.value)
                  }
                }}
                placeholder='Contoh: Cuci Salju'
                required
              />
            </div>

            {/* Duration */}

            <div className='space-y-2'>
              <Label htmlFor='service-duration'>Durasi (Menit)</Label>

              <Input
                id='service-duration'
                type='number'
                min='1'
                value={editingId ? editDuration : duration}
                onChange={(e) => {
                  if (editingId) {
                    setEditDuration(e.target.value)
                  } else {
                    setDuration(e.target.value)
                  }
                }}
                placeholder='Contoh: 45'
                required
              />
            </div>

            {/* Price */}

            <div className='space-y-2'>
              <Label htmlFor='service-price'>Harga (Rp)</Label>

              <Input
                id='service-price'
                type='number'
                min='0'
                value={editingId ? editPrice : price}
                onChange={(e) => {
                  if (editingId) {
                    setEditPrice(e.target.value)
                  } else {
                    setPrice(e.target.value)
                  }
                }}
                placeholder='Contoh: 35000'
                required
              />
            </div>

            {/* Footer */}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleFormCancel}
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
                    : "Tambah Layanan"}
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
            setServiceToDelete(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Hapus Layanan</DialogTitle>

            <DialogDescription>
              Apakah kamu yakin ingin menghapus layanan{" "}
              <span className='font-semibold text-gray-900'>
                {serviceToDelete?.name}
              </span>
              ?
              <br />
              Tindakan ini tidak dapat dibatalkan.
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
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleteLoading ? "Menghapus..." : "Hapus Layanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
