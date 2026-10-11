import { useState } from "react"
import { Plus, CarFront, ArrowLeft, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import VehicleCard from "@/features/vehicles/components/VehicleCard"
import VehicleForm from "@/features/vehicles/components/VehicleForm"
import { useVehicles } from "@/features/vehicles/hooks/usevehicle"

import type {
  Vehicle,
  VehicleFormData,
} from "@/features/vehicles/types/vehicle"

function VehiclesPage() {
  const navigate = useNavigate()

  const {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  } = useVehicles()

  const [showForm, setShowForm] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  function handleAdd() {
    setSelectedVehicle(null)
    setFormError("")
    setShowForm(true)
  }

  function handleEdit(vehicle: Vehicle) {
    setSelectedVehicle(vehicle)
    setFormError("")
    setShowForm(true)
  }

  function handleCancel() {
    if (saving) return

    setShowForm(false)
    setSelectedVehicle(null)
    setFormError("")
  }

  async function handleSubmit(data: VehicleFormData) {
    setSaving(true)
    setFormError("")

    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, data)
      } else {
        await createVehicle(data)
      }

      setShowForm(false)
      setSelectedVehicle(null)
      setFormError("")
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number
          data?: { message?: string }
        }
      }

      if (error.response?.status === 409) {
        setFormError(
          "Kendaraan dapat ditambahkan setelah Anda membuat order pertama di outlet.",
        )
      } else {
        setFormError(
          error.response?.data?.message ??
            "Gagal menyimpan kendaraan. Silakan coba lagi.",
        )
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})?`,
    )

    if (!confirmed) return

    try {
      await deleteVehicle(vehicle.id)
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } }
      }

      window.alert(
        error.response?.data?.message ?? "Gagal menghapus kendaraan.",
      )
    }
  }

  return (
    <div className='min-h-screen space-y-6 bg-[#F3F7FF] px-4 py-6'>
      {/* Header halaman */}
      <section className='space-y-4'>
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='inline-flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-[#3978D4]'
        >
          <ArrowLeft className='h-4 w-4' />
          Kembali
        </button>

        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold uppercase tracking-wider text-[#4F8FEF]'>
              AKUN KAMU
            </p>

            <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-900'>
              Kendaraan Saya
            </h1>

            <p className='mt-2 text-sm leading-6 text-slate-500'>
              Kelola kendaraan yang kamu gunakan untuk layanan carwash.
            </p>
          </div>

          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#3978D4]'>
            <CarFront className='h-6 w-6' />
          </div>
        </div>

        <div className='flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm'>
          <div>
            <p className='text-xs text-slate-500'>Kendaraan terdaftar</p>
            <p className='mt-1 text-xl font-bold text-slate-900'>
              {loading ? "—" : vehicles.length}
            </p>
          </div>

          <span className='rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700'>
            {vehicles.length === 1
              ? "1 kendaraan"
              : `${vehicles.length} kendaraan`}
          </span>
        </div>
      </section>

      {/* Tombol tambah kendaraan */}
      {!showForm && vehicles.length > 0 && (
        <Button
          type='button'
          onClick={handleAdd}
          className='h-12 w-full rounded-xl bg-[#4F8FEF] font-semibold text-white shadow-sm hover:bg-blue-600'
        >
          <Plus className='mr-2 h-5 w-5' />
          Tambah Kendaraan
        </Button>
      )}

      {/* Status loading */}
      {loading ? (
        <div className='rounded-2xl border border-blue-50 bg-white px-5 py-12 text-center shadow-sm'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-[#4F8FEF]' />
          <p className='mt-4 text-sm text-slate-500'>
            Memuat data kendaraan...
          </p>
        </div>
      ) : error ? (
        <div className='rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm'>
          <p className='text-sm leading-6 text-red-600'>{error}</p>

          <Button
            type='button'
            variant='outline'
            onClick={() => void fetchVehicles()}
            className='mt-4 rounded-xl'
          >
            Coba Lagi
          </Button>
        </div>
      ) : vehicles.length === 0 ? (
        /* Empty state */
        <section className='rounded-3xl border border-dashed border-blue-200 bg-white px-5 py-10 text-center shadow-sm'>
          <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#3978D4]'>
              <CarFront className='h-9 w-9' />
            </div>
          </div>

          <h2 className='mt-5 text-lg font-bold text-slate-900'>
            Belum Ada Kendaraan
          </h2>

          <p className='mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500'>
            Kendaraan akan tersimpan saat kamu membuat order pertama di outlet.
            Setelah itu, kamu dapat mengelolanya di sini.
          </p>

          <div className='mt-5 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-left'>
            <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-[#3978D4]' />
            <p className='text-xs leading-5 text-slate-600'>
              Pastikan nomor polisi kendaraan ditulis dengan benar.
            </p>
          </div>
        </section>
      ) : (
        /* Daftar kendaraan */
        <section className='space-y-3'>
          <div className='px-1'>
            <h2 className='text-sm font-bold text-slate-800'>
              Daftar Kendaraan
            </h2>
            <p className='mt-1 text-xs text-slate-500'>
              Pilih kendaraan untuk mengubah atau menghapus datanya.
            </p>
          </div>

          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          <button
            type='button'
            onClick={handleAdd}
            className='flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-4 text-sm font-semibold text-[#3978D4] transition hover:bg-blue-50'
          >
            <Plus className='h-5 w-5' />
            Tambah Kendaraan Lain
          </button>
        </section>
      )}

      {/* Bottom sheet tambah/edit kendaraan */}
      {showForm && (
        <div
          className='fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6'
          onClick={handleCancel}
        >
          <section
            role='dialog'
            aria-modal='true'
            aria-labelledby='vehicle-form-title'
            className='max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-3 shadow-2xl sm:rounded-3xl'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden' />

            <div className='mb-5 flex items-start justify-between gap-3'>
              <div>
                <h2
                  id='vehicle-form-title'
                  className='text-xl font-bold text-slate-900'
                >
                  {selectedVehicle ? "Edit Kendaraan" : "Tambah Kendaraan"}
                </h2>

                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  Masukkan informasi kendaraan dengan benar.
                </p>
              </div>

              <button
                type='button'
                onClick={handleCancel}
                disabled={saving}
                aria-label='Tutup formulir'
                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50'
              >
                ×
              </button>
            </div>

            {formError && (
              <p
                role='alert'
                className='mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700'
              >
                {formError}
              </p>
            )}

            <VehicleForm
              vehicle={selectedVehicle}
              saving={saving}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </section>
        </div>
      )}
    </div>
  )
}

export default VehiclesPage
