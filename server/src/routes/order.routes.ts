import { Router } from "express"
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  recordPayment,
  updateOrder,
  deleteOrder
} from "../controllers/order.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.get("/", authenticate, getOrders)
router.post("/", authenticate, createOrder)
router.get("/:id", authenticate, getOrderById)
router.patch("/:id/status", authenticate, updateOrderStatus)
router.post("/:id/payment", authenticate, recordPayment)
router.patch("/:id", authenticate, updateOrder)
router.delete("/:id", authenticate, deleteOrder)

export default router
