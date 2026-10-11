import { Link } from "react-router-dom"
import { ArrowRight, Camera, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function ScanQrCard() {
  return (
    <section>
      <Card className='relative overflow-hidden rounded-2xl border-0 bg-[#E5EFFF] shadow-sm'>
        <div className='pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl' />
        <div className='pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/60 blur-2xl' />

        <CardContent className='relative space-y-4 p-4'>
          <div className='flex items-start gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#4F8FEF] shadow-sm'>
              <QrCode className='h-6 w-6' />
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='font-semibold text-slate-900'>
                  Sudah di outlet?
                </h2>

                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700'>
                  Scan QR
                </span>
              </div>

              <p className='mt-1 text-sm leading-5 text-slate-600'>
                Scan QR code di outlet untuk mulai membuat pesanan cuci
                kendaraanmu.
              </p>
            </div>
          </div>

          <Link to='/scan' className='block'>
            <Button className='h-12 w-full rounded-xl bg-[#4F8FEF] font-semibold text-white shadow-sm hover:bg-blue-600'>
              <Camera className='mr-2 h-5 w-5' />
              Scan QR Outlet
              <ArrowRight className='ml-auto h-4 w-4' />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}

export default ScanQrCard
