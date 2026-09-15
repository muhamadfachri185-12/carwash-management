import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import {
  createServiceSchema,
  updateServiceSchema,
} from "../schemas/service.schema"
import { AuthRequest } from "../middleware/auth.middleware"

export const getService = async (_req: AuthRequest, res: Response) => {
  const services = await prisma.service.findMany({
    orderBy: {
      createdAt: "desc",
    }, // Diurutkan dari data terbaru
  })
  return res.status(200).json({
    services,
  })
}

export const createService = async (req: AuthRequest, res: Response) => {
  const result = createServiceSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "validation error",
      errors: result.error.flatten(),
    })
  }

  const { name, duration, price } = result.data

  const service = await prisma.service.create({
    data: {
      name,
      duration,
      price,
    },
  })

  return res.status(201).json({
    message: "Service created successfully",
    service,
  })
}

export const updateService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const result = updateServiceSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const existingService = await prisma.service.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!existingService) {
    return res.status(404).json({
      message: "Vehicle not found",
    })
  }

  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: result.data,
  })

  return res.status(200).json({
    message: "Service updated successfully",
    service,
  })
}

// 4. Menghapus layanan berdasarkan ID
export const deleteService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const serviceId = Number(id)

  // Pastikan data layanannya ada sebelum dihapus
  const existingService = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  // Cek apakah service itu sudah terdapat pada order
  const existingOrderItem = await prisma.orderItem.findFirst({
    where: {
      serviceId: serviceId,
    },
  })

  if (existingOrderItem) {
    return res.status(400).json({
      message: "Service tidak dapat dihapus karena ada di order",
    })
  }

  if (!existingService) {
    return res.status(404).json({ message: "Service not found" })
  }

  await prisma.service.delete({
    where: { id: Number(id) },
  })

  return res.status(200).json({ message: "Service deleted successfully" })
}
