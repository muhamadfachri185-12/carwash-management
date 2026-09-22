// Data customer
export interface Customer {
  id: number
  name: string
  phone: string
  address?: string
}

// Data kendaraan milik customer
export interface Vehicle {
  id: number
  customerId: number
  plateNumber: string
  brand: string
  model: string
}

// Data layanan cuci mobil
export interface Service {
  id: number
  name: string
  price: string
  duration: string
  isActive: boolean
}

// Detail layanan yang dipilih dalam sebuah order
export interface OrderItem {
  id: string

  // Data service yang dipilih
  service: Service

  // Jumlah layanan
  quantity: number

  // Harga saat order dibuat
  priceSnapshot: number

  // Durasi saat order dibuat
  durationSnapshot: number

  // Total harga item
  subtotal: number
}

// Data utama sebuah order
export interface Order {
  id: number
  orderCode: string

  // Status proses pencucian
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED"

  // Status pembayaran
  paymentStatus: "UNPAID" | "PAID"

  // Total harga setelah perhitungan
  total: number

  // Total harga sebelum perhitungan tambahan
  subtotal: number

  // Total durasi semua layanan
  totalDuration: number

  // Waktu customer melakukan check-in
  checkInTime: string

  // Waktu order selesai, bisa kosong
  completedAt: string | null

  // Data customer yang melakukan order
  customer: Customer

  // Kendaraan yang dicuci
  vehicle: Vehicle

  // Daftar layanan dalam order
  orderItems: OrderItem[]

  // Waktu order dibuat
  createdAt: string

  // Data pembayaran, bisa belum ada
  payment?: {
    id: number
    amount: number

    // Metode pembayaran yang tersedia
    method: "CASH" | "TRANSFER" | "QRIS"

    // Waktu pembayaran
    paidAt: string
  } | null
}
