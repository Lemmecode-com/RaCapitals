import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Import Models
import AdminUser from './models/AdminUser.js'
import Company from './models/Company.js'
import PriceHistory from './models/PriceHistory.js'
import Event from './models/Event.js'
import ContactSubmission from './models/ContactSubmission.js'

dotenv.config()

const newCompanies = [
  { name: 'Tata Motors', sector: 'Automobile', lotSize: 100, currentPrice: 950 },
  { name: 'Reliance Industries', sector: 'Energy', lotSize: 50, currentPrice: 2800 },
  { name: 'HDFC Bank', sector: 'Banking', lotSize: 200, currentPrice: 1650 },
  { name: 'Infosys', sector: 'IT', lotSize: 150, currentPrice: 1420 }
]

const contactSubmissions = [
  { name: 'Alice Smith', email: 'alice@example.com', message: 'I have a question about IPOs.', status: 'new' },
  { name: 'Bob Jones', email: 'bob.jones@example.com', message: 'Looking for investment advice.', status: 'new' },
  { name: 'Charlie Brown', email: 'charlie@example.com', message: 'How do I change my account details?', status: 'read' },
  { name: 'Diana Prince', email: 'diana@example.com', message: 'When is the next company event?', status: 'replied' },
  { name: 'Eve Adams', email: 'eve@example.com', message: 'I cannot log in to the admin panel.', status: 'new' },
  { name: 'Frank White', email: 'frank@example.com', message: 'Is there a mobile app available?', status: 'read' },
  { name: 'Grace Lee', email: 'grace@example.com', message: 'Great service so far, keep it up!', status: 'new' },
  { name: 'Henry Ford', email: 'henry@example.com', message: 'What are your fees for transactions?', status: 'new' },
  { name: 'Isabella Taylor', email: 'isabella@example.com', message: 'Would like to invest in startups.', status: 'new' },
  { name: 'Jack Wilson', email: 'jack@example.com', message: 'How long does KYC approval take?', status: 'new' }
]

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    // 1. Seed Admin
    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD
    if (!username || !password) {
        console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env')
        process.exit(1)
    }

    const existingAdmin = await AdminUser.findOne({ username })
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(password, 10)
      await AdminUser.create({ username, passwordHash })
      console.log(`Admin user "${username}" created successfully`)
    } else {
      console.log(`Admin user "${username}" already exists`)
    }

    // 2. Seed Companies and Prices
    for (const companyData of newCompanies) {
      let company = await Company.findOne({ name: companyData.name })
      if (!company) {
        company = await Company.create({
          name: companyData.name,
          sector: companyData.sector,
          lotSize: companyData.lotSize
        })
        console.log(`Created company: ${company.name}`)
      } else {
        console.log(`Company already exists: ${company.name}`)
      }
      
      await PriceHistory.create({
        company: company._id,
        price: companyData.currentPrice
      })
      console.log(`Added price ${companyData.currentPrice} for ${company.name}`)
    }

    // 3. Seed Events
    await Event.deleteMany({})
    console.log('Cleared existing events.')
    
    const companies = await Company.find().limit(3)
    if (companies.length >= 3) {
      const eventsToInsert = [
        { title: "Successfully filed Draft Red Herring Prospectus (DRHP)", description: "The company has filed its DRHP with SEBI...", eventType: "DRHP", eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), company: companies[0]._id },
        { title: "Secured Series C Funding of $50M", description: "Raised $50 million...", eventType: "Funding", eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), company: companies[1]._id },
        { title: "Appointed New Chief Executive Officer", description: "Announced the appointment of a veteran industry executive...", eventType: "Leadership Change", eventDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), company: companies[2]._id }
      ]
      await Event.insertMany(eventsToInsert)
      console.log(`Successfully seeded ${eventsToInsert.length} events!`)
    }

    // 4. Seed Contact Submissions
    await ContactSubmission.deleteMany({})
    await ContactSubmission.insertMany(contactSubmissions)
    console.log(`Successfully seeded ${contactSubmissions.length} contact submissions!`)

    // 5. Seed Blogs
    const { seedBlogs } = await import('./seedBlogs.js')
    const blogCount = await seedBlogs()
    console.log(`Successfully seeded ${blogCount} blog articles!`)

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedDatabase()
