import { Router } from "express"
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.post("/", authenticate, createVehicle)
router.get("/", authenticate, getVehicles)
router.get("/:id", authenticate, getVehicleById)
router.patch("/:id", authenticate, updateVehicle)
router.delete("/:id", authenticate, deleteVehicle)

export default router
