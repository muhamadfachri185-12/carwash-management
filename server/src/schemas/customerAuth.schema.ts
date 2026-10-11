import {z} from 'zod'

// Schema untuk register Customer
export const customerRegisterSchema = z.object({
    name: z.string().min(1, "Name is required").min(2, 'Name must be at least 2 characters'),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

// Schema untuk login Customer
//
// Tidak perlu role karena Customer Web
// memang otomatis login sebagai CUSTOMER.

export const customerLoginSchema = z.object({
    email: z.string().email("Invalid Email"),
    password: z.string().min(1, "Password is required")
})