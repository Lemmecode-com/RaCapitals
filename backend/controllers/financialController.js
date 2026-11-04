import mongoose from 'mongoose'
import Company from '../models/Company.js'
import CompanyFinancials from '../models/CompanyFinancials.js'

// Parse financial year string (e.g., "FY21", "FY2021", "2021") into numeric year for consistent sorting
const parseYearNumeric = (fyString) => {
  if (!fyString) return 0
  const digits = fyString.replace(/\D/g, '')
  if (!digits) return 0
  const num = parseInt(digits, 10)
  if (num < 100) return 2000 + num // "FY24" -> 2024
  return num
}

const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }

// Compute percentage growth delta and formatted representation (+/-)
const computeGrowth = (currentVal, prevVal) => {
  if (prevVal === undefined || prevVal === null || prevVal === 0 || currentVal === undefined || currentVal === null) {
    return { delta: null, formatted: null }
  }
  const pct = ((currentVal - prevVal) / Math.abs(prevVal)) * 100
  const rounded = Number(pct.toFixed(1))
  const sign = rounded > 0 ? '+' : ''
  return {
    delta: rounded,
    formatted: `${sign}${rounded}%`
  }
}

// Ensure derived metrics (EBITDA, OPM, PBT, PAT, PAT Margin) are calculated
const deriveMetrics = (doc) => {
  const rev = Number(doc.revenue || 0)
  const otherInc = Number(doc.otherIncome || 0)
  const totalRev = doc.totalRevenue !== undefined && doc.totalRevenue !== null && doc.totalRevenue !== 0
    ? Number(doc.totalRevenue)
    : rev + otherInc

  const opex = Number(doc.operatingExpenses || 0)
  const ebitda = doc.ebitda !== undefined && doc.ebitda !== null && doc.ebitda !== 0
    ? Number(doc.ebitda)
    : totalRev - opex

  const ebitdaMargin = doc.ebitdaMargin !== undefined && doc.ebitdaMargin !== null && doc.ebitdaMargin !== 0
    ? Number(doc.ebitdaMargin)
    : (totalRev > 0 ? Number(((ebitda / totalRev) * 100).toFixed(2)) : 0)

  const depr = Number(doc.depreciation || 0)
  const finance = Number(doc.financeCosts || 0)
  const pbt = doc.pbt !== undefined && doc.pbt !== null && doc.pbt !== 0
    ? Number(doc.pbt)
    : ebitda - depr - finance

  const tax = Number(doc.tax || 0)
  const pat = doc.pat !== undefined && doc.pat !== null && doc.pat !== 0
    ? Number(doc.pat)
    : pbt - tax

  const patMargin = doc.patMargin !== undefined && doc.patMargin !== null && doc.patMargin !== 0
    ? Number(doc.patMargin)
    : (totalRev > 0 ? Number(((pat / totalRev) * 100).toFixed(2)) : 0)

  return {
    ...doc,
    revenue: rev,
    otherIncome: otherInc,
    totalRevenue: totalRev,
    operatingExpenses: opex,
    ebitda,
    ebitdaMargin,
    depreciation: depr,
    financeCosts: finance,
    pbt,
    tax,
    pat,
    patMargin,
    eps: Number(doc.eps || 0),
    netWorth: Number(doc.netWorth || 0)
  }
}

// GET /api/companies/:id/financials
export const getCompanyFinancials = async (req, res) => {
  try {
    const { id } = req.params
    const period = req.query.period || 'annual' // 'annual' | 'quarterly' | 'all'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid company ID format' })
    }

    const company = await Company.findById(id).lean()
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    const query = { company: id }
    if (period !== 'all') {
      query.periodType = period
    }

    const rawRecords = await CompanyFinancials.find(query).lean()

    // Chronological sort: by financial year number, then by quarter if applicable
    rawRecords.sort((a, b) => {
      const yearDiff = parseYearNumeric(a.financialYear) - parseYearNumeric(b.financialYear)
      if (yearDiff !== 0) return yearDiff
      const qA = quarterOrder[a.quarter] || 0
      const qB = quarterOrder[b.quarter] || 0
      return qA - qB
    })

    // Derive calculated metrics & compute period-over-period YoY deltas
    const enrichedStatements = rawRecords.map((rec, idx) => {
      const derived = deriveMetrics(rec)
      const prev = idx > 0 ? deriveMetrics(rawRecords[idx - 1]) : null

      const revGrowth = prev ? computeGrowth(derived.revenue, prev.revenue) : { delta: null, formatted: null }
      const ebitdaGrowth = prev ? computeGrowth(derived.ebitda, prev.ebitda) : { delta: null, formatted: null }
      const patGrowth = prev ? computeGrowth(derived.pat, prev.pat) : { delta: null, formatted: null }
      const epsGrowth = prev ? computeGrowth(derived.eps, prev.eps) : { delta: null, formatted: null }

      return {
        ...derived,
        growth: {
          revenueYoY: revGrowth.delta,
          revenueYoYFormatted: revGrowth.formatted,
          ebitdaYoY: ebitdaGrowth.delta,
          ebitdaYoYFormatted: ebitdaGrowth.formatted,
          patYoY: patGrowth.delta,
          patYoYFormatted: patGrowth.formatted,
          epsYoY: epsGrowth.delta,
          epsYoYFormatted: epsGrowth.formatted
        }
      }
    })

    res.status(200).json({
      companyId: id,
      companyName: company.name,
      periodType: period,
      count: enrichedStatements.length,
      statements: enrichedStatements
    })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving financial statements', error: error.message })
  }
}

