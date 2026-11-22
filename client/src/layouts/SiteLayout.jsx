import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import { useConfig } from '../context/ConfigContext'

export default function SiteLayout() {
    const { config } = useConfig()
    return (
        <>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-mustard focus:px-4 focus:py-2">Skip to content</a>
            <Navbar />
            {!config.acceptingOrders && (
                <p className="bg-ember px-4 py-2 text-center text-sm font-bold text-cream" role="status">Online ordering is paused right now. Please call us on {config.phone}.</p>
            )}
            <main id="main"><Outlet /></main>
            <Footer />
            <CartDrawer />
        </>
    )
}