import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config()

const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

import companyRoutes from './routes/companyRoutes.js'
import priceRoutes from './routes/priceRoutes.js'
import authRoutes from './routes/authRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import blogRoutes from './routes/blogRoutes.js'

app.use('/api/auth', authRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/prices', priceRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/blogs', blogRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
