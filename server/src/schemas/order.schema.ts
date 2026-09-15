

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
