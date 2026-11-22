import MenuItem from '../models/MenuItem.js'
import Settings from '../models/Settings.js'
import { round2 } from '../utils/helpers.js'

export function computeEstimates(s, orderType, totalQty, from = new Date()) {
    const extra = Math.min(s.maxExtraPrepMinutes, Math.max(0, totalQty - 2) * s.extraPrepPerItem)
    const prep = s.basePrepMinutes + extra
    const delivery = orderType === 'Delivery' ? s.deliveryMinutes : 0
    return {
        estimatedPreparationMinutes: prep,
        estimatedDeliveryMinutes: delivery,
        estimatedBufferMinutes: s.bufferMinutes,
        estimatedArrivalAt: new Date(from.getTime() + (prep + delivery) * 60000),
    }
}

export async function buildQuote({ items, orderType = 'Delivery', couponCode }, settingsDoc) {
    const s = settingsDoc || (await Settings.get())
    const docs = await MenuItem.find({ _id: { $in: [...new Set(items.map((i) => i.menuItemId))] } })
    const byId = new Map(docs.map((d) => [String(d._id), d]))
    const issues = []
    const lines = []

    for (const it of items) {
        const d = byId.get(it.menuItemId)
        if (!d) { issues.push({ menuItemId: it.menuItemId, message: 'An item in your cart is no longer on the menu. Please remove it.' }); continue }
        if (!d.isAvailable) { issues.push({ menuItemId: it.menuItemId, message: `${d.name} is currently unavailable. Please remove it to continue.` }); continue }
        const addons = []
        let ok = true
        for (const aid of it.addonIds || []) {
            const a = d.addons.id(aid)
            if (!a) { issues.push({ menuItemId: it.menuItemId, message: `An add-on for ${d.name} is no longer available. Please re-add the item.` }); ok = false; break }
            addons.push({ name: a.name, price: a.price })
        }
        if (!ok) continue
        const unit = d.price + addons.reduce((t, a) => t + a.price, 0)
        lines.push({
            key: `${it.menuItemId}:${[...(it.addonIds || [])].sort().join(',')}`,
            menuItem: d._id, name: d.name, isVeg: d.isVeg, quantity: it.quantity,
            unitPrice: d.price, addons, lineTotal: round2(unit * it.quantity),
        })
    }

    const subtotal = round2(lines.reduce((t, l) => t + l.lineTotal, 0))
    let discount = 0, applied, couponMessage
    if (couponCode) {
        if (s.couponCode && couponCode.toUpperCase() === s.couponCode.toUpperCase()) {
            if (subtotal >= s.couponMinSubtotal) {
                discount = Math.min(round2((subtotal * s.couponPercent) / 100), s.couponMaxDiscount)
                applied = s.couponCode.toUpperCase()
            } else couponMessage = `Add items worth ₹${s.couponMinSubtotal} or more to use this code.`
        } else couponMessage = 'That code is not valid.'
    }
    const deliveryCharge = orderType === 'Delivery' && subtotal < s.freeDeliveryAbove ? s.deliveryCharge : 0
    const tax = round2(((subtotal - discount) * s.taxPercent) / 100)
    const totalAmount = round2(subtotal - discount + deliveryCharge + tax)
    const totalQty = lines.reduce((t, l) => t + l.quantity, 0)

    return {
        issues, lines, subtotal, discount, couponCode: applied, couponMessage, deliveryCharge, tax, totalAmount, totalQty,
        estimates: computeEstimates(s, orderType, totalQty),
        acceptingOrders: s.acceptingOrders, freeDeliveryAbove: s.freeDeliveryAbove,
    }
}