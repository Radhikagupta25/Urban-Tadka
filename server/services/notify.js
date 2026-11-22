import Order from '../models/Order.js'
import Settings from '../models/Settings.js'
import { env } from '../config/env.js'
import { emailConfigured, sendMail } from './email.js'
import { restaurantEmail, customerEmail, statusEmail } from './emailTemplates.js'

const MAX_ATTEMPTS = 6
const STALE_MS = 10 * 60 * 1000

// Atomically claim the right to send. Webhook + callback racing => exactly one wins.
const claim = (id, who) => {
    const p = `notify.${who}`
    const stale = new Date(Date.now() - STALE_MS)
    return Order.findOneAndUpdate(
        {
            _id: id, placed: true, [`${p}.attempts`]: { $lt: MAX_ATTEMPTS },
            $or: [{ [`${p}.status`]: { $in: ['pending', 'failed'] } }, { [`${p}.status`]: 'sending', [`${p}.lockedAt`]: { $lt: stale } }],
        },
        { $set: { [`${p}.status`]: 'sending', [`${p}.lockedAt`]: new Date() } },
        { new: true },
    )
}

async function run(id, who, build, to, cfg) {
    const order = await claim(id, who)
    if (!order) return
    const p = `notify.${who}`
    try {
        const recipient = to(order)
        if (!recipient) throw new Error('No recipient email configured')
        const { subject, html, text } = build(order, cfg)
        await sendMail({ to: recipient, subject, html, text, idempotencyKey: `${order.orderNumber}-${who}` })
        await Order.updateOne({ _id: id }, { $set: { [`${p}.status`]: 'sent', [`${p}.lastError`]: null } })
    } catch (e) {
        console.error(`Email (${who}) failed for ${order.orderNumber}: ${e.message}`)
        await Order.updateOne({ _id: id }, { $set: { [`${p}.status`]: 'failed', [`${p}.lastError`]: String(e.message).slice(0, 300) }, $inc: { [`${p}.attempts`]: 1 } })
    }
}

export async function notifyOrderPlaced(id) {
    if (!emailConfigured()) { console.warn('Email provider not configured; order saved, emails will retry once configured.'); return }
    const cfg = await Settings.get()
    await run(id, 'restaurant', restaurantEmail, () => cfg.orderEmail || env.restaurantEmail, cfg)
    await run(id, 'customer', customerEmail, (o) => o.customerEmail, cfg)
}

export async function sendStatusEmail(order, cfg) {
    if (!emailConfigured()) return
    const { subject, html, text } = statusEmail(order, cfg)
    await sendMail({ to: order.customerEmail, subject, html, text, idempotencyKey: `${order.orderNumber}-status-${order.orderStatus}`.replace(/\s/g, '') })
}

// Called on a timer: retries pending/failed emails (up to MAX_ATTEMPTS) for placed orders.
export async function retryNotifications() {
    if (!emailConfigured()) return
    const cutoff = new Date(Date.now() - 60 * 1000)
    const stale = new Date(Date.now() - STALE_MS)
    const cond = (who) => ({
        [`notify.${who}.attempts`]: { $lt: MAX_ATTEMPTS },
        $or: [{ [`notify.${who}.status`]: { $in: ['pending', 'failed'] } }, { [`notify.${who}.status`]: 'sending', [`notify.${who}.lockedAt`]: { $lt: stale } }],
    })
    const orders = await Order.find({ placed: true, updatedAt: { $lt: cutoff }, $or: [cond('restaurant'), cond('customer')] }).select('_id').limit(25)
    for (const o of orders) await notifyOrderPlaced(o._id)
}

export async function resetFailedNotifications(id) {
    for (const who of ['restaurant', 'customer']) {
        await Order.updateOne({ _id: id, [`notify.${who}.status`]: { $ne: 'sent' } }, { $set: { [`notify.${who}`]: { status: 'pending', attempts: 0 } } })
    }
    await notifyOrderPlaced(id)
}