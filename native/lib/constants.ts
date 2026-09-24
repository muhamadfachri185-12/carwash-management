export const API_BASE_URL = "http://192.168.1.100:3000/api"

export const ORDER_STATUS = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const

export const PAYMENT_STATUS = {
  PAID: "PAID",
  UNPAID: "UNPAID",
} as const

export const PAYMENT_METHODS = {
  CASH: "CASH",
  TRANSFER: "TRANSFER",
  QRIS: "QRIS",
} as const

export const COLORS = {
  primary: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  darkGray: "#374151",
} as const
