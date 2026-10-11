import { Badge } from "@/components/ui/badge"

import type { OrderStatus } from "@/features/orders/types/order.types"

import {
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/features/orders/utils/order.utils"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant='outline' className={getOrderStatusClass(status)}>
      {getOrderStatusLabel(status)}
    </Badge>
  )
}
