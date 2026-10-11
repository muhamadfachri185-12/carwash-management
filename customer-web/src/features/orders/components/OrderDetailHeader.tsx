import { Card, CardContent } from "@/components/ui/card"
import type { CustomerOrder } from "../types/order.types"

import { formatOrderDate } from "@/features/orders/utils/order.utils"

import OrderStatusBadge from "./OrderStatusBadge"

interface OrderDetailHeaderProps {
  order: CustomerOrder
}

export default function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  return (
    <Card>
      <CardContent className='space-y-3 pt-6'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-lg font-semibold'>{order.orderCode}</p>

            <p className='text-sm text-muted-foreground'>
              {formatOrderDate(order.createdAt)}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <div className='text-sm text-muted-foreground'>
          Check-in: {formatOrderDate(order.checkInTime)}
        </div>
      </CardContent>
    </Card>
  )
}
