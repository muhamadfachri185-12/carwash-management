import { Response } from "express"

import { getIO } from "../lib/socket"

import { prisma } from "../lib/prisma"

import { AuthRequest } from "../middleware/auth.middleware"

import { createCustomerOrderSchema } from "../schemas/order.schema"

import { randomUUID } from "crypto"

// ======================================================
// CUSTOMER CREATE ORDER
// ======================================================
//
// POST /api/customer/orders
//
// Customer tidak mengirim customerId.
//
// Customer diambil berdasarkan:
// req.user.userId
//
// Kalau Customer belum punya Customer record:
// → buat Customer
// → buat Vehicle
// → buat Order
//
// Kalau Customer sudah punya Customer record:
// → gunakan Customer tersebut
// → gunakan Vehicle yang dipilih
// → buat Order
//

export const createCustomerOrder = async (req: AuthRequest, res: Response) => {
  // ==================================================
  // 1. CEK AUTHENTICATION
  // ==================================================
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    // ==================================================
    // 2. CEK ROLE
    // ==================================================
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        message: "Customer access required",
      })
    }

    // ==================================================
    // 3. VALIDASI REQUEST
    // ==================================================
    const result = createCustomerOrderSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      })
    }

    const { vehicleId, vehicle, items } = result.data

    // ==================================================
    // 4. CARI CUSTOMER BERDASARKAN USER LOGIN
    // ==================================================
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        userId: req.user.userId,
      },
    })

    // ==================================================
    // 5. CEK SERVICE
    // ==================================================
    const serviceIds = items.map((item) => item.serviceId)
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        isActive: true,
      },
    })
    // Pastikan semua service yang dikirim
    // memang tersedia dan aktif.
    if (services.length !== serviceIds.length) {
      return res.status(400).json({
        message: "One or more services are invalid or inactive",
      })
    }
    // ==================================================
    // 6. HITUNG TOTAL
    // ==================================================
    let totalDuration = 0
    let subtotal = 0

    const orderItems = items.map((item) => {
      const service = services.find((service) => service.id === item.serviceId)

      if (!service) {
        throw new Error("Service not found")
      }

      const price = Number(service.price)
      const itemSubtotal = price * item.quantity
      const itemDuration = service.duration * item.quantity

      subtotal += itemSubtotal
      totalDuration += itemDuration

      return {
        serviceId: service.id,
        quantity: item.quantity,
        priceSnapshot: service.price,
        durationSnapshot: service.duration,
        subtotal: itemSubtotal,
      }
    })

    // ==================================================
    // 7. TRANSACTION
    // ==================================================

    const order = await prisma.$transaction(async (tx) => {
      let customer = existingCustomer

      // ==================================================
      // CUSTOMER BARU
      // ==================================================

      if (!customer) {
        // Customer baru dibuat berdasarkan
        // data User yang sedang login.

        const user = await tx.user.findUnique({
          where: {
            id: req.user!.userId,
          },
          select: {
            name: true,
          },
        })

        if (!user) {
          throw new Error("User not found")
        }

        customer = await tx.customer.create({
          data: {
            userId: req.user!.userId,
            name: user.name,
            phone: "",
          },
        })
      }

      // ==================================================
      // 8. TENTUKAN VEHICLE
      // ==================================================

      let selectedVehicleId: number

      // --------------------------------------------------
      // VEHICLE LAMA
      // --------------------------------------------------

      if (vehicleId) {
        const existingVehicle = await tx.vehicle.findFirst({
          where: {
            id: vehicleId,
            customerId: customer.id,
          },
        })

        if (!existingVehicle) {
          throw new Error("Vehicle does not belong to this customer")
        }

        selectedVehicleId = existingVehicle.id
      }

      // --------------------------------------------------
      // VEHICLE BARU
      // --------------------------------------------------
      else {
        if (!vehicle) {
          throw new Error("Vehicle data is required")
        }

        const newVehicle = await tx.vehicle.create({
          data: {
            customerId: customer.id,
            plateNumber: vehicle.plateNumber,
            brand: vehicle.brand,
            model: vehicle.model,
          },
        })

        selectedVehicleId = newVehicle.id
      }

      // ==================================================
      // 9. BUAT ORDER
      // ==================================================

      const orderCode = `ORD-${Date.now()}-${randomUUID()
        .slice(0, 8)
        .toUpperCase()}`

      const newOrder = await tx.order.create({
        data: {
          orderCode,

          customerId: customer.id,

          vehicleId: selectedVehicleId,

          createdById: req.user!.userId,

          status: "WAITING",

          paymentStatus: "UNPAID",

          totalDuration,

          subtotal,

          total: subtotal,

          orderItems: {
            create: orderItems,
          },
        },

        include: {
          customer: true,

          vehicle: true,

          orderItems: {
            include: {
              service: true,
            },
          },
        },
      })

      return newOrder
    })

    // ==================================================
    // 10. REALTIME ORDER CREATED
    // ==================================================
    const io = getIO()

    console.log("🔥 EMIT order:created:", order.id)
    io.emit("order:created", {
      orderId: order.id,
    })
    // ==================================================
    // 11. RESPONSE
    // ==================================================

    return res.status(201).json({
      message: "Order created successfully",
      order,
    })
  } catch (error) {
    console.error("createCustomerOrder error:", error)

    return res.status(500).json({
      message: "Failed to create order",
    })
  }
}

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        message: "Customer access required",
      })
    }

    const customer = await prisma.customer.findUnique({
      where: {
        userId: req.user.userId,
      },
    })

    // Customer belum pernah membuat order
    if (!customer) {
      return res.status(200).json({
        orders: [],
      })
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id,
      },
      include: {
        vehicle: true,
        orderItems: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return res.status(200).json({
      orders,
    })
  } catch (error) {
    console.error("getCustomerOrders error:", error)

    return res.status(500).json({
      message: "Failed to get customer orders",
    })
  }
}

export const getCustomerOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        message: "Customer access required",
      })
    }

    const orderId = Number(req.params.id)

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      })
    }

    const customer = await prisma.customer.findUnique({
      where: {
        userId: req.user.userId,
      },
    })

    if (!customer) {
      return res.status(404).json({
        message: "Customer profile not found",
      })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: customer.id,
      },
      include: {
        vehicle: true,
        orderItems: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    return res.status(200).json({
      order,
    })
  } catch (error) {
    console.error("getCustomerOrdersById error:", error)

    return res.status(500).json({
      message: "Failed to get customer order by id",
    })
  }
}
