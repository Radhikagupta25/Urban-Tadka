import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import Reveal from '../Reveal'
import SmartImage from '../SmartImage'
import { content } from '../../data/content'

const G = content.gallery

export default function Gallery() {
    const [active, setActive] = useState(null)
    const closeRef = useRef(null)
    const trigger = useRef(null)
    const close = useCallback(() => { setActive(null); trigger.current?.focus() }, [])
    const step = useCallback((d) => setActive((a) => (a === null ? a : (a + d + G.length) % G.length)), [])

    useEffect(() => {
        if (active === null) return
        closeRef.current?.focus()
        const onKey = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
    }, [active, close, step])

    return (
        <section id="gallery" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <Reveal><p className="kicker text-ember">Gallery</p><h2 className="display mt-3 text-6xl md:text-8xl">Taste it<br />with your eyes</h2></Reveal>
            <div className="mt-12 columns-2 gap-3 md:columns-3 lg:columns-4">
                {G.map((g, i) => (
                    <button key={g.src} type="button" aria-label={`Open image: ${g.alt}`} onClick={(e) => { trigger.current = e.currentTarget; setActive(i) }}
                        className="group relative mb-3 block w-full overflow-hidden border-2 border-ink">
                        <SmartImage src={g.src} alt={g.alt} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${g.ratio}`} />
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream opacity-0 transition-all group-hover:bg-ink/50 group-hover:opacity-100 group-focus-visible:bg-ink/50 group-focus-visible:opacity-100"><ZoomIn size={28} aria-hidden="true" /></span>
                    </button>
                ))}
            </div>
            {active !== null && (
                <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4" onClick={close}>
                    <button ref={closeRef} onClick={close} aria-label="Close image" className="absolute right-4 top-4 p-2 text-cream hover:text-mustard"><X size={30} /></button>
                    <button onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous image" className="absolute left-2 p-2 text-cream hover:text-mustard sm:left-6"><ChevronLeft size={38} /></button>
                    <figure onClick={(e) => e.stopPropagation()} className="max-w-5xl">
                        <SmartImage src={G[active].src.replace('w=900', 'w=1800')} alt={G[active].alt} className="max-h-[80vh] w-auto max-w-full object-contain" />
                        <figcaption className="mt-3 text-center text-sm text-cream/70">{G[active].alt} · {active + 1} / {G.length}</figcaption>
                    </figure>
                    <button onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next image" className="absolute right-2 p-2 text-cream hover:text-mustard sm:right-6"><ChevronRight size={38} /></button>
                </div>
            )}
        </section>
    )
}