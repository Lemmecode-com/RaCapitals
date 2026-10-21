import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/admin/Pagination'
import { formatShortDate, apiBaseWithoutApi } from '../../utils/format'
import { BLOG_CATEGORIES } from '../../data/mockBlogs'

const resolveCoverSrc = (coverImage) => {
  if (!coverImage) return ''
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  return `${apiBaseWithoutApi()}${coverImage}`
}

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Published' | 'Draft'
  const [flash, setFlash] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/blogs/admin/all')
      setBlogs(res.data || [])
    } catch (err) {
      console.error('Failed to fetch admin blogs:', err)
      setFlash('Error loading articles from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(''), 3500)
    return () => clearTimeout(timer)
  }, [flash])

  // Filtered list
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesCategory = category === 'All' || b.category === category
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Published' && b.status === 'published') ||
        (statusFilter === 'Draft' && b.status === 'draft')

      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        (b.title || '').toLowerCase().includes(q) ||
        (b.slug || '').toLowerCase().includes(q) ||
        (b.excerpt || '').toLowerCase().includes(q) ||
        (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q)))

      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [blogs, category, statusFilter, search])

  // Pagination calculations
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredBlogs.slice(start, start + itemsPerPage)
  }, [filteredBlogs, currentPage, itemsPerPage])

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, category, statusFilter])

  // Quick toggle publish status
  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published'
    try {
      await api.put(`/blogs/${blog._id}`, { status: newStatus })
      setBlogs((prev) =>
        prev.map((item) =>
          item._id === blog._id ? { ...item, status: newStatus } : item
        )
      )
      setFlash(`Article marked as ${newStatus === 'published' ? 'Published' : 'Draft'}`)
    } catch (err) {
      console.error('Error toggling status:', err)
      setFlash('Failed to update article status')
    }
  }

  // Quick toggle featured status
  const handleToggleFeatured = async (blog) => {
    const newFeatured = !blog.featured
    try {
      await api.put(`/blogs/${blog._id}`, { featured: newFeatured })
      setBlogs((prev) =>
        prev.map((item) =>
          item._id === blog._id ? { ...item, featured: newFeatured } : item
        )
      )
      setFlash(newFeatured ? 'Article featured on spotlight' : 'Article unfeatured')
    } catch (err) {
      console.error('Error toggling featured:', err)
      setFlash('Failed to update featured flag')
    }
  }

  // Delete article
  const handleDelete = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      await api.delete(`/blogs/${deleteConfirmId}`)
      setBlogs((prev) => prev.filter((b) => b._id !== deleteConfirmId))
      setFlash('Article deleted successfully')
    } catch (err) {
      console.error('Error deleting article:', err)
      setFlash('Failed to delete article')
    } finally {
      setDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  return (
    <div className="dashboard-wrap">
      {/* Admin Page Header (Matching Listings & Events pages) */}
      <div className="admin-page-header">
        <div>
          <h1>Market Insights</h1>
        </div>
        <Link to="/admin/blogs/new" className="primary-btn">
          + Add New Article
        </Link>
      </div>

      {flash && <div className="flash">{flash}</div>}

      {/* Admin Controls Toolbar (Matching Listings page) */}
      <section className="admin-controls" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by title, slug, or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="sector-chips">
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${category === c ? 'chip-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', height: '36px', borderRadius: '6px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published Only</option>
          <option value="Draft">Drafts Only</option>
        </select>

        <button type="button" className="secondary-btn" onClick={fetchBlogs}>
          Refresh
        </button>
      </section>

      {/* Main Table Card (Matching Listings & Events pages) */}
      {loading ? (
        <p className="muted">Loading market insights…</p>
      ) : filteredBlogs.length === 0 ? (
        <div className="dashboard-content-card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p className="muted">No articles found matching the current criteria.</p>
            <Link to="/admin/blogs/new" className="primary-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Create Your First Article
            </Link>
          </div>
        </div>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Article Insights ({filteredBlogs.length})</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cover
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Title
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Date & Read Time
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Featured
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBlogs.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Cover Thumbnail */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle', width: '56px' }}>
                      <div className="dashboard-hero-logo" style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden' }}>
                        {b.coverImage ? (
                          <img
                            src={resolveCoverSrc(b.coverImage)}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span className="logo-placeholder small" style={{ fontSize: '0.9rem' }}>📄</span>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.3' }}>
                        <Link to={`/admin/blogs/${b._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                          {b.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <code>/insights/{b.slug}</code>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          background: 'var(--surface-3)',
                          border: '1px solid var(--border)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {b.category}
                      </span>
                    </td>

                    {/* Date & Read Time */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                      <div>{formatShortDate(b.publishedDate)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.readTime || '5 min read'}
                      </div>
                    </td>

                    {/* Status Pill & Toggle */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(b)}
                        title={`Click to toggle status`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          border: b.status === 'published' ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(241, 196, 15, 0.4)',
                          background: b.status === 'published' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)',
                          color: b.status === 'published' ? '#2ecc71' : '#f1c40f',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>{b.status === 'published' ? '● Published' : '○ Draft'}</span>
                      </button>
                    </td>

                    {/* Featured Star Toggle */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(b)}
                        title={b.featured ? 'Spotlight article (Click to unfeature)' : 'Click to feature in spotlight banner'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          color: b.featured ? '#f39c12' : 'var(--text-muted)',
                          padding: '0.2rem'
                        }}
                      >
                        {b.featured ? '★' : '☆'}
                      </button>
                    </td>

                    {/* Actions: View (Opens Admin View Page!), Edit, Delete */}
                    <td style={{ padding: '0.6rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <Link
                          to={`/admin/blogs/${b._id}`}
                          className="row-action-btn"
                          title="View article details inside Admin"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/blogs/edit/${b._id}`}
                          className="row-action-btn"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="row-action-btn delete-btn"
                          onClick={() => setDeleteConfirmId(b._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <ConfirmDialog
          isOpen={!!deleteConfirmId}
          title="Delete Market Insight Article"
          message="Are you sure you want to permanently delete this article? This action cannot be undone."
          confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  )
}

export default AdminBlogs
