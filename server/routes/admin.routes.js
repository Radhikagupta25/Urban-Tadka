import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { loginLimiter } from '../middleware/limits.js'
import { availabilitySchema, loginSchema, menuItemSchema, settingsSchema, statusSchema } from '../utils/validators.js'
import * as admin from '../controllers/admin.controller.js'
import * as menu from '../controllers/menu.controller.js'

const r = Router()
r.post('/login', loginLimiter, validate(loginSchema), admin.login)
r.use(requireAdmin)
r.get('/me', admin.me)
r.get('/stats', admin.stats)
r.get('/orders', admin.listOrders)
r.patch('/orders/:id/status', validate(statusSchema), admin.updateStatus)
r.post('/orders/:id/resend-emails', admin.resendEmails)
r.get('/menu', menu.listAdmin)
r.post('/menu', validate(menuItemSchema), menu.create)
r.put('/menu/:id', validate(menuItemSchema), menu.update)
r.patch('/menu/:id/availability', validate(availabilitySchema), menu.setAvailability)
r.delete('/menu/:id', menu.remove)
r.get('/settings', admin.getSettings)
r.put('/settings', validate(settingsSchema), admin.updateSettings)
export default r