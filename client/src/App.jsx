import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import Home from './pages/Home'
import MenuPage from './pages/MenuPage'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import TrackOrder from './pages/TrackOrder'

const AdminPage = lazy(() => import('./pages/admin/AdminPage'))

function ScrollManager() {
    const { pathname, hash } = useLocation()
    useEffect(() => {
        if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
        else window.scrollTo(0, 0)
    }, [pathname, hash])
    return null
}

export default function App() {
    return (
        <>
            <ScrollManager />
            <Suspense fallback={<p className="p-10 text-center">Loading…</p>}>
                <Routes>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route element={<SiteLayout />}>
                        <Route index element={<Home />} />
                        <Route path="menu" element={<MenuPage />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="order/:orderNumber" element={<OrderConfirmation />} />
                        <Route path="track" element={<TrackOrder />} />
                        <Route path="*" element={<div className="px-6 py-40 text-center"><p className="display text-6xl">Page not found</p></div>} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    )
}