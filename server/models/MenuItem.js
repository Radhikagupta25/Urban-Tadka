import mongoose from 'mongoose'
import { CATEGORIES } from '../utils/constants.js'

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    addons: [new mongoose.Schema({ name: { type: String, required: true, trim: true }, price: { type: Number, required: true, min: 0 } })],
}, { timestamps: true })

export default mongoose.model('MenuItem', menuItemSchema)