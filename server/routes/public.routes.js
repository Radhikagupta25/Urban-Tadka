import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { orderLimiter, trackLimiter } from '../middleware/limits.js'
import { checkoutSchema, quoteSchema, trackSchema } from '../utils/validators.js'
import { getConfig } from '../controllers/public.controller.js'
import { listPublic } from '../controllers/menu.controller.js'
import { createCodOrder, quote, track } from '../controllers/order.controller.js'

const r = Router()
r.get('/config', getConfig)
r.get('/menu', listPublic)
r.post('/quote', validate(quoteSchema), quote)
r.post('/orders/cod', orderLimiter, validate(checkoutSchema), createCodOrder)
r.post('/orders/track', trackLimiter, validate(trackSchema), track)
export default r