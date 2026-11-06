import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'test-secret'

const mockCompanyFindById = jest.fn()
const mockPriceHistoryFind = jest.fn()
const mockPriceHistoryFindOne = jest.fn()
const mockPriceHistoryCreate = jest.fn()

jest.unstable_mockModule('../models/Company.js', () => ({
  default: {
    findById: mockCompanyFindById
  }
}))

jest.unstable_mockModule('../models/PriceHistory.js', () => ({
  default: {
    find: mockPriceHistoryFind,
    findOne: mockPriceHistoryFindOne,
    create: mockPriceHistoryCreate
  }
}))

const { default: app } = await import('../server.js')

describe('Pricing Operations API (TM-ISSUE-13)', () => {
  const validCompanyId = new mongoose.Types.ObjectId().toString()
  const validToken = jwt.sign({ id: 'admin123', username: 'admin' }, process.env.JWT_SECRET)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/prices/:companyId', () => {
    it('returns 401 if unauthenticated', async () => {
      const res = await request(app)
        .post(`/api/prices/${validCompanyId}`)
        .send({ price: 1250 })
      expect(res.status).toBe(401)
    })

    it('returns 400 if price is invalid or non-positive', async () => {
      const res = await request(app)
        .post(`/api/prices/${validCompanyId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ price: -50 })
      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/valid positive price is required/i)
    })

    it('returns 404 if company is not found', async () => {
      mockCompanyFindById.mockResolvedValue(null)

      const res = await request(app)
        .post(`/api/prices/${validCompanyId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ price: 1250 })

      expect(res.status).toBe(404)
      expect(res.body.message).toMatch(/Company not found/i)
    })

    it('creates append-only price history record and returns recalculated stats', async () => {
      mockCompanyFindById.mockResolvedValue({ _id: validCompanyId, name: 'Tata Technologies' })

      // Previous price mock
      mockPriceHistoryFindOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ price: 1100, recordedAt: new Date('2026-01-01') })
        })
      })

      const newRecordDate = new Date('2026-11-06')
      mockPriceHistoryCreate.mockResolvedValue({
        _id: 'price-doc-1',
        company: validCompanyId,
        price: 1250,
        recordedAt: newRecordDate,
        toObject: () => ({
          _id: 'price-doc-1',
          company: validCompanyId,
          price: 1250,
          recordedAt: newRecordDate
        })
      })

      // 52w range mock
      mockPriceHistoryFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { price: 1000 },
          { price: 1250 }
        ])
      })

      const res = await request(app)
        .post(`/api/prices/${validCompanyId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ price: 1250 })

      expect(res.status).toBe(201)
      expect(mockPriceHistoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          company: validCompanyId,
          price: 1250
        })
      )
      expect(res.body.latestPrice).toBe(1250)
      expect(res.body.previousPrice).toBe(1100)
      expect(res.body.high52).toBe(1250)
      expect(res.body.low52).toBe(1000)
    })
  })

  describe('GET /api/prices/:companyId', () => {
    it('returns 200 with sorted price history', async () => {
      const mockHistory = [
        { price: 900, recordedAt: '2026-01-01' },
        { price: 1100, recordedAt: '2026-06-01' }
      ]

      mockPriceHistoryFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockHistory)
        })
      })

      const res = await request(app).get(`/api/prices/${validCompanyId}`)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockHistory)
    })
  })
})

