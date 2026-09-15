import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  duration: z.number().min(1, "Duration is required"),
  price: z.number().min(0, "Price must be a positive number"),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
})
