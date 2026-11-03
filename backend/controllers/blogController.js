import Blog from '../models/Blog.js'

// Slugify helper
const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse spaces and underscores into single hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

// Ensure slug is unique
const ensureUniqueSlug = async (baseSlug, currentId = null) => {
  let slug = baseSlug || 'article'
  let count = 1
  while (true) {
    const existing = await Blog.findOne({ slug })
    if (!existing || (currentId && existing._id.toString() === currentId.toString())) {
      return slug
    }
    slug = `${baseSlug}-${count}`
    count++
  }
}

// Parse comma-separated or array of strings
const parseArrayField = (val) => {
  if (!val) return []
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim()).filter(Boolean)
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

/**
 * PUBLIC: GET /api/blogs
 * Fetch all published blogs with search & category filters
 */
export const getPublishedBlogs = async (req, res) => {
  try {
    const { category, search, limit, featured } = req.query

    const filter = { status: 'published' }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (featured === 'true') {
      filter.featured = true
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { subtitle: searchRegex },
        { excerpt: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    }

    let query = Blog.find(filter).sort({ publishedDate: -1, createdAt: -1 })

    if (limit && !isNaN(Number(limit))) {
      query = query.limit(Number(limit))
    }

    const blogs = await query.lean()
    res.status(200).json(blogs)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching insights', error: error.message })
  }
}

/**
 * PUBLIC: GET /api/blogs/:slug
 * Fetch a single published article by slug
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const blog = await Blog.findOne({ slug }).lean()

    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ message: 'Article not found' })
    }

    res.status(200).json(blog)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching article', error: error.message })
  }
}

/**
 * ADMIN: GET /api/blogs/admin/all
 * Fetch all blogs (both published and draft)
 */
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { status, category, search } = req.query

    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { excerpt: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean()
    res.status(200).json(blogs)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all articles', error: error.message })
  }
}

/**
 * ADMIN: GET /api/blogs/admin/:id
 * Fetch single blog by ID for editing
 */
export const getBlogByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id).lean()

    if (!blog) {
      return res.status(404).json({ message: 'Article not found' })
    }

    res.status(200).json(blog)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching article', error: error.message })
  }
}

/**
 * ADMIN: POST /api/blogs
 * Create a new blog post
 */
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug: rawSlug,
      subtitle,
      contentHtml,
      excerpt,
      category,
      readTime,
      publishedDate,
      author,
      authorRole,
      coverImage,
      tags,
      featured,
      status,
      relatedSlugs
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    if (!contentHtml || !contentHtml.trim()) {
      return res.status(400).json({ message: 'Content is required' })
    }

    // Determine and sanitize slug
    const baseSlug = rawSlug && rawSlug.trim() ? slugify(rawSlug) : slugify(title)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: uniqueSlug,
      subtitle: subtitle ? subtitle.trim() : '',
      contentHtml: contentHtml.trim(),
      excerpt: excerpt ? excerpt.trim() : '',
      category: category || 'Valuation & Analysis',
      readTime: readTime ? readTime.trim() : '5 min read',
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      author: author && author.trim() ? author.trim() : 'RA Research Desk',
      authorRole: authorRole && authorRole.trim() ? authorRole.trim() : 'Equity & Private Markets Analyst',
      coverImage: coverImage ? coverImage.trim() : '',
      tags: parseArrayField(tags),
      featured: Boolean(featured),
      status: status === 'published' ? 'published' : 'draft',
      relatedSlugs: parseArrayField(relatedSlugs)
    })

    res.status(201).json(newBlog)
  } catch (error) {
    res.status(400).json({ message: 'Error creating article', error: error.message })
  }
}

/**
 * ADMIN: PUT /api/blogs/:id
 * Update an existing blog post
 */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id)

    if (!blog) {
      return res.status(404).json({ message: 'Article not found' })
    }

    const {
      title,
      slug: rawSlug,
      subtitle,
      contentHtml,
      excerpt,
      category,
      readTime,
      publishedDate,
      author,
      authorRole,
      coverImage,
      tags,
      featured,
      status,
      relatedSlugs
    } = req.body

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' })
      }
      blog.title = title.trim()
    }

    if (rawSlug !== undefined) {
      const sanitizedSlug = slugify(rawSlug)
      if (sanitizedSlug && sanitizedSlug !== blog.slug) {
        blog.slug = await ensureUniqueSlug(sanitizedSlug, blog._id)
      }
    }

    if (subtitle !== undefined) blog.subtitle = subtitle ? subtitle.trim() : ''
    if (contentHtml !== undefined) {
      if (!contentHtml.trim()) {
        return res.status(400).json({ message: 'Content cannot be empty' })
      }
      blog.contentHtml = contentHtml.trim()
    }
    if (excerpt !== undefined) blog.excerpt = excerpt ? excerpt.trim() : ''
    if (category !== undefined) blog.category = category
    if (readTime !== undefined) blog.readTime = readTime.trim()
    if (publishedDate !== undefined) blog.publishedDate = new Date(publishedDate)
    if (author !== undefined) blog.author = author.trim()
    if (authorRole !== undefined) blog.authorRole = authorRole.trim()
    if (coverImage !== undefined) blog.coverImage = coverImage.trim()
    if (tags !== undefined) blog.tags = parseArrayField(tags)
    if (featured !== undefined) blog.featured = Boolean(featured)
    if (status !== undefined) blog.status = status === 'published' ? 'published' : 'draft'
    if (relatedSlugs !== undefined) blog.relatedSlugs = parseArrayField(relatedSlugs)

    await blog.save()

    res.status(200).json(blog)
  } catch (error) {
    res.status(400).json({ message: 'Error updating article', error: error.message })
  }
}

/**
 * ADMIN: DELETE /api/blogs/:id
 * Delete a blog post
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params
    const blog = await Blog.findByIdAndDelete(id)

    if (!blog) {
      return res.status(404).json({ message: 'Article not found' })
    }

    res.status(200).json({ message: 'Article deleted successfully', id })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting article', error: error.message })
  }
}

/**
 * ADMIN: POST /api/blogs/upload-cover
 * Upload cover image file and return its static path
 */
export const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No cover image file uploaded' })
    }

    const fileUrl = `/uploads/${req.file.filename}`
    res.status(200).json({
      url: fileUrl,
      filename: req.file.filename,
      message: 'Cover image uploaded successfully'
    })
  } catch (error) {
    res.status(500).json({ message: 'Error uploading cover image', error: error.message })
  }
}
