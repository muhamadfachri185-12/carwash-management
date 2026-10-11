import type { Service } from "../types/service"
import { CarFront, Clock3, Wallet } from "lucide-react"

type ServiceCardProps = {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(service.price))

  return (
    <article className='rounded-2xl border border-blue-50 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md'>
      {/* Nama layanan dan harga */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex min-w-0 items-start gap-3'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
            <CarFront className='h-6 w-6' />
          </div>

          <div className='min-w-0'>
            <h3 className='break-words text-base font-bold text-slate-900 sm:text-lg'>
              {service.name}
            </h3>

            <div className='mt-2 flex items-center gap-1.5 text-sm text-slate-500'>
              <Clock3 className='h-4 w-4 shrink-0' />

              <span>{service.duration} menit</span>
            </div>
          </div>
        </div>

        <div className='shrink-0 text-right'>
          <p className='text-xs font-medium text-slate-500'>Harga layanan</p>

          <p className='mt-1 text-base font-bold leading-snug text-[#4F8FEF] sm:text-lg'>
            {formattedPrice}
          </p>
        </div>
      </div>

      {/* Informasi layanan */}
      <div className='mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4'>
        <div className='flex items-center gap-2 rounded-xl bg-[#F3F7FF] p-3'>
          <Clock3 className='h-4 w-4 shrink-0 text-[#4F8FEF]' />

          <div className='min-w-0'>
            <p className='text-xs text-slate-500'>Estimasi</p>

            <p className='mt-0.5 text-sm font-semibold text-slate-800'>
              {service.duration} menit
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 rounded-xl bg-[#F3F7FF] p-3'>
          <Wallet className='h-4 w-4 shrink-0 text-[#4F8FEF]' />

          <div className='min-w-0'>
            <p className='text-xs text-slate-500'>Harga</p>

            <p className='mt-0.5 text-sm font-semibold text-slate-800'>
              {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
