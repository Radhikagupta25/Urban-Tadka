import crypto from 'crypto'

export class AppError extends Error {
    constructor(status, message, details) { super(message); this.status = status; this.details = details }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100
export const toPaise = (n) => Math.round(n * 100)
export const newOrderNumber = () => `UT-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
export const hmacHex = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')
export const safeEqual = (a, b) => {
    const x = Buffer.from(String(a)), y = Buffer.from(String(b))
    return x.length === y.length && crypto.timingSafeEqual(x, y)
}
export const mapsUrl = (o) =>
    o.latitude != null && o.longitude != null ? `https://www.google.com/maps?q=${o.latitude},${o.longitude}` : null