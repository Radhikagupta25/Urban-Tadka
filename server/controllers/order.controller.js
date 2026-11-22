import Order from '../models/Order.js'
import { AppError, asyncHandler } from '../utils/helpers.js'
import { buildQuote } from '../services/pricing.js'
import { createPendingOrder } from '../services/orderService.js'
import { notifyOrderPlaced } from '../services/notify.js'

// Customer-safe view: no GPS, no email, no internal ids.
export const publicView = (doc) => {
    const o = doc.toObject ? doc.toObject() : doc
    return {
        orderNumber: o.orderNumber, orderType: o.orderType, customerName: o.customerName,
        deliveryAddress: o.orderType === 'Delivery' ? o.deliveryAddress : undefined,
        items: o.items.map((i) => ({ name: i.name, isVeg: i.isVeg, quantity: i.quantity, addons: i.addons, lineTotal: i.lineTotal })),
        subtotal: o.subtotal, discount: o.discount, deliveryCharge: o.deliveryCharge, tax: o.tax, totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, orderStatus: o.orderStatus,
        estimatedPreparationMinutes: o.estimatedPreparationMinutes, estimatedDeliveryMinutes: o.estimatedDeliveryMinutes,
        estimatedBufferMinutes: o.estimatedBufferMinutes, estimatedArrivalAt: o.estimatedArrivalAt, createdAt: o.createdAt,
    }
}

export const quote = asyncHandler(async (req, res) => {
    const q = await buildQuote(req.body)
    res.json({
        issues: q.issues, subtotal: q.subtotal, discount: q.discount, couponCode: q.couponCode, couponMessage: q.couponMessage,
        deliveryCharge: q.deliveryCharge, tax: q.tax, totalAmount: q.totalAmount, estimates: q.estimates,
        acceptingOrders: q.acceptingOrders, freeDeliveryAbove: q.freeDeliveryAbove,
    })
})

export const createCodOrder = asyncHandler(async (req, res) => {
    if (req.body.paymentMethod !== 'COD') throw new AppError(400, 'Use the online payment flow for UPI/card payments.')
    const { order, existing } = await createPendingOrder(req.body, 'COD')
    if (!existing) notifyOrderPlaced(order._id).catch((e) => console.error('notify error', e)) // never blocks or loses the order
    res.status(existing ? 200 : 201).json({ order: publicView(order) })
})

export const track = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.body.orderNumber.toUpperCase(), placed: true })
    if (!order || order.customerPhone !== req.body.phone) throw new AppError(404, 'No order found for those details.')
    res.json({ order: publicView(order) })
})