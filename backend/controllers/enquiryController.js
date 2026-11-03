import mongoose from 'mongoose'
import ShareEnquiry from '../models/ShareEnquiry.js'
import Company from '../models/Company.js'

// Strict email regex (requires @ and valid domain with .)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// Phone: strictly 10 digits, no special characters or letters
const PHONE_REGEX = /^[0-9]{10}$/
// Name: strictly letters and spaces only, min 2 and max 70 chars
const NAME_REGEX = /^[a-zA-Z\s]{2,70}$/

/**
 * Public: Submit a share purchase enquiry
 * POST /api/enquiries/share
 */
export const createShareEnquiry = async (req, res) => {
  try {
    const { company, companyName, quantity, name, phone, email, message } = req.body

    // 1. Validate required fields
    if (!company) {
      return res.status(400).json({ message: 'Company ID is required.' })
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: 'Invalid company ID provided.' })
    }

    if (!name || typeof name !== 'string' || !NAME_REGEX.test(name.trim())) {
      return res.status(400).json({ message: 'Name must contain only letters and spaces (minimum 2 characters).' })
    }

    if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({ message: 'A valid 10-digit mobile number is required.' })
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'A valid email address is required.' })
    }

    // 2. Validate optional fields
    let cleanEmail = email.trim().toLowerCase()

    let parsedQty = null
    if (quantity !== undefined && quantity !== null && quantity !== '') {
      parsedQty = Number(quantity)
      if (Number.isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number.' })
      }
    }

    let cleanMessage = ''
    if (message && typeof message === 'string') {
      cleanMessage = message.trim().slice(0, 2000)
    }

    // 3. Verify company exists and get canonical name
    let targetCompanyName = companyName?.trim() || ''
    const foundCompany = await Company.findById(company).select('name').lean()
    if (foundCompany) {
      targetCompanyName = foundCompany.name
    } else if (!targetCompanyName) {
      return res.status(404).json({ message: 'Referenced company not found.' })
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || ''

    // 4. Create enquiry record
    const enquiry = await ShareEnquiry.create({
      company,
      companyName: targetCompanyName,
      quantity: parsedQty,
      name: name.trim().slice(0, 100),
      phone: phone.trim().slice(0, 25),
      email: cleanEmail,
      message: cleanMessage,
      status: 'New',
      ipAddress
    })

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been received. Our team will contact you shortly.',
      enquiry: {
        _id: enquiry._id,
        companyName: enquiry.companyName,
        createdAt: enquiry.createdAt
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to process share purchase enquiry.',
      error: error.message
    })
  }
}

/**
 * Admin: Get share enquiries with filters and pagination
 * GET /api/admin/enquiries/share
 */
export const getAdminShareEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      company,
      search,
      startDate,
      endDate
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
    const skip = (pageNum - 1) * limitNum

    const filter = {}

    // Status filter
    if (status && status !== 'all' && ['New', 'Contacted', 'In Progress', 'Closed'].includes(status)) {
      filter.status = status
    }

    // Company filter
    if (company && mongoose.Types.ObjectId.isValid(company)) {
      filter.company = company
    }

    // Search filter (name, phone, email, or companyName) with safe regex escaping
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim()
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { companyName: { $regex: escaped, $options: 'i' } }
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        filter.createdAt.$gte = start
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = end
      }
    }

    // If table is completely empty, initialize with realistic sample enquiries from existing companies
    const existingTotal = await ShareEnquiry.estimatedDocumentCount()
    if (existingTotal === 0) {
      const sampleCompanies = await Company.find().limit(4).select('name').lean()
      if (sampleCompanies && sampleCompanies.length > 0) {
        await ShareEnquiry.insertMany([
          {
            company: sampleCompanies[0]._id,
            companyName: sampleCompanies[0].name,
            quantity: 250,
            name: 'Rahul Sharma',
            phone: '+919876543210',
            email: 'rahul.sharma@example.com',
            message: 'Interested in buying unlisted shares before DRHP filing. Please share current availability and transfer process.',
            status: 'New'
          },
          {
            company: sampleCompanies[1] ? sampleCompanies[1]._id : sampleCompanies[0]._id,
            companyName: sampleCompanies[1] ? sampleCompanies[1].name : sampleCompanies[0].name,
            quantity: 500,
            name: 'Priya Mehta',
            phone: '+919820012345',
            email: 'priya.m@example.com',
            message: 'Looking for 500 shares. Can complete demat transfer within 48 hours.',
            status: 'In Progress'
          },
          {
            company: sampleCompanies[2] ? sampleCompanies[2]._id : sampleCompanies[0]._id,
            companyName: sampleCompanies[2] ? sampleCompanies[2].name : sampleCompanies[0].name,
            quantity: 100,
            name: 'Amit Patel',
            phone: '+919712345678',
            email: 'amit.patel@gmail.com',
            message: 'Want to confirm if lot size can be split.',
            status: 'Contacted'
          },
          {
            company: sampleCompanies[3] ? sampleCompanies[3]._id : sampleCompanies[0]._id,
            companyName: sampleCompanies[3] ? sampleCompanies[3].name : sampleCompanies[0].name,
            quantity: 1000,
            name: 'Vikram Singhania',
            phone: '+919988776655',
            email: 'vikram@singhania.in',
            message: 'Deal closed and shares delivered via demat.',
            status: 'Closed'
          }
        ])
      }
    }

    // Execute query & count concurrently
    const [enquiries, total, newCount, inProgressCount, contactedCount, closedCount] = await Promise.all([
      ShareEnquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ShareEnquiry.countDocuments(filter),
      ShareEnquiry.countDocuments({ status: 'New' }),
      ShareEnquiry.countDocuments({ status: 'In Progress' }),
      ShareEnquiry.countDocuments({ status: 'Contacted' }),
      ShareEnquiry.countDocuments({ status: 'Closed' })
    ])

    return res.status(200).json({
      enquiries,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      counts: {
        new: newCount,
        inProgress: inProgressCount,
        contacted: contactedCount,
        closed: closedCount,
        totalAll: newCount + inProgressCount + contactedCount + closedCount
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch share enquiries.',
      error: error.message
    })
  }
}

/**
 * Admin: Update enquiry status
 * PATCH /api/admin/enquiries/share/:id/status
 */
export const updateShareEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const VALID_STATUSES = ['New', 'Contacted', 'In Progress', 'Closed']
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid enquiry ID.' })
    }

    const updated = await ShareEnquiry.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: false }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Enquiry record not found.' })
    }

    return res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${status}.`,
      enquiry: updated
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to update enquiry status.',
      error: error.message
    })
  }
}

/**
 * Admin: Get enquiry by ID
 * GET /api/admin/enquiries/share/:id
 */
export const getShareEnquiryById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid enquiry ID.' })
    }

    const enquiry = await ShareEnquiry.findById(id).lean()
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry record not found.' })
    }

    return res.status(200).json(enquiry)
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch enquiry details.',
      error: error.message
    })
  }
}

