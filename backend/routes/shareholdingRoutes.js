import express from 'express'
import {
  getCompanyShareholding,
  upsertCompanyShareholding,
  deleteCompanyShareholding,
  getAllShareholdingsAdmin
} from '../controllers/shareholdingController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Public retrieval
router.get('/company/:id', getCompanyShareholding)
router.get('/:id', getCompanyShareholding)

// Admin management
router.get('/admin/all', authMiddleware, getAllShareholdingsAdmin)
router.post('/company/:id', authMiddleware, upsertCompanyShareholding)
router.post('/', authMiddleware, upsertCompanyShareholding)
router.delete('/:id', authMiddleware, deleteCompanyShareholding)

export default router

