import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { useConfig } from '../../context/ConfigContext'
import { inr } from '../../utils/format'

export default function Promo() {
    const { config } = useConfig()
    const c = config.coupon
    return (
        <section id="offers" className="bg-mustard py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <h2 className="display text-[clamp(3.2rem,10vw,9rem)]">Your favourites,<br />just a click <span className="text-ember">away.</span></h2>
                </Reveal>
                <Reveal delay={0.1} className="mt-10 flex flex-col gap-6 md:flex-row md:items-center">
                    <Link to="/menu" className="btn btn-ink">Order Now</Link>
                    {c && <p className="max-w-md border-l-4 border-ink pl-4 text-lg font-medium">Use code <b className="bg-ink px-2 py-0.5 text-mustard">{c.code}</b> for {c.percent}% off on orders above {inr(c.minSubtotal)} (up to {inr(c.maxDiscount)}).</p>}
                </Reveal>
            </div>
        </section>
    )
}