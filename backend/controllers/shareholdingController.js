import mongoose from 'mongoose'
import Company from '../models/Company.js'
import CompanyShareholding from '../models/CompanyShareholding.js'

// Parse financial year string (e.g., "FY26", "FY2026", "2026") into numeric year for consistent sorting
const parseYearNumeric = (fyString) => {
  if (!fyString) return 0
  const digits = fyString.replace(/\D/g, '')
  if (!digits) return 0
  const num = parseInt(digits, 10)
  if (num < 100) return 2000 + num // "FY26" -> 2026
  return num
}

const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }

// Distinct visual palette for categories
const CATEGORY_COLORS = {
  'promoter': '#3B82F6', // Blue
  'promoter & promoter group': '#3B82F6',
  'financial institutions': '#10B981', // Emerald green
  'banks / fi': '#10B981',
  'domestic institutions': '#10B981',
  'dii': '#10B981',
  'bodies corporate': '#F59E0B', // Amber
  'body corporate': '#F59E0B',
  'foreign institutional': '#6366F1', // Indigo
  'fii': '#6366F1',
  'individuals': '#8B5CF6', // Purple
  'public': '#8B5CF6',
  'hni': '#8B5CF6',
  'employee benefit': '#EC4899', // Pink
  'esop': '#EC4899',
  'others': '#64748B' // Slate
}

const resolveCategoryColor = (category, fallbackIdx = 0) => {
  if (!category) return '#3B82F6'
  const key = category.trim().toLowerCase()
  for (const [pattern, color] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(pattern)) return color
  }
  const fallbackPalette = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B']
  return fallbackPalette[fallbackIdx % fallbackPalette.length]
}

