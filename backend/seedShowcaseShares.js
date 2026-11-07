import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Company from './models/Company.js'
import PriceHistory from './models/PriceHistory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const TOP_SELLING_SHARES = [
  {
    name: 'Metropolitan Stock Exchange of India (MSEI)',
    sector: 'Financial Services',
    industry: 'Stock Exchanges',
    lotSize: 1000,
    price: 1.85,
    priorPrice: 1.68,
    marketCap: 920,
    description: 'Metropolitan Stock Exchange of India (MSE) is a SEBI-recognized stock exchange offering trading in Capital Market, Futures & Options, and Currency Derivatives.'
  },
  {
    name: 'Polymatech',
    sector: 'Semiconductors',
    industry: 'Opto-semiconductor Chips',
    lotSize: 100,
    price: 680,
    priorPrice: 620,
    marketCap: 1850,
    description: 'Polymatech is India’s first semiconductor chip manufacturer producing high-end opto-semiconductor chips and luminaires.'
  },
  {
    name: 'Goodluck Green',
    sector: 'Renewable Energy',
    industry: 'Solar EPC & Power',
    lotSize: 200,
    price: 240,
    priorPrice: 215,
    marketCap: 480,
    description: 'Goodluck Green specialises in commercial solar installations, captive renewable power plants, and clean energy storage.'
  },
  {
    name: 'Hindustan Power Exchange',
    sector: 'Energy',
    industry: 'Electricity Trading Exchange',
    lotSize: 500,
    price: 18.5,
    priorPrice: 16.9,
    marketCap: 620,
    description: 'Hindustan Power Exchange (HPX) is a power exchange platform offering spot electricity contracts and renewable energy certificates.'
  },
  {
    name: 'Parag Parikh Financial Advisory Services (PPFAS)',
    sector: 'Financial Services',
    industry: 'Asset Management',
    lotSize: 50,
    price: 1450,
    priorPrice: 1380,
    marketCap: 3400,
    description: 'PPFAS is a premier value-investing asset management firm managing long-term equity growth funds for institutional and retail investors.'
  },
  {
    name: 'Transline Technologies',
    sector: 'Technology',
    industry: 'Enterprise IT & Biometrics',
    lotSize: 250,
    price: 95,
    priorPrice: 88,
    marketCap: 310,
    description: 'Transline Technologies delivers systems integration, smart card solutions, and biometric infrastructure across government and enterprise sectors.'
  },
  {
    name: 'Quality Enviro Engineers',
    sector: 'Engineering',
    industry: 'Water & Wastewater Management',
    lotSize: 300,
    price: 115,
    priorPrice: 105,
    marketCap: 260,
    description: 'Quality Enviro Engineers designs and executes industrial effluent treatment plants, sewage treatment facilities, and environmental engineering works.'
  },
  {
    name: 'Sun Drops Energia',
    sector: 'Renewable Energy',
    industry: 'Solar Energy',
    lotSize: 400,
    price: 72,
    priorPrice: 66,
    marketCap: 195,
    description: 'Sun Drops Energia provides rooftop and utility-scale solar generation with decentralized clean energy distribution.'
  },
  {
    name: 'OYO (Oravel Stays)',
    sector: 'Hospitality',
    industry: 'Travel & Accommodation Tech',
    lotSize: 1000,
    price: 68,
    priorPrice: 62,
    marketCap: 42000,
    description: 'Oravel Stays (OYO) is a global travel technology platform empowering hotel and home entrepreneurs with full-stack technology.'
  }
]

