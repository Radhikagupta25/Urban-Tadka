import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'
import { env } from './config/env.js'
import { connectDB, closeDB } from './config/db.js'
import { bootstrap } from './config/bootstrap.js'
import { errorHandler, notFound } from './middleware/error.js'
import { apiLimiter } from './middleware/limits.js'
import { razorpayWebhook } from './controllers/payment.controller.js'
import { retryNotifications } from './services/notify.js'
import publicRoutes from './routes/public.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()
app.set('trust proxy', 1) // Render / most PaaS sit behind one proxy
app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

app.use((req, res, next) => {
    const t = Date.now()
    res.on('finish', () => { if (req.path !== '/api/health') console.log(`${req.method} ${req.originalUrl.split('?')[0]} ${res.statusCode} ${Date.now() - t}ms`) })
    next()
})

app.use('/api', cors({
    origin: (origin, cb) => cb(null, !origin || env.clientOrigins.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
}))

app.get('/api/health', (req, res) => {
    const db = mongoose.connection.readyState === 1
    res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'degraded', db, uptime: Math.round(process.uptime()) })
})

// Webhook must be registered BEFORE express.json() so the raw body is intact.
app.post('/api/payment/webhook', express.raw({ type: 'application/json', limit: '1mb' }), razorpayWebhook)

app.use(express.json({ limit: '100kb' }))
app.use('/api', apiLimiter)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', publicRoutes)
app.use(notFound)
app.use(errorHandler)

let server, timer
async function main() {
    await connectDB()       // never accept requests before the DB is ready
    await bootstrap()
    server = app.listen(env.port, '0.0.0.0', () => console.log(`API listening on port ${env.port} (${env.isProd ? 'production' : 'development'})`))
    timer = setInterval(() => retryNotifications().catch((e) => console.error('retry error', e.message)), 2 * 60 * 1000)
}

function shutdown(signal) {
    console.log(`${signal} received, shutting down…`)
    clearInterval(timer)
    setTimeout(() => process.exit(1), 10000).unref()
    if (!server) return process.exit(0)
    server.close(async () => { await closeDB().catch(() => { }); process.exit(0) })
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (e) => console.error('Unhandled rejection', e))

main().catch((e) => { console.error('Fatal startup error:', e.message); process.exit(1) })