import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["ADMIN", "STAFF"]),
})
