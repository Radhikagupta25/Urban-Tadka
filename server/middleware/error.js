import { AppError } from '../utils/helpers.js'

export const notFound = (req, res, next) => next(new AppError(404, 'Not found'))

export const errorHandler = (err, req, res, next) => { // eslint-disable-line
    if (err instanceof AppError) return res.status(err.status).json({ message: err.message, details: err.details })
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body.' })
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request too large.' })
    if (err.name === 'CastError' || err.name === 'ValidationError') return res.status(400).json({ message: 'Invalid data.' })
    console.error(`${req.method} ${req.path}`, err)
    res.status(500).json({ message: 'Something went wrong on our side. Please try again.' })
}