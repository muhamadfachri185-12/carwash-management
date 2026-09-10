import {z} from "zod";

export const createCustomerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().optional()

})

export const updateCustomerSchema = createCustomerSchema.partial()
