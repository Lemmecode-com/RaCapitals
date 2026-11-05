import express from 'express'
import {
  getCompanyFaqs,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqPublish,
  reorderFaqs,
  bulkImportFaqs
} from '../controllers/faqController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Public route for fetching FAQs of a company
router.get('/company/:companyId', getCompanyFaqs)

// Admin protected routes (JWT Auth required)
router.get('/', authMiddleware, getAdminFaqs)
router.post('/', authMiddleware, createFaq)
router.post('/bulk-import', authMiddleware, bulkImportFaqs)
router.put('/:id', authMiddleware, updateFaq)
router.delete('/:id', authMiddleware, deleteFaq)
router.patch('/:id/publish', authMiddleware, toggleFaqPublish)
router.patch('/:id/toggle-publish', authMiddleware, toggleFaqPublish)
router.patch('/reorder', authMiddleware, reorderFaqs)

export default router

