import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { formatShortDate, apiBaseWithoutApi } from '../../utils/format'

const resolveCoverSrc = (coverImage) => {
  if (!coverImage) return ''
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  return `${apiBaseWithoutApi()}${coverImage}`
}

const AdminBlogDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadBlog = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/blogs/admin/${id}`)
      setBlog(res.data)
    } catch (err) {
      console.error('Error fetching blog details:', err)
      setError(err?.response?.data?.message || 'Article not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlog()
  }, [id])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3500)
    return () => clearTimeout(t)
  }, [flash])

  // Toggle status (Draft vs Published)
  const handleToggleStatus = async () => {
    if (!blog) return
    const newStatus = blog.status === 'published' ? 'draft' : 'published'
    try {
      await api.put(`/blogs/${blog._id}`, { status: newStatus })
      setBlog({ ...blog, status: newStatus })
      setFlash(`Article status changed to ${newStatus === 'published' ? 'Published' : 'Draft'}`)
    } catch (err) {
      console.error('Error updating status:', err)
      setFlash('Failed to update status')
    }
  }

  // Toggle featured flag
  const handleToggleFeatured = async () => {
    if (!blog) return
    const newFeatured = !blog.featured
    try {
      await api.put(`/blogs/${blog._id}`, { featured: newFeatured })
      setBlog({ ...blog, featured: newFeatured })
      setFlash(newFeatured ? 'Article featured on homepage spotlight' : 'Article unfeatured')
    } catch (err) {
      console.error('Error updating featured flag:', err)
      setFlash('Failed to update featured flag')
    }
  }

  // Delete article
  const handleDelete = async () => {
    if (!blog) return
    setDeleting(true)
    try {
      await api.delete(`/blogs/${blog._id}`)
      navigate('/admin/blogs')
    } catch (err) {
      console.error('Error deleting article:', err)
      setFlash('Failed to delete article')
      setDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-wrap">
        <p className="muted">Loading article details…</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="dashboard-wrap">
        <Link to="/admin/blogs" className="back-btn-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          ← Back to Market Insights
        </Link>
        <div className="dashboard-content-card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p className="form-error" style={{ fontSize: '1.1rem' }}>{error || 'Article not found.'}</p>
            <Link to="/admin/blogs" className="primary-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Return to Insights List
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isPublished = blog.status === 'published'

  return (
    <div className="dashboard-wrap">
      {flash && <div className="flash" style={{ marginBottom: '1.5rem' }}>{flash}</div>}

      {/* Top Header / Actions Bar */}
      <div className="admin-page-header" style={{ marginBottom: '1.25rem', alignItems: 'flex-start' }}>
        <div>
          <Link
            to="/admin/blogs"
            className="back-btn-subtle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              marginBottom: '0.5rem'
            }}
          >
            ← Back to Market Insights
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: '1.3' }}>
            {blog.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                background: isPublished ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)',
                color: isPublished ? '#2ecc71' : '#f1c40f',
                border: isPublished ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(241, 196, 15, 0.4)'
              }}
            >
              {isPublished ? '● Published' : '○ Draft'}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                background: 'var(--surface-3)',
                border: '1px solid var(--border)'
              }}
            >
              {blog.category}
            </span>

            {blog.featured && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: 'rgba(243, 156, 18, 0.15)',
                  color: '#f39c12',
                  border: '1px solid rgba(243, 156, 18, 0.4)'
                }}
              >
                ★ Featured Spotlight
              </span>
            )}

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Published: {formatShortDate(blog.publishedDate)} • {blog.readTime || '5 min read'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleToggleStatus}
            style={{ fontSize: '0.85rem' }}
          >
            {isPublished ? 'Mark as Draft' : 'Publish Article'}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleToggleFeatured}
            style={{ fontSize: '0.85rem' }}
          >
            {blog.featured ? '☆ Unfeature' : '★ Feature'}
          </button>

          <Link
            to={`/admin/blogs/edit/${blog._id}`}
            className="primary-btn"
            style={{ fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Edit Article
          </Link>

          <Link
            to={`/insights/${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
            style={{ fontSize: '0.85rem', textDecoration: 'none' }}
            title="Open how public visitors view this article"
          >
            Public View ↗
          </Link>

          <button
            type="button"
            className="row-action-btn delete-btn"
            onClick={() => setDeleteModalOpen(true)}
            style={{ padding: '0.45rem 0.8rem' }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Overview Metadata Card */}
      <div className="dashboard-content-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>Article Overview & Information</h3>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              SEO Slug
            </div>
            <div style={{ marginTop: '0.3rem', fontSize: '0.9rem' }}>
              <code>/insights/{blog.slug}</code>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Author & Role
            </div>
            <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>
              {blog.author} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({blog.authorRole})</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Topics / Tags
            </div>
            <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {Array.isArray(blog.tags) && blog.tags.length > 0 ? (
                blog.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.75rem',
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    #{t}
                  </span>
                ))
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Related Slugs
            </div>
            <div style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>
              {Array.isArray(blog.relatedSlugs) && blog.relatedSlugs.length > 0 ? (
                blog.relatedSlugs.join(', ')
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          </div>
        </div>

        {blog.subtitle && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', background: 'var(--surface-2)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Subtitle / Deck
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{blog.subtitle}</p>
          </div>
        )}

        {blog.excerpt && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Excerpt (Card Preview)
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{blog.excerpt}</p>
          </div>
        )}
      </div>

      {/* Cover Image Preview */}
      {blog.coverImage && (
        <div className="dashboard-content-card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>Cover Banner</h3>
          </div>
          <div className="card-body" style={{ padding: '1rem', textAlign: 'center' }}>
            <img
              src={resolveCoverSrc(blog.coverImage)}
              alt={blog.title}
              style={{
                maxWidth: '100%',
                maxHeight: '380px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                objectFit: 'cover'
              }}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Source: <code>{blog.coverImage}</code>
            </div>
          </div>
        </div>
      )}

      {/* Full Article Content */}
      <div className="dashboard-content-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Article Content Body</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Rendered with Taurus Magnus Typography & Styling
          </span>
        </div>
        <div className="card-body" style={{ padding: '2rem 1.5rem', background: 'var(--surface-1)' }}>
          <div
            className="insight-article-body"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <ConfirmDialog
          isOpen={deleteModalOpen}
          title="Delete Market Insight Article"
          message={`Are you sure you want to permanently delete "${blog.title}"? This action cannot be undone.`}
          confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminBlogDetail
