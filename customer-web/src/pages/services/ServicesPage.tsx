import { Clock3, Droplets, Info, Sparkles } from "lucide-react"
import ServiceCard from "@/features/services/components/ServiceCard"
import { useServices } from "@/features/services/hooks/useServices"

export default function ServicesPage() {
  const { services, loading, error } = useServices()

  return (
    <main className='min-h-screen w-full bg-[#F3F7FF] px-4 py-6 pb-24 sm:px-6 sm:py-8'>
      <div className='mx-auto max-w-3xl'>
        {/* Header */}
        <section className='mb-6'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#4F8FEF]'>
              <Droplets className='h-5 w-5' />
            </div>

            <span className='text-sm font-semibold text-[#4F8FEF]'>
              CarWash Services
            </span>
          </div>

          <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>
            Layanan Cuci Kendaraan
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Temukan layanan yang sesuai dengan kebutuhan kendaraanmu. Lihat
            harga dan estimasi durasi sebelum datang ke outlet.
          </p>
        </section>

        {/* Informasi pemesanan */}
        <section className='mb-7 flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
            <Info className='h-5 w-5' />
          </div>

          <div className='min-w-0'>
            <h2 className='font-semibold text-slate-900'>
              Ingin mencuci kendaraan?
            </h2>

            <p className='mt-1 text-sm leading-6 text-slate-600'>
              Datang ke outlet dan scan QR yang tersedia untuk memulai pemesanan
              layanan.
            </p>
          </div>
        </section>

        {/* Judul daftar layanan */}
        <section className='mb-4 flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold text-slate-900'>
              Pilihan Layanan
            </h2>

            <p className='mt-1 text-sm text-slate-500'>
              Pilih layanan sesuai kebutuhanmu.
            </p>
          </div>

          {!loading && !error && services.length > 0 && (
            <span className='shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700'>
              {services.length} layanan
            </span>
          )}
        </section>

        {/* Loading */}
        {loading && (
          <div className='space-y-4' aria-label='Memuat layanan'>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className='animate-pulse rounded-2xl border border-blue-50 bg-white p-5'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='h-5 w-2/3 rounded bg-slate-200' />
                    <div className='mt-3 h-3 w-full rounded bg-slate-100' />
                    <div className='mt-2 h-3 w-1/2 rounded bg-slate-100' />
                  </div>

                  <div className='h-6 w-20 rounded bg-slate-200' />
                </div>

                <div className='mt-6 h-11 rounded-xl bg-slate-100' />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role='alert'
            className='rounded-2xl border border-red-200 bg-white p-5'
          >
            <h2 className='font-semibold text-red-700'>Gagal memuat layanan</h2>

            <p className='mt-2 text-sm leading-6 text-slate-600'>{error}</p>

            <p className='mt-2 text-xs text-slate-500'>
              Periksa koneksi backend, lalu coba muat ulang halaman.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && services.length === 0 && (
          <div className='rounded-2xl border border-dashed border-blue-200 bg-white px-5 py-10 text-center'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#4F8FEF]'>
              <Sparkles className='h-7 w-7' />
            </div>

            <h2 className='mt-4 font-semibold text-slate-900'>
              Belum ada layanan tersedia
            </h2>

            <p className='mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500'>
              Daftar layanan akan ditampilkan di sini setelah tersedia.
            </p>
          </div>
        )}

        {/* Daftar layanan */}
        {!loading && !error && services.length > 0 && (
          <div className='grid grid-cols-1 gap-4'>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* Catatan estimasi */}
        {!loading && !error && services.length > 0 && (
          <div className='mt-6 flex items-start gap-3 rounded-2xl bg-blue-100/60 p-4'>
            <Clock3 className='mt-0.5 h-5 w-5 shrink-0 text-blue-700' />

            <p className='text-xs leading-5 text-blue-900'>
              Durasi yang tercantum merupakan estimasi pengerjaan. Waktu aktual
              dapat berbeda tergantung kondisi kendaraan dan antrean di outlet.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
