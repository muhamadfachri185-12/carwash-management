import { Card,CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {formatOrderPrice} from "@/features/orders/utils/order.utils"

import type {
    OrderService,
    OrderVehicle
} from "@/features/orders/types/order.types"

interface OrderSummaryItem {
    service: OrderService
    quantity: number
}

interface OrderSummaryProps {
    vehicle: OrderVehicle | null
    newVehicle?: {
        plateNumber: string,
        brand: string,
        model: string
    } | null
    items: OrderSummaryItem[]
}

export default function OrderSummary({
    vehicle, newVehicle, items
}: OrderSummaryProps) {
    const totalDuration = items.reduce(
      (total, item) => total + item.service.duration * item.quantity,
      0,
    )

    const subtotal = items.reduce(
      (total, item) => total + Number(item.service.price) * item.quantity,
      0,
    )

    const selectedVehicle = vehicle
      ? `${vehicle.plateNumber} - ${vehicle.brand} ${vehicle.model}`
      : newVehicle
        ? `${newVehicle.plateNumber} - ${newVehicle.brand} ${newVehicle.model}`
        : "Belum memilih kendaraan"

    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Ringkasan Pesanan</CardTitle>
        </CardHeader>

        <CardContent className='space-y-5'>
          {/* Kendaraan */}
          <div>
            <p className='text-sm text-muted-foreground'>Kendaraan</p>

            <p className='mt-1 font-medium'>{selectedVehicle}</p>
          </div>

          {/* Layanan */}
          <div>
            <p className='mb-3 text-sm text-muted-foreground'>Layanan</p>

            {items.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Belum ada layanan yang dipilih.
              </p>
            ) : (
              <div className='space-y-3'>
                {items.map((item) => (
                  <div
                    key={item.service.id}
                    className='flex items-start justify-between gap-4'
                  >
                    <div>
                      <p className='font-medium'>{item.service.name}</p>

                      <p className='text-sm text-muted-foreground'>
                        {item.quantity} × {formatOrderPrice(item.service.price)}
                      </p>
                    </div>

                    <p className='shrink-0 font-medium'>
                      {formatOrderPrice(
                        Number(item.service.price) * item.quantity,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className='space-y-3 border-t pt-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Durasi</span>

              <span className='text-sm font-medium'>{totalDuration} menit</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Subtotal</span>

              <span className='font-medium'>{formatOrderPrice(subtotal)}</span>
            </div>

            <div className='flex items-center justify-between border-t pt-3'>
              <span className='font-semibold'>Total</span>

              <span className='text-lg font-bold'>
                {formatOrderPrice(subtotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
}