import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Company from './models/Company.js'
import PriceHistory from './models/PriceHistory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

export const CURATED_MARQUEE_SHARES = [
  {
    name: 'National Stock Exchange of India (NSE)',
    sector: 'Financial Services',
    industry: 'Stock Exchanges',
    lotSize: 25,
    price: 6850,
    priorPrice: 6500,
    marketCap: 342000,
    description: 'National Stock Exchange of India (NSE) is the leading stock exchange in India, operating world-class trading in equities, derivatives, and fixed income.'
  },
  {
    name: 'HDB Financial Services',
    sector: 'Financial Services',
    industry: 'Non-Banking Financial Company (NBFC)',
    lotSize: 50,
    price: 1180,
    priorPrice: 1120,
    marketCap: 93500,
    description: 'HDB Financial Services is a leading NBFC subsidiary of HDFC Bank, providing secured and unsecured lending and consumer finance.'
  },
  {
    name: 'Tata Capital',
    sector: 'Financial Services',
    industry: 'Financial Conglomerate',
    lotSize: 50,
    price: 920,
    priorPrice: 875,
    marketCap: 74200,
    description: 'Tata Capital is the flagship financial services firm of the Tata Group, offering commercial finance, consumer loans, and wealth management.'
  },
  {
    name: 'Hero Fincorp',
    sector: 'Financial Services',
    industry: 'Retail & MSME Finance',
    lotSize: 50,
    price: 1350,
    priorPrice: 1290,
    marketCap: 17800,
    description: 'Hero Fincorp is an Indian NBFC primarily engaged in retail two-wheeler financing, MSME loans, and used car financing.'
  },
  {
    name: 'Metropolitan Stock Exchange of India (MSEI)',
    sector: 'Financial Services',
    industry: 'Stock Exchanges',
    lotSize: 1000,
    price: 1.85,
    priorPrice: 1.68,
    marketCap: 920,
    description: 'Metropolitan Stock Exchange of India (MSE) is a SEBI-recognized stock exchange offering trading in Capital Market and Currency Derivatives.'
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
    description: 'Hindustan Power Exchange (HPX) is an advanced power exchange offering spot contracts and renewable energy certificates.'
  },
  {
    name: 'Parag Parikh Financial Advisory Services (PPFAS)',
    sector: 'Financial Services',
    industry: 'Asset Management',
    lotSize: 50,
    price: 1450,
    priorPrice: 1380,
    marketCap: 1620,
    description: 'PPFAS is the parent company of PPFAS Mutual Fund, recognized for value-investing strategies and conservative fund management.'
  },
  {
    name: 'Inox Clean Energy',
    sector: 'Renewable Energy',
    industry: 'Wind & Solar Infrastructure',
    lotSize: 100,
    price: 310,
    priorPrice: 285,
    marketCap: 7800,
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
    description: 'Indian Gas Exchange (IGX) is the first nationwide automated natural gas trading marketplace regulated by PNGRB.'
  },
  {
    name: 'Boat Lifestyle (Imagine Marketing)',
    sector: 'Consumer Goods',
    industry: 'Wearables & Audio Tech',
    lotSize: 50,
    price: 780,
    priorPrice: 720,
    marketCap: 6800,
    description: 'Boat Lifestyle is India’s leading hearables and wearables D2C tech brand with immense market share in consumer audio.'
  },
  {
    name: 'OYO Hotels & Homes (Oravel Stays)',
    sector: 'Consumer Services',
    industry: 'Hospitality Tech',
    lotSize: 1000,
    price: 42,
    priorPrice: 38,
    marketCap: 26000,
    description: 'OYO is a global travel technology platform empowering entrepreneurs and small businesses with full-stack hotel technology.'
  },
  {
    name: 'Pharmeasy (API Holdings)',
    sector: 'Healthcare',
    industry: 'Digital Healthcare Platform',
    lotSize: 500,
    price: 14.5,
    priorPrice: 12.8,
    marketCap: 8900,
    description: 'API Holdings operates PharmEasy, India’s largest digital healthcare platform integrating teleconsultation, diagnostics, and medicine delivery.'
  },
  {
    name: 'Reliance Retail',
    sector: 'Consumer Goods',
    industry: 'Retail Conglomerate',
    lotSize: 20,
    price: 2850,
    priorPrice: 2710,
    marketCap: 820000,
    description: 'Reliance Retail Ventures is India’s largest retailer across groceries, consumer electronics, fashion, and lifestyle chains.'
  },
  {
    name: 'Sterlite Power Transmission',
    sector: 'Energy',
    industry: 'Power Transmission Infrastructure',
    lotSize: 100,
    price: 480,
    priorPrice: 445,
    marketCap: 7200,
    description: 'Sterlite Power is a leading integrated power transmission infrastructure developer and solutions provider operating across India and Brazil.'
  },
  {
    name: 'Fincare Business Services',
    sector: 'Financial Services',
    industry: 'Banking & Microfinance',
    lotSize: 100,
    price: 275,
    priorPrice: 250,
    marketCap: 3800,
    description: 'Fincare Business Services is the holding entity for microfinance and small finance banking operations with wide rural coverage.'
  },
  {
    name: 'Mohan Meakin',
    sector: 'Consumer Goods',
    industry: 'Beverages & Distilleries',
    lotSize: 25,
    price: 1950,
    priorPrice: 1820,
    marketCap: 1650,
    description: 'Mohan Meakin is one of India’s heritage brewing and distillery companies, famous for iconic legacy beverage brands.'
  },
  {
    name: 'Utkarsh Coreinvest',
    sector: 'Financial Services',
    industry: 'Financial Holdings',
    lotSize: 200,
    price: 165,
    priorPrice: 152,
    marketCap: 2100,
    description: 'Utkarsh Coreinvest is the core investment company holding strategic stakes in banking, micro-lending, and rural finance.'
  },
  {
    name: 'Chennai Super Kings Cricket (CSK)',
    sector: 'Consumer Services',
    industry: 'Sports & Entertainment',
    lotSize: 100,
    price: 190,
    priorPrice: 175,
    marketCap: 5800,
    description: 'Chennai Super Kings Cricket Ltd owns and operates the iconic five-time IPL champion cricket franchise CSK.'
  },
  {
    name: 'Waaree Energies',
    sector: 'Renewable Energy',
    industry: 'Solar PV Modules',
    lotSize: 50,
    price: 2150,
    priorPrice: 1980,
    marketCap: 28000,
    description: 'Waaree Energies is India’s largest manufacturer of solar photovoltaic (PV) modules with extensive global export presence.'
  },
  {
    name: 'B9 Beverages (Bira 91)',
    sector: 'Consumer Goods',
    industry: 'Craft Beer & Beverages',
    lotSize: 100,
    price: 520,
    priorPrice: 480,
    marketCap: 4100,
    description: 'B9 Beverages is a fast-growing craft beer company producing the wildly popular Bira 91 brand across India and international markets.'
  }
]

