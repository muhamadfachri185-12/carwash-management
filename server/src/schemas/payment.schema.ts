import { z } from "zod"

export const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["CASH", "TRANSFER", "QRIS"]),
})

export const paymentSchemaWithValitdation = paymentSchema.refine(
  (data) =>{
    // Transfer / QRIS / jumlah harus sama
    if (data.method !== "CASH") {
      // validation di controller
      return true
    }
    // CASH amount jarus >= total (perlu cek controller)
    return true
  }, {
    message: "Validasi akan dilakukan di controller"
  }
  
  
)
