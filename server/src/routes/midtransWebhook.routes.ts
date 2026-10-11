import { Router } from "express";
import { midtransWebhook } from "../controllers/midtransWebhook.controller";

const router = Router()

// Endpoint untuk menerima notifikasi pembayaean dari Midtrans
router.post("/", midtransWebhook)

export default router