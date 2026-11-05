import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Company from './models/Company.js'
import CompanyShareholding from './models/CompanyShareholding.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/racapitals'

// Real shareholding data for Metropolitan Stock Exchange of India (from user sheet)
const mseiData = [
  {
    financialYear: 'FY26',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Financial Institutions', percentage: 11.98, color: '#10B981' },
      { category: 'Bodies Corporate', percentage: 29.96, color: '#F59E0B' },
      { category: 'Individuals', percentage: 48.92, color: '#8B5CF6' },
      { category: 'Others', percentage: 9.14, color: '#64748B' }
    ]
  },
  {
    financialYear: 'FY25',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Financial Institutions', percentage: 11.99, color: '#10B981' },
      { category: 'Bodies Corporate', percentage: 35.17, color: '#F59E0B' },
      { category: 'Individuals', percentage: 45.01, color: '#8B5CF6' },
      { category: 'Others', percentage: 7.83, color: '#64748B' }
    ]
  },
  {
    financialYear: 'FY24',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Financial Institutions', percentage: 14.94, color: '#10B981' },
      { category: 'Bodies Corporate', percentage: 17.85, color: '#F59E0B' },
      { category: 'Individuals', percentage: 55.59, color: '#8B5CF6' },
      { category: 'Others', percentage: 7.62, color: '#64748B' }
    ]
  },
  {
    financialYear: 'FY23',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Financial Institutions', percentage: 14.94, color: '#10B981' },
      { category: 'Bodies Corporate', percentage: 18.20, color: '#F59E0B' },
      { category: 'Individuals', percentage: 55.04, color: '#8B5CF6' },
      { category: 'Others', percentage: 11.82, color: '#64748B' }
    ]
  },
  {
    financialYear: 'FY22',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Financial Institutions', percentage: 14.94, color: '#10B981' },
      { category: 'Bodies Corporate', percentage: 18.05, color: '#F59E0B' },
      { category: 'Individuals', percentage: 55.00, color: '#8B5CF6' },
      { category: 'Others', percentage: 12.00, color: '#64748B' }
    ]
  },
  {
    financialYear: 'FY21',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Banks / FI', percentage: 14.94, color: '#10B981' },
      { category: 'Body Corporate', percentage: 18.49, color: '#F59E0B' },
      { category: 'Individuals', percentage: 59.50, color: '#8B5CF6' },
      { category: 'Others', percentage: 7.07, color: '#64748B' }
    ]
  }
]

