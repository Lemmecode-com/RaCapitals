import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Company from './models/Company.js'
import Event from './models/Event.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/racapitals'

async function seedEvents() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB.')

    // Clear existing events
    await Event.deleteMany({})
    console.log('Cleared existing events.')

    // Locate active companies to link events to
    const goodluck = await Company.findOne({ name: /Goodluck Defence/i })
    const tata = await Company.findOne({ name: /Tata Motors/i })
    const reliance = await Company.findOne({ name: /Reliance/i })
    const hdfc = await Company.findOne({ name: /HDFC/i })
    const infosys = await Company.findOne({ name: /Infosys/i })
    const allCompanies = await Company.find({ isActive: true }).limit(5)

    const eventsToInsert = [
      {
        title: 'Goodluck Defence and Aerospace Files DRHP with SEBI for ₹850 Cr Public Issue',
        description: 'The high-precision aerospace forging manufacturer has formally submitted draft red herring prospectus documents to market regulator SEBI for its planned IPO.',
        eventType: 'DRHP',
        eventDate: new Date('2026-10-28'),
        company: goodluck?._id || allCompanies[0]?._id
      },
      {
        title: 'Goodluck Defence Inaugurates Advanced CNC Aerospace Machining Facility',
        description: 'Commissioned dedicated high-speed 5-axis CNC machining centers to support growing international export orders for critical naval and defence sub-assemblies.',
        eventType: 'Other',
        eventDate: new Date('2026-10-18'),
        company: goodluck?._id || allCompanies[0]?._id
      },
      {
        title: 'Tata Motors Electric Mobility Arm Secures $250M Growth Capital',
        description: 'Completed a strategic equity financing round with sovereign wealth partners to accelerate next-generation electric vehicle architecture and battery tech.',
        eventType: 'Funding',
        eventDate: new Date('2026-10-10'),
        company: tata?._id || allCompanies[1]?._id
      },
      {
        title: 'Reliance Retail Expands Omnichannel Fulfillment Network with 150 New Hubs',
        description: 'Strategic logistics and supply chain expansion announced across tier-2 and tier-3 metro corridors to bolster rapid delivery infrastructure.',
        eventType: 'Other',
        eventDate: new Date('2026-09-24'),
        company: reliance?._id || allCompanies[2]?._id
      },
      {
        title: 'HDFC Securities Appoints Veteran Technology Head as Chief Digital Officer',
        description: 'Leadership transition announced to spearhead digital trading architectures, algorithmic routing, and next-gen investor wealth tools.',
        eventType: 'Leadership Change',
        eventDate: new Date('2026-09-12'),
        company: hdfc?._id || allCompanies[3]?._id
      },
      {
        title: 'Infosys Expands European Cloud Collaboration with €120M Enterprise Agreement',
        description: 'Multi-year digital transformation and generative AI deployment pact signed with leading continental telecommunications and infrastructure conglomerates.',
        eventType: 'Other',
        eventDate: new Date('2026-08-30'),
        company: infosys?._id || allCompanies[4]?._id
      }
    ]

    const validEvents = eventsToInsert.filter((e) => e.company)
    if (validEvents.length === 0) {
      console.log('No companies found in database to link events to.')
    } else {
      await Event.insertMany(validEvents)
      console.log(`✅ Successfully seeded ${validEvents.length} corporate events!`)
    }

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error seeding events:', error)
    process.exit(1)
  }
}

seedEvents()
