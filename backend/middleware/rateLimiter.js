// In-memory sliding window rate limiter for public submissions

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 10 // max 10 submissions per window per IP

const ipRequests = new Map()

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of ipRequests.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      ipRequests.delete(ip)
    }
  }
}, 10 * 60 * 1000)

export const enquiryRateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
  const now = Date.now()

  const clientData = ipRequests.get(ip)

  if (!clientData) {
    ipRequests.set(ip, { count: 1, startTime: now })
    return next()
  }

  if (now - clientData.startTime > WINDOW_MS) {
    // Window expired, reset
    ipRequests.set(ip, { count: 1, startTime: now })
    return next()
  }

  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({
      message: 'Too many enquiry requests from this network. Please wait a few minutes before trying again.'
    })
  }

  clientData.count += 1
  next()
}

