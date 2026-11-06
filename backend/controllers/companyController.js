import Company from '../models/Company.js'
import PriceHistory from '../models/PriceHistory.js'

// Shared helper: attach latestPrice / high52 / low52 stats to a single
// lean company object. Reused by getAllCompanies, getAllCompaniesAdmin
// and getDrhpFiledCompanies so the stats logic is never duplicated.
const attachStats = async (company) => {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

  const latestPriceDoc = await PriceHistory.findOne({ company: company._id })
    .sort({ recordedAt: -1 })
    .lean()

  const prices52w = await PriceHistory.find({
    company: company._id,
    recordedAt: { $gte: oneYearAgo }
  }).lean()

  const prices = prices52w.map(p => p.price)
  const high52 = prices.length ? Math.max(...prices) : null
  const low52 = prices.length ? Math.min(...prices) : null

  return {
    ...company,
    latestPrice: latestPriceDoc ? latestPriceDoc.price : null,
    latestPriceDate: latestPriceDoc ? latestPriceDoc.recordedAt : null,
    high52,
    low52
  }
}

const attachStatsBatch = async (companies) =>
  Promise.all(companies.map(attachStats))

export const getAllCompanies = async (req, res) => {
  try {
    const { sector, search, limit, page } = req.query
    const query = { isActive: true }

    if (sector) {
      query.sector = sector
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    let mongooseQuery = Company.find(query).sort({ createdAt: -1 })

    const parsedLimit = parseInt(limit, 10)
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      const parsedPage = parseInt(page, 10) || 1
      if (parsedPage > 1) {
        mongooseQuery = mongooseQuery.skip((parsedPage - 1) * parsedLimit)
      }
      mongooseQuery = mongooseQuery.limit(parsedLimit)
    }

    const companies = await mongooseQuery.lean()
    const companiesWithStats = await attachStatsBatch(companies)

    res.status(200).json(companiesWithStats)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message })
  }
}

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params

const company = await Company.findById(id).lean()
  if (!company) {
    return res.status(404).json({ message: 'Company not found' })
  }

  const priceHistory = await PriceHistory.find({ company: id })
    .sort({ recordedAt: 1 })
    .lean()

  const enriched = await attachStats(company)
  res.status(200).json({
    ...enriched,
    priceHistory
  })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company', error: error.message })
  }
}

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body)
    res.status(201).json(company)
  } catch (error) {
    res.status(400).json({ message: 'Error creating company', error: error.message })
  }
}

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params
    const allowedFields = [
      'name', 'sector', 'industry', 'cin', 'registeredOffice', 'foundedYear',
      'description', 'lotSize', 'faceValue', 'isin', 'logoUrl',
      'marketCap', 'peRatio', 'pbRatio', 'roe', 'bookValue', 'outstandingShares',
      'drhpFiled', 'drhpFiledDate'
    ]

    const updates = {}
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    }

    const company = await Company.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    res.status(200).json(company)
  } catch (error) {
    res.status(400).json({ message: 'Error updating company', error: error.message })
  }
}

export const deactivateCompany = async (req, res) => {
  try {
    const { id } = req.params
    const company = await Company.findByIdAndUpdate(id, { isActive: false }, { new: true })
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }
    res.status(200).json({ message: 'Company deactivated', company })
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating company', error: error.message })
  }
}

export const uploadLogo = async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({ message: 'No logo file uploaded' })
    }

    const company = await Company.findById(id)
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    company.logoUrl = `/uploads/${req.file.filename}`
    await company.save()

    res.status(200).json(company)
  } catch (error) {
    res.status(500).json({ message: 'Error uploading logo', error: error.message })
  }
}

export const getAllCompaniesAdmin = async (req, res) => {
  try {
    const { sector, search, limit, page } = req.query
    const query = {}

    if (sector) {
      query.sector = sector
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    let mongooseQuery = Company.find(query).sort({ createdAt: -1 })

    const parsedLimit = parseInt(limit, 10)
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      const parsedPage = parseInt(page, 10) || 1
      if (parsedPage > 1) {
        mongooseQuery = mongooseQuery.skip((parsedPage - 1) * parsedLimit)
      }
      mongooseQuery = mongooseQuery.limit(parsedLimit)
    }

    const companies = await mongooseQuery.lean()

    const companiesWithStats = await attachStatsBatch(companies)

    res.status(200).json(companiesWithStats)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message })
  }
}

