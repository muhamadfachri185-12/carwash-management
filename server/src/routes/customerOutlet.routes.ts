import {Router} from "express"

import { verifyCustomerOutlet } from "../controllers/customerOutlet.controller"

import { authenticate, authorizeRole } from "../middleware/auth.middleware"

const router = Router()

router.post(
    "/verify",
    authenticate,
    authorizeRole("CUSTOMER"),
    verifyCustomerOutlet
)

export default router
