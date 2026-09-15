import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../schemas/vehicle.schema"
import { AuthRequest } from "../middleware/auth.middleware"

export const getVehicles = async (_req: AuthRequest, res: Response) => {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return res.status(200).json({
    vehicles,
  })
}

export const createVehicle = async (req: AuthRequest, res: Response) => {
  const result = createVehicleSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const { customerId, plateNumber, brand, model } = result.data

  const customer = await prisma.customer.findUnique({
    where: {
      id: Number(customerId),
    },
  })

  if (!customer) {
    return res.status(404).json({
      message: "Customer not found",
    })
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      customerId: Number(customerId),
      plateNumber,
      brand,
      model,
    },
  })

  return res.status(201).json({
    message: "Vehicle created succesfully",
    vehicle,
  })
}

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const result = updateVehicleSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!existingVehicle) {
    return res.status(404).json({
      message: "Vehicle not found",
    })
  }

  if (result.data.customerId) {
    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(result.data.customerId),
      },
    })

    if (!customer) {
      return res.status(400).json({
        message: "Customer not found",
      })
    }
  }

  const vehicle = await prisma.vehicle.update({
    where: {
      id: Number(id),
    },
    data: {
      ...result.data,
      customerId: result.data.customerId
        ? Number(result.data.customerId)
        : undefined,
    },
  })

  return res.status(200).json({
    message: "Vehicle succesfully updated",
    vehicle,
  })
}

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!existingVehicle) {
    return res.status(404).json({
      message: "Vehicle not found",
    })
  }

  await prisma.vehicle.delete({
    where: {
      id: Number(id),
    },
  })

  return res.status(200).json({
    message: "Vehicle deleted succesfully",
  })
}
