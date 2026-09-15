import { Request, Response } from "express"
import { prisma } from "../lib/prisma"

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const [waiting, inProgress, completed, unpaid] = await Promise.all([
      prisma.order.count({
        where: { status: "WAITING" },
      }),
      prisma.order.count({
        where: { status: "IN_PROGRESS" },
      }),
      prisma.order.count({
        where: { status: "COMPLETED" },
      }),
      prisma.order.count({
        where: { paymentStatus: "UNPAID" },
      }),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(today)

    // perhitungan mendapatkan week
    const dayOfWeek = startOfWeek.getDay()
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    // perhitungan mendapatkan month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    // perhitungan mendapatkan year
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    startOfYear.setHours(0, 0, 0, 0)

    const [revenueToday, revenueWeek, revenueMonth, revenueYear] =
      await Promise.all([
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            checkInTime: { gte: today },
          },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            checkInTime: { gte: startOfWeek },
          },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            checkInTime: { gte: startOfMonth },
          },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            checkInTime: { gte: startOfYear },
          },
          _sum: { total: true },
        }),
      ])

    // ==========================
    // ORDER STATUS REPORT BY DATE
    // ==========================

    const orderStatusReport = await prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1,
          ),
        },
      },
      _count: { id: true },
    })

    const reportData = {
      WAITING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    }
    orderStatusReport.forEach((item) => {
      if (item.status in reportData) {
        reportData[item.status as keyof typeof reportData] = item._count.id
      }
    })

    // ==========================
    // RECENT ORDERS
    // ==========================
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { plateNumber: true, brand: true, model: true } },
      },
    })

    res.status(200).json({
      data: {
        waiting,
        inProgress,
        completed,
        unpaid,
        // Revenue Summary
        revenueToday: Number(revenueToday._sum.total || 0),
        revenueWeek: Number(revenueWeek._sum.total || 0),
        revenueMonth: Number(revenueMonth._sum.total || 0),
        revenueYear: Number(revenueYear._sum.total || 0),
        // Order Status Report by Today's Date
        orderStatusReport: reportData,
        // Recent Orders
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderCode: order.orderCode,
          customerName: order.customer.name,
          vehiclePlate: order.vehicle.plateNumber,
          vehicleBrand: order.vehicle.brand,
          vehicleModel: order.vehicle.model,
          total: Number(order.total),
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to get dashboard" })
  }
}
