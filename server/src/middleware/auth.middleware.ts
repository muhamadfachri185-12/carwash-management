import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

interface JwtPayload {
    userId: number;
    role: "ADMIN" | "STAFF"
}

export interface AuthRequest extends Request {
    user?: JwtPayload
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader){
        return res.status(401).json({
            message: "Authentication required"
        })
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token ){
        return res.status(401).json({
            message: "Invalid authorization format"
        })
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if(!JWT_SECRET){
        return res.status(500).json({
            message: "JWT secret is not configured"
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        req.user = decoded;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}