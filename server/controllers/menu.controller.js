import MenuItem from '../models/MenuItem.js'
import { AppError, asyncHandler } from '../utils/helpers.js'
import { CATEGORIES } from '../utils/constants.js'

export const listPublic = asyncHandler(async (req, res) => {
    const items = await MenuItem.find().lean()
    items.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name))
    res.json({ items })
})
export const listAdmin = listPublic
export const create = asyncHandler(async (req, res) => res.status(201).json({ item: await MenuItem.create(req.body) }))
export const update = asyncHandler(async (req, res) => {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) throw new AppError(404, 'Item not found.')
    res.json({ item })
})
export const setAvailability = asyncHandler(async (req, res) => {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { isAvailable: req.body.isAvailable }, { new: true })
    if (!item) throw new AppError(404, 'Item not found.')
    res.json({ item })
})
export const remove = asyncHandler(async (req, res) => {
    const item = await MenuItem.findByIdAndDelete(req.params.id)
    if (!item) throw new AppError(404, 'Item not found.')
    res.json({ ok: true })
})