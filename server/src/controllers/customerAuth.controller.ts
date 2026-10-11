import {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import {prisma} from '../lib/prisma'

import {customerLoginSchema, customerRegisterSchema} from '../schemas/customerAuth.schema'

import {generateToken} from '../utils/jwt'

import {AuthRequest} from '../middleware/auth.middleware'

// ======================================================
// CUSTOMER REGISTER
// ======================================================

// Endpoint:
// POST /api/customer/auth/register
//
// Register Customer hanya membuat User.
// Customer record BELUM dibuat.
//
// Customer baru akan dibuat ketika user
// berhasil membuat order pertama.
export const customerRegister = async(req: Request, res: Response) => {
  // ======================================================
  // 1. VALIDASI REQUEST
  // ======================================================
  const result = customerRegisterSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }
  // Ambil data yang sudah lolos validasi
  const { name, email, password } = result.data

  // ======================================================
  // 2. CEK EMAIL
  // ======================================================
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return res.status(400).json({
      message: "Email already registered",
    })
  }

  // ======================================================
  // 3. HASH PASSWORD
  // ======================================================
  const passwordHash = await bcrypt.hash(password, 10)

  // ======================================================
  // 4. BUAT USER
  // ======================================================
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      // Customer Web selalu dibuat sebagai CUSTOMER.
      //
      // Frontend tidak boleh menentukan role.
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  // ======================================================
  // 5. RESPONSE
  // ======================================================
  return res.status(201).json({
    message: "Registration successful",
    user
  })
}

// ======================================================
// CUSTOMER LOGIN
// ======================================================

// Endpoint:
// POST /api/customer/auth/login
export const customerLogin = async(req: Request, res:Response) => {
  // ======================================================
  // 1. VALIDASI REQUEST
  // ======================================================
  const result = customerLoginSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const { email, password } = result.data

  // ======================================================
  // 2. CARI USER
  // ======================================================
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    })
  }

  // ======================================================
  // 3. CEK ROLE
  // ======================================================

  // Endpoint ini hanya boleh digunakan
  // oleh akun CUSTOMER.
  if (user.role !== "CUSTOMER") {
    return res.status(403).json({
      message: "This account cannot access Customer Web",
    })
  }

  // ======================================================
  // 4. CEK PASSWORD
  // ======================================================
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    })
  }

  // ======================================================
  // 5. BUAT JWT
  // ======================================================
  const token = generateToken({
    userId: user.id,
    role: user.role,
  })

  // ======================================================
  // 6. RESPONSE
  // ======================================================
  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

// ======================================================
// CUSTOMER ME
// ======================================================

// Endpoint:
// GET /api/customer/auth/me
//
// Digunakan Customer Web untuk mengetahui
// user yang sedang login.

export const customerMe = async(req: AuthRequest, res: Response) => {
  // ======================================================
  // 1. CEK AUTHENTICATION
  // ======================================================
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    })
  }
  // ======================================================
  // 2. PASTIKAN ROLE CUSTOMER
  // ======================================================
  if (req.user.role !== "CUSTOMER") {
    return res.status(403).json({
      message: "This account cannot access Customer Web",
    })
  }

  // ======================================================
  // 3. CARI USER
  // ======================================================
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  // ======================================================
  // 4. USER TIDAK DITEMUKAN
  // ======================================================
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    })
  }

  // ======================================================
  // 5. PASTIKAN ROLE DI DATABASE CUSTOMER
  // ======================================================
  if (user.role !== "CUSTOMER"){
    return res.status(403).json({
        message: "Customer access required"
    })
  }

  // ======================================================
  // 5. PASTIKAN ROLE DI DATABASE CUSTOMER
  // ======================================================
  return res.status(200).json({
    user
  })
}