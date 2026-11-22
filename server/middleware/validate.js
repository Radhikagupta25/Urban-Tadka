import { AppError } from '../utils/helpers.js'

export const validate = (schema) => (req, res, next) => {
    const r = schema.safeParse(req.body)
    if (!r.success) {
        const issues = r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
        return next(new AppError(400, issues[0]?.message || 'Invalid request.', issues))
    }
    req.body = r.data
    next()
}