import { mapsUrl } from '../utils/helpers.js'

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const when = (d) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(d))
const hm = (d) => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date(d))
const tel = (p) => `tel:${String(p).replace(/[^\d+]/g, '')}`

const addressText = (o) => {
    if (o.orderType === 'Pickup') return 'Pickup — no delivery address'
    const a = o.deliveryAddress || {}
    return [a.flat, a.line, a.landmark && `Near ${a.landmark}`, [a.city, a.pincode].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}
export const etaRange = (o) => {
    const lo = (o.estimatedPreparationMinutes || 0) + (o.estimatedDeliveryMinutes || 0)
    const hiMs = new Date(o.estimatedArrivalAt).getTime() + (o.estimatedBufferMinutes || 0) * 60000
    return { minutes: `${lo}–${lo + (o.estimatedBufferMinutes || 0)} minutes`, clock: `${hm(o.estimatedArrivalAt)} – ${hm(hiMs)}` }
}

const row = (l, v, bold) => `<tr><td style="padding:4px 0;color:#555;${bold ? 'font-weight:bold;color:#151412;font-size:16px' : ''}">${l}</td><td align="right" style="padding:4px 0;${bold ? 'font-weight:bold;font-size:16px' : ''}">${v}</td></tr>`

const itemsTable = (o) => `
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
<tr style="border-bottom:2px solid #151412;text-align:left"><th style="padding:6px 0">Item</th><th align="center">Qty</th><th align="right">Price</th><th align="right">Total</th></tr>
${o.items.map((i) => `<tr style="border-bottom:1px solid #eee"><td style="padding:8px 0">${esc(i.name)}${i.addons?.length ? `<br><span style="color:#777;font-size:12px">+ ${i.addons.map((a) => esc(a.name)).join(', ')}</span>` : ''}</td>
<td align="center">${i.quantity}</td><td align="right">${inr(i.unitPrice + (i.addons || []).reduce((t, a) => t + a.price, 0))}</td><td align="right">${inr(i.lineTotal)}</td></tr>`).join('')}
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:14px">
${row('Subtotal', inr(o.subtotal))}${o.discount ? row(`Discount${o.couponCode ? ` (${esc(o.couponCode)})` : ''}`, `− ${inr(o.discount)}`) : ''}
${row('Delivery charge', o.deliveryCharge ? inr(o.deliveryCharge) : 'Free')}${row('Tax', inr(o.tax))}${row('Total', inr(o.totalAmount), true)}</table>`

const section = (title, body) => `<tr><td style="padding:18px 28px 0"><div style="font:bold 11px Arial;letter-spacing:2px;color:#E4572E;text-transform:uppercase;margin-bottom:8px">${title}</div>${body}</td></tr>`

const layout = (cfg, pre, inner) => `<!doctype html><html><body style="margin:0;background:#EDE2C8;font-family:Arial,Helvetica,sans-serif;color:#151412">
<span style="display:none;opacity:0;height:0">${esc(pre)}</span>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff">
<tr><td style="background:#151412;padding:20px 28px;font:bold 22px Arial;letter-spacing:3px;color:#F7F0E0">${esc(cfg.restaurantName.toUpperCase())}</td></tr>
${inner}
<tr><td style="padding:24px 28px;background:#151412;color:#bbb;font-size:12px">${esc(cfg.restaurantName)} · ${esc((cfg.addressLines || []).join(', '))} · ${esc(cfg.phone)}</td></tr>
</table></td></tr></table></body></html>`

export function restaurantEmail(o, cfg) {
    const paid = o.paymentStatus === 'Paid'
    const map = mapsUrl(o)
    const banner = paid
        ? `<div style="background:#1f7a3d;color:#fff;padding:10px 14px;font-weight:bold">PAID ONLINE — nothing to collect</div>`
        : `<div style="background:#F5B921;color:#151412;padding:10px 14px;font-weight:bold">CASH ON ${o.orderType === 'Pickup' ? 'PICKUP' : 'DELIVERY'} — collect ${inr(o.totalAmount)}</div>`
    const eta = etaRange(o)
    const html = layout(cfg, `New order ${o.orderNumber}`, `
${section('New order', `<div style="font:bold 26px Arial">${esc(o.orderNumber)}</div><div style="color:#666;font-size:13px;margin:4px 0 12px">${when(o.createdAt)}</div>${banner}`)}
${section('Customer', `<div style="font-size:15px"><b>${esc(o.customerName)}</b><br><a href="${tel(o.customerPhone)}" style="color:#151412;font-weight:bold">${esc(o.customerPhone)}</a><br><a href="mailto:${esc(o.customerEmail)}" style="color:#555">${esc(o.customerEmail)}</a></div>`)}
${section(o.orderType === 'Delivery' ? 'Delivery address' : 'Order type', `<div style="font-size:14px;line-height:1.5">${esc(addressText(o))}</div>
${o.deliveryInstructions ? `<div style="margin-top:8px;font-size:13px"><b>Instructions:</b> ${esc(o.deliveryInstructions)}</div>` : ''}
${map ? `<div style="margin-top:10px;font-size:13px">GPS shared by customer: ${o.latitude}, ${o.longitude}<br><a href="${map}" style="display:inline-block;margin-top:6px;background:#151412;color:#F5B921;padding:9px 14px;text-decoration:none;font-weight:bold">OPEN IN GOOGLE MAPS</a><div style="color:#888;font-size:11px;margin-top:4px">GPS is approximate and does not replace the written address.</div></div>` : ''}`)}
${section('Items', itemsTable(o))}
${section('Payment &amp; timing', `<div style="font-size:14px;line-height:1.7">Method: <b>${o.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay (online)'}</b><br>Status: <b>${esc(o.paymentStatus)}</b><br>Type: <b>${esc(o.orderType)}</b><br>Preparation: ~${o.estimatedPreparationMinutes} min${o.orderType === 'Delivery' ? ` · Delivery: ~${o.estimatedDeliveryMinutes} min` : ''}<br>Promised to customer: <b>${eta.minutes}</b> (around ${eta.clock})</div><div style="height:20px"></div>`)}`)
    const text = `NEW ORDER ${o.orderNumber}\n${o.customerName} ${o.customerPhone}\n${addressText(o)}\n${map || ''}\nTotal ${inr(o.totalAmount)} — ${o.paymentMethod} (${o.paymentStatus})`
    return { subject: `New order ${o.orderNumber} · ${o.orderType} · ${inr(o.totalAmount)}`, html, text }
}

export function customerEmail(o, cfg) {
    const eta = etaRange(o)
    const html = layout(cfg, `Thanks for your order ${o.orderNumber}`, `
${section('Thank you', `<div style="font:bold 24px Arial">Thanks, ${esc(o.customerName.split(' ')[0])}! Your order is in.</div><div style="margin-top:6px;color:#555">Order <b>${esc(o.orderNumber)}</b> · ${when(o.createdAt)}</div>`)}
${section('Estimated time (approximate)', `<div style="font-size:15px">Your food should be ${o.orderType === 'Delivery' ? 'with you' : 'ready'} in approximately <b>${eta.minutes}</b> (around ${eta.clock}). This is an estimate and may vary with kitchen load and traffic.</div>`)}
${section('Your order', itemsTable(o))}
${section('Payment', `<div style="font-size:14px">${o.paymentMethod === 'COD' ? 'Cash on ' + (o.orderType === 'Pickup' ? 'pickup' : 'delivery') : 'Paid online via Razorpay'} · Status: <b>${esc(o.paymentStatus)}</b></div>`)}
${section(o.orderType === 'Delivery' ? 'Delivering to' : 'Pickup', `<div style="font-size:14px;line-height:1.5">${esc(addressText(o))}</div>`)}
${section('Need help?', `<div style="font-size:14px">Call us on <a href="${tel(cfg.phone)}" style="color:#151412;font-weight:bold">${esc(cfg.phone)}</a> and quote your order number.</div><div style="height:20px"></div>`)}`)
    return { subject: `Order ${o.orderNumber} confirmed — ${cfg.restaurantName}`, html, text: `Thanks ${o.customerName}! Order ${o.orderNumber}, total ${inr(o.totalAmount)}. Estimated ${eta.minutes}.` }
}

export function statusEmail(o, cfg) {
    const msg = {
        Confirmed: 'Great news — the kitchen has confirmed your order and will start preparing it shortly.',
        'Out for Delivery': 'Your order is on its way to you.',
        Cancelled: 'Your order has been cancelled. If you paid online, please contact us about your refund.',
    }[o.orderStatus] || `Your order status is now ${o.orderStatus}.`
    const html = layout(cfg, `Order ${o.orderNumber}: ${o.orderStatus}`,
        section(esc(o.orderStatus), `<div style="font:bold 22px Arial">Order ${esc(o.orderNumber)}</div><p style="font-size:15px;line-height:1.5">${esc(msg)}</p><p style="font-size:14px">Questions? <a href="${tel(cfg.phone)}" style="color:#151412;font-weight:bold">${esc(cfg.phone)}</a></p>`))
    return { subject: `Order ${o.orderNumber}: ${o.orderStatus}`, html, text: `${msg} (Order ${o.orderNumber})` }
}