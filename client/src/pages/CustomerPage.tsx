// useState = menyimpan data/state yang bisa berubah
// useEffect = menjalankan kode saat component pertama kali tampil
import { useState, useEffect } from "react"

// Axios instance yang sudah kita buat untuk request ke backend
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

// =========================================================
// TYPE / INTERFACE
// =========================================================

// Interface digunakan untuk menentukan bentuk data Customer.
// Jadi TypeScript tahu bahwa setiap customer harus punya
// id, name, phone, dan address (address boleh tidak ada).
interface Customer {
  id: number
  name: string
  phone: string
  address?: string // ? = optional / boleh undefined
}

export default function CustomerPage() {
  // =========================================================
  // STATE DATA CUSTOMER
  // =========================================================

  // customers = data customer yang berasal dari database/backend.
  //
  // Customer[] artinya:
  // "state ini berisi ARRAY yang setiap itemnya harus mengikuti
  // interface Customer."
  const [customers, setCustomers] = useState<Customer[]>([])

  // =========================================================
  // FORM STATE
  // =========================================================

  // State ini digunakan untuk menyimpan isi input form.
  //
  // Contoh:
  // user mengetik "Budi"
  //        ↓
  // setName("Budi")
  //        ↓
  // name sekarang = "Budi"
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  // editingId digunakan untuk mengetahui apakah form sedang
  // digunakan untuk EDIT customer.
  //
  // null = sedang tambah customer
  // number = sedang edit customer tertentu
  const [editingId, setEditingId] = useState<number | null>(null)

  // =========================================================
  // LOADING STATE
  // =========================================================

  // loading = proses simpan/update/delete sedang berjalan.
  // Biasanya digunakan untuk disable tombol agar user
  // tidak melakukan request berkali-kali.
  const [loading, setLoading] = useState(false)

  // fetching = proses mengambil data customer dari backend.
  const [fetching, setFetching] = useState(true)

  // =========================================================
  // ERROR STATE
  // =========================================================

  // Menyimpan pesan error yang akan ditampilkan di UI.
  const [error, setError] = useState("")

  // =========================================================
  // SEARCH STATE
  // =========================================================

  // Menyimpan teks pencarian dari input search.
  const [searchQuery, setSearchQuery] = useState("")

  // =========================================================
  // DIALOG STATE
  // =========================================================

  // true  = dialog/form terbuka
  // false = dialog/form tertutup
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // State untuk dialog konfirmasi delete.
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Menyimpan customer yang ingin dihapus.
  //
  // null = belum ada customer yang dipilih
  // Customer = ada customer yang sedang dipilih untuk dihapus
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  )

  // Loading khusus proses delete.
  const [deleteLoading, setDeleteLoading] = useState(false)

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================

  // async = function ini bisa menggunakan await.
  //
  // Tujuannya mengambil data customer dari backend.
  const fetchCustomers = async () => {
    try {
      // GET request ke:
      // http://localhost:3000/api/customers
      //
      // Karena baseURL sudah ada di axios.ts,
      // kita cukup menulis "/customers".
      const response = await axios.get("/customers")

      // response.data = data JSON yang dikirim backend.
      //
      // Misalnya backend mengirim:
      // {
      //   customers: [...]
      // }
      //
      // Maka kita ambil response.data.customers
      // lalu masukkan ke state customers.
      setCustomers(response.data.customers)
    } catch (err: any) {
      // Kalau request gagal, masuk ke catch.
      console.log("Gagal memuat customer", err)
    } finally {
      // finally selalu dijalankan setelah try/catch selesai.
      //
      // Baik request berhasil maupun gagal,
      // fetching harus dihentikan.
      setFetching(false)
    }
  }

  // =========================================================
  // USE EFFECT
  // =========================================================

  // useEffect dengan [] dijalankan ketika component pertama
  // kali dipasang/muncul di halaman.
  //
  // Jadi:
  // CustomerPage dibuka
  //       ↓
  // useEffect jalan
  //       ↓
  // fetchCustomers()
  //       ↓
  // ambil data dari backend
  useEffect(() => {
    fetchCustomers()
  }, [])

  // =========================================================
  // SUBMIT FORM
  // =========================================================

  // Function ini dijalankan ketika form disubmit.
  const handleSubmit = async (e: React.FormEvent) => {
    // Karena form HTML secara default akan melakukan reload halaman,
    // preventDefault() digunakan untuk mencegah reload tersebut.
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      // editingId digunakan untuk menentukan:
      //
      // editingId ada  → UPDATE
      // editingId null → CREATE
      if (editingId) {
        // =========================================
        // UPDATE CUSTOMER
        // =========================================

        // PATCH biasanya digunakan untuk mengubah sebagian data.
        //
        // Contoh URL:
        // /customers/5
        //
        // Artinya update customer dengan ID 5.
        await axios.patch(`/customers/${editingId}`, {
          name,
          phone,
          address,
        })
      } else {
        // =========================================
        // CREATE CUSTOMER
        // =========================================

        // POST digunakan untuk membuat data baru.
        await axios.post("/customers", {
          name,
          phone,
          address,
        })
      }

      // Setelah berhasil create/update:
      // kosongkan kembali form.
      resetForm()

      // Tutup dialog.
      setFormDialogOpen(false)

      // Ambil ulang data dari backend supaya tabel
      // langsung menampilkan data terbaru.
      fetchCustomers()
    } catch (err: any) {
      // Kalau backend mengembalikan error,
      // kita bisa melihat response dari backend.
      console.log("ERROR:", err)
      console.log("RESPONSE:", err.response?.data)

      // ?. disebut optional chaining.
      //
      // err.response?.data?.message
      //
      // Artinya:
      // "Kalau response ada, ambil data.
      //  Kalau data ada, ambil message."
      //
      // Kalau tidak ada message, gunakan pesan default.
      setError(err.response?.data?.message || "Gagal menyimpan customer")
    } finally {
      // Request selesai → loading dimatikan.
      setLoading(false)
    }
  }

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEdit = (customer: Customer) => {
    // Simpan ID customer yang sedang diedit.
    setEditingId(customer.id)

    // Masukkan data customer lama ke dalam form.
    //
    // Ini membuat input langsung terisi:
    // Nama   → nama customer
    // Phone  → nomor customer
    // Address → alamat customer
    setName(customer.name)
    setPhone(customer.phone)

    // Kalau address tidak ada, gunakan string kosong.
    setAddress(customer.address || "")

    // Hapus error lama ketika membuka form edit.
    setError("")

    // Buka dialog.
    setFormDialogOpen(true)
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  // Function untuk mengembalikan form ke kondisi awal.
  const resetForm = () => {
    // null berarti tidak sedang edit.
    setEditingId(null)

    // Kosongkan semua input.
    setName("")
    setPhone("")
    setAddress("")

    // Hapus error.
    setError("")
  }

  // =========================================================
  // OPEN DELETE DIALOG
  // =========================================================

  const openDeleteDialog = (customer: Customer) => {
    // Simpan customer yang dipilih.
    //
    // Misalnya user klik Hapus pada Budi:
    // customerToDelete = data Budi
    setCustomerToDelete(customer)

    // Kemudian buka dialog konfirmasi.
    setDeleteDialogOpen(true)
  }

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDeleteConfirm = async (id: number) => {
    // Safety check.
    //
    // Kalau tidak ada customer yang dipilih,
    // function dihentikan.
    if (!customerToDelete) return

    setDeleteLoading(true)

    try {
      // DELETE request ke:
      // /customers/{id}
      //
      // Contoh:
      // /customers/5
      await axios.delete(`/customers/${id}`)

      // Setelah berhasil delete,
      // ambil ulang data customer dari backend.
      fetchCustomers()

      // Tutup dialog.
      setDeleteDialogOpen(false)

      // Hapus customer yang sebelumnya tersimpan di state.
      setCustomerToDelete(null)
    } catch (err: any) {
      // Tampilkan error jika delete gagal.
      alert(err.response?.data?.message || "Gagal menghapus")
    } finally {
      setDeleteLoading(false)
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  // filter() digunakan untuk membuat array baru
  // yang hanya berisi customer yang sesuai pencarian.
  const filteredCustomers = customers.filter((customer) => {
    // Kalau search kosong,
    // tampilkan semua customer.
    if (!searchQuery) return true

    // Ubah query menjadi lowercase supaya
    // pencarian tidak sensitif terhadap huruf besar/kecil.
    //
    // "BUDI" → "budi"
    const query = searchQuery.toLowerCase()

    // Customer akan ditampilkan kalau:
    // nama cocok ATAU nomor telepon cocok.
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    )
  })

  // =========================================================
  // LOADING PAGE
  // =========================================================

  // Conditional rendering.
  //
  // Kalau fetching masih true,
  // jangan tampilkan halaman utama dulu.
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
            // Pastikan form kosong ketika tombol Tambah diklik.
            resetForm()

            // Kemudian buka dialog.
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
                // Controlled input:
                // value berasal dari state
                value={searchQuery}
                // ketika user mengetik,
                // state searchQuery diperbarui.
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Conditional rendering:
                tombol Reset hanya muncul kalau searchQuery
                tidak kosong. */}
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

          {/* Menampilkan informasi jumlah hasil pencarian */}
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
            {/* Conditional rendering:
                Kalau hasil filter kosong → tampilkan pesan.
                Kalau ada data → tampilkan table row. */}
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
              // map() digunakan untuk mengubah setiap data customer
              // menjadi satu <TableRow>.
              filteredCustomers.map((customer) => (
                // key wajib diberikan ketika melakukan map
                // untuk membantu React mengidentifikasi setiap item.
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
                    {/* Kalau address ada → tampilkan address.
                        Kalau tidak ada → tampilkan "-". */}
                    {customer.address ? (
                      <div className='flex items-start gap-2'>
                        <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />

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
                        // Kirim data customer yang diklik
                        // ke function handleEdit().
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
                        // Ketika klik Hapus,
                        // buka confirmation dialog dan simpan
                        // customer yang ingin dihapus.
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
        // open dikontrol oleh state React.
        open={formDialogOpen}
        // onOpenChange dipanggil ketika dialog dibuka/ditutup.
        onOpenChange={(open) => {
          setFormDialogOpen(open)

          // Kalau dialog ditutup,
          // bersihkan data form.
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            {/* Judul berubah berdasarkan editingId.
            
                editingId ada:
                "Edit Customer"

                editingId null:
                "Tambah Customer Baru"
            */}
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

          {/* =================================================
              FORM
          ================================================= */}

          {/* onSubmit membuat semua proses submit form
              ditangani oleh handleSubmit(). */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Nama */}
            <div>
              <Label className='mb-2 block text-sm font-medium text-gray-700'>
                Nama Customer
              </Label>

              <Input
                // Controlled input:
                // nilai input mengikuti state "name".
                value={name}
                // Ketika user mengetik,
                // update state "name".
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
                  // Reset form sebelum dialog ditutup.
                  resetForm()

                  setFormDialogOpen(false)
                }}
                disabled={loading}
              >
                Batal
              </Button>

              <Button
                type='submit'
                // Saat loading:
                // tombol disabled agar user tidak submit
                // berkali-kali.
                disabled={loading}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                {/* Teks tombol juga berubah berdasarkan state. */}
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

      <Dialog
        open={deleteDialogOpen}
        // Di sini onOpenChange langsung menggunakan setter.
        //
        // Saat dialog berubah:
        // setDeleteDialogOpen(true/false)
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Hapus Customer?</DialogTitle>

            <DialogDescription>
              Apakah Anda yakin ingin menghapus customer{" "}
              <span className='font-semibold text-gray-800'>
                {/* ?. = optional chaining.
                    
                    Kalau customerToDelete masih null,
                    React tidak akan error. */}
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

                // Bersihkan customer yang sedang dipilih.
                setCustomerToDelete(null)
              }}
              disabled={deleteLoading}
              className='border-gray-300 text-gray-700 hover:bg-gray-50'
            >
              Batal
            </Button>

            <Button
              variant='destructive'
              // Kita hanya menjalankan delete kalau
              // customerToDelete memang ada.
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
