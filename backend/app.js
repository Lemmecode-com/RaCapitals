import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import priceRoutes from './routes/priceRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import blogRoutes from './routes/blogRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/prices', priceRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/blogs', blogRoutes)

export default app
