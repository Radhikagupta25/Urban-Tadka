import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useQuote } from '../hooks/useQuote'
import Totals from './Totals'
import SmartImage from './SmartImage'
import VegMark from './Vegmark'
import { inr } from '../utils/format'

export default function CartDrawer() {
    const { items, open, setOpen, setQty, remove } = useCart()
    const { quote, loading, error } = useQuote(items, 'Delivery')
    const issueFor = (id) => quote?.issues.find((i) => i.menuItemId === id)

    useEffect(() => {
        if (!open) return
        const onKey = (e) => e.key === 'Escape' && setOpen(false)
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
    }, [open, setOpen])

    if (!open) return null
    const blocked = !items.length || !quote || quote.issues.length > 0

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your cart">
            <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-2 border-ink bg-cream">
                <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
                    <h2 className="display text-3xl">Your cart</h2>
                    <button onClick={() => setOpen(false)} aria-label="Close cart" className="p-1"><X size={26} /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-5">
                    {!items.length ? (
                        <div className="py-20 text-center"><p className="display text-4xl">Nothing here yet</p><Link to="/menu" onClick={() => setOpen(false)} className="btn btn-mustard mt-6">Browse the menu</Link></div>
                    ) : items.map((i) => (
                        <div key={i.key} className="flex gap-4 border-b border-ink/15 py-4">
                            <SmartImage src={i.image} alt={i.name} className="h-20 w-20 shrink-0 object-cover" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2"><VegMark veg={i.isVeg} /><p className="font-bold leading-tight">{i.name}</p></div>
                                {i.addons.length > 0 && <p className="mt-1 text-xs text-ink/60">+ {i.addons.map((a) => a.name).join(', ')}</p>}
                                {issueFor(i.menuItemId) && <p role="alert" className="mt-1 text-xs font-bold text-ember">{issueFor(i.menuItemId).message}</p>}
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center border-2 border-ink">
                                        <button className="p-1.5" aria-label={`Decrease ${i.name}`} onClick={() => setQty(i.key, i.quantity - 1)}><Minus size={14} /></button>
                                        <span className="w-8 text-center text-sm font-bold" aria-live="polite">{i.quantity}</span>
                                        <button className="p-1.5" aria-label={`Increase ${i.name}`} onClick={() => setQty(i.key, i.quantity + 1)}><Plus size={14} /></button>
                                    </div>
                                    <span className="text-sm font-bold">{inr((i.price + i.addons.reduce((t, a) => t + a.price, 0)) * i.quantity)}</span>
                                    <button onClick={() => remove(i.key)} aria-label={`Remove ${i.name}`} className="p-1 text-ink/60 hover:text-ember"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {items.length > 0 && (
                    <div className="border-t-2 border-ink p-5">
                        <Totals quote={quote} loading={loading} error={error} />
                        <p className="mt-2 text-[11px] text-ink/50">Prices shown are confirmed by our server at checkout. Delivery charge applies to delivery orders.</p>
                        <Link to="/checkout" onClick={(e) => { if (blocked) e.preventDefault(); else setOpen(false) }} aria-disabled={blocked}
                            className={`btn btn-ink mt-4 w-full ${blocked ? 'pointer-events-none opacity-50' : ''}`}>Checkout</Link>
                    </div>
                )}
            </aside>
        </div>
    )
}