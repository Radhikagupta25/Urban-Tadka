import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import Admin from '../models/Admin.js'
import { AppError, asyncHandler } from '../utils/helpers.js'

export const signAdminToken = (admin) => jwt.sign({ sub: String(admin._id) }, env.jwtSecret, { expiresIn: '8h', algorithm: 'HS256' })

export const requireAdmin = asyncHandler(async (req, res, next) => {
    const m = /^Bearer (.+)$/.exec(req.get('authorization') || '')
    if (!m) throw new AppError(401, 'Please sign in.')
    let payload
    try { payload = jwt.verify(m[1], env.jwtSecret, { algorithms: ['HS256'] }) }
    catch { throw new AppError(401, 'Session expired. Please sign in again.') }
    const admin = await Admin.findById(payload.sub).select('-passwordHash')
    if (!admin) throw new AppError(401, 'Please sign in.')
    req.admin = admin
    next()
}) 