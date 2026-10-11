import { Router } from "express"
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../controllers/customer.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.post("/", authenticate, createCustomer)
router.get("/", authenticate, getCustomers)
router.get("/:id", authenticate, getCustomerById)
router.patch("/:id", authenticate, updateCustomer)
router.delete("/:id", authenticate, deleteCustomer)

export default router
