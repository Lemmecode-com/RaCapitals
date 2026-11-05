import ShareFaq from '../models/ShareFaq.js'
import Company from '../models/Company.js'

const DEFAULT_GLOBAL_FAQS = [
  {
    q: 'How do I purchase unlisted shares of {COMPANY_NAME}?',
    a: 'The process is completely digital and compliant. 1) Submit your purchase enquiry with desired quantity. 2) Our desk confirms real-time inventory and frozen block price. 3) You provide your Demat Client Master Report (CMR) copy and complete payment via bank transfer. 4) Shares are credited directly to your CDSL/NSDL Demat account within 24-48 business hours.',
    order: 1
  },
  {
    q: 'How are unlisted shares delivered to my Demat account?',
    a: 'Unlisted shares are transferred off-market via CDSL/NSDL Delivery Instruction Slip (DIS) or speed-e electronic transfer directly into your Demat account (Zerodha, Groww, AngelOne, ICICI Direct, HDFC Sky, etc.). You can view them in your portfolio holdings statement under the assigned ISIN.',
    order: 2
  },
  {
    q: 'What is the lock-in period once {COMPANY_NAME} files for IPO and lists?',
    a: 'Under current SEBI (Issue of Capital and Disclosure Requirements) regulations, all pre-IPO equity shares held by non-promoter shareholders are subject to a mandatory 6-month lock-in period starting from the listing date on NSE/BSE. After 6 months, shares become freely tradeable on the stock exchange.',
    order: 3
  },
  {
    q: 'What are the capital gains tax rules for unlisted shares in India?',
    a: 'Under the Indian Income Tax Act, if unlisted shares are held for more than 24 months, gains are classified as Long-Term Capital Gains (LTCG) and taxed at 12.5% (post-July 2024 budget revision). If held for 24 months or less, gains are treated as Short-Term Capital Gains (STCG) and taxed at your applicable individual income tax slab rates.',
    order: 4
  },
  {
    q: 'Can I sell my unlisted shares before {COMPANY_NAME} goes public?',
    a: 'Yes. You are not forced to hold until the IPO. Taurus Magnus operates an active secondary OTC unlisted desk and can help you liquidate your position anytime based on prevailing market demand and counterparty interest.',
    order: 5
  },
  {
    q: 'What is the minimum transaction ticket size?',
    a: 'Minimum investment is determined by the minimum lot size (e.g. 50 shares) multiplied by the prevailing indicative share price, generally starting from ₹25,000 to ₹1,00,000 depending on the script.',
    order: 6
  }
]

// GET /api/companies/:id/faqs  OR  GET /api/faqs/company/:id
export const getCompanyFaqs = async (req, res) => {
  try {
    const companyId = req.params.id || req.params.companyId
    let companyName = 'this company'

    if (companyId) {
      const company = await Company.findById(companyId).select('name').lean()
      if (company && company.name) {
        companyName = company.name
      }
    }

    // 1. Check for company-specific published FAQs
    const customFaqs = await ShareFaq.find({
      company: companyId,
      isPublished: true
    })
      .sort({ order: 1, createdAt: 1 })
      .lean()

    if (customFaqs.length > 0) {
      return res.status(200).json({
        isCustom: true,
        source: 'company_custom',
        count: customFaqs.length,
        faqs: customFaqs.map(f => ({
          _id: f._id,
          question: f.question.replace(/\{COMPANY_NAME\}/g, companyName),
          answer: f.answer.replace(/\{COMPANY_NAME\}/g, companyName),
          order: f.order
        }))
      })
    }

    // 2. Check for global published template FAQs in database
    const globalDbFaqs = await ShareFaq.find({
      company: null,
      isPublished: true
    })
      .sort({ order: 1, createdAt: 1 })
      .lean()

    if (globalDbFaqs.length > 0) {
      return res.status(200).json({
        isCustom: false,
        source: 'global_template',
        count: globalDbFaqs.length,
        faqs: globalDbFaqs.map(f => ({
          _id: f._id,
          question: f.question.replace(/\{COMPANY_NAME\}/g, companyName),
          answer: f.answer.replace(/\{COMPANY_NAME\}/g, companyName),
          order: f.order
        }))
      })
    }

    // 3. Fallback to standard pre-IPO reference FAQs
    const fallbackFaqs = DEFAULT_GLOBAL_FAQS.map((f, i) => ({
      _id: `default-${i + 1}`,
      question: f.q.replace(/\{COMPANY_NAME\}/g, companyName),
      answer: f.a.replace(/\{COMPANY_NAME\}/g, companyName),
      order: f.order
    }))

    return res.status(200).json({
      isCustom: false,
      source: 'default_fallback',
      count: fallbackFaqs.length,
      faqs: fallbackFaqs
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching FAQs', error: error.message })
  }
}

// GET /api/admin/faqs
export const getAdminFaqs = async (req, res) => {
  try {
    const { companyId, search, status } = req.query
    const filter = {}

    if (companyId) {
      if (companyId === 'global') {
        filter.company = null
      } else {
        filter.company = companyId
      }
    }

    if (status === 'published') {
      filter.isPublished = true
    } else if (status === 'draft') {
      filter.isPublished = false
    }

    if (search && search.trim()) {
      filter.$or = [
        { question: { $regex: search.trim(), $options: 'i' } },
        { answer: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const faqs = await ShareFaq.find(filter)
      .populate('company', 'name sector logoUrl')
      .sort({ company: 1, order: 1, createdAt: -1 })
      .lean()

    // Aggregated metrics
    const [totalCount, publishedCount, globalCount] = await Promise.all([
      ShareFaq.countDocuments(),
      ShareFaq.countDocuments({ isPublished: true }),
      ShareFaq.countDocuments({ company: null })
    ])

    return res.status(200).json({
      faqs,
      metrics: {
        total: totalCount,
        published: publishedCount,
        draft: totalCount - publishedCount,
        global: globalCount,
        companySpecific: totalCount - globalCount
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching admin FAQs', error: error.message })
  }
}

// POST /api/admin/faqs
export const createFaq = async (req, res) => {
  try {
    const { company, question, answer, order, isPublished } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' })
    }
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required' })
    }

    let parsedCompany = null
    if (company && company !== 'global' && company !== '') {
      parsedCompany = company
    }

    const faq = await ShareFaq.create({
      company: parsedCompany,
      question: question.trim(),
      answer: answer.trim(),
      order: Number(order) || 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true
    })

    const populated = await ShareFaq.findById(faq._id)
      .populate('company', 'name sector logoUrl')
      .lean()

    return res.status(201).json(populated)
  } catch (error) {
    return res.status(400).json({ message: 'Error creating FAQ', error: error.message })
  }
}

// PUT /api/admin/faqs/:id
export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params
    const { company, question, answer, order, isPublished } = req.body

    const updates = {}
    if (company !== undefined) {
      updates.company = (company === 'global' || !company) ? null : company
    }
    if (question !== undefined) updates.question = question.trim()
    if (answer !== undefined) updates.answer = answer.trim()
    if (order !== undefined) updates.order = Number(order) || 0
    if (isPublished !== undefined) updates.isPublished = Boolean(isPublished)

    const updated = await ShareFaq.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('company', 'name sector logoUrl')
      .lean()

    if (!updated) {
      return res.status(404).json({ message: 'FAQ not found' })
    }

    return res.status(200).json(updated)
  } catch (error) {
    return res.status(400).json({ message: 'Error updating FAQ', error: error.message })
  }
}

// DELETE /api/admin/faqs/:id
export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await ShareFaq.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ message: 'FAQ not found' })
    }

    return res.status(200).json({ message: 'FAQ deleted successfully', id })
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting FAQ', error: error.message })
  }
}

