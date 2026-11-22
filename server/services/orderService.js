import Order from '../models/Order.js'
import Settings from '../models/Settings.js'
import { AppError, newOrderNumber } from '../utils/helpers.js'
import { buildQuote, computeEstimates } from './pricing.js'
import { notifyOrderPlaced } from './notify.js'

export async function createPendingOrder(data, method) {
    const settings = await Settings.get()
    if (!settings.acceptingOrders) throw new AppError(503, 'We are not taking online orders right now. Please call us.')
    const q = await buildQuote(data, settings)
    if (q.issues.length) throw new AppError(409, q.issues[0].message, { issues: q.issues })
    const isCod = method === 'COD'
    const doc = {
        orderNumber: newOrderNumber(),
        idempotencyKey: data.idempotencyKey,
        customerName: data.customer.name, customerPhone: data.customer.phone, customerEmail: data.customer.email,
        orderType: data.orderType,
        deliveryAddress: data.orderType === 'Delivery' ? data.address : undefined,
        latitude: data.location?.latitude, longitude: data.location?.longitude,
        deliveryInstructions: data.instructions,
        items: q.lines.map(({ key, ...l }) => l),
        subtotal: q.subtotal, discount: q.discount, couponCode: q.couponCode,
        deliveryCharge: q.deliveryCharge, tax: q.tax, totalAmount: q.totalAmount,
        paymentMethod: method, paymentStatus: 'Pending', placed: isCod, orderStatus: 'Received',
        ...q.estimates,
        statusHistory: isCod ? [{ status: 'Received', at: new Date() }] : [],
    }
    try {
        return { order: await Order.create(doc), existing: false }
    } catch (e) {
        if (e.code === 11000 && e.keyPattern?.idempotencyKey) {
            return { order: await Order.findOne({ idempotencyKey: data.idempotencyKey }), existing: true }
        }
        throw e
    }
}

// Atomic + idempotent: only one caller (browser callback OR webhook) wins the Pending/Failed -> Paid transition.
export async function finalizeOnlinePayment(razorpayOrderId, paymentId) {
    const current = await Order.findOne({ razorpayOrderId })
    if (!current) return null
    if (['Paid', 'Refunded'].includes(current.paymentStatus)) return current
    const settings = await Settings.get()
    const qty = current.items.reduce((t, i) => t + i.quantity, 0)
    const est = computeEstimates(settings, current.orderType, qty, new Date())
    const updated = await Order.findOneAndUpdate(
        { _id: current._id, paymentStatus: { $in: ['Pending', 'Failed'] } },
        { $set: { paymentStatus: 'Paid', razorpayPaymentId: paymentId, placed: true, ...est }, $push: { statusHistory: { status: 'Received', at: new Date() } } },
        { new: true },
    )
    if (updated) notifyOrderPlaced(updated._id).catch((e) => console.error('notify error', e))
    return updated || (await Order.findById(current._id))
}