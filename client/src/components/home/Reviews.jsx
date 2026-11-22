import { Star } from 'lucide-react'
import Reveal from '../Reveal'
import { content } from '../../data/content'

export default function Reviews() {
    return (
        <section className="bg-cream-deep py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal><p className="kicker text-ember">Guest reviews</p><h2 className="display mt-3 text-6xl md:text-8xl">Kind words</h2></Reveal>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    {content.reviews.map((r, i) => (
                        <Reveal key={r.name} delay={i * 0.1} className={i === 1 ? 'md:mt-12' : i === 2 ? 'md:mt-24' : ''}>
                            <figure className="h-full border-2 border-ink bg-cream p-7 shadow-[8px_8px_0_#151412]">
                                <div className="flex gap-1" role="img" aria-label={`${r.rating} out of 5 stars`}>
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={18} aria-hidden="true" className={s <= r.rating ? 'fill-mustard text-ink' : 'text-ink/25'} />)}
                                </div>
                                <blockquote className="mt-5 font-serif text-xl leading-snug">“{r.text}”</blockquote>
                                <figcaption className="mt-5 text-sm font-bold uppercase tracking-wider">{r.name}</figcaption>
                            </figure>
                        </Reveal>
                    ))}
                </div>
                <p className="mt-16 text-xs text-ink/50">Demo content: sample testimonials. Replace with genuine customer reviews before going live.</p>
            </div>
        </section>
    )
}