import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'

process.env.JWT_SECRET = 'test-secret'

const mockFind = jest.fn()
const mockPriceHistoryFind = jest.fn()
const mockPriceHistoryFindOne = jest.fn()

jest.unstable_mockModule('../models/Company.js', () => ({
  default: {
    find: mockFind
  }
}))

jest.unstable_mockModule('../models/PriceHistory.js', () => ({
  default: {
    find: mockPriceHistoryFind,
    findOne: mockPriceHistoryFindOne
  }
}))

const { default: app } = await import('../server.js')

describe('Company API Limit & Query Handling (Issue #10)', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock price history
    mockPriceHistoryFindOne.mockReturnValue({
      sort: () => ({
        lean: () => Promise.resolve({ price: 100, recordedAt: new Date() })
      })
    })

    mockPriceHistoryFind.mockReturnValue({
      lean: () => Promise.resolve([{ price: 100 }])
    })
  })

  it('respects limit query param when passed to /api/companies?limit=12', async () => {
    const mockCompanies = Array.from({ length: 12 }, (_, i) => ({
      _id: `comp${i}`,
      name: `Company ${i}`,
      isActive: true
    }))

    const mockMongooseQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCompanies)
    }

    mockFind.mockReturnValue(mockMongooseQuery)

    const res = await request(app).get('/api/companies?limit=12')

    expect(res.status).toBe(200)
    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }))
    expect(mockMongooseQuery.limit).toHaveBeenCalledWith(12)
    expect(res.body).toHaveLength(12)
  })

  it('does not call limit when limit param is omitted or zero', async () => {
    const mockCompanies = [
      { _id: 'comp1', name: 'Company 1', isActive: true },
      { _id: 'comp2', name: 'Company 2', isActive: true }
    ]

    const mockMongooseQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCompanies)
    }

    mockFind.mockReturnValue(mockMongooseQuery)

    const res = await request(app).get('/api/companies')

    expect(res.status).toBe(200)
    expect(mockMongooseQuery.limit).not.toHaveBeenCalled()
    expect(res.body).toHaveLength(2)
  })

  it('applies pagination skip when page and limit are both provided', async () => {
    const mockCompanies = [{ _id: 'comp3', name: 'Company 3', isActive: true }]

    const mockMongooseQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCompanies)
    }

    mockFind.mockReturnValue(mockMongooseQuery)

    const res = await request(app).get('/api/companies?limit=5&page=2')

    expect(res.status).toBe(200)
    expect(mockMongooseQuery.skip).toHaveBeenCalledWith(5)
    expect(mockMongooseQuery.limit).toHaveBeenCalledWith(5)
  })
})
