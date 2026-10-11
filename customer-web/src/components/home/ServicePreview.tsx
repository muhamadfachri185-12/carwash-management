import { Link } from "react-router-dom"
import { ArrowRight, Droplets, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function ServicePreview() {
  return (
    <section className='space-y-3'>
      <div>
        <h2 className='font-semibold text-slate-900'>Layanan Cuci</h2>

        <p className='mt-1 text-sm text-slate-500'>
          Pilih layanan sesuai kebutuhan kendaraanmu.
        </p>
      </div>

      <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-sm'>
        <CardContent className='space-y-4 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4F8FEF]'>
              <Droplets className='h-5 w-5' />
            </div>

            <div className='min-w-0 flex-1'>
              <h3 className='font-semibold text-slate-900'>
                Temukan layanan yang cocok
              </h3>

              <p className='mt-1 text-sm leading-5 text-slate-500'>
                Lihat daftar layanan, harga, dan durasi yang tersedia.
              </p>
            </div>

            <Sparkles className='h-5 w-5 shrink-0 text-[#4F8FEF]' />
          </div>

          <Link to='/services' className='block'>
            <Button
              variant='outline'
              className='h-11 w-full rounded-xl border-blue-100 text-[#397DDE] hover:bg-blue-50'
            >
              Lihat Semua Layanan
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}

export default ServicePreview
