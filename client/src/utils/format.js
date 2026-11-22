export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
export const telHref = (p) => `tel:${String(p || '').replace(/[^\d+]/g, '')}`
export const clock = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
export const etaRange = (o) => {
    const lo = (o.estimatedPreparationMinutes || 0) + (o.estimatedDeliveryMinutes || 0)
    return { lo, hi: lo + (o.estimatedBufferMinutes || 0) }
}
export const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`