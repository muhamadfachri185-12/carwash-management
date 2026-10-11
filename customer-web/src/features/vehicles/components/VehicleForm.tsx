import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { CarFront, Hash, Tag } from "lucide-react"

import { vehicleSchema } from "../schemas/vehicleSchema"
import type { VehicleFormValues } from "../schemas/vehicleSchema"
import type { Vehicle } from "../types/vehicle"

type VehicleFormProps = {
  vehicle: Vehicle | null
  saving: boolean
  onSubmit: (data: VehicleFormValues) => Promise<void>
  onCancel: () => void
}

function VehicleForm({
  vehicle,
  saving,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plateNumber: "",
      brand: "",
      model: "",
    },
  })

  useEffect(() => {
    form.reset({
      plateNumber: vehicle?.plateNumber ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
    })
  }, [vehicle, form])

  const handleSubmit = async (data: VehicleFormValues) => {
    await onSubmit({
      plateNumber: data.plateNumber.trim().toUpperCase(),
      brand: data.brand.trim(),
      model: data.model.trim(),
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-5'>
      <FieldGroup>
        <Controller
          name='plateNumber'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='vehicle-plateNumber'>
                Nomor Polisi
              </FieldLabel>

              <div className='relative'>
                <Hash className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />

                <Input
                  {...field}
                  id='vehicle-plateNumber'
                  placeholder='Contoh: B 1234 ABC'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  className='h-12 rounded-xl pl-10 uppercase'
                />
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='brand'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='vehicle-brand'>Merek Kendaraan</FieldLabel>

              <div className='relative'>
                <CarFront className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />

                <Input
                  {...field}
                  id='vehicle-brand'
                  placeholder='Contoh: Honda'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  className='h-12 rounded-xl pl-10'
                />
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='model'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='vehicle-model'>Model Kendaraan</FieldLabel>

              <div className='relative'>
                <Tag className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />

                <Input
                  {...field}
                  id='vehicle-model'
                  placeholder='Contoh: Vario 160'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  className='h-12 rounded-xl pl-10'
                />
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className='flex gap-3 border-t border-slate-100 pt-4'>
        <Button
          type='button'
          variant='outline'
          className='h-11 flex-1 rounded-xl'
          disabled={saving}
          onClick={onCancel}
        >
          Batal
        </Button>

        <Button
          type='submit'
          className='h-11 flex-1 rounded-xl bg-[#4F8FEF] font-semibold text-white hover:bg-blue-600'
          disabled={saving}
        >
          {saving
            ? "Menyimpan..."
            : vehicle
              ? "Simpan Perubahan"
              : "Tambah Kendaraan"}
        </Button>
      </div>
    </form>
  )
}

export default VehicleForm
