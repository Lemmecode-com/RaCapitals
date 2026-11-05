import mongoose from 'mongoose'

const ShareFaqSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

ShareFaqSchema.index({ company: 1, order: 1 })
ShareFaqSchema.index({ isPublished: 1 })

export default mongoose.model('ShareFaq', ShareFaqSchema)

