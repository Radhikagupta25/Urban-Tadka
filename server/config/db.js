import mongoose from 'mongoose'
import { env } from './env.js'

mongoose.set('strictQuery', true)
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'))

export async function connectDB(retries = 5) {
    for (let i = 1; i <= retries; i++) {
        try {
            await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10 })
            console.log('MongoDB connected')
            return
        } catch (e) {
            console.error(`MongoDB connection failed (${i}/${retries}): ${e.message}`)
            if (i === retries) throw e
            await new Promise((r) => setTimeout(r, 2000 * i))
        }
    }
}
export const closeDB = () => mongoose.connection.close()