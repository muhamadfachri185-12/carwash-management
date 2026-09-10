import { Router } from "express"
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.post("/", authenticate, createCustomer)
router.get("/", authenticate, getCustomers)
router.patch("/:id", authenticate, updateCustomer)
router.delete("/:id", authenticate, deleteCustomer)

export default router
