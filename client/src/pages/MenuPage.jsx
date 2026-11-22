import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import { useMenu } from '../hooks/useMenu'
import { CATEGORIES } from '../data/constants'

export default function MenuPage() {
    const { items, loading, error } = useMenu()
    const [params, setParams] = useSearchParams()
    const [q, setQ] = useState('')
    const [vegOnly, setVegOnly] = useState(false)
    const cat = CATEGORIES.includes(params.get('cat')) ? params.get('cat') : 'All'

    const filtered = useMemo(() => items.filter((i) =>
        (cat === 'All' || i.category === cat) && (!vegOnly || i.isVeg) &&
        (!q.trim() || `${i.name} ${i.description}`.toLowerCase().includes(q.trim().toLowerCase()))), [items, cat, q, vegOnly])
    const groups = CATEGORIES.map((c) => [c, filtered.filter((i) => i.category === c)]).filter(([, l]) => l.length)

    return (
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            <h1 className="display text-7xl md:text-9xl">The menu</h1>
            <div className="sticky top-16 z-30 -mx-5 mt-8 border-y-2 border-ink bg-cream px-5 py-3 lg:-mx-8 lg:px-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Menu categories">
                        {['All', ...CATEGORIES].map((c) => (
                            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setParams(c === 'All' ? {} : { cat: c })}
                                className={`shrink-0 border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider ${cat === c ? 'bg-ink text-mustard' : 'hover:bg-mustard'}`}>{c}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" className="h-4 w-4 accent-ink" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only</label>
                        <div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" aria-hidden="true" />
                            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" aria-label="Search dishes" className="field !py-2 pl-9 lg:w-60" /></div>
                    </div>
                </div>
            </div>
            {error && <p role="alert" className="mt-8 text-ember">{error}</p>}
            {loading && <p className="mt-10 animate-pulse">Loading menu…</p>}
            {!loading && !error && groups.length === 0 && <p className="mt-14 text-center font-display text-4xl uppercase text-ink/50">No dishes match your search</p>}
            {groups.map(([c, list]) => (
                <section key={c} id={`cat-${c}`} className="mt-14" aria-labelledby={`h-${c}`}>
                    <h2 id={`h-${c}`} className="display mb-6 text-5xl">{c}</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((i) => <FoodCard key={i._id} item={i} />)}</div>
                </section>
            ))}
        </div>
    )
}