// POST /api/admin/companies/:id/financials
export const upsertCompanyFinancial = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid company ID format' })
    }

    const company = await Company.findById(id)
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    const {
      financialYear,
      periodType = 'annual',
      quarter = null,
      isEstimate = false,
      isAudited = true,
      currency = 'INR',
      unit = 'Cr',
      notes = ''
    } = req.body

    if (!financialYear || typeof financialYear !== 'string') {
      return res.status(400).json({ message: 'financialYear is required (e.g. "FY24")' })
    }

    // Validate numeric monetary fields
    const numericKeys = [
      'revenue', 'otherIncome', 'totalRevenue', 'operatingExpenses',
      'ebitda', 'ebitdaMargin', 'depreciation', 'financeCosts',
      'pbt', 'tax', 'pat', 'patMargin', 'eps', 'netWorth',
      'totalAssets', 'totalLiabilities', 'totalEquity', 'totalDebt',
      'operatingCashFlow', 'investingCashFlow', 'financingCashFlow', 'netCashFlow'
    ]

    for (const key of numericKeys) {
      if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
        const val = Number(req.body[key])
        if (isNaN(val)) {
          return res.status(400).json({ message: `Field "${key}" must be a valid numeric monetary value` })
        }
      }
    }

    // Compute derived metrics before upserting
    const derived = deriveMetrics(req.body)

    const updateDoc = {
      company: id,
      financialYear: financialYear.trim().toUpperCase(),
      periodType,
      quarter: periodType === 'quarterly' ? quarter : null,
      isEstimate: Boolean(isEstimate),
      isAudited: Boolean(isAudited),
      currency,
      unit,
      revenue: derived.revenue,
      otherIncome: derived.otherIncome,
      totalRevenue: derived.totalRevenue,
      operatingExpenses: derived.operatingExpenses,
      ebitda: derived.ebitda,
      ebitdaMargin: derived.ebitdaMargin,
      depreciation: derived.depreciation,
      financeCosts: derived.financeCosts,
      pbt: derived.pbt,
      tax: derived.tax,
      pat: derived.pat,
      patMargin: derived.patMargin,
      eps: derived.eps,
      netWorth: derived.netWorth,
      notes
    }

    // Optional balance sheet / cashflow
    if (req.body.totalAssets !== undefined) updateDoc.totalAssets = Number(req.body.totalAssets)
    if (req.body.totalLiabilities !== undefined) updateDoc.totalLiabilities = Number(req.body.totalLiabilities)
    if (req.body.totalEquity !== undefined) updateDoc.totalEquity = Number(req.body.totalEquity)
    if (req.body.totalDebt !== undefined) updateDoc.totalDebt = Number(req.body.totalDebt)

    const filter = {
      company: id,
      financialYear: updateDoc.financialYear,
      periodType: updateDoc.periodType,
      quarter: updateDoc.quarter
    }

    const savedRecord = await CompanyFinancials.findOneAndUpdate(
      filter,
      updateDoc,
      { upsert: true, new: true, runValidators: true }
    )

    res.status(200).json({
      message: 'Financial statement saved successfully',
      financial: savedRecord
    })
  } catch (error) {
    res.status(400).json({ message: 'Error saving financial statement', error: error.message })
  }
}

// POST /api/admin/financials/bulk-import
export const bulkImportFinancials = async (req, res) => {
  try {
    const { records } = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'records array is required for bulk import' })
    }

    const errors = []
    const successful = []

    for (let i = 0; i < records.length; i++) {
      const rowNum = i + 1
      const rec = records[i]
      const companyId = rec.company || rec.companyId

      if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
        errors.push({ row: rowNum, error: 'Valid company ID is required' })
        continue
      }

      if (!rec.financialYear) {
        errors.push({ row: rowNum, error: 'financialYear is required' })
        continue
      }

      try {
        const derived = deriveMetrics(rec)
        const updateDoc = {
          company: companyId,
          financialYear: rec.financialYear.trim().toUpperCase(),
          periodType: rec.periodType || 'annual',
          quarter: rec.periodType === 'quarterly' ? rec.quarter : null,
          isEstimate: Boolean(rec.isEstimate),
          isAudited: rec.isAudited !== undefined ? Boolean(rec.isAudited) : true,
          revenue: derived.revenue,
          otherIncome: derived.otherIncome,
          totalRevenue: derived.totalRevenue,
          operatingExpenses: derived.operatingExpenses,
          ebitda: derived.ebitda,
          ebitdaMargin: derived.ebitdaMargin,
          depreciation: derived.depreciation,
          financeCosts: derived.financeCosts,
          pbt: derived.pbt,
          tax: derived.tax,
          pat: derived.pat,
          patMargin: derived.patMargin,
          eps: derived.eps,
          netWorth: derived.netWorth,
          notes: rec.notes || ''
        }

        const filter = {
          company: companyId,
          financialYear: updateDoc.financialYear,
          periodType: updateDoc.periodType,
          quarter: updateDoc.quarter
        }

        const upserted = await CompanyFinancials.findOneAndUpdate(
          filter,
          updateDoc,
          { upsert: true, new: true, runValidators: true }
        )
        successful.push(upserted._id)
      } catch (rowErr) {
        errors.push({ row: rowNum, error: rowErr.message })
      }
    }

    res.status(200).json({
      totalProcessed: records.length,
      successCount: successful.length,
      errorCount: errors.length,
      errors
    })
  } catch (error) {
    res.status(500).json({ message: 'Bulk import failed', error: error.message })
  }
}

// DELETE /api/admin/financials/:id
export const deleteCompanyFinancial = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await CompanyFinancials.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Financial record not found' })
    }
    res.status(200).json({ message: 'Financial record deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting financial record', error: error.message })
  }
}

