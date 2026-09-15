import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { loginSchema, registerSchema } from "../schemas/auth.schema"
import { generateToken } from "../utils/jwt"
import { AuthRequest } from "../middleware/auth.middleware"
import { error } from "node:console"

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const { name, email, password, role } = result.data

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered",
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return res.status(201).json({
    message: "Registration succesful",
    user,
  })
}

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten(),
    })
  }

  const { email, password, role } = result.data

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

  // VALIDASI ROLE SESUAI DATABASE
  if (user.role !== role) {
    return res.status(403).json({
      message: `Akun ini terdaftar sebagai ${user.role}, bukan ${role}`,
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Password invalid",
    })
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  })

  return res.status(200).json({
    message: "Login succesfull",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    })
  }

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

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    })
  }

  return res.status(200).json({
    user,
  })
}
