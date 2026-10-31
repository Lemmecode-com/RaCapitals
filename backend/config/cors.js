const productionOrigins = [
  'https://taurusmagnus.com',
  'https://www.taurusmagnus.com'
]

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
]

export const getAllowedOrigins = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const origins = isProduction ? [...productionOrigins] : [...productionOrigins, ...devOrigins]

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach((o) => {
      const trimmed = o.trim()
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed)
      }
    })
  }
  return origins
}

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, mobile, Supertest (no origin header)
    if (!origin) return callback(null, true)

    const allowed = getAllowedOrigins()
    if (allowed.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS policy violation: Origin ${origin} is not allowed.`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
