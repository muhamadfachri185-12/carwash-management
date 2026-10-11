import { Pencil, Trash2, CarFront, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Vehicle } from "../types/vehicle"

type VehicleCardProps = {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (Vehicle: Vehicle) => void
}

function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  return (
    <article className='rounded-2xl border border-blue-50 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-start gap-3'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#3978D4]'>
          <CarFront className='h-6 w-6' />
        </div>

        <div className='min-w-0 flex-1'>
          <h3 className='break-words text-base font-bold text-slate-900'>
            {vehicle.brand} {vehicle.model}
          </h3>

          <p className='mt-1 text-xs text-slate-500'>Kendaraan terdaftar</p>
        </div>
      </div>

      {/* Nomor polisi */}
      <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3'>
        <div className='flex items-center gap-2 text-xs text-slate-500'>
          <Hash className='h-3.5 w-3.5' />
          Nomor Polisi
        </div>

        <p className='mt-2 break-all font-mono text-lg font-bold tracking-widest text-slate-900'>
          {vehicle.plateNumber}
        </p>
      </div>

      {/* Tombol aksi */}
      <div className='mt-4 flex gap-2'>
        <Button
          type='button'
          variant='outline'
          className='h-10 flex-1 rounded-xl border-blue-100 text-slate-700 hover:bg-blue-50 hover:text-[#3978D4]'
          onClick={() => onEdit(vehicle)}
        >
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-10 flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700'
          onClick={() => onDelete(vehicle)}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Hapus
        </Button>
      </div>
    </article>
  )
}

export default VehicleCard
