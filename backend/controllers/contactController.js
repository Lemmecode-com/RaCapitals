import ContactSubmission from '../models/ContactSubmission.js'

export const createContactSubmission = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body

    // 1. Name validation
    const cleanName = (name || '').trim()
    if (!cleanName) {
      return res.status(400).json({ message: 'Name is required.' })
    }
    if (cleanName.length > 50) {
      return res.status(400).json({ message: 'Name cannot exceed 50 characters.' })
    }
    if (/\d/.test(cleanName)) {
      return res.status(400).json({ message: 'Name cannot contain numbers.' })
    }

    // 2. Email validation
    const cleanEmail = (email || '').trim().toLowerCase()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' })
    }

    // 3. Phone number validation & sanitization (mandatory, strictly 10 digits)
    const cleanPhone = (phone || '').toString().replace(/[^0-9]/g, '').slice(0, 10)
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'A valid 10-digit mobile phone number is required.' })
    }

    // 4. Message validation
    const cleanMessage = (message || '').trim()
    if (!cleanMessage) {
      return res.status(400).json({ message: 'Message cannot be empty.' })
    }
    if (cleanMessage.length > 1000) {
      return res.status(400).json({ message: 'Message cannot exceed 1000 characters.' })
    }

    const submission = await ContactSubmission.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
      status: 'New'
    })

    res.status(201).json(submission)
  } catch (error) {
    res.status(400).json({ message: 'Error submitting contact form', error: error.message })
  }
}

export const getContactSubmissions = async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query
    const query = {}

    // Status filter
    if (status && status !== 'all') {
      query.status = new RegExp(`^${status}$`, 'i')
    }

    // Search filter across sender name, email, phone, or message
    if (search && search.trim()) {
      const searchLow = search.trim()
      query.$or = [
        { name: { $regex: searchLow, $options: 'i' } },
        { email: { $regex: searchLow, $options: 'i' } },
        { phone: { $regex: searchLow, $options: 'i' } },
        { message: { $regex: searchLow, $options: 'i' } }
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        query.createdAt.$lte = end
      }
    }

    const submissions = await ContactSubmission.find(query).sort({ createdAt: -1 }).lean()
    res.status(200).json(submissions)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact submissions', error: error.message })
  }
}

export const getUnreadContactCount = async (req, res) => {
  try {
    const count = await ContactSubmission.countDocuments({
      status: { $in: ['new', 'New'] }
    })
    res.status(200).json({ count })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message })
  }
}

export const markContactRead = async (req, res) => {
  try {
    const { id } = req.params
    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { status: 'Contacted' },
      { new: true }
    )
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }
    res.status(200).json(submission)
  } catch (error) {
    res.status(500).json({ message: 'Error updating submission', error: error.message })
  }
}

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['New', 'In Progress', 'Contacted', 'Closed']
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      })
    }

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!submission) {
      return res.status(404).json({ message: 'Contact submission not found' })
    }

    res.status(200).json(submission)
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact status', error: error.message })
  }
}
