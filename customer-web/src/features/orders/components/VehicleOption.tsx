import {Card, CardContent} from "@/components/ui/card"

import type { OrderVehicle } from "@/features/orders/types/order.types"

interface VehicleOptionProps {
    vehicle: OrderVehicle
    selected: boolean
    onSelect: (vehicleId: number) => void
}

export default function VehicleOption({ vehicle, selected, onSelect }: VehicleOptionProps) {
    return (
      <Card
        className={`cursor-pointer transition ${
          selected
            ? "border-primary ring-1 ring-primary"
            : "hover:border-primary/50"
        }`}
        onClick={() => onSelect(vehicle.id)}
      >
        <CardContent className='flex items-center justify-between p-4'>
          <div>
            <p className='font-semibold'>{vehicle.plateNumber}</p>

            <p className='text-sm text-muted-foreground'>
              {vehicle.brand} {vehicle.model}
            </p>
          </div>

          {selected && (
            <span className='text-sm font-medium text-primary'>Dipilih</span>
          )}
        </CardContent>
      </Card>
    )
}