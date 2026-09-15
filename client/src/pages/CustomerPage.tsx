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

import { Users, Plus, Edit, Trash2, Search, Phone, MapPin } from "lucide-react"

interface Customer {
  id: number
  name: string
  phone: string
  address?: string
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([])

  // Form state
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)

  // Loading state
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Error state
  const [error, setError] = useState("")

  // Search
  const [searchQuery, setSearchQuery] = useState("")

  // Customer form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  )
  const [deleteLoading, setDeleteLoading] = useState(false)

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("/customers")
      setCustomers(response.data.customers)
    } catch (err: any) {
      console.log("Gagal memuat customer", err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // =========================================================
  // SUBMIT FORM
  // =========================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      if (editingId) {
        // Edit customer
        await axios.patch(`/customers/${editingId}`, {
          name,
          phone,
          address,
        })
      } else {
        // Tambah customer
        await axios.post("/customers", {
          name,
          phone,
          address,
        })
      }

      // Reset form
      resetForm()

      // Tutup popup
      setFormDialogOpen(false)

      // Refresh data
      fetchCustomers()
    } catch (err: any) {
      console.log("ERROR:", err)
      console.log("RESPONSE:", err.response?.data)

      setError(err.response?.data?.message || "Gagal menyimpan customer")
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setName(customer.name)
    setPhone(customer.phone)
    setAddress(customer.address || "")
    setError("")

    // Buka popup
    setFormDialogOpen(true)
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setPhone("")
    setAddress("")
    setError("")
  }

  // =========================================================
  // OPEN DELETE DIALOG
  // =========================================================

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDeleteConfirm = async (id: number) => {
    if (!customerToDelete) return

    setDeleteLoading(true)

    try {
      await axios.delete(`/customers/${id}`)

      fetchCustomers()

      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus")
    } finally {
      setDeleteLoading(false)
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()

    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    )
  })

  // =========================================================
  // LOADING PAGE
  // =========================================================

  if (fetching) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />

          <p className='text-sm text-gray-500'>Memuat data customer...</p>
        </div>
      </div>
    )
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className='space-y-6'>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Manajemen Customers
          </h1>

          <p className='mt-1 text-sm text-gray-500'>
            Kelola data customer dan informasi kontak
          </p>
        </div>

        {/* Tombol tambah customer */}
        <Button
          onClick={() => {
            resetForm()
            setFormDialogOpen(true)
          }}
          className='bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='mr-2 h-4 w-4' />
          Tambah Customer
        </Button>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='p-5'>
          <div className='mb-4 flex items-center gap-2'>
            <Search className='h-5 w-5 text-blue-600' />
            <h2 className='text-base font-semibold text-gray-800'>
              Cari Customer
            </h2>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <div className='relative flex-1'>
              <Input
                placeholder='Cari nama atau nomor telepon...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {searchQuery && (
              <Button
                variant='outline'
                onClick={() => setSearchQuery("")}
                className='border-gray-300 text-gray-700 hover:bg-gray-50'
              >
                Reset
              </Button>
            )}
          </div>

          {searchQuery && (
            <p className='mt-3 text-xs text-gray-500'>
              Menampilkan{" "}
              <span className='font-semibold text-gray-800'>
                {filteredCustomers.length}
              </span>{" "}
              dari{" "}
              <span className='font-semibold text-gray-800'>
                {customers.length}
              </span>{" "}
              customer
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          CUSTOMER TABLE
      ====================================================== */}

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-blue-600' />
            <h2 className='font-semibold text-gray-900'>Daftar Customer</h2>
            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredCustomers.length}
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='font-semibold text-gray-600'>
                Nama
              </TableHead>

              <TableHead className='font-semibold text-gray-600'>
                Telepon
              </TableHead>

              <TableHead className='font-semibold text-gray-600'>
                Alamat
              </TableHead>

              <TableHead className='text-right font-semibold text-gray-600'>
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='h-24 text-center text-gray-500'
                >
                  <div className='flex flex-col items-center justify-center'>
                    <Users className='mb-2 h-8 w-8 text-gray-400' />

                    <p className='text-sm'>
                      {searchQuery
                        ? "Tidak ada customer yang sesuai dengan pencarian."
                        : "Belum ada data customer."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className='border-b border-gray-100 hover:bg-gray-50'
                >
                  {/* Nama */}
                  <TableCell className='font-medium text-gray-800'>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                        <Users className='h-4 w-4 text-blue-600' />
                      </div>

                      <span>{customer.name}</span>
                    </div>
                  </TableCell>

                  {/* Telepon */}
                  <TableCell>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Phone className='h-4 w-4 text-gray-400' />

                      {customer.phone}
                    </div>
                  </TableCell>

                  {/* Alamat */}
                  <TableCell className='max-w-sm text-gray-600'>
                    {customer.address ? (
                      <div className='flex items-start gap-2'>
                        <MapPin className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />

                        <span className='line-clamp-2'>{customer.address}</span>
                      </div>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      {/* Edit */}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEdit(customer)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Edit className='mr-1 h-4 w-4' />
                        Edit
                      </Button>

                      {/* Delete */}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => openDeleteDialog(customer)}
                        className='border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                      >
                        <Trash2 className='mr-1 h-4 w-4' />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* =====================================================
          ADD / EDIT CUSTOMER DIALOG
      ====================================================== */}

      <Dialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open)

          // Kalau popup ditutup, reset form
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Customer" : "Tambah Customer Baru"}
            </DialogTitle>

            <DialogDescription>
              {editingId
                ? "Perbarui informasi customer."
                : "Tambahkan customer baru ke sistem."}
            </DialogDescription>
          </DialogHeader>

          {/* Error */}
          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Nama */}
            <div>
              <Label className='mb-2 block text-sm font-medium text-gray-700'>
                Nama Customer
              </Label>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Masukkan nama customer'
                required
              />
            </div>

            {/* Telepon */}
            <div>
              <Label className='mb-2 block text-sm font-medium text-gray-700'>
                No. Telepon
              </Label>

              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='Contoh: 081209120212'
                required
              />
            </div>

            {/* Alamat */}
            <div>
              <Label className='mb-2 block text-sm font-medium text-gray-700'>
                Alamat{" "}
                <span className='text-xs font-normal text-gray-400'>
                  (Opsional)
                </span>
              </Label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='Masukkan alamat customer'
                rows={3}
                className='w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              />
            </div>

            {/* Buttons */}
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
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                {loading
                  ? "Menyimpan..."
                  : editingId
                    ? "Update Customer"
                    : "Simpan Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          DELETE CONFIRMATION DIALOG
      ====================================================== */}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Hapus Customer?</DialogTitle>

            <DialogDescription>
              Apakah Anda yakin ingin menghapus customer{" "}
              <span className='font-semibold text-gray-800'>
                {customerToDelete?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
            <p className='text-sm text-red-700'>
              Customer tidak dapat dihapus jika masih memiliki order.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setDeleteDialogOpen(false)
                setCustomerToDelete(null)
              }}
              disabled={deleteLoading}
              className='border-gray-300 text-gray-700 hover:bg-gray-50'
            >
              Batal
            </Button>

            <Button
              variant='destructive'
              onClick={() => {
                if (customerToDelete) {
                  handleDeleteConfirm(customerToDelete.id)
                }
              }}
              disabled={deleteLoading}
              className='bg-red-600 text-white hover:bg-red-700'
            >
              {deleteLoading ? "Menghapus..." : "Hapus Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
