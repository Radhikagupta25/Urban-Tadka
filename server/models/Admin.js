import mongoose from 'mongoose'

export default mongoose.model('Admin', new mongoose.Schema({
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true }))