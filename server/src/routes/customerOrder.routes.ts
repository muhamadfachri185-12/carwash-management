import { Router } from "express"
import { createSnapTransaction } from "../controllers/midtrans.controller"

import {
  createCustomerOrder,
  getCustomerOrders,
  getCustomerOrderById,
} from "../controllers/customerOrder.controller"

import {
  authenticate,
  authorizeRole,
  requireOutletAccess,
} from "../middleware/auth.middleware"

const router = Router()

router.post(
  "/",
  authenticate,
  authorizeRole("CUSTOMER"),
  requireOutletAccess,
  createCustomerOrder,
)

router.post(
  "/:orderId/pay",
  authenticate,
  authorizeRole("CUSTOMER"),
  createSnapTransaction
)

router.get("/", authenticate, authorizeRole("CUSTOMER"), getCustomerOrders)

router.get(
  "/:id",
  authenticate,
  authorizeRole("CUSTOMER"),
  getCustomerOrderById,
)

export default router
