import 'dotenv/config'

const e = process.env
const list = (s) => (s || '').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean)
const missing = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'].filter((k) => !e[k])
if (missing.length) { console.error(`Missing required environment variables: ${missing.join(', ')}`); process.exit(1) }
const isProd = e.NODE_ENV === 'production'
if (isProd && e.JWT_SECRET.length < 32) { console.error('JWT_SECRET must be at least 32 characters in production.'); process.exit(1) }

export const env = {
    port: Number(e.PORT) || 5000,
    isProd,
    mongoUri: e.MONGODB_URI,
    jwtSecret: e.JWT_SECRET,
    clientOrigins: list(e.CLIENT_URL),
    razorpay: { keyId: e.RAZORPAY_KEY_ID, keySecret: e.RAZORPAY_KEY_SECRET, webhookSecret: e.RAZORPAY_WEBHOOK_SECRET },
    email: {
        host: e.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(e.EMAIL_PORT) || 587,
        user: e.EMAIL_USER,
        pass: (e.EMAIL_PASS || '').replace(/\s/g, ''),
        from: e.EMAIL_FROM || e.EMAIL_USER,
    },
    restaurantEmail: e.RESTAURANT_EMAIL || '',
    restaurant: { name: e.RESTAURANT_NAME || 'Urban Tadka', phone: e.RESTAURANT_PHONE || '', address: e.RESTAURANT_ADDRESS || '' },
    adminEmail: e.ADMIN_EMAIL,
    adminPassword: e.ADMIN_PASSWORD,
}