import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const num = ['basePrepMinutes', 'extraPrepPerItem', 'maxExtraPrepMinutes', 'deliveryMinutes', 'bufferMinutes', 'deliveryCharge', 'freeDeliveryAbove', 'taxPercent', 'couponPercent', 'couponMinSubtotal', 'couponMaxDiscount']
const labels = {
    basePrepMinutes: 'Base preparation (min)', extraPrepPerItem: 'Extra prep per item beyond 2 (min)', maxExtraPrepMinutes: 'Max extra prep (min)',
    deliveryMinutes: 'Delivery time (min)', bufferMinutes: 'Estimate range buffer (min)', deliveryCharge: 'Delivery charge (₹)',
    freeDeliveryAbove: 'Free delivery above (₹)', taxPercent: 'Tax (%)', couponPercent: 'Coupon discount (%)', couponMinSubtotal: 'Coupon min subtotal (₹)', couponMaxDiscount: 'Coupon max discount (₹)',
}

export default function SettingsTab() {
    const [f, setF] = useState(null)
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    useEffect(() => {
        api.admin.settings().then(({ settings: s }) => setF({
            ...s, addressText: (s.addressLines || []).join('\n'), hoursText: (s.hours || []).map((h) => `${h.days} | ${h.time}`).join('\n'),
            instagram: s.social?.instagram || '', facebook: s.social?.facebook || '', youtube: s.social?.youtube || '',
        })).catch((e) => setErr(e.message))
    }, [])
    if (!f) return <p>{err || 'Loading…'}</p>
    const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

    async function save(e) {
        e.preventDefault(); setErr(''); setMsg('')
        const body = {
            restaurantName: f.restaurantName, tagline: f.tagline || '', logoUrl: f.logoUrl || '', phone: f.phone || '', contactEmail: f.contactEmail || '', orderEmail: f.orderEmail || '',
            addressLines: f.addressText.split('\n').map((l) => l.trim()).filter(Boolean), mapQuery: f.mapQuery || '',
            hours: f.hoursText.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [days, time] = l.split('|'); return { days: (days || '').trim(), time: (time || '').trim() } }),
            social: { instagram: f.instagram, facebook: f.facebook, youtube: f.youtube }, acceptingOrders: !!f.acceptingOrders,
            ...Object.fromEntries(num.map((k) => [k, Number(f[k]) || 0])), couponCode: f.couponCode || '',
        }
        try { await api.admin.saveSettings(body); setMsg('Saved. Changes are live immediately.') } catch (x) { setErr(x.message) }
    }
    const T = ({ k, l, ...p }) => <div><label className="label" htmlFor={k}>{l}</label><input id={k} className="field" value={f[k] ?? ''} onChange={set(k)} {...p} /></div>

    return (
        <form onSubmit={save} className="max-w-3xl space-y-8">
            <label className="flex items-center gap-3 border-2 border-ink bg-cream p-4 font-bold"><input type="checkbox" className="h-5 w-5" checked={!!f.acceptingOrders} onChange={set('acceptingOrders')} /> Accepting online orders</label>
            <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="kicker mb-3 text-ember">Restaurant</legend>
                <T k="restaurantName" l="Name" required /><T k="tagline" l="Tagline" /><T k="logoUrl" l="Logo URL (optional, https)" /><T k="phone" l="Phone" />
                <T k="contactEmail" l="Public contact email" type="email" /><T k="orderEmail" l="Email that receives NEW ORDERS" type="email" />
                <div className="sm:col-span-2"><label className="label" htmlFor="at">Address (one line per row)</label><textarea id="at" rows={3} className="field" value={f.addressText} onChange={set('addressText')} /></div>
                <div className="sm:col-span-2"><T k="mapQuery" l="Google Maps search text (address or place name)" /></div>
                <div className="sm:col-span-2"><label className="label" htmlFor="ht">Opening hours (one per line: Days | Time)</label><textarea id="ht" rows={3} className="field" value={f.hoursText} onChange={set('hoursText')} /></div>
                <T k="instagram" l="Instagram URL" /><T k="facebook" l="Facebook URL" /><T k="youtube" l="YouTube URL" />
            </fieldset>
            <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="kicker mb-3 text-ember">Pricing &amp; timing</legend>
                {num.slice(0, 8).map((k) => <T key={k} k={k} l={labels[k]} type="number" min="0" />)}
            </fieldset>
            <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="kicker mb-3 text-ember">Coupon (leave code empty to disable)</legend>
                <T k="couponCode" l="Code" />{num.slice(8).map((k) => <T key={k} k={k} l={labels[k]} type="number" min="0" />)}
            </fieldset>
            {err && <p role="alert" className="font-bold text-ember">{err}</p>}{msg && <p role="status" className="font-bold text-green-700">{msg}</p>}
            <button className="btn btn-ink">Save settings</button>
        </form>
    )
}