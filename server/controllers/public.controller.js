import Settings from '../models/Settings.js'
import { asyncHandler } from '../utils/helpers.js'

export const publicConfig = (s) => ({
    restaurantName: s.restaurantName, tagline: s.tagline, logoUrl: s.logoUrl, phone: s.phone, contactEmail: s.contactEmail,
    addressLines: s.addressLines, mapQuery: s.mapQuery,
    hours: s.hours.map((h) => ({ days: h.days, time: h.time })),
    social: { instagram: s.social?.instagram || '', facebook: s.social?.facebook || '', youtube: s.social?.youtube || '' },
    acceptingOrders: s.acceptingOrders, deliveryCharge: s.deliveryCharge, freeDeliveryAbove: s.freeDeliveryAbove, taxPercent: s.taxPercent,
    coupon: s.couponCode && s.couponPercent ? { code: s.couponCode, percent: s.couponPercent, minSubtotal: s.couponMinSubtotal, maxDiscount: s.couponMaxDiscount } : null,
})

export const getConfig = asyncHandler(async (req, res) => res.json({ config: publicConfig(await Settings.get()) }))