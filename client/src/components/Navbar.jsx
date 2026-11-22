import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../context/CartContext'

const links = [['Home', '/'], ['Menu', '/menu'], ['Our Story', '/#story'], ['Offers', '/#offers'], ['Contact', '/#contact']]

export default function Navbar() {
    const { count, setOpen } = useCart()
    const [menu, setMenu] = useState(false)
    const loc = useLocation()
    useEffect(() => setMenu(false), [loc.pathname, loc.hash])
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setMenu(false)
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    return (
        <header className="sticky top-0 z-40 border-b-2 border-mustard bg-ink">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Primary">
                <Logo />
                <ul className="hidden items-center gap-8 lg:flex">
                    {links.map(([l, to]) => <li key={l}><Link to={to} className="text-sm font-medium uppercase tracking-wider text-cream/80 hover:text-mustard">{l}</Link></li>)}
                </ul>
                <div className="flex items-center gap-3">
                    <button onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`} className="relative p-2 text-cream hover:text-mustard">
                        <ShoppingBag size={24} />
                        {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center bg-mustard px-1 text-xs font-bold text-ink">{count}</span>}
                    </button>
                    <Link to="/menu" className="btn btn-mustard hidden !border-mustard !py-2 lg:inline-flex">Order Now</Link>
                    <button className="p-2 text-cream lg:hidden" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu ? 'Close menu' : 'Open menu'}>
                        {menu ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </nav>
            {menu && (
                <div id="mobile-nav" className="border-t border-cream/10 bg-ink px-5 pb-6 lg:hidden">
                    <ul>{links.map(([l, to]) => <li key={l} className="border-b border-cream/10"><Link to={to} className="block py-4 font-display text-3xl uppercase text-cream">{l}</Link></li>)}</ul>
                    <Link to="/menu" className="btn btn-mustard mt-6 w-full !border-mustard">Order Now</Link>
                </div>
            )}
        </header>
    )
}