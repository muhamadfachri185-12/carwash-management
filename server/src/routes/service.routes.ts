import { Router } from "express"
import {
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorizeRoles } from "../middleware/role.middleware"

const router = Router()

// Menghubungkan jalur endpoint API dengan fungsi controller dan middleware auth
router.get("/", authenticate, getService)
router.post("/", authenticate, authorizeRoles("ADMIN"), createService)
router.patch("/:id", authenticate, authorizeRoles("ADMIN"), updateService)
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteService)

export default router
