import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import FoodCard from '../FoodCard'
import { useMenu } from '../../hooks/useMenu'

export default function Bestsellers() {
    const { items, loading, error } = useMenu()
    const best = items.filter((i) => i.isBestseller).slice(0, 6)
    return (
        <section className="bg-cream-deep py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <Reveal><p className="kicker text-ember">Bestsellers</p><h2 className="display mt-3 text-6xl md:text-8xl">Crowd<br />favourites</h2></Reveal>
                    <Link to="/menu" className="btn btn-line self-start md:self-auto">View full menu</Link>
                </div>
                {error && <p role="alert" className="mt-8 text-ember">{error}</p>}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:[&>*:nth-child(3n+2)]:mt-10">
                    {loading ? Array.from({ length: 3 }, (_, i) => <div key={i} className="h-96 animate-pulse border-2 border-ink/20 bg-cream" />)
                        : best.map((it) => <FoodCard key={it._id} item={it} />)}
                </div>
            </div>
        </section>
    )
}