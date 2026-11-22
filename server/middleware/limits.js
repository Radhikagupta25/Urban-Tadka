import rateLimit from 'express-rate-limit'

const make = (windowMin, max, message) => rateLimit({
    windowMs: windowMin * 60 * 1000, max, standardHeaders: true, legacyHeaders: false, message: { message },
})
export const loginLimiter = make(15, 10, 'Too many sign-in attempts. Try again later.')
export const orderLimiter = make(15, 30, 'Too many order attempts. Please wait a few minutes.')
export const trackLimiter = make(15, 20, 'Too many lookups. Please wait a few minutes.')
export const apiLimiter = make(1, 300, 'Too many requests.')