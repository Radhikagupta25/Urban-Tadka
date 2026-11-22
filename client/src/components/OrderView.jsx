import { useConfig } from '../context/ConfigContext'
import VegMark from './Vegmark'
import { clock, etaRange, inr, telHref } from '../utils/format'

const FLOW = ['Received', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']

export default function OrderView({ order }) {
    const { config } = useConfig()
    const eta = etaRange(order)
    const a = order.deliveryAddress
    const flow = order.orderType === 'Pickup' ? FLOW.filter((s) => s !== 'Out for Delivery') : FLOW
    const idx = flow.indexOf(order.orderStatus)
    return (
        <div className="space-y-8">
            {order.orderStatus === 'Cancelled' ? (
                <p className="border-2 border-ember p-4 font-bold text-ember">This order was cancelled. Call {config.phone} if you have questions.</p>
            ) : (
                <ol className="grid gap-2 sm:grid-cols-5" aria-label="Order progress">
                    {flow.map((s, i) => (
                        <li key={s} className={`border-2 border-ink px-3 py-2 text-xs font-bold uppercase tracking-wider ${i <= idx ? 'bg-mustard' : 'bg-cream text-ink/40'}`} aria-current={i === idx ? 'step' : undefined}>{s}</li>
                    ))}
                </ol>
            )}
            {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                <div className="border-2 border-ink bg-ink p-5 text-cream">
                    <p className="kicker text-mustard">Estimated {order.orderType === 'Delivery' ? 'arrival' : 'pickup'} (approximate)</p>
                    <p className="display mt-1 text-5xl">{eta.lo}–{eta.hi} min</p>
                    <p className="mt-1 text-sm text-cream/70">Around {clock(order.estimatedArrivalAt)} – {clock(new Date(order.estimatedArrivalAt).getTime() + (order.estimatedBufferMinutes || 0) * 60000)}</p>
                    <p className="mt-3 text-xs text-cream/55">Preparation ~{order.estimatedPreparationMinutes} min{order.orderType === 'Delivery' ? ` + delivery ~${order.estimatedDeliveryMinutes} min` : ''}. Estimates are based on usual kitchen times, not live traffic or exact distance.</p>
                </div>
            )}
            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <h3 className="kicker mb-3 text-ember">Items</h3>
                    <ul className="divide-y divide-ink/15">
                        {order.items.map((i, k) => (
                            <li key={k} className="flex justify-between gap-4 py-3"><span className="flex gap-2"><VegMark veg={i.isVeg} /><span>{i.quantity} × {i.name}{i.addons?.length > 0 && <span className="block text-xs text-ink/60">+ {i.addons.map((x) => x.name).join(', ')}</span>}</span></span><span className="font-bold">{inr(i.lineTotal)}</span></li>
                        ))}
                    </ul>
                    <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(order.subtotal)}</dd></div>
                        {order.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>− {inr(order.discount)}</dd></div>}
                        <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryCharge ? inr(order.deliveryCharge) : 'Free'}</dd></div>
                        <div className="flex justify-between"><dt>Tax</dt><dd>{inr(order.tax)}</dd></div>
                        <div className="flex justify-between border-t-2 border-ink pt-2 text-lg font-bold"><dt>Total</dt><dd>{inr(order.totalAmount)}</dd></div>
                    </dl>
                </div>
                <div className="space-y-5 text-sm">
                    <div><h3 className="kicker mb-1 text-ember">Payment</h3><p>{order.paymentMethod === 'COD' ? 'Cash on ' + (order.orderType === 'Pickup' ? 'pickup' : 'delivery') : 'Online (Razorpay)'} · <b>{order.paymentStatus}</b></p></div>
                    <div><h3 className="kicker mb-1 text-ember">{order.orderType === 'Delivery' ? 'Delivering to' : 'Pickup from'}</h3>
                        {order.orderType === 'Delivery' && a
                            ? <p>{a.flat}, {a.line}{a.landmark && `, near ${a.landmark}`}<br />{a.city} {a.pincode}</p>
                            : <p>{config.addressLines.join(', ')}</p>}</div>
                    <div><h3 className="kicker mb-1 text-ember">Need help?</h3><p>Call <a className="font-bold underline" href={telHref(config.phone)}>{config.phone}</a> and quote your order number.</p></div>
                </div>
            </div>
        </div>
    )
}