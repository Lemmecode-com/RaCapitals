import express from 'express'
import {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  getBlogByIdAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadCoverImage
} from '../controllers/blogController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { uploadBlogCover } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Admin protected routes (MUST be defined before /:slug)
router.get('/admin/all', authMiddleware, getAllBlogsAdmin)
router.get('/admin/:id', authMiddleware, getBlogByIdAdmin)
router.post('/upload-cover', authMiddleware, uploadBlogCover.single('cover'), uploadCoverImage)
router.post('/', authMiddleware, createBlog)
router.put('/:id', authMiddleware, updateBlog)
router.delete('/:id', authMiddleware, deleteBlog)

// Public routes
router.get('/', getPublishedBlogs)
router.get('/:slug', getBlogBySlug)

export default router
