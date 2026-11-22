import { useEffect, useState } from 'react'
import { api } from '../services/api'

let cache = null
export function useMenu() {
    const [state, setState] = useState({ items: cache || [], loading: !cache, error: '' })
    useEffect(() => {
        let live = true
        api.menu().then((r) => { cache = r.items; if (live) setState({ items: r.items, loading: false, error: '' }) })
            .catch((e) => live && setState({ items: cache || [], loading: false, error: e.message }))
        return () => { live = false }
    }, [])
    return state
}