import { Card, CardContent } from "@/components/ui/card"

import type { OrderService } from "../types/order.types"

import { formatOrderPrice } from "../utils/order.utils"

interface ServiceOptionProps {
  service: OrderService
  quantity: number
  onQuantityChange: (serviceId: number, quantity: number) => void
}

export default function ServiceOption({
  service,
  quantity,
  onQuantityChange,
}: ServiceOptionProps) {
  const isSelected = quantity > 0

  const decreaseQuantity = () => {
    onQuantityChange(service.id, Math.max(0, quantity - 1))
  }

  const increaseQuantity = () => {
    onQuantityChange(service.id, quantity + 1)
  }

  return (
    <Card
      className={`transition ${
        isSelected ? "border-primary ring-1 ring-primary" : ""
      }`}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h3 className='font-semibold'>{service.name}</h3>

            <p className='mt-1 text-sm text-muted-foreground'>
              {service.duration} menit
            </p>

            <p className='mt-2 font-medium'>
              {formatOrderPrice(service.price)}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-3'>
            <button
              type='button'
              className='flex h-8 w-8 items-center justify-center rounded-md border text-lg'
              onClick={decreaseQuantity}
              disabled={quantity === 0}
            >
              −
            </button>

            <span className='w-5 text-center text-sm font-medium'>
              {quantity}
            </span>

            <button
              type='button'
              className='flex h-8 w-8 items-center justify-center rounded-md border text-lg'
              onClick={increaseQuantity}
            >
              +
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
