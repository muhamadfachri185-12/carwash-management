import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schemas/customer.schema"
import { AuthRequest } from "../middleware/auth.middleware"

export const getCustomers = async (_req: AuthRequest, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return res.status(200).json({
    customers,
  })
}

export const createCustomer = async (req: AuthRequest, res: Response) => {
  const result = createCustomerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const { name, phone, address } = result.data

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      address,
    },
  })

  return res.status(200).json({
    message: "Customer created succesfully",
    customer,
  })
}

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const result = updateCustomerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!existingCustomer) {
    return res.status(404).json({
      message: "Customer not found",
    })
  }

  const customer = await prisma.customer.update({
    where: {
      id: Number(id),
    },
    data: result.data,
  })

  return res.status(200).json({
    message: "Customer succesfully updated",
    customer,
  })
}

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const customerId = Number(id)

  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  })

  // Cek apakah customer memiliki order
  const existingOrder = await prisma.order.findFirst({
    where: {
      customerId: customerId,
    },
  })

  if (existingOrder) {
    return res.status(400).json({
      message: "Customer tidak dapat dihapus karena memilik order",
    })
  }

  if (!existingCustomer) {
    return res.status(404).json({
      message: "Customer not found",
    })
  }
  await prisma.customer.delete({
    where: {
      id: customerId,
    },
  })

  return res.status(200).json({
    message: "Customer deleted succesfully",
  })
}