async function seedMarquee() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/racapitals'
  console.log('Connecting to MongoDB:', uri.replace(/:([^:@]{1,})@/, ':****@'))
  await mongoose.connect(uri)

  console.log(`--- Seeding ${CURATED_MARQUEE_SHARES.length} Curated Horizontal Marquee Ticker Shares ---`)
  for (const item of CURATED_MARQUEE_SHARES) {
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
        isMarquee: true
      })
      console.log(`Created & Marked Marquee: ${item.name}`)
    } else {
      company.isMarquee = true
      await company.save()
      console.log(`Updated isMarquee: ${item.name}`)
    }

    // Add prior and latest price history for percentage movement if not already recorded
    const count = await PriceHistory.countDocuments({ company: company._id })
    if (count === 0) {
      const priorDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const latestDate = new Date()
      await PriceHistory.create({ company: company._id, price: item.priorPrice, recordedAt: priorDate })
      await PriceHistory.create({ company: company._id, price: item.price, recordedAt: latestDate })
    }
  }

  const marqueeCount = await Company.countDocuments({ isMarquee: true, isActive: true })
  console.log(`✓ Successfully seeded and marked ${marqueeCount} curated shares for Marquee Ticker!`)
  process.exit(0)
}

seedMarquee().catch(err => {
  console.error('Seeding error:', err)
  process.exit(1)
})

