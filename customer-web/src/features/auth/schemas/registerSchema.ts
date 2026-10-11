import { z } from "zod"

// Aturan untuk form register
export const registerSchema = z
  .object({
    // Nama minimal 2 karakter
    name: z
      .string()
      .min(1, "Nama wajib diisi")
      .min(2, "Nama minimal 2 karakter"),

    // Email harus valid
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),

    // Password minimal 6 karakter
    password: z
      .string()
      .min(1, "Password wajib diisi")
      .min(6, "Password minimal 6 karakter"),

    // Konfirmasi password wajib diisi
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })

  // Membandingkan password dan confirmPassword
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  })
