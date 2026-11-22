export default function VegMark({ veg }) {
    const c = veg ? 'border-green-700' : 'border-red-700'
    return (
        <span role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'} className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border-2 ${c}`}>
            <span className={`h-2 w-2 rounded-full ${veg ? 'bg-green-700' : 'bg-red-700'}`} />
        </span>
    )
}