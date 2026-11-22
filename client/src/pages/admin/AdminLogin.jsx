import { useState } from 'react'
import { api, adminToken } from '../../services/api'

export default function AdminLogin({ onLogin }) {
    const [f, setF] = useState({ email: '', password: '' })
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)
    async function submit(e) {
        e.preventDefault(); setErr(''); setBusy(true)
        try { const r = await api.admin.login(f); adminToken.set(r.token); onLogin(r.admin) }
        catch (x) { setErr(x.message) } finally { setBusy(false) }
    }
    return (
        <div className="flex min-h-screen items-center justify-center bg-ink p-5">
            <form onSubmit={submit} className="w-full max-w-sm border-2 border-mustard bg-cream p-8">
                <h1 className="display text-5xl">Admin sign in</h1>
                <div className="mt-6"><label htmlFor="ae" className="label">Email</label><input id="ae" type="email" autoComplete="username" className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
                <div className="mt-4"><label htmlFor="ap" className="label">Password</label><input id="ap" type="password" autoComplete="current-password" className="field" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></div>
                {err && <p role="alert" className="mt-4 text-sm font-bold text-ember">{err}</p>}
                <button className="btn btn-ink mt-6 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
        </div>
    )
}