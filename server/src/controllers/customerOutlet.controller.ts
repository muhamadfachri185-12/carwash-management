import { Response } from "express"

import jwt from "jsonwebtoken"
import { AuthRequest } from "../middleware/auth.middleware"

const OUTLET_QR_VALUE = "CARWASH_OUTLET:MAIN"

export const verifyCustomerOutlet = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        message: "Customer access required",
      })
    }

    const { qrValue } = req.body

    if (qrValue !== OUTLET_QR_VALUE) {
      return res.status(400).json({
        message: "Invalid outlet QR",
      })
    }

    const JWT_SECRET = process.env.JWT_SECRET

    if(!JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      })
    }

    const outletAccessToken = jwt.sign(
      {
        userId: req.user.userId,
        role: "CUSTOMER",
        purpose: "OUTLET_ORDER",
        outlet: "MAIN",
      },
      JWT_SECRET,
      {
        expiresIn: "15m",
      },
    )

    return res.status(200).json({
      message: "Outlet QR verified",
      verified: true,
      outletAccessToken
    })
  } catch (error) {
    console.error("verifyCustomerOutlet error:", error)

    return res.status(500).json({
      message: "Failed to verify outlet QR",
    })
  }
}
