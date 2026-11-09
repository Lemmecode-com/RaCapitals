import mongoose from 'mongoose'

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  sector: { type: String, required: true },
  industry: { type: String, trim: true },
  cin: { type: String, trim: true },
  registeredOffice: { type: String, trim: true },
  foundedYear: { type: Number },
  description: { type: String },
  lotSize: { type: Number, required: true },
  faceValue: { type: Number },
  isin: { type: String, trim: true },
  marketCap: { type: Number }, // in ₹ Cr
  peRatio: { type: Number },
  pbRatio: { type: Number },
  roe: { type: Number }, // in %
  bookValue: { type: Number }, // in ₹
  outstandingShares: { type: Number },
  isActive: { type: Boolean, default: true },
  drhpFiled: { type: Boolean, default: false },
  drhpFiledDate: { type: Date, default: null },
  isHeroFeatured: { type: Boolean, default: false },
  isTopSelling: { type: Boolean, default: false },
  isMarquee: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Company', CompanySchema)