// GET /api/companies/:id/shareholding  OR  GET /api/shareholding/company/:id
export const getCompanyShareholding = async (req, res) => {
  try {
    const companyId = req.params.id || req.params.companyId

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID format' })
    }

    const company = await Company.findById(companyId).select('name sector').lean()
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    const rawRecords = await CompanyShareholding.find({ company: companyId }).lean()

    if (!rawRecords || rawRecords.length === 0) {
      return res.status(200).json({
        companyId,
        companyName: company.name,
        hasData: false,
        periods: [],
        records: []
      })
    }

    // Sort chronologically ascending (oldest -> newest) for accurate YoY shift calculation
    rawRecords.sort((a, b) => {
      const yearDiff = parseYearNumeric(a.financialYear) - parseYearNumeric(b.financialYear)
      if (yearDiff !== 0) return yearDiff
      const qA = quarterOrder[a.quarter] || 0
      const qB = quarterOrder[b.quarter] || 0
      return qA - qB
    })

    // Compute YoY shifts across consecutive periods
    const enrichedRecords = rawRecords.map((rec, idx) => {
      const prevRec = idx > 0 ? rawRecords[idx - 1] : null

      const enrichedBreakdown = (rec.breakdown || []).map((item, bIdx) => {
        let shift = '0.0%'
        if (prevRec && Array.isArray(prevRec.breakdown)) {
          const prevItem = prevRec.breakdown.find(
            (p) => p.category.trim().toLowerCase() === item.category.trim().toLowerCase()
          )
          if (prevItem && prevItem.percentage !== undefined) {
            const diff = Number((item.percentage - prevItem.percentage).toFixed(2))
            const sign = diff > 0 ? '+' : ''
            shift = `${sign}${diff}%`
          }
        }

        return {
          category: item.category,
          percentage: Number(item.percentage),
          numberOfShares: item.numberOfShares || null,
          color: item.color || resolveCategoryColor(item.category, bIdx),
          lockInStatus: item.lockInStatus || (item.category.toLowerCase().includes('promoter') ? 'Pre-IPO (6m lock-in)' : 'Free Float'),
          shift
        }
      })

      const periodLabel = rec.quarter ? `${rec.quarter} ${rec.financialYear}` : rec.financialYear

      return {
        _id: rec._id,
        financialYear: rec.financialYear,
        quarter: rec.quarter,
        periodType: rec.periodType,
        periodLabel,
        promoterPledgedPercentage: Number(rec.promoterPledgedPercentage || 0),
        totalSharesCount: rec.totalSharesCount || null,
        totalPercentage: Number(rec.totalPercentage || 100),
        breakdown: enrichedBreakdown,
        marqueeInvestors: rec.marqueeInvestors || [],
        sourceUrl: rec.sourceUrl || '',
        notes: rec.notes || '',
        updatedAt: rec.updatedAt
      }
    })

    // Sort descending (latest year first, e.g. FY26, FY25, FY24) for default UI view
    const descendingRecords = [...enrichedRecords].reverse()
    const periods = descendingRecords.map((r) => r.periodLabel)

    return res.status(200).json({
      companyId,
      companyName: company.name,
      hasData: true,
      count: descendingRecords.length,
      periods,
      records: descendingRecords
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching shareholding data', error: error.message })
  }
}

// POST /api/admin/shareholding/company/:id  OR  POST /api/companies/:id/shareholding
export const upsertCompanyShareholding = async (req, res) => {
  try {
    const companyId = req.params.id || req.body.company || req.body.companyId

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: 'Valid Company ID is required.' })
    }

    const company = await Company.findById(companyId).select('name').lean()
    if (!company) {
      return res.status(404).json({ message: 'Company not found.' })
    }

    const {
      financialYear,
      periodType = 'annual',
      quarter = null,
      promoterPledgedPercentage = 0,
      totalSharesCount = null,
      breakdown = [],
      marqueeInvestors = [],
      sourceUrl = '',
      notes = ''
    } = req.body

    if (!financialYear || !financialYear.trim()) {
      return res.status(400).json({ message: 'Financial Year (e.g. FY26) is required.' })
    }

    const cleanFY = financialYear.trim().toUpperCase()

    if (!Array.isArray(breakdown) || breakdown.length === 0) {
      return res.status(400).json({ message: 'At least one shareholder category breakdown is required.' })
    }

    // Clean and validate breakdown rows
    const cleanedBreakdown = breakdown.map((item, idx) => {
      if (!item.category || !item.category.trim()) {
        throw new Error(`Category name is required for breakdown row ${idx + 1}`)
      }
      const pct = parseFloat(item.percentage)
      if (Number.isNaN(pct) || pct < 0) {
        throw new Error(`Valid percentage is required for "${item.category}"`)
      }
      return {
        category: item.category.trim(),
        percentage: Number(pct.toFixed(2)),
        numberOfShares: item.numberOfShares ? Number(item.numberOfShares) : null,
        color: item.color || resolveCategoryColor(item.category, idx),
        lockInStatus: item.lockInStatus || (item.category.toLowerCase().includes('promoter') ? 'Pre-IPO (6m lock-in)' : 'Free Float')
      }
    })

    const calculatedTotal = Number(
      cleanedBreakdown.reduce((sum, b) => sum + b.percentage, 0).toFixed(2)
    )

    const filter = {
      company: companyId,
      financialYear: cleanFY,
      periodType,
      quarter: quarter || null
    }

    const updateDoc = {
      ...filter,
      promoterPledgedPercentage: Number(promoterPledgedPercentage) || 0,
      totalSharesCount: totalSharesCount ? Number(totalSharesCount) : null,
      totalPercentage: calculatedTotal,
      breakdown: cleanedBreakdown,
      marqueeInvestors: Array.isArray(marqueeInvestors) ? marqueeInvestors : [],
      sourceUrl: (sourceUrl || '').trim(),
      notes: (notes || '').trim()
    }

    const saved = await CompanyShareholding.findOneAndUpdate(filter, updateDoc, {
      new: true,
      upsert: true,
      runValidators: true
    }).populate('company', 'name sector')

    return res.status(200).json({
      message: `Shareholding record for ${cleanFY} saved successfully.`,
      record: saved
    })
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Error saving shareholding record' })
  }
}

// DELETE /api/admin/shareholding/:id
export const deleteCompanyShareholding = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const deleted = await CompanyShareholding.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Shareholding record not found' })
    }

    return res.status(200).json({ message: 'Shareholding record deleted successfully', id })
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting shareholding record', error: error.message })
  }
}

// GET /api/admin/shareholding
export const getAllShareholdingsAdmin = async (req, res) => {
  try {
    const { companyId } = req.query
    const filter = {}
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      filter.company = companyId
    }

    const records = await CompanyShareholding.find(filter)
      .populate('company', 'name sector logoUrl')
      .sort({ company: 1, financialYear: -1, createdAt: -1 })
      .lean()

    return res.status(200).json({ count: records.length, records })
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching admin shareholdings', error: error.message })
  }
}

