import type {OrderService} from "@/features/orders/types/order.types"

import ServiceOption from "./ServiceOption"

interface ServiceSelectorProps {
    services: OrderService[]
    quantities: Record<number, number>
    onQuantityChange: (
        serviceId: number,
        quantity: number
    ) => void
}

export default function ServiceSelector({
    services, quantities, onQuantityChange
}: ServiceSelectorProps) {
    return (
      <div className='space-y-4'>
        <div>
          <h2 className='text-lg font-semibold'>Layanan</h2>

          <p className='text-sm text-muted-foreground'>
            Pilih layanan yang ingin kamu gunakan
          </p>
        </div>

        {services.length === 0 ? (
          <div className='rounded-lg border p-4 text-center'>
            <p className='text-sm text-muted-foreground'>
              Belum ada layanan yang tersedia.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {services.map((service) => (
              <ServiceOption
                key={service.id}
                service={service}
                quantity={quantities[service.id] ?? 0}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>
        )}
      </div>
    )
}