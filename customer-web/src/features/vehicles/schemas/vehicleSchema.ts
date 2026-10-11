import { z } from "zod"

export const vehicleSchema = z.object({
    plateNumber: z.string().trim().min(1, "Nomor polisi wajib diisi"),

    brand: z.string().trim().min(1, "Merek kendaraan wajib diisi"),

    model: z.string().trim().min(1, "Model kendaraan wajib diisi")
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>