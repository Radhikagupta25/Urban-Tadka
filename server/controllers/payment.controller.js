import Razorpay from 'razorpay'
import { env } from '../config/env.js'
import Order from '../models/Order.js'
import Settings from '../models/Settings.js'
import { AppError, asyncHandler, hmacHex, safeEqual, toPaise } from '../utils/helpers.js'
import { createPendingOrder, finalizeOnlinePayment } from '../services/orderService.js'
import { publicView } from './order.controller.js'

let client
const rzp = () => {
    if (!env.razorpay.keyId || !env.razorpay.keySecret) throw new AppError(503, 'Online payments are not configured. Please choose Cash on Delivery.')
    return (client ||= new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret }))
}

// POST /api/payment/create-order
export const createPaymentOrder = asyncHandler(async (req, res) => {
    const razorpay = rzp()
    if (req.body.paymentMethod !== 'Razorpay') throw new AppError(400, 'Invalid payment method.')
    let { order, existing } = await createPendingOrder(req.body, 'Razorpay')
    if (existing && order.paymentStatus === 'Paid') return res.json({ alreadyPaid: true, order: publicView(order) })
    if (!order.razorpayOrderId) {
        let rz
        try {
            rz = await razorpay.orders.create({ amount: toPaise(order.totalAmount), currency: 'INR', receipt: order.orderNumber, notes: { orderNumber: order.orderNumber } })
        } catch (e) { console.error('Razorpay create order failed', e?.error || e?.message); throw new AppError(502, 'Could not start the payment. Please try again.') }
        const updated = await Order.findOneAndUpdate({ _id: order._id, razorpayOrderId: { $exists: false } }, { $set: { razorpayOrderId: rz.id } }, { new: true })
        order = updated || (await Order.findById(order._id))
    }
    const cfg = await Settings.get()
    res.json({
        orderNumber: order.orderNumber, razorpayOrderId: order.razorpayOrderId, amount: toPaise(order.totalAmount), currency: 'INR',
        keyId: env.razorpay.keyId, restaurantName: cfg.restaurantName,
        prefill: { name: order.customerName, email: order.customerEmail, contact: order.customerPhone },
    })
})

// POST /api/payment/verify — trusts nothing from the browser except a signature we can check.
export const verifyPayment = asyncHandler(async (req, res) => {
    rzp()
    const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = req.body
    if (!safeEqual(hmacHex(env.razorpay.keySecret, `${oid}|${pid}`), sig)) throw new AppError(400, 'Payment verification failed.')
    const order = await finalizeOnlinePayment(oid, pid)
    if (!order) throw new AppError(404, 'Order not found.')
    res.json({ order: publicView(order) })
})

// POST /api/payment/webhook — mounted with express.raw() so the signature covers the exact bytes Razorpay sent.
export async function razorpayWebhook(req, res) {
    const secret = env.razorpay.webhookSecret
    if (!secret) return res.status(503).json({ message: 'Webhook not configured' })
    const sig = req.get('x-razorpay-signature')
    if (!sig || !Buffer.isBuffer(req.body) || !safeEqual(hmacHex(secret, req.body), sig)) return res.status(400).json({ message: 'Invalid signature' })
    let event
    try { event = JSON.parse(req.body.toString('utf8')) } catch { return res.status(400).json({ message: 'Bad payload' }) }
    try {
        const pay = event.payload?.payment?.entity
        switch (event.event) {
            case 'payment.captured':
            case 'order.paid': {
                const orderId = pay?.order_id || event.payload?.order?.entity?.id
                const order = orderId && (await Order.findOne({ razorpayOrderId: orderId }))
                if (!order || !pay) break
                if (pay.amount !== toPaise(order.totalAmount)) { console.error('Webhook amount mismatch for', order.orderNumber); break }
                await finalizeOnlinePayment(orderId, pay.id)
                break
            }
            case 'payment.failed':
                if (pay?.order_id) await Order.updateOne({ razorpayOrderId: pay.order_id, paymentStatus: 'Pending' }, { $set: { paymentStatus: 'Failed' } })
                break
            case 'refund.processed': {
                const refund = event.payload?.refund?.entity
                const order = refund && (await Order.findOne({ razorpayPaymentId: refund.payment_id }))
                if (order && refund.amount >= toPaise(order.totalAmount)) await Order.updateOne({ _id: order._id }, { $set: { paymentStatus: 'Refunded' } })
                break
            }
            default: break
        }
    } catch (e) { console.error('Webhook handling error', e); return res.status(500).json({ message: 'Retry' }) } // Razorpay retries on non-2xx
    res.json({ received: true })
}