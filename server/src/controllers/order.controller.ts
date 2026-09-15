import { randomUUID } from "node:crypto"
import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema"
import { paymentSchema } from "../schemas/payment.schema"
import { AuthRequest } from "../middleware/auth.middleware"

const orderInclude = {
  customer: true,
  vehicle: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  orderItems: {
    include: {
      service: true,
    },
  },
  payment: true,
} as const

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ...orderInclude,
      },
    })

    res.status(200).json({
      data: orders,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to get orders",
    })
  }
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  const validation = createOrderSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: validation.error.flatten(),
    })
  }

  const { customerId, vehicleId, items } = validation.data

  try {
    const [customer, vehicle, services] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      prisma.service.findMany({
        where: {
          id: { in: items.map((item) => item.serviceId) },
          isActive: true,
        },
      }),
    ])

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    if (!vehicle || vehicle.customerId !== customerId) {
      return res.status(400).json({
        message: "Vehicle does not belong to the selected customer",
      })
    }

    if (services.length !== items.length) {
      return res.status(400).json({
        message: "One or more selected services are unavailable",
      })
    }

    const servicesById = new Map(
      services.map((service) => [service.id, service]),
    )
    const orderItems = items.map((item) => {
      const service = servicesById.get(item.serviceId)!
      const price = Number(service.price)

      return {
        serviceId: service.id,
        quantity: item.quantity,
        priceSnapshot: price,
        durationSnapshot: service.duration,
        subtotal: price * item.quantity,
      }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalDuration = orderItems.reduce(
      (sum, item) => sum + item.durationSnapshot * item.quantity,
      0,
    )

    const order = await prisma.order.create({
      data: {
        orderCode: `ORD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        customerId,
        vehicleId,
        createdById: req.user!.userId,
        totalDuration,
        subtotal,
        total: subtotal,
        orderItems: {
          create: orderItems,
        },
      },
      include: orderInclude,
    })

    return res.status(201).json({
      message: "Order created successfully",
      data: order,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Failed to create order",
    })
  }
}

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        ...orderInclude,
      },
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    res.status(200).json({
      data: order,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to get order",
    })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const validation = updateOrderStatusSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid status",
        errors: validation.error.flatten(),
      })
    }

    const { status } = validation.data

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    const validTransition =
      (order.status === "WAITING" && status === "IN_PROGRESS") ||
      (order.status === "IN_PROGRESS" && status === "COMPLETED")

    if (!validTransition) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      })
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      },
    })

    return res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Failed to update order status",
    })
  }
}

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const validation = paymentSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      })
    }

    const { amount, method } = validation.data

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { payment: true },
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Order already paid" })
    }

    // VALIDASI BERDASARKAN METODE
    const orderAmount = Number(amount)
    const orderTotal = Number(order.total)

    if (method === "CASH") {
      // CASH: amount harus >= total
      if (orderAmount < orderTotal) {
        return res.status(400).json({
          message: `Uang pembayaran kurang. Total: Rp${orderTotal.toLocaleString("id-ID")}, Diterima: Rp${orderAmount.toLocaleString("id-ID")}`,
        })
      }
    } else {
      // TRANSFER/QRIS: amount harus sama dengan total
      if (orderAmount !== orderTotal) {
        return res.status(400).json({
          message: `Untuk ${method}, amount harus sama dengan order total (Rp${orderTotal})`,
        })
      }
    }

    // Simpan payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: orderAmount,
        method: method as "CASH" | "TRANSFER" | "QRIS",
        receivedById: req.user!.userId,
      },
    })

    // Update status mejadi PAID
    await prisma.order.update({
      where: { id: Number(id) },
      data: { paymentStatus: "PAID" },
    })

    const change = method === "CASH" ? orderAmount - orderTotal : 0

    return res.status(200).json({
      message: "Payment recorded successfully",
      data: {
        payment,
        order,
        change,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Failed to record payment",
    })
  }
}

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const validation = createOrderSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      })
    }

    const { customerId, vehicleId, items } = validation.data

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "WAITING") {
      return res.status(400).json({
        message: "Only WAITING orders can be edited",
      })
    }

    const [customer, vehicle, services] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      prisma.service.findMany({
        where: {
          id: { in: items.map((item) => item.serviceId) },
          isActive: true,
        },
      }),
    ])

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    if (!vehicle || vehicle.customerId !== customerId) {
      return res.status(400).json({
        message: "Vehicle does not belong to the selected customer",
      })
    }

    if (services.length !== items.length) {
      return res.status(400).json({
        message: "One or more selected services are unavailable",
      })
    }

    const servicesById = new Map(
      services.map((service) => [service.id, service]),
    )
    const orderItems = items.map((item) => {
      const service = servicesById.get(item.serviceId)!
      const price = Number(service.price)

      return {
        serviceId: service.id,
        quantity: item.quantity,
        priceSnapshot: price,
        durationSnapshot: service.duration,
        subtotal: price * item.quantity,
      }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalDuration = orderItems.reduce(
      (sum, item) => sum + item.durationSnapshot * item.quantity,
      0,
    )

    await prisma.orderItem.deleteMany({
      where: { orderId: Number(id) },
    })

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        customerId,
        vehicleId,
        totalDuration,
        subtotal,
        total: subtotal,
        orderItems: {
          create: orderItems,
        },
      },
      include: orderInclude,
    })

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Failed to update order",
    })
  }
}

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "WAITING") {
      return res.status(400).json({
        message: "Only WAITING orders can be deleted",
      })
    }

    await prisma.order.delete({
      where: { id: Number(id) },
    })

    return res.status(200).json({
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Failed to delete order",
    })
  }
}
