import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Company from './models/Company.js'
import PriceHistory from './models/PriceHistory.js'

dotenv.config()

const goodluckCompany = {
  name: 'Goodluck Defence and Aerospace Ltd',
  sector: 'Engineering',
  industry: 'Aerospace & Defence',
  cin: 'U29309UP2019PLC123456',
  foundedYear: 2019,
  description: 'Goodluck Defence and Aerospace Ltd manufactures high-precision forged components and sub-assemblies for aerospace, naval, and defence systems.',
  lotSize: 100,
  faceValue: 10,
  isin: 'INE999D01019',
  marketCap: 850,
  peRatio: 32.4,
  pbRatio: 4.8,
  roe: 18.2,
  bookValue: 42.5,
  isActive: true,
  drhpFiled: true,
  drhpFiledDate: new Date('2024-03-15')
}

const priceMilestones = [
  { price: 58.0, recordedAt: new Date('2022-04-15') },
  { price: 64.5, recordedAt: new Date('2022-07-20') },
  { price: 71.0, recordedAt: new Date('2022-10-18') },
  { price: 79.5, recordedAt: new Date('2023-01-25') },
  { price: 88.0, recordedAt: new Date('2023-05-12') },
  { price: 97.5, recordedAt: new Date('2023-08-30') },
  { price: 108.0, recordedAt: new Date('2023-11-22') },
  { price: 122.0, recordedAt: new Date('2024-02-14') },
  { price: 136.5, recordedAt: new Date('2024-05-28') },
  { price: 148.0, recordedAt: new Date('2024-09-10') },
  { price: 165.0, recordedAt: new Date('2024-12-15') },
  { price: 182.5, recordedAt: new Date('2025-03-20') },
  { price: 204.0, recordedAt: new Date('2025-07-11') },
  { price: 226.5, recordedAt: new Date('2025-10-24') },
  { price: 245.0, recordedAt: new Date('2026-02-18') },
  { price: 268.0, recordedAt: new Date('2026-06-15') },
  { price: 285.0, recordedAt: new Date('2026-10-05') },
  { price: 295.0, recordedAt: new Date('2026-11-01') }
]

const seedGoodluck = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in environment')
      process.exit(1)
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    let company = await Company.findOne({ name: /Goodluck Defence/i })
    if (!company) {
      company = await Company.create(goodluckCompany)
      console.log(`Created company: ${company.name} (${company._id})`)
    } else {
      console.log(`Found existing company: ${company.name} (${company._id})`)
    }

    // Check if price history exists
    const existingPrices = await PriceHistory.countDocuments({ company: company._id })
    if (existingPrices === 0) {
      for (const p of priceMilestones) {
        await PriceHistory.create({
          company: company._id,
          price: p.price,
          recordedAt: p.recordedAt
        })
      }
      console.log(`Seeded ${priceMilestones.length} price milestones for ${company.name}`)
    } else {
      console.log(`${company.name} already has ${existingPrices} price records.`)
    }

    console.log('Done.')
    process.exit(0)
  } catch (err) {
    console.error('Error seeding Goodluck:', err)
    process.exit(1)
  }
}

seedGoodluck()

