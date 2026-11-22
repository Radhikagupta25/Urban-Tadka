import mongoose from 'mongoose'
import { env } from '../config/env.js'

const num = (d) => ({ type: Number, default: d, min: 0 })
const schema = new mongoose.Schema({
    key: { type: String, default: 'main', unique: true },
    restaurantName: { type: String, default: 'Urban Tadka' },
    tagline: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    orderEmail: { type: String, default: '' },   // where new-order emails go
    addressLines: { type: [String], default: [] },
    mapQuery: { type: String, default: '' },
    hours: { type: [new mongoose.Schema({ days: String, time: String }, { _id: false })], default: [] },
    social: { instagram: { type: String, default: '' }, facebook: { type: String, default: '' }, youtube: { type: String, default: '' } },
    acceptingOrders: { type: Boolean, default: true },
    basePrepMinutes: num(20), extraPrepPerItem: num(2), maxExtraPrepMinutes: num(20),
    deliveryMinutes: num(20), bufferMinutes: num(10),
    deliveryCharge: num(40), freeDeliveryAbove: num(599), taxPercent: num(5),
    couponCode: { type: String, default: 'TADKA10' }, couponPercent: num(10), couponMinSubtotal: num(299), couponMaxDiscount: num(100),
}, { timestamps: true })

const envDefaults = () => {
    const lines = env.restaurant.address.split('|').map((l) => l.trim()).filter(Boolean)
    return {
        restaurantName: env.restaurant.name, tagline: 'Big flavours. Desi soul.', phone: env.restaurant.phone,
        contactEmail: env.restaurantEmail, orderEmail: env.restaurantEmail, addressLines: lines, mapQuery: lines.join(', '),
        hours: [{ days: 'Monday – Sunday', time: '11:00 am – 11:00 pm' }], // sample: edit in Admin → Settings
    }
}

schema.statics.get = async function () {
    let s = await this.findOne({ key: 'main' })
    if (!s) {
        try { s = await this.create({ key: 'main', ...envDefaults() }) }
        catch (e) { s = await this.findOne({ key: 'main' }); if (!s) throw e }
    }
    return s
}
export default mongoose.model('Settings', schema)