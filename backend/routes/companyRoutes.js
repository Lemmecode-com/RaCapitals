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
  getDrhpFiledCompanies
} from '../controllers/companyController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// NOTE: /drhp-filed MUST be registered before /:id, otherwise Express
// treats "drhp-filed" as a literal :id value.
router.get('/drhp-filed', getDrhpFiledCompanies)
router.get('/', getAllCompanies)
router.get('/admin/all', authMiddleware, getAllCompaniesAdmin)
router.get('/:id', getCompanyById)
router.post('/', authMiddleware, createCompany)
router.put('/:id', authMiddleware, updateCompany)
router.patch('/:id/drhp', authMiddleware, updateDrhpStatus)
router.patch('/:id/deactivate', authMiddleware, deactivateCompany)
router.patch('/:id/activate', authMiddleware, activateCompany)
router.post('/:id/logo', authMiddleware, upload.single('logo'), uploadLogo)

export default router
