import mongoose from 'mongoose'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../utils/constants.js'

const { Schema } = mongoose
const notifySchema = new Schema({
    status: { type: String, enum: ['pending', 'sending', 'sent', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    lockedAt: Date,
    lastError: String,
}, { _id: false })

const itemSchema = new Schema({
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String, isVeg: Boolean, quantity: Number, unitPrice: Number,
    addons: [new Schema({ name: String, price: Number }, { _id: false })],
    lineTotal: Number,
}, { _id: false })

const orderSchema = new Schema({
    orderNumber: { type: String, unique: true, index: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    customerName: String, customerPhone: String, customerEmail: String,
    orderType: { type: String, enum: ['Delivery', 'Pickup'], required: true },
    deliveryAddress: { flat: String, line: String, landmark: String, city: String, pincode: String },
    latitude: Number, longitude: Number,
    deliveryInstructions: String,
    items: [itemSchema],
    subtotal: Number, discount: { type: Number, default: 0 }, couponCode: String,
    deliveryCharge: Number, tax: Number, totalAmount: Number,
    paymentMethod: { type: String, enum: ['COD', 'Razorpay'], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },
    razorpayOrderId: { type: String, index: true, sparse: true },
    razorpayPaymentId: String,
    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Received' },
    placed: { type: Boolean, default: false, index: true }, // false = awaiting verified online payment
    estimatedPreparationMinutes: Number, estimatedDeliveryMinutes: Number, estimatedBufferMinutes: Number,
    estimatedArrivalAt: Date,
    statusHistory: [new Schema({ status: String, at: Date }, { _id: false })],
    notify: {
        restaurant: { type: notifySchema, default: () => ({}) },
        customer: { type: notifySchema, default: () => ({}) },
    },
}, { timestamps: true })

orderSchema.index({ placed: 1, createdAt: -1 })
export default mongoose.model('Order', orderSchema)