import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { orderLimiter } from '../middleware/limits.js'
import { checkoutSchema, verifySchema } from '../utils/validators.js'
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller.js'

const r = Router()
r.post('/create-order', orderLimiter, validate(checkoutSchema), createPaymentOrder)
r.post('/verify', orderLimiter, validate(verifySchema), verifyPayment)
export default r