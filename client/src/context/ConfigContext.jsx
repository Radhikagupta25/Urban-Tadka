import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../services/api'

const Ctx = createContext(null)
export const useConfig = () => useContext(Ctx)

export function ConfigProvider({ children }) {
    const [config, setConfig] = useState(null)
    const [error, setError] = useState('')
    const load = useCallback(() => {
        setError('')
        api.config().then((r) => setConfig(r.config)).catch((e) => setError(e.message))
    }, [])
    useEffect(load, [load])
    useEffect(() => { if (config) document.title = `${config.restaurantName} | Order online` }, [config])

    if (!config) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-ink p-6 text-center text-cream">
                {error ? (
                    <div className="max-w-md">
                        <p className="display text-4xl text-mustard">Can't load the site</p>
                        <p className="mt-3 text-cream/70">{error}</p>
                        <p className="mt-2 text-xs text-cream/40">If you deployed this yourself: check VITE_API_URL and CORS (CLIENT_URL) settings.</p>
                        <button className="btn btn-mustard mt-6" onClick={load}>Try again</button>
                    </div>
                ) : <p className="kicker animate-pulse text-mustard">Loading…</p>}
            </div>
        )
    }
    return <Ctx.Provider value={{ config }}>{children}</Ctx.Provider>
}