import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import AdminUser from './models/AdminUser.js'

dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD

    if (!username || !password) {
      console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env')
      process.exit(1)
    }

    const existing = await AdminUser.findOne({ username })

    if (existing) {
      console.log(`Admin user "${username}" already exists`)
      process.exit(0)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await AdminUser.create({ username, passwordHash })

    console.log(`Admin user "${username}" created successfully`)
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedAdmin()