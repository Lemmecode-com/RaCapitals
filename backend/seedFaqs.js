import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Company from './models/Company.js'
import ShareFaq from './models/ShareFaq.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/racapitals'

const seedFaqs = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected for FAQ seeding')

    const companies = await Company.find().lean()
    console.log(`Found ${companies.length} companies`)

    // Sample custom FAQs for popular companies
    for (const comp of companies) {
      const name = comp.name
      let customQuestions = []

      if (name.includes('Tata')) {
        customQuestions = [
          {
            question: `When is ${name} anticipated to launch its IPO on NSE/BSE?`,
            answer: `${name} has demonstrated strong financial metrics and corporate governance. While market reports indicate internal listing preparations, statutory filings and board approvals will determine the exact public offering timeline.`,
            order: 1
          },
          {
            question: `What is the lot size and minimum ticket size for ${name}?`,
            answer: `The lot size for ${name} is ${comp.lotSize || 50} shares. The minimum investment is determined by multiplying the lot size by the current indicative share price.`,
            order: 2
          },
          {
            question: `How are demat shares of ${name} transferred to my broker?`,
            answer: `Shares of ${name} are transferred via off-market CDSL/NSDL DIS slip or electronic speed-e directly into your demat account under ISIN ${comp.isin || 'registered ISIN'} within 24 to 48 hours of confirmed payment.`,
            order: 3
          }
        ]
      } else if (name.includes('Reliance')) {
        customQuestions = [
          {
            question: `What is the latest valuation benchmark for ${name}?`,
            answer: `${name} continues to be valued aggressively based on expansion across consumer touchpoints, retail footprint, and institutional backing from marquee global sovereign funds.`,
            order: 1
          },
          {
            question: `Are shares of ${name} subject to SEBI lock-in post-listing?`,
            answer: `Yes, under SEBI regulations all pre-IPO shares acquired prior to the IPO are subject to a mandatory 6-month statutory lock-in period from the date of listing.`,
            order: 2
          }
        ]
      }

      for (const q of customQuestions) {
        const existing = await ShareFaq.findOne({ company: comp._id, question: q.question })
        if (!existing) {
          await ShareFaq.create({
            company: comp._id,
            question: q.question,
            answer: q.answer,
            order: q.order,
            isPublished: true
          })
          console.log(`Created FAQ for ${name}: "${q.question}"`)
        }
      }
    }

    console.log('FAQ seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding FAQs:', error)
    process.exit(1)
  }
}

seedFaqs()

