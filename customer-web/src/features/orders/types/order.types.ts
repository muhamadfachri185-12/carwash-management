export type OrderStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type PaymentStatus = "UNPAID" | "PAID"

export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS"

export interface OrderVehicle {
  id: number
  plateNumber: string
  brand: string
  model: string
}

export interface OrderService {
  id: number
  name: string
  duration: number
  price: number | string
}

export interface OrderItem {
  id: number
  quantity: number
  priceSnapshot: number | string
  durationSnapshot: number
  subtotal: number | string
  service: OrderService
}

export interface OrderPayment {
  id: number
  amount: number | string
  method: PaymentMethod
  paidAt: string
}

export interface CustomerOrder {
  id: number
  orderCode: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalDuration: number
  subtotal: number | string
  total: number | string
  checkInTime: string
  completedAt: string | null
  createdAt: string
  vehicle: OrderVehicle
  orderItems: OrderItem[]
  payment: OrderPayment | null
}