// PATCH /api/admin/faqs/:id/publish
export const toggleFaqPublish = async (req, res) => {
  try {
    const { id } = req.params
    const faq = await ShareFaq.findById(id)

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' })
    }

    faq.isPublished = !faq.isPublished
    await faq.save()

    const populated = await ShareFaq.findById(faq._id)
      .populate('company', 'name sector logoUrl')
      .lean()

    return res.status(200).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling FAQ status', error: error.message })
  }
}

// PATCH /api/admin/faqs/reorder
export const reorderFaqs = async (req, res) => {
  try {
    const { items } = req.body // [{ id, order }]

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items array is required' })
    }

    const updates = items.map(item =>
      ShareFaq.findByIdAndUpdate(item.id, { order: Number(item.order) || 0 })
    )

    await Promise.all(updates)
    return res.status(200).json({ message: 'FAQs reordered successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Error reordering FAQs', error: error.message })
  }
}

// POST /api/admin/faqs/bulk-import
export const bulkImportFaqs = async (req, res) => {
  try {
    const { faqs } = req.body
    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ message: 'No FAQ records provided for import.' })
    }

    // Load active companies to resolve company name to ID
    const companies = await Company.find({}).select('_id name').lean()
    const companyMap = new Map()
    companies.forEach((c) => {
      companyMap.set(c.name.trim().toLowerCase(), c._id)
    })

    const toInsert = []
    const errors = []

    for (let i = 0; i < faqs.length; i++) {
      const row = faqs[i]
      const rowNum = i + 1

      const question = (row.question || '').trim()
      const answer = (row.answer || '').trim()
      const companyInput = (row.company || row.companyName || row.company_name || '').trim()

      if (!question) {
        errors.push({ row: rowNum, error: 'Question is required.' })
        continue
      }
      if (!answer) {
        errors.push({ row: rowNum, error: 'Answer is required.' })
        continue
      }

      let companyId = null
      if (companyInput) {
        if (/^[0-9a-fA-F]{24}$/.test(companyInput) && companies.some((c) => c._id.toString() === companyInput)) {
          companyId = companyInput
        } else {
          const matched = companyMap.get(companyInput.toLowerCase())
          if (matched) {
            companyId = matched
          } else {
            errors.push({ row: rowNum, error: `Company "${companyInput}" not found in database.` })
            continue
          }
        }
      } else {
        errors.push({ row: rowNum, error: 'Company name is required.' })
        continue
      }

      const order = Number(row.order) || (toInsert.length + 1)
      const isPublished = row.isPublished !== undefined ? Boolean(row.isPublished) : true

      toInsert.push({
        company: companyId,
        question,
        answer,
        order,
        isPublished
      })
    }

    if (toInsert.length === 0) {
      return res.status(400).json({
        message: 'No valid FAQs could be imported. Please review row-wise errors.',
        errors,
        importedCount: 0
      })
    }

    const inserted = await ShareFaq.insertMany(toInsert)

    return res.status(200).json({
      message: `Successfully imported ${inserted.length} FAQ(s).`,
      importedCount: inserted.length,
      errorsCount: errors.length,
      errors
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error bulk importing FAQs', error: error.message })
  }
}

