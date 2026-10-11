import type { OrderVehicle } from "@/features/orders/types/order.types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderVehicleInfoProps {
  vehicle: OrderVehicle
}

export default function OrderVehicleInfo({ vehicle }: OrderVehicleInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Kendaraan</CardTitle>
      </CardHeader>

      <CardContent>
        <div className='space-y-1'>
          <p className='font-semibold'>{vehicle.plateNumber}</p>

          <p className='text-sm text-muted-foreground'>
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
