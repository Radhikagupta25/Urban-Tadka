import { useCallback, useEffect, useState } from 'react'
import { api } from '../../services/api'
import { ORDER_STATUSES } from '../../data/constants'
import { inr, telHref } from '../../utils/format'

const FILTERS = [['active', 'Active'], ['done', 'Delivered'], ['cancelled', 'Cancelled'], ['all', 'All history']]
const emailState = (o) => {
    const r = o.notify?.restaurant?.status, c = o.notify?.customer?.status
    return { ok: r === 'sent' && c === 'sent', text: `Restaurant email: ${r || 'pending'} · Customer email: ${c || 'pending'}`, err: o.notify?.restaurant?.lastError || o.notify?.customer?.lastError }
}

export default function OrdersTab() {
    const [filter, setFilter] = useState('active')
    const [orders, setOrders] = useState([])
    const [err, setErr] = useState('')
    const [open, setOpen] = useState(null)
    const [busy, setBusy] = useState('')

    const load = useCallback(async () => {
        try { setOrders((await api.admin.orders(filter)).orders); setErr('') } catch (e) { setErr(e.message) }
    }, [filter])
    useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

    const replace = (o) => setOrders((l) => l.map((x) => (x._id === o._id ? o : x)))
    async function setStatus(o, s) { setBusy(o._id); try { replace((await api.admin.setStatus(o._id, s)).order) } catch (e) { setErr(e.message) } finally { setBusy('') } }
    async function resend(o) { setBusy(o._id); try { replace((await api.admin.resendEmails(o._id)).order) } catch (e) { setErr(e.message) } finally { setBusy('') } }

    return (
        <div>
            <div className="mb-5 flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider ${filter === k ? 'bg-ink text-mustard' : 'bg-cream hover:bg-mustard'}`}>{l}</button>)}</div>
            {err && <p role="alert" className="mb-4 font-bold text-ember">{err}</p>}
            {!orders.length && <p className="py-10 text-center text-ink/55">No orders here yet. This list refreshes every 30 seconds.</p>}
            <ul className="space-y-3">
                {orders.map((o) => {
                    const es = emailState(o), a = o.deliveryAddress
                    return (
                        <li key={o._id} className="border-2 border-ink bg-cream">
                            <div className="flex flex-wrap items-center gap-3 p-4">
                                <button className="flex-1 text-left" onClick={() => setOpen(open === o._id ? null : o._id)} aria-expanded={open === o._id}>
                                    <span className="font-mono font-bold">{o.orderNumber}</span> · {o.customerName}
                                    <span className="block text-xs text-ink/60">{new Date(o.createdAt).toLocaleString('en-IN')} · {o.orderType} · {o.items.reduce((t, i) => t + i.quantity, 0)} items</span>
                                </button>
                                <span className="font-bold">{inr(o.totalAmount)}</span>
                                <span className={`px-2 py-1 text-xs font-bold uppercase ${o.paymentStatus === 'Paid' ? 'bg-green-200' : 'bg-mustard'}`}>{o.paymentMethod === 'COD' ? 'COD' : 'Online'} · {o.paymentStatus}</span>
                                <label className="sr-only" htmlFor={`s-${o._id}`}>Order status</label>
                                <select id={`s-${o._id}`} className="field !w-auto !py-2" value={o.orderStatus} disabled={busy === o._id} onChange={(e) => setStatus(o, e.target.value)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                            </div>
                            {open === o._id && (
                                <div className="grid gap-6 border-t-2 border-ink p-4 text-sm md:grid-cols-3">
                                    <div><p className="kicker text-ember">Customer</p><p className="mt-1"><b>{o.customerName}</b><br /><a className="font-bold underline" href={telHref(o.customerPhone)}>{o.customerPhone}</a><br />{o.customerEmail}</p></div>
                                    <div><p className="kicker text-ember">{o.orderType === 'Delivery' ? 'Delivery' : 'Pickup'}</p>
                                        {o.orderType === 'Delivery' && a && <p className="mt-1">{a.flat}, {a.line}{a.landmark && `, near ${a.landmark}`}<br />{a.city} {a.pincode}</p>}
                                        {o.deliveryInstructions && <p className="mt-1"><b>Note:</b> {o.deliveryInstructions}</p>}
                                        {o.mapsLink && <a className="mt-2 inline-block font-bold underline" href={o.mapsLink} target="_blank" rel="noopener noreferrer">Open customer location in Google Maps</a>}</div>
                                    <div><p className="kicker text-ember">Items</p><ul className="mt-1">{o.items.map((i, k) => <li key={k}>{i.quantity} × {i.name}{i.addons?.length > 0 && ` (+ ${i.addons.map((x) => x.name).join(', ')})`}</li>)}</ul>
                                        <p className="mt-2">Subtotal {inr(o.subtotal)} · Delivery {inr(o.deliveryCharge)} · Tax {inr(o.tax)}<br /><b>Total {inr(o.totalAmount)}</b></p></div>
                                    <div className="md:col-span-3 border-t border-ink/15 pt-3">
                                        <p className={es.ok ? 'text-green-700' : 'font-bold text-ember'}>{es.text}</p>
                                        {es.err && <p className="text-xs text-ink/55">Last error: {es.err}</p>}
                                        {!es.ok && <button className="btn btn-line mt-2 !py-1.5" disabled={busy === o._id} onClick={() => resend(o)}>Retry emails now</button>}
                                        {o.razorpayPaymentId && <p className="mt-2 text-xs text-ink/55">Razorpay payment: {o.razorpayPaymentId}</p>}
                                    </div>
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}