import express from 'express'
import {
  getCompanyFinancials,
  upsertCompanyFinancial,
  bulkImportFinancials,
  deleteCompanyFinancial
} from '../controllers/financialController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Public retrieval
router.get('/company/:id', getCompanyFinancials)
router.get('/:id', getCompanyFinancials)

// Admin management
router.post('/company/:id', authMiddleware, upsertCompanyFinancial)
router.post('/companies/:id', authMiddleware, upsertCompanyFinancial)
router.post('/bulk-import', authMiddleware, bulkImportFinancials)
router.delete('/:id', authMiddleware, deleteCompanyFinancial)

export default router

