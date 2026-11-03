import express from 'express'
import {
  createShareEnquiry,
  getAdminShareEnquiries,
  getShareEnquiryById,
  updateShareEnquiryStatus
} from '../controllers/enquiryController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { enquiryRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Public endpoint for submitting share purchase enquiries (Rate-limited, no auth required)
router.post('/share', enquiryRateLimiter, createShareEnquiry)

// Protected Admin endpoints (JWT authenticated)
router.get('/admin/share', authMiddleware, getAdminShareEnquiries)
router.get('/share', authMiddleware, getAdminShareEnquiries)
router.get('/admin/share/:id', authMiddleware, getShareEnquiryById)
router.get('/share/:id', authMiddleware, getShareEnquiryById)
router.patch('/admin/share/:id/status', authMiddleware, updateShareEnquiryStatus)
router.put('/admin/share/:id/status', authMiddleware, updateShareEnquiryStatus)
router.patch('/share/:id/status', authMiddleware, updateShareEnquiryStatus)
router.put('/share/:id/status', authMiddleware, updateShareEnquiryStatus)
router.patch('/:id/status', authMiddleware, updateShareEnquiryStatus)
router.put('/:id/status', authMiddleware, updateShareEnquiryStatus)

export default router