export const updateDrhpStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { drhpFiled, drhpFiledDate } = req.body

    const updates = {}
    if (drhpFiled !== undefined) updates.drhpFiled = Boolean(drhpFiled)
    if (drhpFiledDate !== undefined) {
      updates.drhpFiledDate = drhpFiledDate ? new Date(drhpFiledDate) : null
    }

    const company = await Company.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    res.status(200).json(company)
  } catch (error) {
    res.status(400).json({ message: 'Error updating DRHP status', error: error.message })
  }
}

export const getDrhpFiledCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ drhpFiled: true, isActive: true })
      .sort({ drhpFiledDate: -1 })
      .lean()

    const companiesWithStats = await attachStatsBatch(companies)

    res.status(200).json(companiesWithStats)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching DRHP filed companies', error: error.message })
  }
}

export const activateCompany = async (req, res) => {
  try {
    const { id } = req.params
    const company = await Company.findByIdAndUpdate(id, { isActive: true }, { new: true })
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }
    res.status(200).json({ message: 'Company activated', company })
  } catch (error) {
    res.status(500).json({ message: 'Error activating company', error: error.message })
  }
}


export const bulkImportCompanies = async (req, res) => {
  try {
    const { companies } = req.body
    if (!Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({ message: 'No companies provided for import.' })
    }

    let createdCount = 0
    let failedCount = 0
    const failures = []

    for (let i = 0; i < companies.length; i++) {
      const item = companies[i]
      const rowNum = item.rowNumber || (i + 1)
      try {
        const name = (item.name || '').trim()
        const sector = (item.sector || '').trim()
        const lotSize = Number(item.lotSize)

        if (!name) {
          failedCount++
          failures.push(`Row ${rowNum}: Company Name is required`)
          continue
        }
        if (!sector) {
          failedCount++
          failures.push(`Row ${rowNum} (${name}): Sector is required`)
          continue
        }
        if (!item.lotSize || Number.isNaN(lotSize) || lotSize <= 0) {
          failedCount++
          failures.push(`Row ${rowNum} (${name}): Valid positive Lot Size is required`)
          continue
        }

        const company = await Company.create({
          name,
          sector,
          industry: item.industry?.trim(),
          cin: item.cin?.trim(),
          registeredOffice: item.registeredOffice?.trim(),
          foundedYear: item.foundedYear ? Number(item.foundedYear) : undefined,
          description: item.description?.trim(),
          lotSize,
          faceValue: item.faceValue ? Number(item.faceValue) : undefined,
          isin: item.isin?.trim(),
          marketCap: item.marketCap ? Number(item.marketCap) : undefined,
          peRatio: item.peRatio ? Number(item.peRatio) : undefined,
          pbRatio: item.pbRatio ? Number(item.pbRatio) : undefined,
          roe: item.roe ? Number(item.roe) : undefined,
          bookValue: item.bookValue ? Number(item.bookValue) : undefined,
          outstandingShares: item.outstandingShares ? Number(item.outstandingShares) : undefined,
          drhpFiled: Boolean(item.drhpFiled),
          drhpFiledDate: item.drhpFiled ? (item.drhpFiledDate || new Date()) : null
        })

        if (item.price && Number(item.price) > 0) {
          await PriceHistory.create({
            company: company._id,
            price: Number(item.price),
            recordedAt: new Date()
          })
        }

        createdCount++
      } catch (err) {
        failedCount++
        failures.push(`Row ${rowNum} (${item.name || 'Unknown'}): ${err.message}`)
      }
    }

    return res.status(200).json({
      message: `Successfully imported ${createdCount} company record(s).`,
      createdCount,
      failedCount,
      failures
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error bulk importing companies', error: error.message })
  }
}
