import { useEffect, useState } from 'react'
import { api, adminToken } from '../../services/api'
import AdminLogin from './AdminLogin'
import OrdersTab from './Orders'
import MenuTab from './MenuTab'
import SettingsTab from './SettingsTab'
import { inr } from '../../utils/format'

function Overview() {
    const [s, setS] = useState(null)
    useEffect(() => { const load = () => api.admin.stats().then(setS).catch(() => { }); load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [])
    if (!s) return <p>Loading…</p>
    const cards = [['Orders todayyy', s.ordersToday], ['Pending / active', s.pending], ['Completed', s.completed], ['Cancelled', s.cancelled], ['All orders', s.total], ['Revenue today', inr(s.revenueToday)], ['Revenue (all time)', inr(s.revenue)]]
    return (
        <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([l, v]) => <div key={l} className="border-2 border-ink bg-cream p-5"><p className="kicker text-ink/55">{l}</p><p className="display mt-2 text-5xl">{v}</p></div>)}</div>
            <p className="mt-4 text-xs text-ink/55">Revenue counts paid, non-cancelled orders. COD orders count once marked Delivered.</p>
        </div>
    )
}

const TABS = [['overview', 'Overview'], ['orders', 'Orders'], ['menu', 'Menu'], ['settings', 'Settings']]

export default function AdminPage() {
    const [admin, setAdmin] = useState(undefined)
    const [tab, setTab] = useState('orders')
    useEffect(() => {
        if (!adminToken.get()) { setAdmin(null); return }
        api.admin.me().then((r) => setAdmin(r.admin)).catch(() => setAdmin(null))
        const out = () => setAdmin(null)
        window.addEventListener('ut-admin-expired', out)
        return () => window.removeEventListener('ut-admin-expired', out)
    }, [])
    useEffect(() => { document.title = 'Admin' }, [])

    if (admin === undefined) return <p className="p-10">Loading…</p>
    if (!admin) return <AdminLogin onLogin={setAdmin} />
    return (
        <div className="min-h-screen bg-cream-deep">
            <header className="bg-ink text-cream">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                    <p className="font-display text-2xl uppercase tracking-wide text-mustard">Restaurant admin</p>
                    <div className="flex items-center gap-4 text-sm"><span className="hidden sm:inline text-cream/60">{admin.email}</span><button className="font-bold uppercase underline" onClick={() => { adminToken.clear(); setAdmin(null) }}>Sign out</button></div>
                </div>
                <nav className="mx-auto flex max-w-7xl gap-1 px-5" aria-label="Admin sections">
                    {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} aria-current={tab === k} className={`px-5 py-3 text-sm font-bold uppercase tracking-wider ${tab === k ? 'bg-cream-deep text-ink' : 'text-cream/70 hover:text-mustard'}`}>{l}</button>)}
                </nav>
            </header>
            <main className="mx-auto max-w-7xl px-5 py-8">
                {tab === 'overview' && <Overview />}
                {tab === 'orders' && <OrdersTab />}
                {tab === 'menu' && <MenuTab />}
                {tab === 'settings' && <SettingsTab />}
            </main>
        </div>
    )
}