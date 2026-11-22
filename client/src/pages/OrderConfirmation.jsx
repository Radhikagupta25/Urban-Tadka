import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import OrderView from '../components/OrderView'

export default function OrderConfirmation() {
    const { orderNumber } = useParams()
    const { state } = useLocation()
    const order = state?.order
    // Order details are never in the URL or storage; after a refresh, customers verify with their phone number.
    if (!order) return <Navigate to={`/track?order=${encodeURIComponent(orderNumber)}`} replace />
    const paid = order.paymentStatus === 'Paid'
    return (
        <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
            <div className="text-center">
                <motion.svg width="96" height="96" viewBox="0 0 96 96" className="mx-auto" aria-hidden="true" initial="h" animate="v">
                    <motion.circle cx="48" cy="48" r="44" fill="#F5B921" stroke="#151412" strokeWidth="4" variants={{ h: { scale: 0.6, opacity: 0 }, v: { scale: 1, opacity: 1 } }} transition={{ duration: 0.4 }} />
                    <motion.path d="M28 50 L43 65 L70 34" fill="none" stroke="#151412" strokeWidth="7" strokeLinecap="square" variants={{ h: { pathLength: 0 }, v: { pathLength: 1 } }} transition={{ duration: 0.5, delay: 0.35 }} />
                </motion.svg>
                <h1 className="display mt-6 text-6xl md:text-8xl">{paid || order.paymentMethod === 'COD' ? 'Order placed!' : 'Order received'}</h1>
                <p className="mt-3 text-lg">Order number <b className="bg-ink px-2 py-1 font-mono text-mustard">{order.orderNumber}</b></p>
                <p className="mt-2 text-sm text-ink/65">A confirmation has been emailed to you. Keep your order number and phone number to track your order.</p>
            </div>
            <div className="mt-12 border-2 border-ink bg-cream p-6 sm:p-8"><OrderView order={order} /></div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/menu" className="btn btn-mustard">Continue browsing</Link>
                <Link to={`/track?order=${order.orderNumber}`} className="btn btn-line">Track this order</Link>
            </div>
        </div>
    )
}