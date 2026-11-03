import ContactSubmission from '../models/ContactSubmission.js'

export const createContactSubmission = async (req, res) => {
  try {
    const { name, email, message } = req.body
    const submission = await ContactSubmission.create({ name, email, message })
    res.status(201).json(submission)
  } catch (error) {
    res.status(400).json({ message: 'Error submitting contact form', error: error.message })
  }
}

export const getContactSubmissions = async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 }).lean()
    res.status(200).json(submissions)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact submissions', error: error.message })
  }
}

export const getUnreadContactCount = async (req, res) => {
  try {
    const count = await ContactSubmission.countDocuments({ status: 'new' })
    res.status(200).json({ count })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message })
  }
}

export const markContactRead = async (req, res) => {
  try {
    const { id } = req.params
    const submission = await ContactSubmission.findByIdAndUpdate(id, { status: 'read' }, { new: true })
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }
    res.status(200).json(submission)
  } catch (error) {
    res.status(500).json({ message: 'Error updating submission', error: error.message })
  }
}
