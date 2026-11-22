import { API_BASE } from '../config/api'

export class ApiError extends Error {
    constructor(message, status, details) { super(message); this.status = status; this.details = details }
}
const TOKEN = 'ut_admin_token'
export const adminToken = {
    get: () => { try { return sessionStorage.getItem(TOKEN) } catch { return null } },
    set: (t) => { try { sessionStorage.setItem(TOKEN, t) } catch { /* ignore */ } },
    clear: () => { try { sessionStorage.removeItem(TOKEN) } catch { /* ignore */ } },
}

async function request(path, { method = 'GET', body, auth } = {}) {
    const headers = {}
    if (body) headers['Content-Type'] = 'application/json'
    if (auth && adminToken.get()) headers.Authorization = `Bearer ${adminToken.get()}`
    let res
    try { res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }) }
    catch { throw new ApiError('Cannot reach the server. Check your connection and try again.', 0) }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        if (auth && res.status === 401) { adminToken.clear(); window.dispatchEvent(new Event('ut-admin-expired')) }
        throw new ApiError(data.message || 'Request failed.', res.status, data.details)
    }
    return data
}

export const api = {
    config: () => request('/config'),
    menu: () => request('/menu'),
    quote: (b) => request('/quote', { method: 'POST', body: b }),
    placeCod: (b) => request('/orders/cod', { method: 'POST', body: b }),
    createPayment: (b) => request('/payment/create-order', { method: 'POST', body: b }),
    verifyPayment: (b) => request('/payment/verify', { method: 'POST', body: b }),
    track: (b) => request('/orders/track', { method: 'POST', body: b }),
    admin: {
        login: (b) => request('/admin/login', { method: 'POST', body: b }),
        me: () => request('/admin/me', { auth: true }),
        stats: () => request('/admin/stats', { auth: true }),
        orders: (filter) => request(`/admin/orders?filter=${filter}`, { auth: true }),
        setStatus: (id, orderStatus) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { orderStatus }, auth: true }),
        resendEmails: (id) => request(`/admin/orders/${id}/resend-emails`, { method: 'POST', auth: true }),
        menu: () => request('/admin/menu', { auth: true }),
        createItem: (b) => request('/admin/menu', { method: 'POST', body: b, auth: true }),
        updateItem: (id, b) => request(`/admin/menu/${id}`, { method: 'PUT', body: b, auth: true }),
        setAvailability: (id, isAvailable) => request(`/admin/menu/${id}/availability`, { method: 'PATCH', body: { isAvailable }, auth: true }),
        deleteItem: (id) => request(`/admin/menu/${id}`, { method: 'DELETE', auth: true }),
        settings: () => request('/admin/settings', { auth: true }),
        saveSettings: (b) => request('/admin/settings', { method: 'PUT', body: b, auth: true }),
    },
}