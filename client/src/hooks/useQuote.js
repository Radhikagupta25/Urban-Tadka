import { useEffect, useState } from 'react'
import { api } from '../services/api'

// Totals always come from the server; the browser never calculates what you pay.
export function useQuote(items, orderType, couponCode) {
    const [state, setState] = useState({ quote: null, loading: false, error: '' })
    const sig = JSON.stringify([items.map((i) => [i.menuItemId, i.quantity, i.addonIds]), orderType, couponCode])
    useEffect(() => {
        if (!items.length) { setState({ quote: null, loading: false, error: '' }); return }
        let dead = false
        setState((s) => ({ ...s, loading: true }))
        const t = setTimeout(async () => {
            try {
                const quote = await api.quote({ items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, addonIds: i.addonIds })), orderType, couponCode: couponCode || undefined })
                if (!dead) setState({ quote, loading: false, error: '' })
            } catch (e) { if (!dead) setState({ quote: null, loading: false, error: e.message }) }
        }, 250)
        return () => { dead = true; clearTimeout(t) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sig])
    return state
}