import {Router} from "express"

import {
    customerRegister,
    customerLogin,
    customerMe
} from '../controllers/customerAuth.controller'

import {authenticate} from '../middleware/auth.middleware'

const router = Router()

// Customer Register
router.post('/register', customerRegister)

// Customer Login
router.post('/login', customerLogin)

// Customer Me
router.get('/me', authenticate, customerMe)

export default router