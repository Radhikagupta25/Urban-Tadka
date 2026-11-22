import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import OrderView from '../components/OrderView'

export default function TrackOrder() {
    const [params] = useSearchParams()
    const { state } = useLocation()
    const [num, setNum] = useState(params.get('order') || '')
    const [phone, setPhone] = useState('')
    const [order, setOrder] = useState(null)
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)

    async function submit(e) {
        e.preventDefault(); setErr(''); setBusy(true)
        try { setOrder((await api.track({ orderNumber: num, phone })).order) }
        catch (x) { setOrder(null); setErr(x.message) }
        finally { setBusy(false) }
    }
    return (
        <div className="mx-auto max-w-3xl px-5 py-14">
            <h1 className="display text-6xl md:text-8xl">Track order</h1>
            {state?.notice && <p role="status" className="mt-6 border-2 border-ink bg-mustard p-4 text-sm font-bold">{state.notice}</p>}
            <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div><label htmlFor="on" className="label">Order number</label><input id="on" className="field uppercase" value={num} onChange={(e) => setNum(e.target.value)} placeholder="UT-XXXXXXXXXX" required /></div>
                <div><label htmlFor="ph" className="label">Phone used for the order</label><input id="ph" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                <button className="btn btn-ink" disabled={busy}>{busy ? 'Checking…' : 'Track'}</button>
            </form>
            {err && <p role="alert" className="mt-4 font-bold text-ember">{err}</p>}
            {order && <div className="mt-10 border-2 border-ink p-6"><OrderView order={order} /></div>}
        </div>
    )
}