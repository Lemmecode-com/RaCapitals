import PriceHistory from '../models/PriceHistory.js'
import Company from '../models/Company.js'

export const updatePrice = async (req, res) => {
  try {
    const { companyId } = req.params
    const { price, recordedAt } = req.body

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'A valid positive price is required' })
    }

    const company = await Company.findById(companyId)
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    // Previous price before new insertion
    const previousPriceDoc = await PriceHistory.findOne({ company: companyId })
      .sort({ recordedAt: -1 })
      .lean()

    // Append-only: Always create a new PriceHistory document
    const priceRecord = await PriceHistory.create({
      company: companyId,
      price: numPrice,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date()
    })

    // Recalculate 52-week stats
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    const prices52w = await PriceHistory.find({
      company: companyId,
      recordedAt: { $gte: oneYearAgo }
    }).lean()

    const prices = prices52w.map(p => p.price)
    const high52 = prices.length ? Math.max(...prices) : numPrice
    const low52 = prices.length ? Math.min(...prices) : numPrice

    res.status(201).json({
      ...priceRecord.toObject(),
      latestPrice: priceRecord.price,
      latestPriceDate: priceRecord.recordedAt,
      high52,
      low52,
      previousPrice: previousPriceDoc ? previousPriceDoc.price : null
    })
  } catch (error) {
    res.status(400).json({ message: 'Error updating price', error: error.message })
  }
}

export const getPriceHistory = async (req, res) => {
  try {
    const { companyId } = req.params

    const history = await PriceHistory.find({ company: companyId })
      .sort({ recordedAt: 1 })
      .lean()

    res.status(200).json(history)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching price history', error: error.message })
  }
}
