import { useEffect, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import SmartImage from './SmartImage'
import VegMark from './Vegmark'
import { useCart } from '../context/CartContext'
import { inr } from '../utils/format'

function Customise({ item, onClose }) {
    const { add } = useCart()
    const [picked, setPicked] = useState([])
    const [qty, setQty] = useState(1)
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose()
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])
    const chosen = item.addons.filter((a) => picked.includes(a._id))
    const unit = item.price + chosen.reduce((t, a) => t + a.price, 0)
    const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Customise ${item.name}`} onClick={onClose}>
            <div className="w-full max-w-md border-2 border-ink bg-cream p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4"><h3 className="display text-3xl">{item.name}</h3><button onClick={onClose} aria-label="Close"><X /></button></div>
                <fieldset className="mt-4">
                    <legend className="kicker mb-2 text-ink/60">Add-ons</legend>
                    {item.addons.map((a) => (
                        <label key={a._id} className="flex cursor-pointer items-center justify-between border-b border-ink/15 py-3">
                            <span className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-ink" checked={picked.includes(a._id)} onChange={() => toggle(a._id)} />{a.name}</span>
                            <span className="text-sm font-bold">+ {inr(a.price)}</span>
                        </label>
                    ))}
                </fieldset>
                <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center border-2 border-ink">
                        <button className="p-2" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
                        <span className="w-8 text-center font-bold">{qty}</span>
                        <button className="p-2" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(20, q + 1))}><Plus size={16} /></button>
                    </div>
                    <button className="btn btn-ink flex-1" onClick={() => { add(item, chosen, qty); onClose() }}>Add · {inr(unit * qty)}</button>
                </div>
            </div>
        </div>
    )
}

export default function FoodCard({ item }) {
    const { add } = useCart()
    const [custom, setCustom] = useState(false)
    const sold = !item.isAvailable
    return (
        <article className="group flex flex-col border-2 border-ink bg-cream">
            <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink">
                <SmartImage src={item.image} alt={item.name} className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${sold ? 'grayscale' : ''}`} />
                {item.isBestseller && <span className="absolute left-0 top-3 bg-ember px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cream">Bestseller</span>}
                {sold && <span className="absolute inset-0 flex items-center justify-center bg-ink/60 font-display text-3xl uppercase text-cream">Sold out</span>}
            </div>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2"><VegMark veg={item.isVeg} /><span className="kicker text-ink/45">{item.category}</span></div>
                <h3 className="mt-2 font-display text-3xl uppercase leading-none">{item.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{item.description}</p>
                <div className="mt-5 flex items-center justify-between">
                    <span className="font-display text-3xl">{inr(item.price)}</span>
                    <button disabled={sold} className="btn btn-ink !px-4 !py-2" onClick={() => (item.addons?.length ? setCustom(true) : add(item))}
                        aria-label={`${item.addons?.length ? 'Customise and add' : 'Add'} ${item.name} to cart`}>
                        {item.addons?.length ? 'Customise' : 'Add'}
                    </button>
                </div>
            </div>
            {custom && <Customise item={item} onClose={() => setCustom(false)} />}
        </article>
    )
}