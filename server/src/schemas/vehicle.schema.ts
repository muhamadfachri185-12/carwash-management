import {z} from "zod"

export const createVehicleSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    plateNumber: z.string().min(1, "Plate number is required"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required")
})

export const updateVehicleSchema = createVehicleSchema.partial()