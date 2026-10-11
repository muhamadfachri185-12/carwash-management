import { z } from "zod"

// Aturan untuk form login
export const loginSchema = z.object({
  // Email wajib diisi dan harus memiliki format email
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),

  // Password wajib diisi dan minimal 6 karakter
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
})
