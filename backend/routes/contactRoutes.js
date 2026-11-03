import express from 'express'
import {
  createContactSubmission,
  getContactSubmissions,
  getUnreadContactCount,
  markContactRead
} from '../controllers/contactController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', createContactSubmission)
router.get('/', authMiddleware, getContactSubmissions)
router.get('/unread-count', authMiddleware, getUnreadContactCount)
router.patch('/:id/read', authMiddleware, markContactRead)

export default router
