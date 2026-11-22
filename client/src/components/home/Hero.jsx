import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SmartImage from '../SmartImage'
import { content } from '../../data/content'

const items = ['Street food', 'Biryani', 'Tandoor', 'Chaat', 'Curries', 'Lassi', 'Mithai']
const ease = [0.22, 1, 0.36, 1]

export default function Hero() {
    return (
        <section id="home" className="overflow-hidden bg-ink text-cream">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-12 lg:px-8 lg:pb-24 lg:pt-20">
                <div className="lg:col-span-7">
                    <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="kicker inline-block bg-mustard px-3 py-1.5 text-ink">Freshly prepared. Always flavourful.</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease }} className="display mt-6 text-[clamp(4rem,12vw,10rem)]">
                        Big flavours.<br /><span className="text-mustard">Desi soul.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease }} className="mt-6 max-w-lg text-lg leading-relaxed text-cream/75">
                        From street-side favourites to hearty Indian classics, experience the flavours you crave, made fresh and served with love.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease }} className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Link to="/menu" className="btn btn-line-light">Explore Menu</Link>
                        <Link to="/menu" className="btn btn-mustard !border-mustard">Order Now</Link>
                    </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2, ease }} className="relative lg:col-span-5">
                    <div className="absolute -bottom-4 -left-4 h-full w-full bg-mustard" aria-hidden="true" />
                    <SmartImage src={content.hero} alt="A bowl of rich Indian curry" className="relative aspect-[4/5] w-full object-cover" loading="eager" />
                    <SmartImage src={content.heroInset} alt="Golden samosas" className="absolute -bottom-8 -right-3 hidden aspect-square w-36 border-4 border-ink object-cover sm:block" loading="eager" />
                </motion.div>
            </div>
            <div className="overflow-hidden border-y-2 border-ink bg-mustard py-3 text-ink" aria-hidden="true">
                <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-display text-2xl uppercase">
                    {[...items, ...items, ...items, ...items].map((t, i) => <span key={i}>{t} <span className="ml-10 text-ember">✦</span></span>)}
                </div>
            </div>
        </section>
    )
}