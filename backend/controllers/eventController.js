import Event from '../models/Event.js'
import Company from '../models/Company.js'

export const getAllEvents = async (req, res) => {
  try {
    const { companyId } = req.query

    const query = {}
    if (companyId) {
      query.company = companyId
    }

    const events = await Event.find(query)
      .sort({ eventDate: -1 })
      .populate({
        path: 'company',
        select: '_id name'
      })
      .lean()

    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message })
  }
}

export const createEvent = async (req, res) => {
  try {
    const { title, description, company, eventDate, eventType } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }
    if (!eventDate) {
      return res.status(400).json({ message: 'Event date is required' })
    }

    const event = await Event.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      company: company || undefined,
      eventDate: new Date(eventDate),
      eventType: eventType || 'Other'
    })

    const populated = await Event.findById(event._id).populate({ path: 'company', select: '_id name' }).lean()
    res.status(201).json(populated)
  } catch (error) {
    res.status(400).json({ message: 'Error creating event', error: error.message })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, company, eventDate, eventType } = req.body

    const updates = {}
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description ? description.trim() : ''
    if (company !== undefined) updates.company = company || undefined
    if (eventDate !== undefined) updates.eventDate = eventDate ? new Date(eventDate) : undefined
    if (eventType !== undefined) updates.eventType = eventType

    const event = await Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate({ path: 'company', select: '_id name' })
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res.status(200).json(event)
  } catch (error) {
    res.status(400).json({ message: 'Error updating event', error: error.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params
    const event = await Event.findByIdAndDelete(id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    res.status(200).json({ message: 'Event deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message })
  }
}