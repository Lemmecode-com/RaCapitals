import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'test-secret'

const mockCompanyFindById = jest.fn()
const mockFinancialsFind = jest.fn()
const mockFinancialsFindOneAndUpdate = jest.fn()

jest.unstable_mockModule('../models/Company.js', () => ({
  default: {
    findById: mockCompanyFindById
  }
}))

jest.unstable_mockModule('../models/CompanyFinancials.js', () => ({
  default: {
    find: mockFinancialsFind,
    findOneAndUpdate: mockFinancialsFindOneAndUpdate
  }
}))

const { default: app } = await import('../server.js')

describe('Financial Statements API (TM-ISSUE-06)', () => {
  const validCompanyId = new mongoose.Types.ObjectId().toString()
  const validToken = jwt.sign({ id: 'admin123', username: 'admin' }, process.env.JWT_SECRET)

  const setupMockCompany = (companyVal) => {
    mockCompanyFindById.mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue(companyVal),
      then: (resolve) => Promise.resolve(companyVal).then(resolve)
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/companies/:id/financials', () => {
    it('returns 400 if company id is not a valid ObjectId', async () => {
      const res = await request(app).get('/api/companies/invalid-id/financials')
      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Invalid company ID format/i)
    })

    it('returns 404 if company is not found', async () => {
      setupMockCompany(null)

      const res = await request(app).get(`/api/companies/${validCompanyId}/financials`)
      expect(res.status).toBe(404)
      expect(res.body.message).toMatch(/Company not found/i)
    })

    it('returns 200 with chronological statements and YoY growth calculations', async () => {
      setupMockCompany({ _id: validCompanyId, name: 'Tata Tech' })

      const mockRawStatements = [
        {
          financialYear: 'FY24',
          periodType: 'annual',
          revenue: 1000,
          otherIncome: 50,
          operatingExpenses: 700,
          depreciation: 40,
          financeCosts: 10,
          tax: 70,
          eps: 25,
          netWorth: 800
        },
        {
          financialYear: 'FY23',
          periodType: 'annual',
          revenue: 800,
          otherIncome: 40,
          operatingExpenses: 600,
          depreciation: 30,
          financeCosts: 10,
          tax: 50,
          eps: 20,
          netWorth: 600
        }
      ]

      mockFinancialsFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRawStatements)
      })

      const res = await request(app).get(`/api/companies/${validCompanyId}/financials?period=annual`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('statements')
      expect(res.body.count).toBe(2)

      // Ensure chronological ordering: FY23 should come before FY24
      const statements = res.body.statements
      expect(statements[0].financialYear).toBe('FY23')
      expect(statements[1].financialYear).toBe('FY24')

      // Check first year growth is null
      expect(statements[0].growth.revenueYoY).toBeNull()

      // Check second year growth is calculated (+25.0%)
      expect(statements[1].growth.revenueYoY).toBe(25)
      expect(statements[1].growth.revenueYoYFormatted).toBe('+25%')

      // Check derived calculations
      expect(statements[1].totalRevenue).toBe(1050) // 1000 + 50
      expect(statements[1].ebitda).toBe(350) // 1050 - 700
      expect(statements[1].pbt).toBe(300) // 350 - 40 - 10
      expect(statements[1].pat).toBe(230) // 300 - 70
    })
  })

  describe('POST /api/companies/:id/financials', () => {
    it('returns 401 when no auth token is provided', async () => {
      const res = await request(app)
        .post(`/api/companies/${validCompanyId}/financials`)
        .send({ financialYear: 'FY24' })

      expect(res.status).toBe(401)
    })

    it('returns 400 if financialYear is missing', async () => {
      setupMockCompany({ _id: validCompanyId, name: 'Tata Tech' })

      const res = await request(app)
        .post(`/api/companies/${validCompanyId}/financials`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ revenue: 500 })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/financialYear is required/i)
    })

    it('returns 400 if monetary fields contain non-numeric data', async () => {
      setupMockCompany({ _id: validCompanyId, name: 'Tata Tech' })

      const res = await request(app)
        .post(`/api/companies/${validCompanyId}/financials`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ financialYear: 'FY24', revenue: 'invalid-string' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/must be a valid numeric monetary value/i)
    })

    it('returns 200 and upserts statement with derived metrics', async () => {
      setupMockCompany({ _id: validCompanyId, name: 'Tata Tech' })
      mockFinancialsFindOneAndUpdate.mockResolvedValue({
        _id: 'fin123',
        company: validCompanyId,
        financialYear: 'FY24',
        revenue: 1200,
        ebitda: 350,
        pat: 220
      })

      const res = await request(app)
        .post(`/api/companies/${validCompanyId}/financials`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          financialYear: 'FY24',
          periodType: 'annual',
          revenue: 1200,
          operatingExpenses: 850
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('financial')
      expect(mockFinancialsFindOneAndUpdate).toHaveBeenCalled()
    })
  })
})
