import express from 'express'
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deactivateCompany,
  uploadLogo,
  getAllCompaniesAdmin,
  activateCompany,
  updateDrhpStatus,
  getDrhpFiledCompanies,
  bulkImportCompanies,
  getFeaturedCompany,
  updateFeaturedCompany,
  getTopSellingCompanies,
  updateTopSellingStatus
} from '../controllers/companyController.js'
import {
  getCompanyFinancials,
  upsertCompanyFinancial
} from '../controllers/financialController.js'
import { getCompanyFaqs } from '../controllers/faqController.js'
import {
  getCompanyShareholding,
  upsertCompanyShareholding
} from '../controllers/shareholdingController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// NOTE: Specific routes MUST be registered before /:id, otherwise Express
// treats the path segment as a literal :id value.
router.get('/featured', getFeaturedCompany)
router.get('/top-selling', getTopSellingCompanies)
router.get('/drhp-filed', getDrhpFiledCompanies)
router.get('/', getAllCompanies)
router.get('/admin/all', authMiddleware, getAllCompaniesAdmin)
router.post('/admin/bulk-import', authMiddleware, bulkImportCompanies)

router.get('/:id', getCompanyById)
router.get('/:id/financials', getCompanyFinancials)
router.get('/:id/faqs', getCompanyFaqs)
router.get('/:id/shareholding', getCompanyShareholding)
router.post('/', authMiddleware, createCompany)
router.put('/:id', authMiddleware, updateCompany)
router.post('/:id/financials', authMiddleware, upsertCompanyFinancial)
router.post('/:id/shareholding', authMiddleware, upsertCompanyShareholding)
router.patch('/:id/featured', authMiddleware, updateFeaturedCompany)
router.patch('/:id/top-selling', authMiddleware, updateTopSellingStatus)
router.patch('/:id/drhp', authMiddleware, updateDrhpStatus)
router.patch('/:id/deactivate', authMiddleware, deactivateCompany)
router.patch('/:id/activate', authMiddleware, activateCompany)
router.post('/:id/logo', authMiddleware, upload.single('logo'), uploadLogo)

export default router
