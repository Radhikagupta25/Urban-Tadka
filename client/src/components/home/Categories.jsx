import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from '../Reveal'
import SmartImage from '../SmartImage'
import { content } from '../../data/content'

const spans = ['md:col-span-5', 'md:col-span-4', 'md:col-span-3', 'md:col-span-3', 'md:col-span-4', 'md:col-span-5']

export default function Categories() {
    return (
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <Reveal><p className="kicker text-ember">Popular categories</p><h2 className="display mt-3 text-6xl md:text-8xl">What are you<br />craving?</h2></Reveal>
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-12">
                {content.categories.map((c, i) => (
                    <Reveal key={c.name} delay={i * 0.05} className={`${spans[i]} ${i === 0 || i === 5 ? 'col-span-2' : ''}`}>
                        <Link to={`/menu?cat=${encodeURIComponent(c.name)}`} className="group relative block h-52 overflow-hidden border-2 border-ink md:h-64">
                            <SmartImage src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink px-4 py-3 text-cream transition-colors group-hover:bg-mustard group-hover:text-ink">
                                <span className="font-display text-2xl uppercase">{c.name}</span><ArrowUpRight size={20} />
                            </span>
                        </Link>
                    </Reveal>
                ))}
            </div>
        </section>
    )
}