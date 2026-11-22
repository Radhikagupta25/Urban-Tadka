import { inr } from '../utils/format'

export default function Totals({ quote, loading, error }) {
    if (error) return <p role="alert" className="text-sm text-ember">{error}</p>
    if (!quote) return <p className="text-sm text-ink/50">{loading ? 'Calculating…' : 'Add items to see totals.'}</p>
    const R = ({ l, v, bold }) => <div className={`flex justify-between ${bold ? 'border-t-2 border-ink pt-3 text-lg font-bold' : 'text-sm'}`}><span>{l}</span><span>{v}</span></div>
    return (
        <div className={`space-y-2 ${loading ? 'opacity-60' : ''}`} aria-live="polite">
            <R l="Subtotal" v={inr(quote.subtotal)} />
            {quote.discount > 0 && <R l={`Discount (${quote.couponCode})`} v={`− ${inr(quote.discount)}`} />}
            <R l="Delivery" v={quote.deliveryCharge ? inr(quote.deliveryCharge) : 'Free'} />
            <R l="Tax" v={inr(quote.tax)} />
            <R l="To pay" v={inr(quote.totalAmount)} bold />
            {quote.deliveryCharge > 0 && quote.freeDeliveryAbove > 0 && <p className="text-xs text-ink/55">Free delivery on orders of {inr(quote.freeDeliveryAbove)} or more.</p>}
        </div>
    )
}