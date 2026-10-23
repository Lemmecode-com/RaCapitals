import mongoose from 'mongoose'

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  sector: { type: String, required: true },
  description: { type: String },
  lotSize: { type: Number, required: true },
  faceValue: { type: Number },
  isin: { type: String },
  isActive: { type: Boolean, default: true },
  drhpFiled: { type: Boolean, default: false },
  drhpFiledDate: { type: Date, default: null }
}, { timestamps: true })

export default mongoose.model('Company', CompanySchema)
