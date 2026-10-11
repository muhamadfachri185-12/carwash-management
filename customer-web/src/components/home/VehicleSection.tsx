import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CarFront, ChevronRight, Plus } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { getVehicles } from "@/features/vehicles/api/vehicleApi"
import type { Vehicle } from "@/features/vehicles/types/vehicle"

function VehicleSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchVehicles = async () => {
      try {
        const data = await getVehicles()

        if (mounted) {
          setVehicles(data)
        }
      } catch (error) {
        console.error("Gagal mengambil kendaraan:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchVehicles()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='font-semibold text-slate-900'>Kendaraan Saya</h2>

        <Link
          to='/vehicles'
          className='flex items-center gap-1 text-sm font-medium text-[#397DDE]'
        >
          Kelola
          <ChevronRight className='h-4 w-4' />
        </Link>
      </div>

      {loading ? (
        <Card className='rounded-2xl border-0 shadow-sm'>
          <CardContent className='space-y-3 p-4'>
            <div className='h-5 w-36 animate-pulse rounded bg-slate-100' />
            <div className='h-4 w-24 animate-pulse rounded bg-slate-100' />
          </CardContent>
        </Card>
      ) : vehicles.length > 0 ? (
        <div className='space-y-2.5'>
          {vehicles.slice(0, 2).map((vehicle) => (
            <Link to='/vehicles' key={vehicle.id} className='block'>
              <Card className='rounded-2xl border-0 bg-white shadow-sm transition hover:bg-blue-50/50'>
                <CardContent className='flex items-center gap-3 p-3.5'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4F8FEF]'>
                    <CarFront className='h-6 w-6' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-semibold text-slate-900'>
                      {vehicle.brand} {vehicle.model}
                    </p>

                    <p className='mt-1 font-mono text-sm text-slate-500'>
                      {vehicle.plateNumber}
                    </p>
                  </div>

                  <ChevronRight className='h-5 w-5 shrink-0 text-slate-400' />
                </CardContent>
              </Card>
            </Link>
          ))}

          {vehicles.length > 2 && (
            <Link
              to='/vehicles'
              className='block text-center text-sm font-medium text-[#397DDE]'
            >
              Lihat {vehicles.length - 2} kendaraan lainnya
            </Link>
          )}
        </div>
      ) : (
        <Card className='rounded-2xl border-0 bg-white shadow-sm'>
          <CardContent className='flex flex-col items-center p-5 text-center'>
            <div className='flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#4F8FEF]'>
              <CarFront className='h-5 w-5' />
            </div>

            <p className='mt-3 font-medium text-slate-900'>
              Belum ada kendaraan
            </p>

            <p className='mt-1 text-sm text-slate-500'>
              Tambahkan kendaraan agar lebih mudah membuat order.
            </p>

            <Link to='/vehicles' className='mt-3 block w-full'>
              <Button
                variant='outline'
                className='w-full rounded-xl border-blue-100 text-[#397DDE] hover:bg-blue-50'
              >
                <Plus className='mr-2 h-4 w-4' />
                Kelola Kendaraan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default VehicleSection
