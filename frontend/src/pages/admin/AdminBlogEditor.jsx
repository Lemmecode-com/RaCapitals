import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { apiBaseWithoutApi, formatShortDate } from '../../utils/format'

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
  category: 'Valuation & Analysis',
  readTime: '5 min read',
  publishedDate: new Date().toISOString().slice(0, 10),
  author: 'RA Research Desk',
  authorRole: 'Equity & Private Markets Analyst',
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
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditMode)

  const textareaRef = useRef(null)
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
          category: data.category || 'Valuation & Analysis',
          readTime: data.readTime || '5 min read',
          publishedDate: data.publishedDate ? data.publishedDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
          author: data.author || 'RA Research Desk',
          authorRole: data.authorRole || 'Equity & Private Markets Analyst',
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

  // Handle title change & auto-generate slug if not manually edited
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setForm((prev) => ({
      ...prev,
      title: newTitle,
      slug: !isSlugManuallyEdited ? slugify(newTitle) : prev.slug
    }))
  }

  // Handle manual slug editing
  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))
  }

  // Auto-calculate read time based on word count
  const handleCalculateReadTime = () => {
    const stripped = form.contentHtml.replace(/<[^>]+>/g, ' ')
    const words = stripped.trim().split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(words / 180))
    setForm((prev) => ({ ...prev, readTime: `${minutes} min read` }))
  }

  // Cover image file upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

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

  // Helper to insert HTML snippets at cursor position in textarea
  const insertHtmlSnippet = (snippet) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setForm((prev) => ({ ...prev, contentHtml: prev.contentHtml + '\n' + snippet }))
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = form.contentHtml
    const newText = text.substring(0, start) + snippet + text.substring(end)

    setForm((prev) => ({ ...prev, contentHtml: newText }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 50)
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Article title is required')
      return
    }

    if (!form.contentHtml.trim()) {
      setError('Article content (HTML) is required')
      return
    }

    setSaving(true)

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      relatedSlugs: form.relatedSlugs
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
              Article Title *
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Swiggy Pre-IPO Valuation Analysis: Quick Commerce Economics & DRHP Takeaways"
                className="form-input"
                style={{ fontSize: '1rem', fontWeight: 600 }}
                required
              />
            </label>

            {/* Slug & Subtitle */}
            <div className="form-row">
              <label className="form-label" style={{ flex: 1 }}>
                SEO Slug *
                <input
                  type="text"
                  value={form.slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. swiggy-pre-ipo-valuation-analysis"
                  className="form-input"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Live URL: <code>/insights/{form.slug || 'your-slug'}</code>
                </span>
              </label>

              <label className="form-label" style={{ flex: 1 }}>
                Category *
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="form-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Subtitle / Deck */}
            <label className="form-label">
              Subtitle (Deck)
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="A brief summary deck displayed right under the main title..."
                className="form-input"
              />
            </label>

            {/* Excerpt */}
            <label className="form-label">
              Short Excerpt (Grid Card Preview)
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="2-3 sentences summarizing the article for the cards grid and search results..."
                className="contact-form-textarea"
                rows={2}
                style={{ minHeight: '70px' }}
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
                  className="form-input"
                />
              </label>

              <label className="form-label">
                Author Role
                <input
                  type="text"
                  value={form.authorRole}
                  onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                  className="form-input"
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
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleCalculateReadTime}
                    className="secondary-btn"
                    title="Auto-calculate from word count"
                    style={{ whiteSpace: 'nowrap', padding: '0 0.6rem', fontSize: '0.78rem' }}
                  >
                    Auto
                  </button>
                </div>
              </label>
            </div>

            {/* Cover Image URL + Upload Button */}
            <div className="form-label">
              Cover Image (Banner)
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

            {/* Tags and Related Slugs */}
            <div className="form-row">
              <label className="form-label" style={{ flex: 1 }}>
                Tags (Comma-separated)
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. Swiggy, Pre-IPO, Quick Commerce, Valuation"
                  className="form-input"
                />
              </label>

              <label className="form-label" style={{ flex: 1 }}>
                Related Article Slugs (Comma-separated)
                <input
                  type="text"
                  value={form.relatedSlugs}
                  onChange={(e) => setForm({ ...form, relatedSlugs: e.target.value })}
                  placeholder="e.g. how-unlisted-shares-transferred-demat, taxation-on-unlisted-shares-in-india"
                  className="form-input"
                />
              </label>
            </div>

            {/* Featured Spotlight Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                ★ Feature as Spotlight Deep Dive on Insights Homepage
              </span>
            </label>
          </div>
        </div>

        {/* Content Section (with Tabs & Snippet Toolbar) */}
        <div className="dashboard-content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`chip ${activeTab === 'write' ? 'chip-active' : ''}`}
                onClick={() => setActiveTab('write')}
              >
                ✏️ HTML Editor
              </button>
              <button
                type="button"
                className={`chip ${activeTab === 'preview' ? 'chip-active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                👁 Live Article Preview
              </button>
            </div>

            {/* Quick HTML Snippet Toolbar */}
            {activeTab === 'write' && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => insertHtmlSnippet('<div class="insight-lead">\n  Your lead introductory paragraph here...\n</div>\n')}
                >
                  + Lead Intro
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => insertHtmlSnippet('<div class="insight-callout">\n  <h4>Key Takeaways</h4>\n  <ul>\n    <li><strong>Point 1:</strong> Description here.</li>\n    <li><strong>Point 2:</strong> Description here.</li>\n  </ul>\n</div>\n')}
                >
                  + Callout Box
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => insertHtmlSnippet('<h2>1. Section Title Here</h2>\n<p>Your analysis text here...</p>\n')}
                >
                  + Heading & Para
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => insertHtmlSnippet('<div class="insight-table-wrap">\n  <table class="insight-table">\n    <thead>\n      <tr>\n        <th>Metric</th>\n        <th>Company A</th>\n        <th>Company B</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><strong>Valuation Multiple</strong></td>\n        <td>₹10,000 Cr</td>\n        <td>₹15,000 Cr</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n')}
                >
                  + Comparison Table
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => insertHtmlSnippet('<blockquote>\n  "A noteworthy quote or market perspective."\n</blockquote>\n')}
                >
                  + Quote
                </button>
              </div>
            )}
          </div>

          <div className="card-body" style={{ padding: '1rem' }}>
            {activeTab === 'write' ? (
              <div>
                <textarea
                  ref={textareaRef}
                  value={form.contentHtml}
                  onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                  placeholder="Write or paste your article content in HTML format..."
                  rows={20}
                  className="contact-form-textarea"
                  style={{
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    minHeight: '450px',
                    width: '100%'
                  }}
                  required
                />
              </div>
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
