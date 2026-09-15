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

import { Car, Plus, Edit, Trash2, Search, User } from "lucide-react"

// Interface digunakan untuk menentukan bentuk/type data.
//
// Jadi TypeScript tahu bahwa setiap customer
// memiliki id berupa number dan name berupa string.
interface Customer {
  id: number
  name: string
}

// Interface Vehicle menjelaskan bentuk data kendaraan.
//
// customer adalah object Customer.
// Artinya data vehicle yang diterima dari backend
// diharapkan memiliki informasi customer di dalamnya.
interface Vehicle {
  id: number
  plateNumber: string
  brand: string
  model: string
  customer: Customer
}

export default function VehiclePage() {
  // =========================
  // DATA STATE
  // =========================

  // Menyimpan seluruh data kendaraan dari backend.
  //
  // <Vehicle[]> berarti state ini berupa array
  // yang setiap elemennya harus mengikuti interface Vehicle.
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  // Menyimpan seluruh customer.
  // Data ini digunakan untuk dropdown Customer
  // ketika tambah/edit kendaraan.
  const [customers, setCustomers] = useState<Customer[]>([])

  // =========================
  // FORM STATE
  // =========================

  // State untuk input form kendaraan.
  //
  // Input HTML pada dasarnya menghasilkan string,
  // sehingga semua value form di sini disimpan sebagai string.
  const [plateNumber, setPlateNumber] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [customerId, setCustomerId] = useState("")

  // =========================
  // EDIT STATE
  // =========================

  // Menentukan apakah form sedang dalam mode edit.
  //
  // null = mode tambah
  // number = mode edit dan berisi ID kendaraan
  const [editingId, setEditingId] = useState<number | null>(null)

  // =========================
  // LOADING STATE
  // =========================

  // loading digunakan ketika submit form
  // sedang melakukan POST atau PATCH.
  const [loading, setLoading] = useState(false)

  // fetching digunakan ketika mengambil
  // data kendaraan dan customer dari backend.
  const [fetching, setFetching] = useState(true)

  // =========================
  // ERROR STATE
  // =========================

  // Menyimpan pesan error untuk ditampilkan
  // kepada user.
  const [error, setError] = useState("")

  // =========================
  // SEARCH STATE
  // =========================

  // Keyword untuk mencari berdasarkan plat nomor.
  const [searchPlate, setSearchPlate] = useState("")

  // Keyword untuk mencari berdasarkan nama customer.
  const [searchCustomer, setSearchCustomer] = useState("")

  // =========================
  // FORM DIALOG
  // =========================

  // Mengontrol apakah dialog tambah/edit terbuka.
  //
  // true  = dialog terbuka
  // false = dialog tertutup
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // =========================
  // DELETE DIALOG
  // =========================

  // Mengontrol dialog konfirmasi delete.
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Menyimpan kendaraan yang ingin dihapus.
  //
  // null = belum memilih kendaraan.
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  // Loading khusus untuk proses delete.
  const [deleteLoading, setDeleteLoading] = useState(false)

  // =========================
  // FETCH VEHICLES & CUSTOMERS
  // =========================

  const fetchVehicles = async () => {
    try {
      // Aktifkan loading table.
      setFetching(true)

      // Bersihkan error sebelumnya.
      setError("")

      // Promise.all digunakan untuk menjalankan
      // beberapa request secara bersamaan.
      //
      // Daripada:
      //
      // await axios.get("/vehicles")
      // await axios.get("/customers")
      //
      // kita bisa menjalankannya bersamaan.
      const [vehicleRes, customerRes] = await Promise.all([
        axios.get("/vehicles"),
        axios.get("/customers"),
      ])

      // Simpan data kendaraan dari response backend
      // ke state vehicles.
      setVehicles(vehicleRes.data.vehicles)

      // Simpan data customer ke state customers.
      setCustomers(customerRes.data.customers)
    } catch (err: any) {
      // Kalau salah satu request gagal,
      // Promise.all akan masuk ke catch.
      console.error(err)

      // Ambil pesan error dari backend jika ada.
      setError(err.response?.data?.message || "Gagal mengambil data kendaraan.")
    } finally {
      // finally selalu dijalankan setelah try/catch.
      //
      // Jadi loading akan dimatikan
      // baik request berhasil maupun gagal.
      setFetching(false)
    }
  }

  // useEffect dengan dependency array kosong []
  // hanya berjalan ketika component pertama kali
  // ditampilkan.
  //
  // Ini cocok untuk mengambil data awal dari API.
  useEffect(() => {
    fetchVehicles()
  }, [])

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    // Kosongkan semua input.
    setPlateNumber("")
    setBrand("")
    setModel("")
    setCustomerId("")

    // Kembalikan ke mode tambah.
    //
    // editingId = null berarti
    // tidak sedang mengedit kendaraan.
    setEditingId(null)

    // Bersihkan error.
    setError("")
  }

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAdd = () => {
    // Pastikan form kosong.
    resetForm()

    // Buka dialog.
    setFormDialogOpen(true)
  }

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (vehicle: Vehicle) => {
    // Simpan ID kendaraan yang sedang diedit.
    setEditingId(vehicle.id)

    // Masukkan data kendaraan yang dipilih
    // ke dalam input form.
    setPlateNumber(vehicle.plateNumber)
    setBrand(vehicle.brand)
    setModel(vehicle.model)

    // customerId pada state berupa string,
    // sedangkan vehicle.customer.id berupa number.
    //
    // Jadi number diubah menjadi string.
    //
    // Contoh:
    // 5 -> "5"
    setCustomerId(String(vehicle.customer.id))

    // Bersihkan error sebelumnya.
    setError("")

    // Buka dialog.
    setFormDialogOpen(true)
  }

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Mencegah browser melakukan reload
    // ketika form di-submit.
    e.preventDefault()

    // Validasi sederhana di frontend.
    //
    // Kalau salah satu field kosong,
    // jangan kirim request ke backend.
    if (!customerId || !plateNumber || !brand || !model) {
      setError("Semua field wajib diisi.")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Membuat object data yang akan dikirim
      // ke backend.
      const payload = {
        // IMPORTANT:
        // customerId dari <select> berupa string.
        //
        // Backend membutuhkan number.
        //
        // Contoh:
        // "3" -> 3
        customerId: Number(customerId),

        plateNumber,
        brand,
        model,
      }

      // Kalau editingId memiliki nilai,
      // berarti user sedang mengedit.
      if (editingId) {
        // PATCH digunakan untuk update data.
        //
        // Contoh:
        // editingId = 5
        //
        // request:
        // PATCH /vehicles/5
        await axios.patch(`/vehicles/${editingId}`, payload)
      } else {
        // Kalau editingId null,
        // berarti user sedang membuat data baru.
        //
        // POST digunakan untuk membuat data baru.
        await axios.post("/vehicles", payload)
      }

      // Setelah berhasil:
      // 1. Bersihkan form
      // 2. Tutup dialog
      resetForm()
      setFormDialogOpen(false)

      // Ambil data terbaru dari backend
      // supaya table langsung berubah.
      await fetchVehicles()
    } catch (err: any) {
      console.error(err)

      // Tampilkan pesan error dari backend jika tersedia.
      setError(err.response?.data?.message || "Gagal menyimpan data kendaraan.")
    } finally {
      // Matikan loading setelah proses selesai.
      setLoading(false)
    }
  }

  // =========================
  // OPEN DELETE DIALOG
  // =========================

  const handleDeleteClick = (vehicle: Vehicle) => {
    // Simpan kendaraan yang dipilih.
    setVehicleToDelete(vehicle)

    // Buka dialog konfirmasi.
    setDeleteDialogOpen(true)
  }

  // =========================
  // DELETE VEHICLE
  // =========================

  const handleDelete = async () => {
    // Kalau tidak ada kendaraan yang dipilih,
    // hentikan function.
    if (!vehicleToDelete) return

    try {
      setDeleteLoading(true)
      setError("")

      // DELETE berdasarkan ID kendaraan.
      //
      // Contoh:
      // DELETE /vehicles/5
      await axios.delete(`/vehicles/${vehicleToDelete.id}`)

      // Tutup dialog.
      setDeleteDialogOpen(false)

      // Bersihkan kendaraan yang dipilih.
      setVehicleToDelete(null)

      // Ambil ulang data terbaru.
      await fetchVehicles()
    } catch (err: any) {
      console.error(err)

      setError(err.response?.data?.message || "Gagal menghapus kendaraan.")
    } finally {
      // Matikan loading delete.
      setDeleteLoading(false)
    }
  }

  // =========================
  // FILTER VEHICLES
  // =========================

  // filter() menghasilkan array baru
  // berdasarkan kondisi yang kita tentukan.
  //
  // vehicles = semua kendaraan
  // filteredVehicles = kendaraan yang sesuai pencarian
  const filteredVehicles = vehicles.filter((vehicle) => {
    // =========================
    // SEARCH PLATE
    // =========================

    const matchesPlate = searchPlate
      ? vehicle.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
      : true

    // Penjelasan ternary:
    //
    // Kalau searchPlate ada:
    // -> cari apakah plateNumber mengandung keyword
    //
    // Kalau searchPlate kosong:
    // -> true
    //
    // true berarti kendaraan tidak difilter berdasarkan plat.

    // =========================
    // SEARCH CUSTOMER
    // =========================

    const matchesCustomer = searchCustomer
      ? vehicle.customer?.name
          .toLowerCase()
          .includes(searchCustomer.toLowerCase())
      : true

    // Optional chaining ?. digunakan karena
    // customer mungkin saja tidak ada.
    //
    // vehicle.customer?.name
    //
    // Kalau customer ada:
    // -> ambil name
    //
    // Kalau customer tidak ada:
    // -> tidak langsung error.

    // Kendaraan hanya ditampilkan kalau
    // lolos kedua filter.
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

        {/* 
          Ketika button diklik,
          function handleAdd akan dijalankan.
        */}
        <Button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-700'>
          <Plus className='mr-2 h-4 w-4' />
          Tambah Kendaraan
        </Button>
      </div>

      {/* =========================
          ERROR GLOBAL
      ========================= */}

      {/*
        Error global hanya ditampilkan
        ketika dialog form sedang tertutup.

        Jadi error form tetap ditampilkan
        di dalam dialog.
      */}
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
          {/* =========================
              SEARCH PLATE
          ========================= */}

          <div className='space-y-2'>
            <Label htmlFor='searchPlate'>Plat Nomor</Label>

            <div className='relative'>
              <Input
                id='searchPlate'
                // Controlled input:
                // value input berasal dari state React.
                value={searchPlate}
                // Setiap user mengetik,
                // searchPlate akan diperbarui.
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder='Cari berdasarkan plat nomor...'
                className='pl-9'
              />
            </div>
          </div>

          {/* =========================
              SEARCH CUSTOMER
          ========================= */}

          <div className='space-y-2'>
            <Label htmlFor='searchCustomer'>Nama Customer</Label>

            <div className='relative'>
              <Input
                id='searchCustomer'
                value={searchCustomer}
                // Update keyword customer
                // setiap user mengetik.
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

            {/* 
              filteredVehicles.length menunjukkan
              jumlah kendaraan yang sedang ditampilkan
              setelah search/filter.
            */}
            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
              {filteredVehicles.length}
            </span>
          </div>
        </div>

        {/* =========================
            CONDITIONAL RENDERING
        ========================= */}

        {/*
          Ada 3 kondisi:

          1. fetching === true
             -> tampilkan loading

          2. fetching selesai + data kosong
             -> tampilkan "Tidak ada kendaraan"

          3. Ada data
             -> tampilkan table
        */}

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
              {/* 
                map() digunakan untuk mengubah
                setiap object vehicle menjadi JSX.

                Misalnya ada:
                [
                  vehicle1,
                  vehicle2,
                  vehicle3
                ]

                map() akan menghasilkan
                3 buah TableRow.
              */}
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className='hover:bg-gray-50'>
                  {/* =========================
                      PLATE NUMBER
                  ========================= */}

                  <TableCell>
                    <div className='inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-semibold text-gray-800'>
                      {vehicle.plateNumber}
                    </div>
                  </TableCell>

                  {/* =========================
                      BRAND & MODEL
                  ========================= */}

                  <TableCell>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {vehicle.brand}
                      </p>

                      <p className='text-sm text-gray-500'>{vehicle.model}</p>
                    </div>
                  </TableCell>

                  {/* =========================
                      CUSTOMER
                  ========================= */}

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

                  {/* =========================
                      ACTIONS
                  ========================= */}

                  <TableCell>
                    <div className='flex justify-end gap-2'>
                      {/* EDIT */}

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(vehicle)}
                        className='border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Edit className='mr-1.5 h-4 w-4' />
                        Edit
                      </Button>

                      {/* DELETE */}

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
          // Update status dialog.
          setFormDialogOpen(open)

          // Kalau dialog ditutup,
          // bersihkan form.
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            {/* 
              Judul berubah berdasarkan mode.

              editingId ada:
              -> Edit Kendaraan

              editingId null:
              -> Tambah Kendaraan
            */}
            <DialogTitle>
              {editingId ? "Edit Kendaraan" : "Tambah Kendaraan"}
            </DialogTitle>

            <DialogDescription>
              {editingId
                ? "Perbarui informasi kendaraan."
                : "Tambahkan kendaraan baru ke dalam sistem."}
            </DialogDescription>
          </DialogHeader>

          {/* 
            Satu form digunakan untuk dua fungsi:

            Kalau editingId ada:
            -> update

            Kalau editingId null:
            -> create
          */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            {/* =========================
                CUSTOMER
            ========================= */}

            <div className='space-y-2'>
              <Label htmlFor='customer'>Customer</Label>

              <select
                id='customer'
                // Value select dikontrol oleh customerId.
                value={customerId}
                // e.target.value dari select selalu string.
                onChange={(e) => setCustomerId(e.target.value)}
                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              >
                {/* 
                  Value kosong berarti belum memilih customer.
                */}
                <option value=''>Pilih customer</option>

                {/* 
                  map() digunakan untuk membuat
                  option berdasarkan data customer.
                */}
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* =========================
                PLATE NUMBER
            ========================= */}

            <div className='space-y-2'>
              <Label htmlFor='plateNumber'>Plat Nomor</Label>

              <Input
                id='plateNumber'
                value={plateNumber}
                // Update state ketika user mengetik.
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder='Contoh: B 1234 ABC'
              />
            </div>

            {/* =========================
                BRAND
            ========================= */}

            <div className='space-y-2'>
              <Label htmlFor='brand'>Merk</Label>

              <Input
                id='brand'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder='Contoh: Toyota'
              />
            </div>

            {/* =========================
                MODEL
            ========================= */}

            <div className='space-y-2'>
              <Label htmlFor='model'>Model</Label>

              <Input
                id='model'
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder='Contoh: Avanza'
              />
            </div>

            {/* =========================
                FORM FOOTER
            ========================= */}

            <DialogFooter>
              {/* 
                type="button" penting.

                Karena button ini berada di dalam <form>.
                Kalau tidak diberi type="button",
                browser bisa menganggapnya sebagai submit.
              */}
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
                {/* 
                  Teks tombol berubah berdasarkan state.

                  loading:
                  -> Menyimpan...

                  edit:
                  -> Simpan Perubahan

                  tambah:
                  -> Tambah Kendaraan
                */}
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
          // Update status dialog.
          setDeleteDialogOpen(open)

          // Kalau dialog ditutup,
          // hapus kendaraan yang sedang dipilih.
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
              {/* 
                Optional chaining:
                
                vehicleToDelete?.plateNumber

                Kalau vehicleToDelete ada:
                -> tampilkan plateNumber

                Kalau null:
                -> tidak menyebabkan error
              */}
              <span className='font-semibold text-gray-900'>
                {vehicleToDelete?.plateNumber}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            {/* =========================
                CANCEL DELETE
            ========================= */}

            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>

            {/* =========================
                CONFIRM DELETE
            ========================= */}

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
