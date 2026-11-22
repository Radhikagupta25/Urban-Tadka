import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'

export default function Logo({ className = '' }) {
    const { config } = useConfig()
    const parts = config.restaurantName.toUpperCase().split(' ')
    const last = parts.length > 1 ? parts.pop() : null
    return (
        <Link to="/" aria-label={`${config.restaurantName} home`} className={className}>
            {config.logoUrl
                ? <img src={config.logoUrl} alt={config.restaurantName} className="h-9 w-auto" />
                : <span className="font-display text-3xl tracking-wide text-cream">{parts.join(' ')}{last && <span className="text-mustard"> {last}</span>}</span>}
        </Link>
    )
}