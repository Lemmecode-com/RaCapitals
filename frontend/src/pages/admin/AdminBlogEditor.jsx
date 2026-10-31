import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { apiBaseWithoutApi, formatShortDate } from '../../utils/format'
import TipTapEditor from '../../components/admin/TipTapEditor'

const CATEGORIES = [
  'Valuation & Analysis',
  'Guides & Education',
  'Pre-IPO News',
  'Tax & Legal'
]

const INITIAL_FORM = {
  title: '',
  slug: '',
  subtitle: '',
  category: '',
  readTime: '',
  publishedDate: new Date().toISOString().slice(0, 10),
  author: '',
  authorRole: '',
  coverImage: '',
  tags: '',
  excerpt: '',
  contentHtml: '',
  featured: false,
  status: 'published',
  relatedSlugs: ''
}

const resolveCoverSrc = (coverImage) => {
  if (!coverImage) return ''
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  return `${apiBaseWithoutApi()}${coverImage}`
}

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const AdminBlogEditor = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('write') // 'write' | 'preview'

  const fileInputRef = useRef(null)

  // Fetch article if in edit mode
  useEffect(() => {
    if (!isEditMode) return
    setLoading(true)
    api
      .get(`/blogs/admin/${id}`)
      .then((res) => {
        const data = res.data
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          subtitle: data.subtitle || '',
          category: data.category || '',
          readTime: data.readTime || '',
          publishedDate: data.publishedDate ? data.publishedDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
          author: data.author || '',
          authorRole: data.authorRole || '',
          coverImage: data.coverImage || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          excerpt: data.excerpt || '',
          contentHtml: data.contentHtml || '',
          featured: Boolean(data.featured),
          status: data.status || 'draft',
          relatedSlugs: Array.isArray(data.relatedSlugs) ? data.relatedSlugs.join(', ') : ''
        })
      })
      .catch((err) => {
        console.error('Failed to load blog:', err)
        setError('Failed to load article details from server.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, isEditMode])

  // Handle title change & auto-generate slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setForm((prev) => ({
      ...prev,
      title: newTitle,
      slug: slugify(newTitle)
    }))
  }

  // Auto-calculate read time based on word count
  const handleCalculateReadTime = () => {
    const stripped = form.contentHtml.replace(/<[^>]+>/g, ' ')
    const words = stripped.trim().split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(words / 180))
    setForm((prev) => ({ ...prev, readTime: `${minutes} min read` }))
  }

  // Cover image file upload handler with validation
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. File type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type: Please upload a JPG, PNG, or WebP image.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // 2. File size validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large: Cover image must be smaller than 5 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploadingCover(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('cover', file)

      const res = await api.post('/blogs/upload-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data?.url) {
        setForm((prev) => ({ ...prev, coverImage: res.data.url }))
      }
    } catch (err) {
      console.error('Error uploading cover image:', err)
      setError(err?.response?.data?.message || 'Failed to upload cover image')
    } finally {
      setUploadingCover(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Form submission with comprehensive validations
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedTitle = form.title.trim()
    const trimmedSubtitle = (form.subtitle || '').trim()
    const trimmedExcerpt = (form.excerpt || '').trim()
    const plainContent = (form.contentHtml || '').replace(/<[^>]+>/g, ' ').trim()
    const isPublishing = form.status === 'published'

    // 1. Title validation
    if (!trimmedTitle) {
      setError('Article title is required.')
      return
    }
    if (trimmedTitle.length < 10) {
      setError('Article title is too short (minimum 10 characters required).')
      return
    }
    if (trimmedTitle.length > 120) {
      setError('Article title is too long (maximum 120 characters allowed).')
      return
    }

    // 2. Category validation
    if (!form.category) {
      setError('Please select an article category.')
      return
    }

    // 3. Subtitle validation (if provided)
    if (trimmedSubtitle.length > 200) {
      setError('Subtitle is too long (maximum 200 characters allowed).')
      return
    }

    // 4. Short Description validation
    if (isPublishing && !trimmedExcerpt) {
      setError('Short Description (Card Preview) is required before publishing live.')
      return
    }
    if (trimmedExcerpt && trimmedExcerpt.length < 20) {
      setError('Short Description is too brief (minimum 20 characters recommended for card preview).')
      return
    }
    if (trimmedExcerpt.length > 250) {
      setError('Short Description must not exceed 250 characters.')
      return
    }

    // 5. Author and Role length limits
    if (form.author.trim().length > 50) {
      setError('Author name must not exceed 50 characters.')
      return
    }
    if (form.authorRole.trim().length > 60) {
      setError('Author role must not exceed 60 characters.')
      return
    }

    // 6. Cover Image validation
    if (isPublishing && !form.coverImage.trim()) {
      setError('A cover image banner is required before publishing live.')
      return
    }
    if (
      form.coverImage.trim() &&
      !form.coverImage.startsWith('/uploads') &&
      !form.coverImage.startsWith('http://') &&
      !form.coverImage.startsWith('https://')
    ) {
      setError('Cover image must be a valid URL (http:// or https://) or an uploaded file.')
      return
    }

    // 7. Tags validation (Max 8 tags, clean formatting)
    const rawTags = (form.tags || '')
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)
    const uniqueTags = [...new Set(rawTags)]
    if (uniqueTags.length > 8) {
      setError('Maximum 8 tags allowed per article.')
      return
    }

    // 8. Article Content validation
    if (!plainContent) {
      setError('Article content cannot be empty.')
      return
    }
    const wordCount = plainContent.split(/\s+/).filter(Boolean).length
    if (isPublishing && wordCount < 30) {
      setError(`Article content is too short for publication (${wordCount} words; minimum 30 words required).`)
      return
    }

    // 9. Read time normalization
    let normalizedReadTime = form.readTime.trim()
    if (!normalizedReadTime) {
      const minutes = Math.max(1, Math.ceil(wordCount / 180))
      normalizedReadTime = `${minutes} min read`
    } else if (/^\d+$/.test(normalizedReadTime)) {
      normalizedReadTime = `${normalizedReadTime} min read`
    }

    setSaving(true)

    const payload = {
      ...form,
      title: trimmedTitle,
      slug: form.slug.trim() || slugify(trimmedTitle),
      subtitle: trimmedSubtitle,
      excerpt: trimmedExcerpt,
      author: form.author.trim() || 'RA Research Desk',
      authorRole: form.authorRole.trim() || 'Equity & Private Markets Analyst',
      readTime: normalizedReadTime,
      publishedDate: form.publishedDate || new Date().toISOString().slice(0, 10),
      tags: uniqueTags,
      relatedSlugs: (form.relatedSlugs || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }

    try {
      if (isEditMode) {
        await api.put(`/blogs/${id}`, payload)
      } else {
        await api.post('/blogs', payload)
      }
      navigate('/admin/blogs')
    } catch (err) {
      console.error('Save error:', err)
      setError(err?.response?.data?.message || 'Failed to save article. Please verify inputs.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-wrap">
        <p className="muted">Loading article editor…</p>
      </div>
    )
  }

  return (
    <div className="dashboard-wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Navigation & Status */}
      <div className="admin-page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <Link
            to="/admin/blogs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
              textDecoration: 'none'
            }}
          >
            ← Back to All Articles
          </Link>
          <h1 style={{ margin: 0 }}>
            {isEditMode ? 'Edit Market Insight' : 'Write New Market Insight'}
          </h1>
        </div>

        {/* Status indicator and Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="form-input"
            style={{
              width: 'auto',
              padding: '0.55rem 0.85rem',
              fontWeight: 600,
              color: form.status === 'published' ? '#2ecc71' : '#f1c40f'
            }}
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Published (Live)</option>
          </select>

          <button
            type="button"
            className="primary-btn"
            onClick={handleSubmit}
            disabled={saving}
            style={{ minWidth: '130px' }}
          >
            {saving ? 'Saving…' : isEditMode ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(231, 76, 60, 0.15)',
            border: '1px solid #e74c3c',
            color: '#e74c3c',
            padding: '0.85rem 1.25rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Editor & Meta Container */}
      <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Core Metadata Card */}
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Article Metadata & SEO</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title */}
            <label className="form-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Article Title *</span>
                <span style={{ fontSize: '0.75rem', color: (form.title || '').length >= 110 ? '#e74c3c' : 'var(--text-muted)' }}>
                  {(form.title || '').length}/120
                </span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Swiggy Pre-IPO Valuation Analysis: Quick Commerce Economics & DRHP Takeaways"
                className="form-input"
                style={{ fontSize: '1rem', fontWeight: form.title ? 600 : 400, fontFamily: 'var(--font-body)' }}
                maxLength={120}
                required
              />
            </label>

            {/* Slug & Subtitle */}
            <div className="form-row">
              <label className="form-label" style={{ flex: 1 }}>
                SEO Slug
                <input
                  type="text"
                  value={form.slug}
                  readOnly
                  placeholder="Auto-generated from title..."
                  className="form-input"
                  style={{
                    cursor: 'not-allowed',
                    opacity: 0.85,
                    background: 'var(--surface-2)'
                  }}
                  tabIndex={-1}
                />
              </label>

              <label className="form-label" style={{ flex: 1 }}>
                Category *
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="" disabled>-- Select Category --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Subtitle / Deck */}
            <label className="form-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Subtitle (Deck)</span>
                <span style={{ fontSize: '0.75rem', color: (form.subtitle || '').length >= 185 ? '#e74c3c' : 'var(--text-muted)' }}>
                  {(form.subtitle || '').length}/200
                </span>
              </div>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="A brief summary deck displayed right under the main title..."
                className="form-input"
                maxLength={200}
              />
            </label>

            {/* Short Description */}
            <label className="form-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  Short Description (Card Preview) {form.status === 'published' && <span style={{ color: 'var(--rust, #e74c3c)' }}>*</span>}
                </span>
                <span style={{ fontSize: '0.75rem', color: (form.excerpt || '').length >= 235 ? '#e74c3c' : 'var(--text-muted)' }}>
                  {(form.excerpt || '').length}/250
                </span>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="2-3 sentences summarizing the article for the cards grid and search results..."
                className="contact-form-textarea"
                rows={2}
                style={{ minHeight: '70px' }}
                maxLength={250}
              />
            </label>

            {/* Author, Role, ReadTime, Date */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <label className="form-label">
                Author Name
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="e.g. RA Research Desk"
                  className="form-input"
                  maxLength={50}
                />
              </label>

              <label className="form-label">
                Author Role
                <input
                  type="text"
                  value={form.authorRole}
                  onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                  placeholder="e.g. Equity & Private Markets Analyst"
                  className="form-input"
                  maxLength={60}
                />
              </label>

              <label className="form-label">
                Published Date
                <input
                  type="date"
                  value={form.publishedDate}
                  onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
                  className="form-input"
                />
              </label>

              <label className="form-label">
                Read Time
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="form-input"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="button"
                    onClick={handleCalculateReadTime}
                    className="secondary-btn"
                    title="Auto-calculate from word count"
                    style={{ whiteSpace: 'nowrap', padding: '0.55rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
                  >
                    Auto
                  </button>
                </div>
              </label>
            </div>

            {/* Cover Image URL + Upload Button */}
            <div className="form-label">
              <div>
                Cover Image (Banner) {form.status === 'published' && <span style={{ color: 'var(--rust, #e74c3c)' }}>*</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="Paste image URL (Unsplash, CDN) or click Upload File →"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {uploadingCover ? 'Uploading…' : '📁 Upload Image'}
                </button>
              </div>

              {/* Cover Preview */}
              {form.coverImage && (
                <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={resolveCoverSrc(form.coverImage)}
                    alt="Cover preview"
                    style={{
                      maxHeight: '140px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      display: 'block'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coverImage: '' })}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Remove cover image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="form-row">
              <label className="form-label" style={{ flex: 1 }}>
                <div>
                  Tags <small style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Max 8 tags, comma-separated)</small>
                </div>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. Swiggy, Pre-IPO, Quick Commerce, Valuation"
                  className="form-input"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Content Section (with Tabs & TipTap Rich Editor) */}
        <div className="dashboard-content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`chip ${activeTab === 'write' ? 'chip-active' : ''}`}
                onClick={() => setActiveTab('write')}
              >
                ✏️ Rich Article Editor
              </button>
              <button
                type="button"
                className={`chip ${activeTab === 'preview' ? 'chip-active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                👁 Live Article Preview
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              MS Word-like WYSIWYG editing + &lt;/&gt; HTML switch
            </div>
          </div>

          <div className="card-body" style={{ padding: '1rem' }}>
            {activeTab === 'write' ? (
              <TipTapEditor
                content={form.contentHtml}
                onChange={(html) => setForm((prev) => ({ ...prev, contentHtml: html }))}
              />
            ) : (
              <div
                style={{
                  background: 'var(--surface-1)',
                  borderRadius: '8px',
                  padding: '2rem',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Article Header Preview */}
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: 'var(--surface-3)',
                      color: 'var(--accent)'
                    }}
                  >
                    {form.category}
                  </span>
                  <h1 style={{ fontSize: '1.8rem', margin: '0.75rem 0 0.5rem 0' }}>{form.title || 'Untitled Article'}</h1>
                  {form.subtitle && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>{form.subtitle}</p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>By {form.author} ({form.authorRole})</span>
                    <span>• {form.readTime}</span>
                    <span>• {formatShortDate(form.publishedDate)}</span>
                  </div>
                </div>

                {/* Rendered HTML Body */}
                <div
                  className="insight-article-body"
                  dangerouslySetInnerHTML={{ __html: form.contentHtml || '<p style="color:var(--text-muted)">No content written yet. Switch back to HTML Editor to compose your article.</p>' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate('/admin/blogs')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={saving}
            style={{ minWidth: '150px' }}
          >
            {saving ? 'Saving Article…' : isEditMode ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminBlogEditor
