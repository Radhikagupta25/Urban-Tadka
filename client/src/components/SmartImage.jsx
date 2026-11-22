import { useState } from 'react'

export default function SmartImage({ src, alt, className = '', ...rest }) {
    const [failed, setFailed] = useState(false)
    if (!src || failed) {
        return <div role="img" aria-label={alt} className={`flex items-center justify-center bg-mustard p-3 text-center font-display text-xl uppercase text-ink/70 ${className}`}>{alt}</div>
    }
    return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} {...rest} />
}