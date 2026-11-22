import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { CATEGORIES } from '../../data/constants'
import { inr } from '../../utils/format'

const blank = { name: '', description: '', image: '', price: '', category: CATEGORIES[0], isVeg: true, isAvailable: true, isBestseller: false, addonsText: '' }
const toText = (a) => (a || []).map((x) => `${x.name} | ${x.price}`).join('\n')
const parseAddons = (t) => t.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [n, p] = l.split('|'); return { name: (n || '').trim(), price: Number(p) || 0 } })

export default function MenuTab() {
    const [items, setItems] = useState([])
    const [edit, setEdit] = useState(null)
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)
    const load = () => api.admin.menu().then((r) => setItems(r.items)).catch((e) => setErr(e.message))
    useEffect(() => { load() }, [])

    async function save(e) {
        e.preventDefault(); setErr(''); setBusy(true)
        const body = { name: edit.name, description: edit.description, image: edit.image, price: Number(edit.price), category: edit.category, isVeg: edit.isVeg, isAvailable: edit.isAvailable, isBestseller: edit.isBestseller, addons: parseAddons(edit.addonsText) }
        try { edit._id ? await api.admin.updateItem(edit._id, body) : await api.admin.createItem(body); setEdit(null); load() }
        catch (x) { setErr(x.message) } finally { setBusy(false) }
    }
    const toggle = async (i) => { try { await api.admin.setAvailability(i._id, !i.isAvailable); load() } catch (x) { setErr(x.message) } }
    const del = async (i) => { if (!window.confirm(`Delete "${i.name}"? This cannot be undone.`)) return; try { await api.admin.deleteItem(i._id); load() } catch (x) { setErr(x.message) } }
    const set = (k) => (e) => setEdit((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

    return (
        <div>
            <div className="mb-4 flex items-center justify-between"><p className="text-sm text-ink/60">{items.length} items</p><button className="btn btn-ink" onClick={() => setEdit(blank)}>Add item</button></div>
            {err && <p role="alert" className="mb-3 font-bold text-ember">{err}</p>}
            <div className="overflow-x-auto border-2 border-ink bg-cream">
                <table className="w-full text-left text-sm">
                    <thead className="border-b-2 border-ink bg-ink text-cream"><tr>{['Item', 'Category', 'Price', 'Available', ''].map((h) => <th key={h} className="px-4 py-3 text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody>{items.map((i) => (
                        <tr key={i._id} className="border-b border-ink/15">
                            <td className="px-4 py-3 font-bold">{i.name} {i.isBestseller && <span className="ml-1 bg-ember px-1.5 py-0.5 text-[10px] text-cream">BEST</span>}</td>
                            <td className="px-4 py-3">{i.category}</td><td className="px-4 py-3">{inr(i.price)}</td>
                            <td className="px-4 py-3"><button onClick={() => toggle(i)} role="switch" aria-checked={i.isAvailable} aria-label={`${i.name} available`} className={`h-6 w-11 border-2 border-ink p-0.5 ${i.isAvailable ? 'bg-mustard' : 'bg-cream'}`}><span className={`block h-4 w-4 bg-ink transition-transform ${i.isAvailable ? 'translate-x-5' : ''}`} /></button></td>
                            <td className="space-x-3 px-4 py-3 text-right"><button className="font-bold underline" onClick={() => setEdit({ ...i, addonsText: toText(i.addons) })}>Edit</button><button className="font-bold text-ember underline" onClick={() => del(i)}>Delete</button></td>
                        </tr>))}</tbody>
                </table>
            </div>
            {edit && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-4" role="dialog" aria-modal="true" aria-label="Edit menu item">
                    <form onSubmit={save} className="my-8 w-full max-w-lg space-y-4 border-2 border-ink bg-cream p-6">
                        <h2 className="display text-4xl">{edit._id ? 'Edit item' : 'Add item'}</h2>
                        <div><label className="label" htmlFor="mn">Name</label><input id="mn" className="field" value={edit.name} onChange={set('name')} required /></div>
                        <div><label className="label" htmlFor="md">Description</label><textarea id="md" rows={2} className="field" value={edit.description} onChange={set('description')} /></div>
                        <div><label className="label" htmlFor="mi">Image URL (https)</label><input id="mi" className="field" value={edit.image} onChange={set('image')} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label" htmlFor="mp">Price (₹)</label><input id="mp" type="number" min="0" step="1" className="field" value={edit.price} onChange={set('price')} required /></div>
                            <div><label className="label" htmlFor="mc">Category</label><select id="mc" className="field" value={edit.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
                        </div>
                        <div className="flex flex-wrap gap-5 text-sm font-bold">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={edit.isVeg} onChange={set('isVeg')} /> Vegetarian</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={edit.isAvailable} onChange={set('isAvailable')} /> Available</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={edit.isBestseller} onChange={set('isBestseller')} /> Bestseller</label>
                        </div>
                        <div><label className="label" htmlFor="ma">Add-ons (one per line: Name | price)</label><textarea id="ma" rows={3} className="field" value={edit.addonsText} onChange={set('addonsText')} placeholder={'Butter Naan | 45'} /></div>
                        {err && <p role="alert" className="font-bold text-ember">{err}</p>}
                        <div className="flex gap-3"><button className="btn btn-ink" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className="btn btn-line" onClick={() => { setEdit(null); setErr('') }}>Cancel</button></div>
                    </form>
                </div>
            )}
        </div>
    )
}