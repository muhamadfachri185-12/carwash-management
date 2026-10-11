import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CarFront,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  SprayCan,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { getVehicles } from "@/features/vehicles/api/vehicleApi"
import { getServices } from "@/features/services/api/serviceApi"

import type { Vehicle } from "@/features/vehicles/types/vehicle"
import type { Service } from "@/features/services/types/service"

import { createCustomerOrder } from "@/features/orders/api/orderApi"

import type {
  OrderService,
  OrderVehicle,
} from "@/features/orders/types/order.types"

import VehicleSelector from "@/features/orders/components/VehicleSelector"
import ServiceSelector from "@/features/orders/components/ServiceSelector"
import OrderSummary from "@/features/orders/components/OrderSummary"

interface LocationState {
  outletQr?: string
}

interface NewVehicle {
  plateNumber: string
  brand: string
  model: string
}

const formatRupiah = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price)

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = location.state as LocationState | null
  const outletQr = locationState?.outletQr

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [selectedVehicleId, setSelectedVehicleId] = useState<number>()

  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false)

  const [newVehicle, setNewVehicle] = useState<NewVehicle>({
    plateNumber: "",
    brand: "",
    model: "",
  })

  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const [vehicleData, serviceData] = await Promise.all([
          getVehicles(),
          getServices(),
        ])

        setVehicles(vehicleData)
        setServices(serviceData.filter((service) => service.isActive))
      } catch (error) {
        console.error(error)
        setError("Gagal mengambil data kendaraan dan layanan.")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const handleNewVehicleChange = (field: keyof NewVehicle, value: string) => {
    setNewVehicle((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSelectVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setIsAddingNewVehicle(false)
    setError("")
  }

  const handleAddNewVehicle = () => {
    setSelectedVehicleId(undefined)
    setIsAddingNewVehicle(true)
    setError("")
  }

  const handleCancelNewVehicle = () => {
    setIsAddingNewVehicle(false)

    setNewVehicle({
      plateNumber: "",
      brand: "",
      model: "",
    })
  }

  const handleQuantityChange = (serviceId: number, quantity: number) => {
    setQuantities((current) => ({
      ...current,
      [serviceId]: quantity,
    }))

    setError("")
  }

  const selectedItems = useMemo(() => {
    return services
      .filter((service) => (quantities[service.id] ?? 0) > 0)
      .map((service) => ({
        service,
        quantity: quantities[service.id],
      }))
  }, [services, quantities])

  const selectedVehicle = useMemo(() => {
    return vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null
  }, [vehicles, selectedVehicleId])

  const orderVehicle: OrderVehicle | null = selectedVehicle
    ? {
        id: selectedVehicle.id,
        plateNumber: selectedVehicle.plateNumber,
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
      }
    : null

  const orderItems = selectedItems.map(({ service, quantity }) => {
    const orderService: OrderService = {
      id: service.id,
      name: service.name,
      duration: service.duration,
      price: service.price,
    }

    return {
      service: orderService,
      quantity,
    }
  })

  const totalItems = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const totalPrice = selectedItems.reduce(
    (total, item) => total + Number(item.service.price) * item.quantity,
    0,
  )

  const validateOrder = () => {
    if (!selectedVehicleId && !isAddingNewVehicle) {
      setError("Silakan pilih kendaraan terlebih dahulu.")
      return false
    }

    if (isAddingNewVehicle) {
      if (
        !newVehicle.plateNumber.trim() ||
        !newVehicle.brand.trim() ||
        !newVehicle.model.trim()
      ) {
        setError("Lengkapi nomor polisi, merek, dan model kendaraan.")
        return false
      }
    }

    if (selectedItems.length === 0) {
      setError("Pilih minimal satu layanan untuk melanjutkan.")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (submitting || !validateOrder()) {
      return
    }

    try {
      setSubmitting(true)
      setError("")

      const order = await createCustomerOrder({
        ...(selectedVehicleId
          ? {
              vehicleId: selectedVehicleId,
            }
          : {
              vehicle: {
                plateNumber: newVehicle.plateNumber.trim(),
                brand: newVehicle.brand.trim(),
                model: newVehicle.model.trim(),
              },
            }),

        items: selectedItems.map(({ service, quantity }) => ({
          serviceId: service.id,
          quantity,
        })),
      })

      navigate(`/orders/${order.id}`)
    } catch (error) {
      console.error(error)
      setError("Gagal membuat pesanan. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-[60vh] bg-[#F3F7FF] px-4 py-8'>
        <Card className='mx-auto max-w-md rounded-2xl border-0 shadow-sm'>
          <CardContent className='flex flex-col items-center gap-3 p-10'>
            <LoaderCircle className='h-8 w-8 animate-spin text-[#4F8FEF]' />

            <p className='text-sm text-slate-500'>
              Memuat data kendaraan dan layanan...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#F3F7FF] px-4 pb-28 pt-5'>
      <div className='mx-auto max-w-md space-y-6'>
        {/* Header */}
        <header className='flex items-center gap-3'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => navigate(-1)}
            disabled={submitting}
            aria-label='Kembali'
            className='h-11 w-11 shrink-0 rounded-xl bg-white text-slate-700 shadow-sm hover:bg-blue-50'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>

          <div className='min-w-0 flex-1'>
            <h1 className='text-xl font-bold tracking-tight text-slate-900'>
              Buat Pesanan
            </h1>

            <p className='mt-1 text-xs text-slate-500'>
              Pilih kendaraan dan layanan cuci mobil
            </p>
          </div>

          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#4F8FEF]'>
            <CarFront className='h-6 w-6' />
          </div>
        </header>

        {/* Progress */}
        <div className='rounded-2xl border border-blue-100 bg-white p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm font-semibold text-slate-800'>
              Detail pesanan
            </span>

            <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#3978D1]'>
              Langkah 1 dari 2
            </span>
          </div>

          <div className='h-1.5 overflow-hidden rounded-full bg-slate-100'>
            <div className='h-full w-1/2 rounded-full bg-[#4F8FEF]' />
          </div>

          <p className='mt-3 text-xs leading-5 text-slate-500'>
            Tentukan kendaraan dan layanan yang kamu inginkan sebelum mengirim
            pesanan.
          </p>
        </div>

        {/* Outlet QR */}
        {outletQr && (
          <div className='flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4F8FEF]'>
              <ShieldCheck className='h-5 w-5' />
            </div>

            <div className='min-w-0'>
              <p className='text-sm font-semibold text-slate-800'>
                QR outlet berhasil dipindai
              </p>

              <p className='mt-1 break-all text-xs leading-5 text-slate-500'>
                Pesanan dilanjutkan menggunakan QR yang sudah kamu pindai.
              </p>
            </div>

            <CheckCircle2 className='mt-1 h-5 w-5 shrink-0 text-emerald-500' />
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role='alert'
            className='flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4'
          >
            <CircleAlert className='mt-0.5 h-5 w-5 shrink-0 text-red-500' />

            <p className='text-sm leading-5 text-red-700'>{error}</p>
          </div>
        )}

        {/* Vehicle */}
        <section className='space-y-3'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-base font-bold text-slate-900'>
                Pilih Kendaraan
              </h2>

              <p className='mt-1 text-xs text-slate-500'>
                Kendaraan yang akan dicuci
              </p>
            </div>

            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#4F8FEF]'>
              <CarFront className='h-5 w-5' />
            </div>
          </div>

          <div className='rounded-2xl border border-blue-100 bg-white p-3 shadow-sm'>
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              isAddingNewVehicle={isAddingNewVehicle}
              newVehicle={newVehicle}
              onSelectVehicle={handleSelectVehicle}
              onAddNewVehicle={handleAddNewVehicle}
              onCancelNewVehicle={handleCancelNewVehicle}
              onNewVehicleChange={handleNewVehicleChange}
            />
          </div>
        </section>

        <Separator className='bg-blue-100' />

        {/* Services */}
        <section className='space-y-3'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-base font-bold text-slate-900'>
                Pilih Layanan
              </h2>

              <p className='mt-1 text-xs text-slate-500'>
                Pilih satu atau beberapa layanan
              </p>
            </div>

            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#4F8FEF]'>
              <SprayCan className='h-5 w-5' />
            </div>
          </div>

          {services.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-center'>
              <Sparkles className='mx-auto mb-2 h-7 w-7 text-slate-300' />

              <p className='text-sm font-semibold text-slate-700'>
                Belum ada layanan tersedia
              </p>

              <p className='mt-1 text-xs text-slate-500'>
                Silakan coba lagi nanti.
              </p>
            </div>
          ) : (
            <div className='rounded-2xl border border-blue-100 bg-white p-3 shadow-sm'>
              <ServiceSelector
                services={services}
                quantities={quantities}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          )}
        </section>

        <Separator className='bg-blue-100' />

        {/* Summary */}
        <section className='space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#4F8FEF]'>
              <CheckCircle2 className='h-5 w-5' />
            </div>

            <div>
              <h2 className='text-base font-bold text-slate-900'>
                Ringkasan Pesanan
              </h2>

              <p className='mt-1 text-xs text-slate-500'>
                Periksa kembali pilihanmu
              </p>
            </div>
          </div>

          <div className='rounded-2xl border border-blue-100 bg-white p-4 shadow-sm'>
            <OrderSummary
              vehicle={orderVehicle}
              newVehicle={isAddingNewVehicle ? newVehicle : null}
              items={orderItems}
            />

            <Separator className='my-4 bg-slate-100' />

            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs text-slate-500'>
                  {totalItems} item layanan
                </p>

                <p className='mt-1 text-sm font-semibold text-slate-800'>
                  Total estimasi
                </p>
              </div>

              <p className='text-lg font-bold text-[#3978D1]'>
                {formatRupiah(totalPrice)}
              </p>
            </div>

            <p className='mt-3 text-xs leading-5 text-slate-400'>
              Total dihitung dari harga layanan dan jumlah yang kamu pilih.
            </p>
          </div>
        </section>

        {/* Bottom action */}
        <div className='space-y-3'>
          <Button
            type='button'
            className='h-12 w-full rounded-xl bg-[#4F8FEF] text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-[#3978D1]'
            disabled={submitting || services.length === 0}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <LoaderCircle className='mr-2 h-4 w-4 animate-spin' />
                Membuat Pesanan...
              </>
            ) : (
              <>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Konfirmasi Pesanan
              </>
            )}
          </Button>

          <p className='text-center text-xs leading-5 text-slate-400'>
            Pastikan kendaraan dan layanan sudah sesuai sebelum melanjutkan.
          </p>
        </div>
      </div>
    </div>
  )
}
