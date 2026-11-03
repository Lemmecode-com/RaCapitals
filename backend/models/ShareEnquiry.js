import mongoose from 'mongoose'

const ShareEnquirySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Closed'],
    default: 'New'
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true })

ShareEnquirySchema.index({ company: 1, createdAt: -1 })
ShareEnquirySchema.index({ status: 1, createdAt: -1 })
ShareEnquirySchema.index({ createdAt: -1 })

export default mongoose.model('ShareEnquiry', ShareEnquirySchema)

