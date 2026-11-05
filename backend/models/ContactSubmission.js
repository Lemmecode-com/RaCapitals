import mongoose from 'mongoose'

const ContactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Contacted', 'Closed', 'new', 'read', 'replied'],
    default: 'New'
  }
}, { timestamps: true })

export default mongoose.model('ContactSubmission', ContactSubmissionSchema)
