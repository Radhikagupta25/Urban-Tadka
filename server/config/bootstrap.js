import bcrypt from 'bcryptjs'
import { env } from './env.js'
import Admin from '../models/Admin.js'
import MenuItem from '../models/MenuItem.js'
import Settings from '../models/Settings.js'
import { menuSeed } from '../data/menuSeed.js'

export async function bootstrap() {
    const s = await Settings.get()
    if (!(await MenuItem.countDocuments())) {
        await MenuItem.insertMany(menuSeed)
        console.log(`Seeded ${menuSeed.length} sample menu items (edit them in Admin → Menu).`)
    }
    if (!(await Admin.countDocuments())) {
        if (env.adminEmail && env.adminPassword && env.adminPassword.length >= 10) {
            await Admin.create({ email: env.adminEmail, passwordHash: await bcrypt.hash(env.adminPassword, 12) })
            console.log(`Created admin ${env.adminEmail}`)
        } else console.warn('No admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars) and restart.')
    }
    const warn = (c, m) => c || console.warn(`[setup] ${m}`)
    warn(env.razorpay.keyId && env.razorpay.keySecret, 'Razorpay keys missing: online payment disabled (COD still works).')
    warn(env.razorpay.webhookSecret, 'RAZORPAY_WEBHOOK_SECRET missing: webhooks rejected.')
    warn(env.email.user && env.email.pass, 'EMAIL_USER / EMAIL_PASS missing: emails queued and retried once configured.')
    warn(s.orderEmail || env.restaurantEmail, 'No restaurant order email set (RESTAURANT_EMAIL or Admin → Settings).')
}