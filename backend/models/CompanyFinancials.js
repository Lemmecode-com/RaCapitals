import mongoose from 'mongoose'

const CompanyFinancialsSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  financialYear: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  }, // e.g. "FY20", "FY21", "FY22", "FY23", "FY24", "FY25", "FY26"
  periodType: {
    type: String,
    enum: ['annual', 'quarterly'],
    default: 'annual',
    required: true
  },
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', null],
    default: null
  },
  isEstimate: {
    type: Boolean,
    default: false
  },
  isAudited: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  unit: {
    type: String,
    default: 'Cr'
  },

  // Income Statement
  revenue: { type: Number, default: 0 }, // Revenue from Operations
  otherIncome: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  operatingExpenses: { type: Number, default: 0 },
  ebitda: { type: Number, default: 0 },
  ebitdaMargin: { type: Number, default: 0 }, // Operating Profit Margin (OPM %)
  depreciation: { type: Number, default: 0 },
  financeCosts: { type: Number, default: 0 }, // Interest expense
  pbt: { type: Number, default: 0 }, // Profit Before Tax
  tax: { type: Number, default: 0 },
  pat: { type: Number, default: 0 }, // Profit After Tax (Net Profit)
  patMargin: { type: Number, default: 0 }, // PAT Margin %
  eps: { type: Number, default: 0 }, // Diluted EPS in ₹
  netWorth: { type: Number, default: 0 }, // Total Shareholder Net Worth

  // Balance Sheet (Extensible)
  totalAssets: { type: Number, default: null },
  totalLiabilities: { type: Number, default: null },
  totalEquity: { type: Number, default: null },
  totalDebt: { type: Number, default: null },

  // Cash Flow (Extensible)
  operatingCashFlow: { type: Number, default: null },
  investingCashFlow: { type: Number, default: null },
  financingCashFlow: { type: Number, default: null },
  netCashFlow: { type: Number, default: null },

  notes: { type: String, default: '' }
}, { timestamps: true })

// Compound unique index ensuring no duplicate statements for the same company/year/period/quarter
CompanyFinancialsSchema.index(
  { company: 1, financialYear: 1, periodType: 1, quarter: 1 },
  { unique: true }
)

export default mongoose.model('CompanyFinancials', CompanyFinancialsSchema)

