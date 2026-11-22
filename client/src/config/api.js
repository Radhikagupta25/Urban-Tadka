// Central API configuration. In production VITE_API_URL must point at the deployed backend.
const raw = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
if (import.meta.env.PROD && !raw) console.error('VITE_API_URL is not set. Rebuild the frontend with the backend URL.')
export const API_BASE = `${raw}/api`