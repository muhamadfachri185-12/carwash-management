import type {
  OrderStatus,
  PaymentStatus,
} from "@/features/orders/types/order.types"

export const formatOrderPrice = (price: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price))
}

export const formatOrderDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const getOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case "WAITING":
      return "Menunggu"

    case "IN_PROGRESS":
      return "Sedang Dicuci"

    case "COMPLETED":
      return "Selesai"

    case "CANCELLED":
      return "Dibatalkan"

    default:
      return status
  }
}

export const getOrderStatusClass = (status: OrderStatus) => {
  switch (status) {
    case "WAITING":
      return "bg-yellow-100 text-yellow-700"

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700"

    case "COMPLETED":
      return "bg-green-100 text-green-700"

    case "CANCELLED":
      return "bg-red-100 text-green-100"
  }
}

export const getPaymentStatusLabel = (status: PaymentStatus) => {
  return status === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"
}

export const getPaymentStatusClass = (status: PaymentStatus) => {
  return status === "PAID" ? "text-green-600" : "text-orange-600"
}
