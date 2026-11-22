import Reveal from '../Reveal'
import SmartImage from '../SmartImage'
import { content } from '../../data/content'
import { useConfig } from '../../context/ConfigContext'

export default function Story() {
    const { config } = useConfig()
    return (
        <section id="story" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-32">
            <div className="grid items-center gap-14 lg:grid-cols-12">
                <Reveal className="relative lg:col-span-6">
                    <SmartImage src={content.story[0]} alt="Fragrant biryani" className="aspect-[4/5] w-full border-2 border-ink object-cover" />
                    <SmartImage src={content.story[1]} alt="Street-style chaat" className="absolute -bottom-10 -right-3 hidden aspect-square w-2/5 border-4 border-cream object-cover shadow-[8px_8px_0_#151412] sm:block" />
                </Reveal>
                <div className="lg:col-span-6 lg:pl-8">
                    <Reveal><p className="kicker text-ember">Our story</p></Reveal>
                    <Reveal delay={0.1}><h2 className="display mt-3 text-6xl md:text-8xl">Born on the<br />street. <span className="text-ember">Raised</span><br />in the kitchen.</h2></Reveal>
                    <Reveal delay={0.2}>
                        <p className="mt-8 text-lg leading-relaxed text-ink/80">{config.restaurantName} started with a simple craving: food that tastes the way it does at your favourite street corner, cooked with the care of a family kitchen.</p>
                        <p className="mt-4 leading-relaxed text-ink/65">We toast our spices whole, simmer our gravies slowly, and cook every order fresh, so the first bite hits just as hard as the last.</p>
                        <p className="mt-8 border-l-4 border-mustard pl-5 font-serif text-2xl italic">Made fresh. Served with love.</p>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}