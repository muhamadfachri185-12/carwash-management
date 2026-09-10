import "dotenv/config"
import express from "express"
import authRoutes from "./routes/auth.routes"
import customerRoutes from "./routes/customer.routes"
import vehicleRoutes from "./routes/vehicle.routes"

const app = express()
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/vehicles", vehicleRoutes)

app.get("/", (_req, res) => {
  res.json({
    message: "CarWash Management API",
  })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})
