import mongoose from 'mongoose'

const CompanyShareholdingSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    financialYear: {
      type: String, // e.g. "FY26", "FY25", "FY24", "FY23", "FY22", "FY21"
      required: true,
      trim: true,
      uppercase: true
    },
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
    promoterPledgedPercentage: {
      type: Number,
      default: 0 // e.g. 0.00 (%)
    },
    totalSharesCount: {
      type: Number,
      default: null
    },

    // Category-wise Breakdown (e.g. Financial Institutions, Bodies Corporate, Individuals, Others)
    breakdown: [
      {
        category: {
          type: String,
          required: true,
          trim: true
        },
        percentage: {
          type: Number,
          required: true
        },
        numberOfShares: {
          type: Number,
          default: null
        },
        color: {
          type: String,
          default: '#3B82F6'
        },
        lockInStatus: {
          type: String,
          default: 'Free Float'
        }
      }
    ],

    // Total holding percentage (computed or 100%)
    totalPercentage: {
      type: Number,
      default: 100
    },

    // Marquee Institutional & Private Equity Investors (Anchor investors)
    marqueeInvestors: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        stake: {
          type: String,
          required: true,
          trim: true // e.g. "4.85%"
        },
        type: {
          type: String,
          trim: true // e.g. "Sovereign Wealth Fund", "Venture Capital", "Mutual Fund"
        },
        country: {
          type: String,
          default: 'India',
          trim: true
        }
      }
    ],

    sourceUrl: {
      type: String,
      trim: true // Detail / source URL
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

// Unique index: Guarantee no duplicate record for the same company and financial period
CompanyShareholdingSchema.index(
  { company: 1, financialYear: 1, periodType: 1, quarter: 1 },
  { unique: true }
)

export default mongoose.model('CompanyShareholding', CompanyShareholdingSchema)

