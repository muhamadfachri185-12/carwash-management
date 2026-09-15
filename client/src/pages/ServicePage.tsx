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

// Interface digunakan untuk menentukan bentuk/type data Service.
//
// Jadi setiap object service harus punya:
// id       -> number
// name     -> string
// duration -> number
// price    -> number
// isActive -> boolean
interface Service {
  id: number
  name: string
  duration: number
  price: number
  isActive: boolean
}

export default function ServicePage() {
  // Array services digunakan untuk menyimpan semua data layanan
  // yang didapatkan dari backend.
  const [services, setServices] = useState<Service[]>([])

  // =========================
  // FORM STATE
  // =========================

  // State untuk form TAMBAH layanan.
  //
  // Walaupun duration dan price nantinya dikirim sebagai number,
  // input HTML tetap menghasilkan value berupa string.
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState("")

  // =========================
  // EDIT STATE
  // =========================

  // editingId digunakan untuk mengetahui apakah
  // sekarang kita sedang mengedit sebuah service.
  //
  // null = tidak sedang edit
  // number = sedang edit service dengan ID tersebut
  const [editingId, setEditingId] = useState<number | null>(null)

  // State khusus untuk form EDIT.
  const [editName, setEditName] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editPrice, setEditPrice] = useState("")

  // =========================
  // LOADING & ERROR
  // =========================

  // loading digunakan ketika proses create/update sedang berlangsung.
  const [loading, setLoading] = useState(false)

  // fetching digunakan ketika mengambil daftar service dari backend.
  //
  // Dibedakan dari loading supaya:
  // fetching = loading data table
  // loading = menyimpan data form
  const [fetching, setFetching] = useState(true)

  // Menyimpan pesan error untuk ditampilkan ke user.
  const [error, setError] = useState("")

  // =========================
  // SEARCH & FILTER
  // =========================

  // Menyimpan keyword pencarian.
  const [searchQuery, setSearchQuery] = useState("")

  // Menyimpan filter status.
  //
  // Nilainya bisa:
  // ALL
  // ACTIVE
  // INACTIVE
  const [statusFilter, setStatusFilter] = useState("ALL")

  // =========================
  // FORM DIALOG
  // =========================

  // true  = dialog tambah/edit terbuka
  // false = dialog tertutup
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // =========================
  // DELETE DIALOG
  // =========================

  // Mengontrol dialog konfirmasi delete.
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Menyimpan service yang akan dihapus.
  //
  // null berarti belum memilih service.
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  // Loading khusus ketika proses delete.
  const [deleteLoading, setDeleteLoading] = useState(false)

  // =========================
  // FETCH SERVICES
  // =========================

  // Function untuk mengambil data service dari backend.
  const fetchServices = async () => {
    try {
      // Tampilkan status loading pada table
      setFetching(true)

      // GET request ke:
      // http://localhost:3000/api/services
      //
      // Karena baseURL Axios sudah berisi /api,
      // di sini cukup menggunakan "/services".
      const res = await axios.get("/services")

      // Simpan data services dari response backend
      // ke state React.
      setServices(res.data.services)
    } catch (err: any) {
      // Kalau request gagal, masuk ke catch.
      console.error("Gagal memuat data layanan", err)

      // Ambil pesan error dari backend jika tersedia.
      setError(err.response?.data?.message || "Gagal memuat data layanan.")
    } finally {
      // finally selalu dijalankan,
      // baik request berhasil maupun gagal.
      setFetching(false)
    }
  }

  // useEffect dengan [] hanya dijalankan sekali
  // ketika component pertama kali ditampilkan.
  //
  // Cocok digunakan untuk mengambil data awal dari API.
  useEffect(() => {
    fetchServices()
  }, [])

  // =========================
  // RESET FORM
  // =========================

  // Mengembalikan semua state form ke kondisi awal.
  const resetForm = () => {
    // Reset form tambah
    setName("")
    setDuration("")
    setPrice("")

    // Reset form edit
    setEditName("")
    setEditDuration("")
    setEditPrice("")

    // Tidak sedang edit
    setEditingId(null)

    // Bersihkan error
    setError("")
  }

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAdd = () => {
    // Pastikan form bersih sebelum digunakan
    // untuk menambahkan service baru.
    resetForm()

    // Buka dialog
    setFormDialogOpen(true)
  }

  // =========================
  // CREATE SERVICE
  // =========================

  const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
    // Mencegah browser reload ketika form submit.
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      // POST digunakan untuk membuat data baru.
      await axios.post("/services", {
        name,

        // Input HTML menghasilkan string.
        // Backend membutuhkan number.
        //
        // Contoh:
        // "45" -> 45
        duration: Number(duration),

        // Contoh:
        // "35000" -> 35000
        price: Number(price),
      })

      // Setelah berhasil:
      // 1. Bersihkan form
      // 2. Tutup dialog
      resetForm()
      setFormDialogOpen(false)

      // Ambil ulang data supaya table langsung
      // menampilkan service yang baru dibuat.
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
    // Simpan ID service yang sedang diedit.
    setEditingId(service.id)

    // Isi form edit menggunakan data service yang dipilih.
    setEditName(service.name)

    // Karena state input berupa string,
    // number harus diubah menjadi string.
    //
    // Contoh:
    // 45 -> "45"
    setEditDuration(String(service.duration))
    setEditPrice(String(service.price))

    setError("")

    // Buka dialog form.
    setFormDialogOpen(true)
  }

  // =========================
  // SAVE EDIT
  // =========================

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Kalau tidak ada editingId,
    // berarti tidak ada service yang sedang diedit.
    if (!editingId) return

    setLoading(true)
    setError("")

    try {
      // PATCH digunakan untuk mengubah sebagian data.
      //
      // URL akan menjadi:
      // /services/1
      // /services/2
      // dst.
      await axios.patch(`/services/${editingId}`, {
        name: editName,
        duration: Number(editDuration),
        price: Number(editPrice),
      })

      // Setelah berhasil update,
      // bersihkan form dan tutup dialog.
      resetForm()
      setFormDialogOpen(false)

      // Ambil data terbaru dari backend.
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
    // Bersihkan semua data form
    resetForm()

    // Tutup dialog
    setFormDialogOpen(false)
  }

  // =========================
  // TOGGLE ACTIVE / INACTIVE
  // =========================

  const handleToggleActive = async (service: Service) => {
    try {
      // Kita mengirim kebalikan dari status sekarang.
      //
      // Kalau:
      // isActive = true
      //
      // maka:
      // !true = false
      //
      // Kalau:
      // isActive = false
      //
      // maka:
      // !false = true
      await axios.patch(`/services/${service.id}`, {
        isActive: !service.isActive,
      })

      // Ambil data terbaru setelah status berubah.
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
    // Simpan service yang ingin dihapus.
    setServiceToDelete(service)

    // Buka dialog konfirmasi.
    setDeleteDialogOpen(true)
  }

  // =========================
  // DELETE SERVICE
  // =========================

  const handleDeleteConfirm = async () => {
    // Kalau belum ada service yang dipilih,
    // jangan lakukan apa-apa.
    if (!serviceToDelete) return

    setDeleteLoading(true)
    setError("")

    try {
      // DELETE request berdasarkan ID service.
      await axios.delete(`/services/${serviceToDelete.id}`)

      // Tutup dialog setelah berhasil.
      setDeleteDialogOpen(false)

      // Bersihkan service yang dipilih.
      setServiceToDelete(null)

      // Ambil data terbaru.
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

  // filter() membuat array baru berdasarkan kondisi tertentu.
  //
  // services = semua service
  // filteredServices = service yang sesuai pencarian/filter
  const filteredServices = services.filter((service) => {
    // =========================
    // SEARCH
    // =========================

    if (searchQuery) {
      // Ubah nama service dan keyword menjadi lowercase
      // supaya pencarian tidak memperhatikan huruf besar/kecil.
      //
      // "Cuci Salju".toLowerCase()
      // menjadi:
      // "cuci salju"
      const matchesSearch = service.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      // Kalau nama service tidak mengandung keyword,
      // service tersebut tidak dimasukkan ke hasil.
      if (!matchesSearch) {
        return false
      }
    }

    // =========================
    // STATUS FILTER
    // =========================

    // Kalau filter ACTIVE,
    // buang service yang tidak aktif.
    if (statusFilter === "ACTIVE" && !service.isActive) {
      return false
    }

    // Kalau filter INACTIVE,
    // buang service yang aktif.
    if (statusFilter === "INACTIVE" && service.isActive) {
      return false
    }

    // Kalau lolos semua kondisi,
    // masukkan service ke hasil filter.
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

        {/* 
          Ketika button diklik,
          function handleAdd dijalankan.
        */}
        <Button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-700'>
          <Plus className='mr-2 h-4 w-4' />
          Tambah Layanan
        </Button>
      </div>

      {/* =========================
          GLOBAL ERROR
      ========================= */}

      {/*
        Error hanya ditampilkan di luar dialog
        kalau formDialogOpen = false.

        Tujuannya supaya error form tidak muncul
        sekaligus di global error.
      */}
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
          {/* =========================
              SEARCH
          ========================= */}

          <div className='space-y-2'>
            <Label htmlFor='search-service'>Nama Layanan</Label>

            <div className='relative'>
              <Input
                id='search-service'
                placeholder='Cari nama layanan...'
                // Input dikontrol oleh React state.
                value={searchQuery}
                // Update searchQuery setiap user mengetik.
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>
          </div>

          {/* =========================
              STATUS FILTER
          ========================= */}

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

        {/* =========================
            RESULT INFO
        ========================= */}

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

          {/* 
            Tombol Reset hanya muncul kalau
            user sedang menggunakan search atau filter.
          */}
          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                // Kembalikan search ke kosong
                setSearchQuery("")

                // Kembalikan filter ke ALL
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

        {/* 
          Conditional Rendering

          Ada 3 kondisi:

          1. fetching = true
             -> tampilkan loading

          2. fetching selesai tetapi data kosong
             -> tampilkan "Tidak ada layanan"

          3. Ada data
             -> tampilkan table
        */}
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
              {/* 
                map() digunakan untuk mengubah
                setiap object service menjadi elemen JSX.

                Misalnya ada 3 service:
                [service1, service2, service3]

                maka map() menghasilkan:
                <TableRow />
                <TableRow />
                <TableRow />
              */}
              {filteredServices.map((service) => (
                <TableRow key={service.id} className='hover:bg-gray-50'>
                  {/* =========================
                      ID
                  ========================= */}

                  <TableCell>
                    <span className='font-mono text-sm font-medium text-gray-600'>
                      #{service.id}
                    </span>
                  </TableCell>

                  {/* =========================
                      NAME
                  ========================= */}

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

                  {/* =========================
                      DURATION
                  ========================= */}

                  <TableCell>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Clock className='h-4 w-4 text-gray-400' />

                      <span>{service.duration} Menit</span>
                    </div>
                  </TableCell>

                  {/* =========================
                      PRICE
                  ========================= */}

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <CircleDollarSign className='h-4 w-4 text-gray-400' />

                      <span className='font-medium text-gray-800'>
                        Rp {Number(service.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </TableCell>

                  {/* =========================
                      STATUS
                  ========================= */}

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

                  {/* =========================
                      ACTIONS
                  ========================= */}

                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      {/* =========================
                          EDIT
                      ========================= */}

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditStart(service)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Edit className='mr-1.5 h-4 w-4' />
                        Edit
                      </Button>

                      {/* =========================
                          TOGGLE ACTIVE
                      ========================= */}

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

                      {/* =========================
                          DELETE
                      ========================= */}

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
          // Update status dialog
          setFormDialogOpen(open)

          // Kalau dialog ditutup,
          // bersihkan semua data form.
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

          {/* 
            Form yang sama digunakan untuk ADD dan EDIT.

            Kalau editingId ada:
            -> handleEditSave

            Kalau editingId null:
            -> handleCreateService
          */}
          <form
            onSubmit={editingId ? handleEditSave : handleCreateService}
            className='space-y-5'
          >
            {/* ERROR */}

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            {/* =========================
                NAME
            ========================= */}

            <div className='space-y-2'>
              <Label htmlFor='service-name'>Nama Layanan</Label>

              <Input
                id='service-name'
                // Kalau edit:
                // gunakan editName
                //
                // Kalau tambah:
                // gunakan name
                value={editingId ? editName : name}
                onChange={(e) => {
                  // Tentukan state mana yang harus diubah
                  // berdasarkan mode form.
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

            {/* =========================
                DURATION
            ========================= */}

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

            {/* =========================
                PRICE
            ========================= */}

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

            {/* =========================
                FOOTER
            ========================= */}

            <DialogFooter>
              {/* 
                type="button" penting.

                Kalau tidak diberikan,
                button di dalam form bisa dianggap
                sebagai submit button.
              */}
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
                {/* 
                  Teks tombol berubah berdasarkan state.

                  loading = true
                  -> Menyimpan...

                  editingId ada
                  -> Simpan Perubahan

                  editingId null
                  -> Tambah Layanan
                */}
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

          // Kalau dialog ditutup,
          // hapus service yang sebelumnya dipilih.
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
              {/* 
                Optional chaining digunakan karena
                serviceToDelete bisa bernilai null.
                
                Kalau null:
                serviceToDelete?.name
                hasilnya undefined dan tidak menyebabkan error.
              */}
              <span className='font-semibold text-gray-900'>
                {serviceToDelete?.name}
              </span>
              ?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            {/* CANCEL */}

            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>

            {/* DELETE */}

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
