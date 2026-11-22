let loading
const loadScript = () => {
    if (window.Razorpay) return Promise.resolve()
    return (loading ||= new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = resolve
        s.onerror = () => { loading = null; reject(new Error('Could not load the payment window. Check your connection.')) }
        document.body.appendChild(s)
    }))
}

// Resolves: {status:'paid', response} | {status:'failed', error} | {status:'dismissed'}
export async function payWithRazorpay(s) {
    await loadScript()
    return new Promise((resolve) => {
        let lastError = null
        const rzp = new window.Razorpay({
            key: s.keyId, amount: s.amount, currency: s.currency, name: s.restaurantName,
            description: `Order ${s.orderNumber}`, order_id: s.razorpayOrderId, prefill: s.prefill,
            theme: { color: '#151412' },
            handler: (response) => resolve({ status: 'paid', response }),
            modal: { confirm_close: true, ondismiss: () => resolve(lastError ? { status: 'failed', error: lastError } : { status: 'dismissed' }) },
        })
        rzp.on('payment.failed', (r) => { lastError = r?.error?.description || 'Payment failed' })
        rzp.open()
    })
}