const DRHP_FILED_SHARES = [
  {
    name: 'OYO (Oravel Stays)',
    sector: 'Hospitality',
    industry: 'Travel & Accommodation Tech',
    lotSize: 1000,
    price: 68,
    priorPrice: 62,
    marketCap: 42000,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-04-10'),
    description: 'Oravel Stays (OYO) is a global travel technology platform empowering hotel and home entrepreneurs with full-stack technology.'
  },
  {
    name: 'Zepto',
    sector: 'Consumer Tech',
    industry: 'Quick Commerce',
    lotSize: 100,
    price: 495,
    priorPrice: 440,
    marketCap: 32000,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-06-18'),
    description: 'Zepto is India’s fast-growing quick-commerce unicorn delivering groceries and essentials in 10 minutes.'
  },
  {
    name: 'InCred Holdings',
    sector: 'Financial Services',
    industry: 'Diversified NBFC',
    lotSize: 150,
    price: 290,
    priorPrice: 270,
    marketCap: 7800,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-02-22'),
    description: 'InCred is a new-age financial services group operating in retail lending, wealth management, and institutional equities.'
  },
  {
    name: 'Garuda Aerospace',
    sector: 'Aerospace & Defence',
    industry: 'Unmanned Aerial Vehicles',
    lotSize: 200,
    price: 360,
    priorPrice: 325,
    marketCap: 2100,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-05-14'),
    description: 'Garuda Aerospace designs and manufactures precision drones for agricultural mapping, surveillance, and defence applications.'
  },
  {
    name: 'Muthoot Fincorp',
    sector: 'Financial Services',
    industry: 'NBFC & Gold Loans',
    lotSize: 250,
    price: 340,
    priorPrice: 320,
    marketCap: 8900,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-01-30'),
    description: 'Muthoot Fincorp is the flagship entity of the Muthoot Pappachan Group, providing gold loans, MSME credit, and microfinance.'
  },
  {
    name: 'Sterlite Electric',
    sector: 'Power & Infrastructure',
    industry: 'Power Transmission',
    lotSize: 300,
    price: 185,
    priorPrice: 172,
    marketCap: 5200,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-03-25'),
    description: 'Sterlite Electric develops high-voltage power transmission systems and clean grid evacuation networks.'
  },
  {
    name: 'Goldi Solar',
    sector: 'Renewable Energy',
    industry: 'Solar Module Manufacturing',
    lotSize: 150,
    price: 410,
    priorPrice: 380,
    marketCap: 3800,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-07-05'),
    description: 'Goldi Solar is a leading Indian solar module manufacturer and comprehensive EPC solutions provider.'
  },
  {
    name: 'Inox Clean Energy',
    sector: 'Renewable Energy',
    industry: 'Wind & Green Hydrogen',
    lotSize: 200,
    price: 265,
    priorPrice: 245,
    marketCap: 4600,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-06-02'),
    description: 'Inox Clean Energy manages utility-scale wind energy portfolios, hybrid green generation, and storage initiatives.'
  },
  {
    name: 'Indian Gas Exchange',
    sector: 'Energy',
    industry: 'Natural Gas Trading Platform',
    lotSize: 500,
    price: 88,
    priorPrice: 81,
    marketCap: 1450,
    drhpFiled: true,
    drhpFiledDate: new Date('2024-04-28'),
    description: 'Indian Gas Exchange (IGX) is the first nationwide automated natural gas trading marketplace regulated by PNGRB.'
  }
]

async function seedShowcase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/racapitals'
  console.log('Connecting to MongoDB:', uri.replace(/:([^:@]{1,})@/, ':****@'))
  await mongoose.connect(uri)

  console.log('--- Seeding 9 Top Selling Shares ---')
  for (const item of TOP_SELLING_SHARES) {
    let company = await Company.findOne({ name: item.name })
    if (!company) {
      company = await Company.create({
        name: item.name,
        sector: item.sector,
        industry: item.industry,
        lotSize: item.lotSize,
        marketCap: item.marketCap,
        description: item.description,
        isActive: true,
        isTopSelling: true
      })
      console.log(`Created: ${item.name}`)
    } else {
      company.isTopSelling = true
      await company.save()
      console.log(`Updated isTopSelling: ${item.name}`)
    }

    // Add prior and latest price history for percentage movement
    const count = await PriceHistory.countDocuments({ company: company._id })
    if (count === 0) {
      const priorDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const latestDate = new Date()
      await PriceHistory.create({ company: company._id, price: item.priorPrice, recordedAt: priorDate })
      await PriceHistory.create({ company: company._id, price: item.price, recordedAt: latestDate })
    }
  }

  console.log('--- Seeding 9 DRHP-Filed Shares ---')
  for (const item of DRHP_FILED_SHARES) {
    let company = await Company.findOne({ name: item.name })
    if (!company) {
      company = await Company.create({
        name: item.name,
        sector: item.sector,
        industry: item.industry,
        lotSize: item.lotSize,
        marketCap: item.marketCap,
        description: item.description,
        isActive: true,
        drhpFiled: true,
        drhpFiledDate: item.drhpFiledDate || new Date()
      })
      console.log(`Created DRHP: ${item.name}`)
    } else {
      company.drhpFiled = true
      if (!company.drhpFiledDate) company.drhpFiledDate = item.drhpFiledDate || new Date()
      await company.save()
      console.log(`Updated drhpFiled: ${item.name}`)
    }

    const count = await PriceHistory.countDocuments({ company: company._id })
    if (count === 0) {
      const priorDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const latestDate = new Date()
      await PriceHistory.create({ company: company._id, price: item.priorPrice, recordedAt: priorDate })
      await PriceHistory.create({ company: company._id, price: item.price, recordedAt: latestDate })
    }
  }

  console.log('✓ Successfully seeded showcase shares!')
  process.exit(0)
}

seedShowcase().catch(err => {
  console.error('Seeding error:', err)
  process.exit(1)
})

