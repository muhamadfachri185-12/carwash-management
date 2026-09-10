import { Router } from "express"
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from "../controllers/vehicle.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.post("/", authenticate, createVehicle)
router.get("/", authenticate, getVehicles)
router.patch("/:id", authenticate, updateVehicle)
router.delete("/:id", authenticate, deleteVehicle)

export default router
