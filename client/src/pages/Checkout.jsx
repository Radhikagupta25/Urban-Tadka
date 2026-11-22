import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, LocateFixed, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useConfig } from '../context/ConfigContext'
import { useQuote } from '../hooks/useQuote'
import { api } from '../services/api'
import { payWithRazorpay } from '../services/razorpay'
import { mapsLink } from '../utils/format'
import Totals from '../components/Totals'

const empty = { name: '', phone: '', email: '', flat: '', line: '', landmark: '', city: '', pincode: '', instructions: '' }

function validate(v, type) {
    const e = {}
    if (v.name.trim().length < 2) e.name = 'Enter your full name.'
    if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(v.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid 10-digit mobile number.'
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Enter a valid email address.'
    if (type === 'Delivery') {
        if (!v.flat.trim()) e.flat = 'Flat / house number is required.'
        if (v.line.trim().length < 5) e.line = 'Enter your full delivery address.'
        if (!v.city.trim()) e.city = 'City is required.'
        if (!/^\d{6}$/.test(v.pincode.trim())) e.pincode = 'Enter a 6-digit pincode.'
    }
    return e
}

function Field({ id, label, error, children }) {
    return <div><label htmlFor={id} className="label">{label}</label>{children}{error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-bold text-ember">{error}</p>}</div>
}

export default function Checkout() {
    const { items, clear } = useCart()
    const { config } = useConfig()
    const nav = useNavigate()
    const [v, setV] = useState(empty)
    const [errs, setErrs] = useState({})
    const [type, setType] = useState('Delivery')
    const [pay, setPay] = useState('Razorpay')
    const [coupon, setCoupon] = useState('')
    const [applied, setApplied] = useState('')
    const [loc, setLoc] = useState(null)
    const [locMsg, setLocMsg] = useState('')
    const [busy, setBusy] = useState(false)
    const [serverErr, setServerErr] = useState('')
    const keyRef = useRef({ h: '', key: '' })
    const { quote, loading, error } = useQuote(items, type, applied)

    const set = (k) => (e) => { setV((s) => ({ ...s, [k]: e.target.value })); if (errs[k]) setErrs((x) => ({ ...x, [k]: undefined })) }
    const aria = (k) => ({ 'aria-invalid': !!errs[k], 'aria-describedby': errs[k] ? `${k}-err` : undefined })

    function getLocation() {
        setLocMsg('')
        if (!navigator.geolocation) return setLocMsg('Location is not supported on this device. Please type your address.')
        navigator.geolocation.getCurrentPosition(
            (p) => setLoc({ latitude: +p.coords.latitude.toFixed(6), longitude: +p.coords.longitude.toFixed(6) }),
            (err) => setLocMsg(err.code === 1 ? 'Location permission was denied. No problem — just type your address below.' : 'We could not get your location. Please type your address.'),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
    }

    // One idempotency key per distinct payload, so a retry reuses the same order but an edited cart gets a new one.
    const keyFor = (payload) => {
        const h = JSON.stringify(payload)
        if (keyRef.current.h !== h) keyRef.current = { h, key: crypto.randomUUID() }
        return keyRef.current.key
    }

    async function submit(e) {
        e.preventDefault(); setServerErr('')
        const found = validate(v, type); setErrs(found)
        if (Object.keys(found).length) { setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0); return }
        if (!items.length || !quote || quote.issues.length) return
        const base = {
            items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, addonIds: i.addonIds })),
            orderType: type, couponCode: applied || undefined,
            customer: { name: v.name, phone: v.phone, email: v.email },
            address: type === 'Delivery' ? { flat: v.flat, line: v.line, landmark: v.landmark, city: v.city, pincode: v.pincode } : undefined,
            location: loc || undefined, instructions: v.instructions || undefined, paymentMethod: pay,
        }
        const payload = { ...base, idempotencyKey: keyFor(base) }
        setBusy(true)
        try {
            if (pay === 'COD') {
                const r = await api.placeCod(payload)
                clear(); nav(`/order/${r.order.orderNumber}`, { state: { order: r.order } })
                return
            }
            const s = await api.createPayment(payload)
            if (s.alreadyPaid) { clear(); nav(`/order/${s.order.orderNumber}`, { state: { order: s.order } }); return }
            const res = await payWithRazorpay(s)
            if (res.status === 'paid') {
                clear()
                try { const r = await api.verifyPayment(res.response); nav(`/order/${r.order.orderNumber}`, { state: { order: r.order } }) }
                catch { nav(`/track?order=${s.orderNumber}`, { state: { notice: 'We received your payment but could not confirm it just yet. Your order will be confirmed automatically — check your email, or look it up here with your phone number.' } }) }
            } else if (res.status === 'failed') {
                setServerErr(`Payment failed: ${res.error}. No order has been placed. If money was debited, it will be reversed by your bank — contact us with reference ${s.orderNumber} if it is not.`)
            } else setServerErr('Payment cancelled. Your cart is saved — you can try again or choose Cash on Delivery.')
        } catch (err) { setServerErr(err.message) }
        finally { setBusy(false) }
    }

    if (!items.length) return <div className="px-5 py-32 text-center"><p className="display text-6xl">Your cart is empty</p><Link to="/menu" className="btn btn-mustard mt-8">Browse the menu</Link></div>
    const blocked = busy || !quote || quote.issues.length > 0 || !config.acceptingOrders

    return (
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            <h1 className="display text-6xl md:text-8xl">Checkout</h1>
            <form onSubmit={submit} noValidate className="mt-10 grid gap-12 lg:grid-cols-12">
                <div className="space-y-10 lg:col-span-7">
                    <fieldset><legend className="kicker mb-3 text-ember">Order type</legend>
                        <div className="grid grid-cols-2 gap-3">
                            {[['Delivery', 'Home delivery'], ['Pickup', 'Takeaway / pickup']].map(([val, l]) => (
                                <label key={val} className={`cursor-pointer border-2 border-ink p-4 text-center font-bold uppercase tracking-wider ${type === val ? 'bg-ink text-mustard' : 'hover:bg-mustard'}`}>
                                    <input type="radio" name="type" className="sr-only" checked={type === val} onChange={() => setType(val)} />{l}</label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="grid gap-5 sm:grid-cols-2"><legend className="kicker mb-3 text-ember">Your details</legend>
                        <Field id="name" label="Full name" error={errs.name}><input id="name" autoComplete="name" className="field" value={v.name} onChange={set('name')} {...aria('name')} /></Field>
                        <Field id="phone" label="Mobile number" error={errs.phone}><input id="phone" type="tel" autoComplete="tel" className="field" value={v.phone} onChange={set('phone')} placeholder="98765 43210" {...aria('phone')} /></Field>
                        <div className="sm:col-span-2"><Field id="email" label="Email (for your confirmation)" error={errs.email}><input id="email" type="email" autoComplete="email" className="field" value={v.email} onChange={set('email')} {...aria('email')} /></Field></div>
                    </fieldset>

                    {type === 'Delivery' && (
                        <fieldset className="grid gap-5 sm:grid-cols-2"><legend className="kicker mb-3 text-ember">Delivery address</legend>
                            <div className="sm:col-span-2">
                                <button type="button" onClick={getLocation} className="btn btn-line"><LocateFixed size={16} /> Use my current location</button>
                                {loc && <p className="mt-3 flex flex-wrap items-center gap-2 border-2 border-green-700 bg-green-50 p-3 text-sm" role="status"><CheckCircle2 className="text-green-700" size={18} /> Location shared. <a className="font-bold underline" href={mapsLink(loc.latitude, loc.longitude)} target="_blank" rel="noopener noreferrer">Check on Google Maps</a>
                                    <button type="button" onClick={() => setLoc(null)} className="ml-auto flex items-center gap-1 text-xs font-bold uppercase"><X size={14} /> Remove</button></p>}
                                {locMsg && <p role="alert" className="mt-3 text-sm font-bold text-ember">{locMsg}</p>}
                                <p className="mt-2 text-xs text-ink/55">Optional. Shared only when you press the button. GPS helps our rider but does not replace your full address below.</p>
                            </div>
                            <Field id="flat" label="Flat / house no." error={errs.flat}><input id="flat" className="field" value={v.flat} onChange={set('flat')} {...aria('flat')} /></Field>
                            <Field id="landmark" label="Landmark (optional)"><input id="landmark" className="field" value={v.landmark} onChange={set('landmark')} /></Field>
                            <div className="sm:col-span-2"><Field id="line" label="Street / area" error={errs.line}><input id="line" autoComplete="street-address" className="field" value={v.line} onChange={set('line')} {...aria('line')} /></Field></div>
                            <Field id="city" label="City" error={errs.city}><input id="city" autoComplete="address-level2" className="field" value={v.city} onChange={set('city')} {...aria('city')} /></Field>
                            <Field id="pincode" label="Pincode" error={errs.pincode}><input id="pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" className="field" value={v.pincode} onChange={set('pincode')} {...aria('pincode')} /></Field>
                            <div className="sm:col-span-2"><Field id="instructions" label="Delivery instructions (optional)"><textarea id="instructions" rows={2} className="field" value={v.instructions} onChange={set('instructions')} /></Field></div>
                        </fieldset>
                    )}

                    <fieldset><legend className="kicker mb-3 text-ember">Payment</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[['Razorpay', 'Pay online', 'UPI, cards, netbanking'], ['COD', type === 'Pickup' ? 'Pay at pickup' : 'Cash on delivery', 'Pay when you receive']].map(([val, t, s]) => (
                                <label key={val} className={`cursor-pointer border-2 border-ink p-4 ${pay === val ? 'bg-ink text-cream' : 'hover:bg-mustard'}`}>
                                    <input type="radio" name="pay" className="sr-only" checked={pay === val} onChange={() => setPay(val)} />
                                    <span className="block font-bold uppercase tracking-wider">{t}</span><span className="text-sm opacity-70">{s}</span></label>
                            ))}
                        </div>
                    </fieldset>
                </div>

                <aside className="lg:col-span-5">
                    <div className="border-2 border-ink bg-cream-deep p-6 lg:sticky lg:top-24">
                        <h2 className="display text-4xl">Summary</h2>
                        <ul className="mt-4 divide-y divide-ink/15 text-sm">{items.map((i) => <li key={i.key} className="flex justify-between gap-3 py-2"><span>{i.quantity} × {i.name}{i.addons.length > 0 && <span className="block text-xs text-ink/55">+ {i.addons.map((a) => a.name).join(', ')}</span>}</span></li>)}</ul>
                        <div className="mt-4 flex gap-2">
                            <input aria-label="Coupon code" className="field !py-2 uppercase" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                            <button type="button" className="btn btn-line !py-2" onClick={() => setApplied(coupon.trim())}>Apply</button>
                        </div>
                        {quote?.couponMessage && <p className="mt-1 text-xs font-bold text-ember">{quote.couponMessage}</p>}
                        <div className="mt-5"><Totals quote={quote} loading={loading} error={error} /></div>
                        {quote?.issues.map((i, k) => <p key={k} role="alert" className="mt-3 text-sm font-bold text-ember">{i.message}</p>)}
                        {quote && <p className="mt-3 text-xs text-ink/60">Estimated {type === 'Delivery' ? 'arrival' : 'ready time'} (approximate): {quote.estimates.estimatedPreparationMinutes + quote.estimates.estimatedDeliveryMinutes}–{quote.estimates.estimatedPreparationMinutes + quote.estimates.estimatedDeliveryMinutes + quote.estimates.estimatedBufferMinutes} minutes.</p>}
                        {serverErr && <p role="alert" className="mt-4 border-2 border-ember p-3 text-sm font-bold text-ember">{serverErr}</p>}
                        <button type="submit" disabled={blocked} className="btn btn-ink mt-5 w-full">{busy ? 'Please wait…' : pay === 'COD' ? 'Place order' : 'Pay & place order'}</button>
                        {!config.acceptingOrders && <p className="mt-2 text-xs font-bold text-ember">Online ordering is paused. Please call {config.phone}.</p>}
                    </div>
                </aside>
            </form>
        </div>
    )
}