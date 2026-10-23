import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  eventDate: { type: Date, required: true },
  eventType: {
    type: String,
    enum: ['DRHP', 'Funding', 'Leadership Change', 'Other'],
    default: 'Other'
  }
}, { timestamps: true })

export default mongoose.model('Event', EventSchema)