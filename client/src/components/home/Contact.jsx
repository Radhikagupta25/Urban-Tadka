import { Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import Reveal from '../Reveal'
import { useConfig } from '../../context/ConfigContext'
import { telHref } from '../../utils/format'

export default function Contact() {
    const { config: c } = useConfig()
    const q = encodeURIComponent(c.mapQuery || c.addressLines.join(', '))
    return (
        <section id="contact" className="bg-cream-deep py-20 lg:py-28">
            <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-12 lg:px-8">
                <div className="lg:col-span-5">
                    <Reveal><p className="kicker text-ember">Visit &amp; contact</p><h2 className="display mt-3 text-6xl md:text-7xl">Find us</h2></Reveal>
                    <Reveal delay={0.1}>
                        <ul className="mt-8 space-y-5">
                            <li className="flex gap-4"><MapPin className="mt-0.5 shrink-0 text-ember" aria-hidden="true" /><address className="not-italic">{c.addressLines.map((l) => <span key={l} className="block">{l}</span>)}</address></li>
                            {c.phone && <li className="flex gap-4"><Phone className="shrink-0 text-ember" aria-hidden="true" /><a href={telHref(c.phone)} className="font-bold hover:text-ember">{c.phone}</a></li>}
                            {c.contactEmail && <li className="flex gap-4"><Mail className="shrink-0 text-ember" aria-hidden="true" /><a href={`mailto:${c.contactEmail}`} className="break-all hover:text-ember">{c.contactEmail}</a></li>}
                            <li className="flex gap-4"><Clock className="mt-0.5 shrink-0 text-ember" aria-hidden="true" /><div>{c.hours.map((h) => <p key={h.days}><b>{h.days}</b><br /><span className="text-sm">{h.time}</span></p>)}</div></li>
                        </ul>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer" className="btn btn-ink"><Navigation size={16} /> Get Directions</a>
                            {c.phone && <a href={telHref(c.phone)} className="btn btn-line"><Phone size={16} /> Call Now</a>}
                        </div>
                    </Reveal>
                </div>
                <Reveal className="lg:col-span-7">
                    <iframe title="Map showing the restaurant location" src={`https://www.google.com/maps?q=${q}&output=embed`} className="h-full min-h-[380px] w-full border-2 border-ink" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                </Reveal>
            </div>
        </section>
    )
}