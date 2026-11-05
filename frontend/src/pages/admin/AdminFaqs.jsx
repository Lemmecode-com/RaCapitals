import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/admin/Pagination'

const STATUS_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' }
]

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([])
  const [metrics, setMetrics] = useState({ total: 0, published: 0, draft: 0, global: 0, companySpecific: 0 })
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'published' | 'draft'
  const [flash, setFlash] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [formData, setFormData] = useState({
    company: '',
    question: '',
    answer: '',
    order: 0,
    isPublished: true
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Auto-hide flash message
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3000)
    return () => clearTimeout(t)
  }, [flash])

  // Fetch Companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await api.get('/companies')
        setCompanies(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setCompanies([])
      }
    }
    loadCompanies()
  }, [])

  // Fetch FAQs from backend
  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/faqs')
      setFaqs(Array.isArray(res.data?.faqs) ? res.data.faqs : [])
      if (res.data?.metrics) {
        setMetrics(res.data.metrics)
      }
    } catch (err) {
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  // Instant responsive client-side filter
  const filteredFaqs = useMemo(() => {
    if (!Array.isArray(faqs)) return []
    return faqs.filter((f) => {
      // Company Scope filter
      if (selectedCompanyId) {
        if (!f.company || (f.company._id !== selectedCompanyId && f.company !== selectedCompanyId)) {
          return false
        }
      }

      // Status filter
      if (statusFilter === 'published' && !f.isPublished) return false
      if (statusFilter === 'draft' && f.isPublished) return false

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase()
        const questionMatch = (f.question || '').toLowerCase().includes(q)
        const answerMatch = (f.answer || '').toLowerCase().includes(q)
        const companyMatch = (f.company?.name || '').toLowerCase().includes(q)
        if (!questionMatch && !answerMatch && !companyMatch) return false
      }

      return true
    })
  }, [faqs, selectedCompanyId, statusFilter, searchTerm])

  // Unique companies covered by FAQs
  const companiesCoveredCount = useMemo(() => {
    if (!Array.isArray(faqs)) return 0
    const set = new Set()
    faqs.forEach((f) => {
      const id = f.company?._id || f.company
      if (id) set.add(id)
    })
    return set.size
  }, [faqs])

  // Pagination logic
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage) || 1
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredFaqs.slice(start, start + itemsPerPage)
  }, [filteredFaqs, currentPage, itemsPerPage])

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCompanyId, statusFilter, searchTerm])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingFaq(null)
    setFormData({
      company: selectedCompanyId || '',
      question: '',
      answer: '',
      order: faqs.length + 1,
      isPublished: true
    })
    setFormError('')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (faq) => {
    setEditingFaq(faq)
    setFormData({
      company: faq.company?._id || faq.company || '',
      question: faq.question || '',
      answer: faq.answer || '',
      order: faq.order ?? 0,
      isPublished: faq.isPublished !== undefined ? faq.isPublished : true
    })
    setFormError('')
    setIsModalOpen(true)
  }

  // Save (Create / Update) FAQ
  const handleSaveFaq = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.company) {
      setFormError('Please select a company.')
      return
    }
    if (!formData.question.trim()) {
      setFormError('Question is required.')
      return
    }
    if (!formData.answer.trim()) {
      setFormError('Answer is required.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        company: formData.company ? formData.company : null,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: Number(formData.order) || 0,
        isPublished: Boolean(formData.isPublished)
      }

      if (editingFaq) {
        await api.put(`/admin/faqs/${editingFaq._id}`, payload)
        setFlash('FAQ updated successfully.')
      } else {
        await api.post('/admin/faqs', payload)
        setFlash('New FAQ created successfully.')
      }

      setIsModalOpen(false)
      fetchFaqs()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save FAQ.')
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle Publish Status
  const handleTogglePublish = async (faqId) => {
    try {
      const res = await api.patch(`/admin/faqs/${faqId}/toggle-publish`)
      const updated = res.data?.faq
      if (updated) {
        setFaqs(prev => prev.map(f => f._id === faqId ? { ...f, isPublished: updated.isPublished } : f))
        setFlash(`FAQ status changed to ${updated.isPublished ? 'Published' : 'Draft'}.`)
        // Update metric counters locally
        setMetrics(prev => ({
          ...prev,
          published: updated.isPublished ? prev.published + 1 : Math.max(0, prev.published - 1),
          draft: !updated.isPublished ? prev.draft + 1 : Math.max(0, prev.draft - 1)
        }))
      }
    } catch (err) {
      setFlash('Failed to toggle publish status.')
    }
  }

  // Delete FAQ
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.delete(`/admin/faqs/${deleteTarget._id}`)
      setDeleteTarget(null)
      setFlash('FAQ deleted successfully.')
      fetchFaqs()
    } catch (err) {
      alert('Failed to delete FAQ.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="dashboard-wrap">
      {/* 1. Header Bar matching Listings / Blogs / Contacts */}
      <div className="admin-page-header">
        <div>
          <h1>Share FAQs</h1>
          <p className="muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>
            Manage company-specific investor due diligence questions and global pre-IPO templates.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={handleOpenCreate}
        >
          + Add New FAQ
        </button>
      </div>

      {flash && <div className="flash">{flash}</div>}

      {/* 2. Standard 4-Metric Strip */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card metric-primary">
          <div className="metric-header">Total FAQs</div>
          <div className="metric-value">{metrics.total || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">Published</div>
          <div className="metric-value" style={{ color: 'var(--brass)' }}>{metrics.published || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">Draft / Hidden</div>
          <div className="metric-value" style={{ color: 'var(--muted)' }}>{metrics.draft || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">Companies Covered</div>
          <div className="metric-value">{companiesCoveredCount}</div>
        </div>
      </div>

      {/* 3. Standard Admin Controls Toolbar */}
      <section className="admin-controls" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search questions or answers…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="sector-chips">
          {STATUS_CHIPS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${statusFilter === s.id ? 'chip-active' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="admin-controls-subrow">
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="form-input"
            style={{ padding: '0.4rem 0.75rem', height: '38px', borderRadius: '6px' }}
          >
            <option value="">All Companies (Filter)</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.sector || 'Unlisted'})</option>
            ))}
          </select>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setSelectedCompanyId('')
              setSearchTerm('')
              setStatusFilter('all')
              fetchFaqs()
            }}
            style={{ height: '38px' }}
          >
            Refresh
          </button>
        </div>
      </section>

      {/* 4. Table Content Card (Matching Listings & Blogs) */}
      {loading ? (
        <p className="muted">Loading FAQs…</p>
      ) : filteredFaqs.length === 0 ? (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Due Diligence Questions (0)</h3>
          </div>
          <div className="card-body" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p className="muted" style={{ margin: '0 0 1rem 0' }}>No FAQs match the current criteria.</p>
            <button
              type="button"
              className="primary-btn"
              onClick={handleOpenCreate}
            >
              + Create First FAQ
            </button>
          </div>
        </div>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Due Diligence Questions ({filteredFaqs.length})</h3>
            {totalPages > 1 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '50px' }}>#</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question & Answer</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '220px' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '130px' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '150px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFaqs.map((faq, idx) => (
                  <tr key={faq._id} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--muted)' }}>
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--page-text)', marginBottom: '0.25rem' }}>
                        {faq.question}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: '1.5', maxWidth: '560px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {faq.answer}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <span className="sector-badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                        🏢 {faq.company?.name || 'All Companies'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(faq._id)}
                        title="Click to toggle publish status"
                        className={`status-badge ${faq.isPublished ? 'status-live' : 'status-off'}`}
                        style={{
                          cursor: 'pointer',
                          border: 'none',
                          fontSize: '0.75rem',
                          margin: 0
                        }}
                      >
                        {faq.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => handleOpenEdit(faq)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="row-action-btn delete-btn"
                          onClick={() => setDeleteTarget(faq)}
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

      {/* 5. Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* 6. Create / Edit FAQ Modal matching AdminListings & AdminEvents */}
      {isModalOpen && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', width: '92%' }}>
            <button className="modal-close-btn" type="button" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2>{editingFaq ? 'Edit Due Diligence Question' : 'Add New Due Diligence Question'}</h2>
            <p className="muted" style={{ fontSize: '0.85rem', margin: '-0.5rem 0 1.25rem 0' }}>
              Configure question content, target company scope, and display priority.
            </p>

            <form onSubmit={handleSaveFaq}>
              {formError && (
                <div className="flash" style={{ borderColor: 'var(--rust)', color: 'var(--error-fg)', marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}

              {/* Company Picker */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Select Company *
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  required
                >
                  <option value="">-- Choose Company --</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.sector || 'Unlisted'})</option>
                  ))}
                </select>
                <span className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Select the company to which this investor question and answer belongs.
                </span>
              </div>

              {/* Question */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Question *
                </label>
                <input
                  type="text"
                  placeholder="e.g. How are shares of Tata Motors transferred to my demat?"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                />
              </div>

              {/* Answer */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Answer *
                </label>
                <textarea
                  placeholder="Provide detailed answer, SEBI timeline, lot size information, or transfer mechanics…"
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.88rem', lineHeight: '1.5', resize: 'vertical' }}
                />
              </div>

              {/* Order & Published Toggle */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ flex: '0 0 130px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                    className="form-input"
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.1rem' }}>
                  <input
                    type="checkbox"
                    id="isPublishedCheck"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isPublishedCheck" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--page-text)', cursor: 'pointer' }}>
                    Published (Active on site)
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-btn"
                >
                  {submitting ? 'Saving…' : (editingFaq ? 'Save Changes' : 'Create FAQ')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 7. Delete Confirmation Modal using ConfirmDialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete FAQ"
          message={`Are you sure you want to permanently delete this FAQ: "${deleteTarget.question}"?`}
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete FAQ'}
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
