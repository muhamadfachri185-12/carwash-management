import "dotenv/config"
import express from "express"
import { createServer } from "http"
import { Socket } from "socket.io"
import { iniSocket } from "./lib/socket"

import authRoutes from "./routes/auth.routes"
import customerAuthRoutes from "./routes/customerAuth.routes"
import customerRoutes from "./routes/customer.routes"
import vehicleRoutes from "./routes/vehicle.routes"
import serviceRoutes from "./routes/service.routes"
import orderRoutes from "./routes/order.routes"
import dashboardRoutes from "./routes/dashboard.routes"
import customerOrderRoutes from "./routes/customerOrder.routes"
import customerOutletRoutes from "./routes/customerOutlet.routes"
import midtransWebhookRoutes from "./routes/midtransWebhook.routes"

import cors from "cors"

const app = express()

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.18.65:5173",
      "http://localhost:5174",
    ],
  }),
)

app.use(express.json())

// ==========================================
// AUTH STAFF / ADMIN
// ==========================================

app.use("/api/auth", authRoutes)

// ==========================================
// AUTH CUSTOMER
// ==========================================

app.use("/api/customer/auth", customerAuthRoutes)
app.use("/api/customer/orders", customerOrderRoutes)
app.use("/api/customer/outlet", customerOutletRoutes)

// ==========================================
// OTHER ROUTES
// ==========================================

app.use("/api/customers", customerRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/payments/midtrans-webhook", midtransWebhookRoutes)

app.get("/", (_req, res) => {
  res.json({
    message: "CarWash Management API",
  })
})


const PORT = 3000

const httpServer = createServer(app)

const io = iniSocket(httpServer)

io.on("connection", (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on("join:customer", (userId: number) => {
    const roomName = `customer:${userId}`

    socket.join(roomName)

    console.log(`Socket ${socket.id} joined ${roomName}`)
  })

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})
