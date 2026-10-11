import { z } from "zod"

const orderItemSchema = z.object({
  serviceId: z.coerce.number().int().positive("Service is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
})

export const createOrderSchema = z
  .object({
    customerId: z.coerce.number().int().positive("Customer is required"),
    vehicleId: z.coerce.number().int().positive("Vehicle is required"),
    items: z.array(orderItemSchema).min(1, "Select at least one service"),
  })
  .superRefine((value, context) => {
    const serviceIds = value.items.map((item) => item.serviceId)

    if (new Set(serviceIds).size !== serviceIds.length) {
      context.addIssue({
        code: "custom",
        message: "Each service can only be added once",
        path: ["items"],
      })
    }
  })

export const updateOrderStatusSchema = z.object({
  status: z.enum(["WAITING", "IN_PROGRESS", "COMPLETED"]),
})


export const createCustomerOrderSchema = z
  .object({
    vehicle: z
      .object({
        plateNumber: z.string().trim().min(1, "Plat nomor wajib diisi"),
        brand: z.string().trim().min(1, "Merek kendaraan wajib diisi"),
        model: z.string().trim().min(1, "Pilih minimal satu layanan"),
      })
      .optional(),
    vehicleId: z.coerce.number().int().positive().optional(),
    items: z.array(orderItemSchema).min(1, "Pilih minimal satu layanan"),
  })
  .superRefine((value, context) => {
    // Customer harus memilih kendaraan yang sudah terdaftar
    // atau mengisi data kendaraan baru.
    if (!value.vehicleId && !value.vehicle) {
      context.addIssue({
        code: "custom",
        message: "Pilih atau tambahkan kendaraan",
        path: ["vehicleId"],
      })
    }

    // Tidak boleh mengirim keduanya sekaligus.
    if(value.vehicleId && value.vehicle){
      context.addIssue({
        code: "custom",
        message: "Choose either existing vehicle or new vehicle",
        path: ["vehicleId"]
      })
    }

    // Customer tidak perlu mengirim customerId.
    // Identitas Customer ditentukan dari akun yang login.
    const serviceIds = value.items.map((item) => item.serviceId)

    if (new Set(serviceIds).size !== serviceIds.length) {
      context.addIssue({
        code: "custom",
        message: "Setiap layanan hanya boleh dipilih sekali",
        path: ["items"],
      })
    }
  })

