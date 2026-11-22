import { Flame, Gem, Languages, SprayCan, Bike, Headset } from 'lucide-react'
import Reveal from '../Reveal'

const why = [
    [Flame, 'Freshly prepared', 'Cooked to order, never reheated from yesterday.'],
    [Gem, 'Quality ingredients', 'Fresh produce and whole spices, sourced with care.'],
    [Languages, 'Authentic flavours', 'Recipes rooted in regional Indian kitchens.'],
    [SprayCan, 'Hygienic preparation', 'Clean stations, gloved handling, careful packing.'],
    [Bike, 'Fast delivery', 'Packed hot and sent out as soon as it is ready.'],
    [Headset, 'Friendly service', 'A real person on the phone when you need one.'],
]

export default function WhyUs() {
    return (
        <section className="bg-ink py-20 text-cream lg:py-28">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal><p className="kicker text-mustard">Why us</p><h2 className="display mt-3 max-w-3xl text-6xl md:text-8xl">Why <span className="text-mustard">Urban</span> Tadka?</h2></Reveal>
                <div className="mt-14 grid border-l-2 border-t-2 border-cream/20 sm:grid-cols-2 lg:grid-cols-3">
                    {why.map(([Icon, t, d], i) => (
                        <Reveal key={t} delay={i * 0.05} className="border-b-2 border-r-2 border-cream/20 p-8">
                            <div className="flex items-start justify-between"><Icon className="text-mustard" size={30} strokeWidth={1.5} aria-hidden="true" /><span className="font-display text-5xl text-cream/15">0{i + 1}</span></div>
                            <h3 className="mt-8 font-display text-3xl uppercase">{t}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-cream/65">{d}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}