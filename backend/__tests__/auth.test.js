import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret'

const mockFindOne = jest.fn()
jest.unstable_mockModule('../models/AdminUser.js', () => ({
  default: { findOne: mockFindOne }
}))

const { default: app } = await import('../app.js')

let hashedPassword
beforeAll(async () => {
  hashedPassword = await bcrypt.hash('password123', 10)
})

afterEach(() => jest.clearAllMocks())

describe('POST /api/auth/login', () => {
  it('returns 401 when credentials missing', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown user', async () => {
    mockFindOne.mockResolvedValue(null)
    const res = await request(app).post('/api/auth/login').send({ username: 'x', password: 'y' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for wrong password', async () => {
    mockFindOne.mockResolvedValue({ username: 'admin', passwordHash: hashedPassword })
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('returns token on valid login', async () => {
    mockFindOne.mockResolvedValue({ _id: '123', username: 'admin', passwordHash: hashedPassword })
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })
})

describe('GET /api/auth/verify', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/verify')
    expect(res.status).toBe(401)
  })

  it('returns valid:true with valid token', async () => {
    const token = jwt.sign({ id: '123', username: 'admin' }, process.env.JWT_SECRET)
    const res = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
  })
})

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
