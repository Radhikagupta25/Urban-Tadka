import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'
import Order from '../models/Order.js'
import Settings from '../models/Settings.js'
import { signAdminToken } from '../middleware/auth.js'
import { AppError, asyncHandler, mapsUrl } from '../utils/helpers.js'
import { ACTIVE_STATUSES } from '../utils/constants.js'
import { resetFailedNotifications, sendStatusEmail } from '../services/notify.js'

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10)

export const login = asyncHandler(async (req, res) => {
    const admin = await Admin.findOne({ email: req.body.email })
    const ok = await bcrypt.compare(req.body.password, admin?.passwordHash || DUMMY_HASH)
    if (!admin || !ok) throw new AppError(401, 'Incorrect email or password.')
    res.json({ token: signAdminToken(admin), admin: { name: admin.name, email: admin.email } })
})
export const me = (req, res) => res.json({ admin: { name: req.admin.name, email: req.admin.email } })

const adminView = (doc) => ({ ...doc.toObject(), mapsLink: mapsUrl(doc) })

export const stats = asyncHandler(async (req, res) => {
    const ist = new Date(Date.now() + 5.5 * 3600e3); ist.setUTCHours(0, 0, 0, 0)
    const startToday = new Date(ist.getTime() - 5.5 * 3600e3)
    const paid = { placed: true, paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } }
    const sum = (m) => Order.aggregate([{ $match: m }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    const [total, pending, completed, cancelled, revAll, revToday, ordersToday] = await Promise.all([
        Order.countDocuments({ placed: true }),
        Order.countDocuments({ placed: true, orderStatus: { $in: ACTIVE_STATUSES } }),
        Order.countDocuments({ placed: true, orderStatus: 'Delivered' }),
        Order.countDocuments({ placed: true, orderStatus: 'Cancelled' }),
        sum(paid), sum({ ...paid, createdAt: { $gte: startToday } }),
        Order.countDocuments({ placed: true, createdAt: { $gte: startToday } }),
    ])
    res.json({ total, pending, completed, cancelled, ordersToday, revenue: revAll[0]?.total || 0, revenueToday: revToday[0]?.total || 0 })
})

export const listOrders = asyncHandler(async (req, res) => {
    const f = { placed: true }
    const { filter = 'active' } = req.query
    if (filter === 'active') f.orderStatus = { $in: ACTIVE_STATUSES }
    else if (filter === 'done') f.orderStatus = 'Delivered'
    else if (filter === 'cancelled') f.orderStatus = 'Cancelled'
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const orders = await Order.find(f).sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50)
    res.json({ orders: orders.map(adminView) })
})

export const updateStatus = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, placed: true })
    if (!order) throw new AppError(404, 'Order not found.')
    const next = req.body.orderStatus
    if (order.orderStatus === next) return res.json({ order: adminView(order) })
    const set = { orderStatus: next }
    if (next === 'Delivered' && order.paymentMethod === 'COD' && order.paymentStatus === 'Pending') set.paymentStatus = 'Paid' // cash collected
    const updated = await Order.findByIdAndUpdate(order._id, { $set: set, $push: { statusHistory: { status: next, at: new Date() } } }, { new: true })
    if (['Confirmed', 'Out for Delivery', 'Cancelled'].includes(next)) {
        Settings.get().then((cfg) => sendStatusEmail(updated, cfg)).catch((e) => console.error('status email failed', e.message))
    }
    res.json({ order: adminView(updated) })
})

export const resendEmails = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, placed: true })
    if (!order) throw new AppError(404, 'Order not found.')
    await resetFailedNotifications(order._id)
    res.json({ order: adminView(await Order.findById(order._id)) })
})

export const getSettings = asyncHandler(async (req, res) => res.json({ settings: (await Settings.get()).toObject() }))
export const updateSettings = asyncHandler(async (req, res) => {
    await Settings.get()
    const s = await Settings.findOneAndUpdate({ key: 'main' }, { $set: req.body }, { new: true, runValidators: true })
    res.json({ settings: s.toObject() })
})