// Standard historical patterns for other companies
const standardProfiles = [
  {
    financialYear: 'FY25',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Promoter & Promoter Group', percentage: 55.20, color: '#3B82F6', lockInStatus: 'Pre-IPO (6m lock-in)' },
      { category: 'Domestic Institutions (DIIs)', percentage: 16.40, color: '#10B981' },
      { category: 'Foreign Institutional (FIIs)', percentage: 12.80, color: '#F59E0B' },
      { category: 'Public & Retail (HNIs)', percentage: 12.60, color: '#8B5CF6' },
      { category: 'Employee Trust (ESOP)', percentage: 3.00, color: '#EC4899' }
    ],
    marqueeInvestors: [
      { name: 'Temasek Holdings', stake: '4.85%', type: 'Sovereign Wealth Fund', country: 'Singapore' },
      { name: 'SBI Mutual Fund', stake: '3.40%', type: 'Mutual Fund', country: 'India' }
    ]
  },
  {
    financialYear: 'FY24',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Promoter & Promoter Group', percentage: 56.40, color: '#3B82F6', lockInStatus: 'Pre-IPO (6m lock-in)' },
      { category: 'Domestic Institutions (DIIs)', percentage: 14.80, color: '#10B981' },
      { category: 'Foreign Institutional (FIIs)', percentage: 12.30, color: '#F59E0B' },
      { category: 'Public & Retail (HNIs)', percentage: 13.50, color: '#8B5CF6' },
      { category: 'Employee Trust (ESOP)', percentage: 3.00, color: '#EC4899' }
    ],
    marqueeInvestors: [
      { name: 'Temasek Holdings', stake: '4.85%', type: 'Sovereign Wealth Fund', country: 'Singapore' },
      { name: 'Peak XV Partners', stake: '6.20%', type: 'Venture Capital', country: 'India / USA' }
    ]
  },
  {
    financialYear: 'FY23',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Promoter & Promoter Group', percentage: 58.10, color: '#3B82F6', lockInStatus: 'Pre-IPO (6m lock-in)' },
      { category: 'Domestic Institutions (DIIs)', percentage: 13.20, color: '#10B981' },
      { category: 'Foreign Institutional (FIIs)', percentage: 11.50, color: '#F59E0B' },
      { category: 'Public & Retail (HNIs)', percentage: 14.20, color: '#8B5CF6' },
      { category: 'Employee Trust (ESOP)', percentage: 3.00, color: '#EC4899' }
    ]
  },
  {
    financialYear: 'FY22',
    promoterPledgedPercentage: 0,
    breakdown: [
      { category: 'Promoter & Promoter Group', percentage: 61.50, color: '#3B82F6', lockInStatus: 'Pre-IPO (6m lock-in)' },
      { category: 'Domestic Institutions (DIIs)', percentage: 11.80, color: '#10B981' },
      { category: 'Foreign Institutional (FIIs)', percentage: 10.90, color: '#F59E0B' },
      { category: 'Public & Retail (HNIs)', percentage: 15.80, color: '#8B5CF6' }
    ]
  }
]

const seedShareholding = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB successfully.')

    // 1. Ensure Metropolitan Stock Exchange exists
    let msei = await Company.findOne({
      name: { $regex: /metropolitan stock exchange/i }
    })
    if (!msei) {
      msei = await Company.create({
        name: 'Metropolitan Stock Exchange of India',
        sector: 'Financial Services',
        industry: 'Stock Exchanges & Clearing Corp',
        lotSize: 100,
        faceValue: 1,
        description: 'Metropolitan Stock Exchange of India (MSE) is a SEBI-recognized stock exchange offering trading in Capital Market, Futures & Options, and Currency Derivatives.'
      })
      console.log('Created company: Metropolitan Stock Exchange of India')
    }

    // Seed MSEI 6-year data
    for (const item of mseiData) {
      await CompanyShareholding.findOneAndUpdate(
        { company: msei._id, financialYear: item.financialYear, periodType: 'annual' },
        {
          company: msei._id,
          financialYear: item.financialYear,
          periodType: 'annual',
          promoterPledgedPercentage: item.promoterPledgedPercentage,
          breakdown: item.breakdown,
          totalPercentage: Number(item.breakdown.reduce((sum, b) => sum + b.percentage, 0).toFixed(2)),
          sourceUrl: 'https://unlistedzone.com'
        },
        { upsert: true, new: true }
      )
    }
    console.log(`Seeded ${mseiData.length} years of shareholding for ${msei.name}`)

    // 2. Also seed other active companies
    const otherCompanies = await Company.find({ _id: { $ne: msei._id } }).limit(5)
    for (const comp of otherCompanies) {
      for (const item of standardProfiles) {
        await CompanyShareholding.findOneAndUpdate(
          { company: comp._id, financialYear: item.financialYear, periodType: 'annual' },
          {
            company: comp._id,
            financialYear: item.financialYear,
            periodType: 'annual',
            promoterPledgedPercentage: item.promoterPledgedPercentage,
            breakdown: item.breakdown,
            totalPercentage: Number(item.breakdown.reduce((sum, b) => sum + b.percentage, 0).toFixed(2)),
            marqueeInvestors: item.marqueeInvestors || []
          },
          { upsert: true, new: true }
        )
      }
      console.log(`Seeded ${standardProfiles.length} years of shareholding for ${comp.name}`)
    }

    console.log('Shareholding pattern seed completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seedShareholding()

