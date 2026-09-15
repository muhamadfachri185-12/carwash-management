import { z } from "zod"

// Skema untuk memvalidasi data saat membuat layanan baru
export const createVehicleSchema = z.object({
  customerId: z.number().int().positive("Customer is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
})

// Membuat semua field bersifat opsional untuk keperluan update (PATCH)
export const updateVehicleSchema = createVehicleSchema.partial()
