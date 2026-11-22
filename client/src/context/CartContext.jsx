import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'ut_cart_v1' // item ids + quantities only; no personal data
const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

const load = () => {
    try {
        const v = JSON.parse(localStorage.getItem(KEY))
        return Array.isArray(v) ? v.filter((i) => i && i.key && i.menuItemId && Number.isInteger(i.quantity) && i.quantity > 0).slice(0, 40) : []
    } catch { return [] }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(load)
    const [open, setOpen] = useState(false)
    useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignore */ } }, [items])

    const add = useCallback((item, addons = [], quantity = 1) => {
        const addonIds = addons.map((a) => a._id).sort()
        const key = `${item._id}:${addonIds.join(',')}`
        setItems((cur) => {
            const ex = cur.find((i) => i.key === key)
            if (ex) return cur.map((i) => (i.key === key ? { ...i, quantity: Math.min(20, i.quantity + quantity) } : i))
            return [...cur, { key, menuItemId: item._id, name: item.name, image: item.image, isVeg: item.isVeg, price: item.price, addonIds, addons: addons.map((a) => ({ name: a.name, price: a.price })), quantity }]
        })
        setOpen(true)
    }, [])
    const setQty = useCallback((key, q) => setItems((cur) => (q <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, quantity: Math.min(20, q) } : i)))), [])
    const remove = useCallback((key) => setItems((cur) => cur.filter((i) => i.key !== key)), [])
    const clear = useCallback(() => setItems([]), [])
    const count = useMemo(() => items.reduce((t, i) => t + i.quantity, 0), [items])

    return <Ctx.Provider value={{ items, add, setQty, remove, clear, count, open, setOpen }}>{children}</Ctx.Provider>
}