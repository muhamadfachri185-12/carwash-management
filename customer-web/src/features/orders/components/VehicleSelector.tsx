import { Button } from "@/components/ui/button"

import type { OrderVehicle } from "../types/order.types"

import VehicleOption from "./VehicleOption"

import NewVehicleForm, { type NewVehicleFormData } from "./NewVehicleForm"

interface VehicleSelectorProps {
  vehicles: OrderVehicle[]
  selectedVehicleId?: number
  isAddingNewVehicle: boolean
  newVehicle: NewVehicleFormData

  onSelectVehicle: (vehicleId: number) => void
  onAddNewVehicle: () => void
  onCancelNewVehicle: () => void

  onNewVehicleChange: (field: keyof NewVehicleFormData, value: string) => void
}

export default function VehicleSelector({
  vehicles,
  selectedVehicleId,
  isAddingNewVehicle,
  newVehicle,
  onSelectVehicle,
  onAddNewVehicle,
  onCancelNewVehicle,
  onNewVehicleChange,
}: VehicleSelectorProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold'>Kendaraan</h2>

        <p className='text-sm text-muted-foreground'>
          Pilih kendaraan yang ingin dicuci
        </p>
      </div>

      {!isAddingNewVehicle && (
        <>
          {vehicles.length > 0 ? (
            <div className='space-y-3'>
              {vehicles.map((vehicle) => (
                <VehicleOption
                  key={vehicle.id}
                  vehicle={vehicle}
                  selected={selectedVehicleId === vehicle.id}
                  onSelect={onSelectVehicle}
                />
              ))}
            </div>
          ) : (
            <div className='rounded-lg border p-4 text-center'>
              <p className='text-sm text-muted-foreground'>
                Kamu belum memiliki kendaraan.
              </p>
            </div>
          )}

          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={onAddNewVehicle}
          >
            + Tambah Kendaraan Baru
          </Button>
        </>
      )}

      {isAddingNewVehicle && (
        <NewVehicleForm
          value={newVehicle}
          onChange={onNewVehicleChange}
          onCancel={onCancelNewVehicle}
        />
      )}
    </div>
  )
}
