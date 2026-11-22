import { z } from 'zod'
import { CATEGORIES, ORDER_STATUSES } from './constants.js'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')
const urlOrEmpty = z.string().trim().max(500).refine((u) => u === '' || /^https?:\/\//i.test(u), 'Must be an http(s) URL')
const emailOrEmpty = z.string().trim().toLowerCase().max(120).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Invalid email address')

export const phoneSchema = z.string().trim()
    .transform((p) => p.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'))

const cartItem = z.object({
    menuItemId: objectId,
    quantity: z.number().int().min(1).max(20),
    addonIds: z.array(objectId).max(10).default([]),
})

export const quoteSchema = z.object({
    items: z.array(cartItem).min(1, 'Your cart is empty.').max(40),
    orderType: z.enum(['Delivery', 'Pickup']).default('Delivery'),
    couponCode: z.string().trim().max(20).optional(),
})

const address = z.object({
    flat: z.string().trim().max(60).default(''),
    line: z.string().trim().max(200).default(''),
    landmark: z.string().trim().max(100).default(''),
    city: z.string().trim().max(60).default(''),
    pincode: z.string().trim().max(10).default(''),
})

export const checkoutSchema = quoteSchema.extend({
    idempotencyKey: z.string().min(8).max(64),
    customer: z.object({
        name: z.string().trim().min(2, 'Enter your full name.').max(80),
        phone: phoneSchema,
        email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(120),
    }),
    address: address.optional(),
    location: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).optional(),
    instructions: z.string().trim().max(300).optional(),
    paymentMethod: z.enum(['COD', 'Razorpay']),
}).superRefine((v, ctx) => {
    if (v.orderType !== 'Delivery') return
    const a = v.address
    const bad = (path, message) => ctx.addIssue({ code: 'custom', path: ['address', path], message })
    if (!a?.flat) bad('flat', 'Flat / house number is required.')
    if (!a || a.line.length < 5) bad('line', 'Enter your full delivery address.')
    if (!a?.city) bad('city', 'City is required.')
    if (!a || !/^\d{6}$/.test(a.pincode)) bad('pincode', 'Enter a 6-digit pincode.')
})

export const trackSchema = z.object({ orderNumber: z.string().trim().min(6).max(20), phone: phoneSchema })
export const verifySchema = z.object({
    razorpay_order_id: z.string().min(5).max(64),
    razorpay_payment_id: z.string().min(5).max(64),
    razorpay_signature: z.string().min(10).max(200),
})
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) })
export const statusSchema = z.object({ orderStatus: z.enum(ORDER_STATUSES) })
export const availabilitySchema = z.object({ isAvailable: z.boolean() })

export const menuItemSchema = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(300).default(''),
    image: urlOrEmpty.default(''),
    price: z.number().min(0).max(100000),
    category: z.enum(CATEGORIES),
    isVeg: z.boolean(),
    isAvailable: z.boolean().default(true),
    isBestseller: z.boolean().default(false),
    addons: z.array(z.object({ name: z.string().trim().min(1).max(60), price: z.number().min(0).max(10000) })).max(12).default([]),
})

export const settingsSchema = z.object({
    restaurantName: z.string().trim().min(1).max(60),
    tagline: z.string().trim().max(120),
    logoUrl: urlOrEmpty,
    phone: z.string().trim().max(30),
    contactEmail: emailOrEmpty,
    orderEmail: emailOrEmpty,
    addressLines: z.array(z.string().trim().max(120)).max(5),
    mapQuery: z.string().trim().max(200),
    hours: z.array(z.object({ days: z.string().trim().max(40), time: z.string().trim().max(80) })).max(10),
    social: z.object({ instagram: urlOrEmpty, facebook: urlOrEmpty, youtube: urlOrEmpty }),
    acceptingOrders: z.boolean(),
    basePrepMinutes: z.number().min(0).max(240),
    extraPrepPerItem: z.number().min(0).max(30),
    maxExtraPrepMinutes: z.number().min(0).max(120),
    deliveryMinutes: z.number().min(0).max(240),
    bufferMinutes: z.number().min(0).max(120),
    deliveryCharge: z.number().min(0).max(1000),
    freeDeliveryAbove: z.number().min(0).max(100000),
    taxPercent: z.number().min(0).max(40),
    couponCode: z.string().trim().max(20),
    couponPercent: z.number().min(0).max(100),
    couponMinSubtotal: z.number().min(0).max(100000),
    couponMaxDiscount: z.number().min(0).max(100000),
})