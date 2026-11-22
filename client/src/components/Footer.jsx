import { Link } from 'react-router-dom'
import { Facebook, Instagram, Youtube } from 'lucide-react'
import Logo from './Logo'
import { useConfig } from '../context/ConfigContext'
import { telHref } from '../utils/format'

export default function Footer() {
    const { config: c } = useConfig()
    const socials = [['Instagram', Instagram, c.social.instagram], ['Facebook', Facebook, c.social.facebook], ['YouTube', Youtube, c.social.youtube]].filter((s) => s[2])
    return (
        <footer className="bg-ink text-cream/70">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-12 lg:px-8">
                <div className="md:col-span-5">
                    <Logo />
                    <p className="mt-4 max-w-sm text-sm leading-relaxed">{c.tagline || 'Fresh Indian food, made with love.'}</p>
                    {socials.length > 0 && <div className="mt-5 flex gap-3">{socials.map(([l, Icon, href]) => <a key={l} href={href} target="_blank" rel="noopener noreferrer" aria-label={l} className="flex h-10 w-10 items-center justify-center border-2 border-cream/30 hover:border-mustard hover:text-mustard"><Icon size={18} /></a>)}</div>}
                </div>
                <nav className="md:col-span-3" aria-label="Footer">
                    <h3 className="kicker mb-4 text-mustard">Explore</h3>
                    <ul className="space-y-2 text-sm">
                        {[['Home', '/'], ['Menu', '/menu'], ['Our Story', '/#story'], ['Offers', '/#offers'], ['Contact', '/#contact'], ['Track your order', '/track']].map(([l, to]) => <li key={l}><Link to={to} className="hover:text-mustard">{l}</Link></li>)}
                    </ul>
                </nav>
                <div className="md:col-span-4">
                    <h3 className="kicker mb-4 text-mustard">Contact</h3>
                    <ul className="space-y-2 text-sm">
                        <li>{c.addressLines.join(', ')}</li>
                        {c.phone && <li><a href={telHref(c.phone)} className="hover:text-mustard">{c.phone}</a></li>}
                        {c.contactEmail && <li><a href={`mailto:${c.contactEmail}`} className="break-all hover:text-mustard">{c.contactEmail}</a></li>}
                    </ul>
                </div>
            </div>
            <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/45">© {new Date().getFullYear()} {c.restaurantName}. All rights reserved.</div>
        </footer>
    )
}