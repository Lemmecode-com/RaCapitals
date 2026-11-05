import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'test-secret'

const mockContactCreate = jest.fn()
const mockContactFind = jest.fn()
const mockContactFindByIdAndUpdate = jest.fn()
const mockContactCountDocuments = jest.fn()

jest.unstable_mockModule('../models/ContactSubmission.js', () => ({
  default: {
    create: mockContactCreate,
    find: mockContactFind,
    findByIdAndUpdate: mockContactFindByIdAndUpdate,
    countDocuments: mockContactCountDocuments
  }
}))

const { default: app } = await import('../server.js')

describe('Contact Us API (#36 / TM-ISSUE-12)', () => {
  const validToken = jwt.sign({ id: 'admin123', username: 'admin' }, process.env.JWT_SECRET)
  const validSubmissionId = new mongoose.Types.ObjectId().toString()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/contact', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ email: 'test@example.com', phone: '9876543210', message: 'Hello' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/name is required/i)
    })

    it('returns 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Rahul Sharma', email: 'invalid-email', phone: '9876543210', message: 'Hello' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/valid email address is required/i)
    })

    it('returns 400 when phone number is missing', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Rahul Sharma', email: 'rahul@example.com', message: 'Hello' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/valid 10-digit mobile phone number is required/i)
    })

    it('returns 400 when phone number is less than 10 digits', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Rahul Sharma', email: 'rahul@example.com', phone: '98765', message: 'Hello' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/valid 10-digit mobile phone number is required/i)
    })

    it('returns 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', message: '   ' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/message cannot be empty/i)
    })

    it('returns 201 and persists phone alongside name, email, and message', async () => {
      const mockCreated = {
        _id: validSubmissionId,
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        message: 'Interested in unlisted shares.',
        status: 'New',
        createdAt: new Date().toISOString()
      }
      mockContactCreate.mockResolvedValue(mockCreated)

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+91 98765-43210',
          message: 'Interested in unlisted shares.'
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('phone', '9876543210')
      expect(mockContactCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '9876543210',
          message: 'Interested in unlisted shares.',
          status: 'New'
        })
      )
    })
  })

  describe('GET /api/contact', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/contact')
      expect(res.status).toBe(401)
    })

    it('returns 200 with list of submissions for authenticated admin', async () => {
      const mockList = [
        {
          _id: validSubmissionId,
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '9876543210',
          message: 'Test message',
          status: 'New'
        }
      ]
      mockContactFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockList)
        })
      })

      const res = await request(app)
        .get('/api/contact')
        .set('Authorization', `Bearer ${validToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0].phone).toBe('9876543210')
    })
  })

  describe('PATCH /api/contact/:id/status', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .patch(`/api/contact/${validSubmissionId}/status`)
        .send({ status: 'In Progress' })

      expect(res.status).toBe(401)
    })

    it('returns 400 for invalid status', async () => {
      const res = await request(app)
        .patch(`/api/contact/${validSubmissionId}/status`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'InvalidStatus' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/invalid status/i)
    })

    it('returns 200 and updates status', async () => {
      mockContactFindByIdAndUpdate.mockResolvedValue({
        _id: validSubmissionId,
        name: 'Rahul Sharma',
        status: 'In Progress'
      })

      const res = await request(app)
        .patch(`/api/contact/${validSubmissionId}/status`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'In Progress' })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('In Progress')
      expect(mockContactFindByIdAndUpdate).toHaveBeenCalledWith(
        validSubmissionId,
        { status: 'In Progress' },
        { new: true }
      )
    })
  })
})

