import "dotenv/config"
import express from "express"
import authRoutes from "./routes/auth.routes"
import customerRoutes from "./routes/customer.routes"
import vehicleRoutes from "./routes/vehicle.routes"
import serviceRoutes from "./routes/service.routes"
import orderRoutes from "./routes/order.routes"
import dashboardRoutes from "./routes/dashboard.routes"
import cors from "cors"

const app = express()

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
)

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/", (_req, res) => {
  res.json({
    message: "CarWash Management API",
  })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})
