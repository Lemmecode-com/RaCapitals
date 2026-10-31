import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import Pagination from '../../components/admin/Pagination'

const AdminContacts = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [selectedMessage, setSelectedMessage] = useState(null)

  const truncateMessage = (text) => {
    if (!text) return ''
    let truncated = text
    const words = text.split(' ')
    if (words.length > 4) {
      truncated = words.slice(0, 4).join(' ') + ' ...'
    }
    if (truncated.length > 40) {
      return truncated.slice(0, 40) + '...'
    }
    return truncated
  }

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      try {
        const res = await api.get('/contact')
        setSubmissions(Array.isArray(res.data) ? res.data : [])
      } catch {
        setError('Failed to load contact submissions.')
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/contact/${id}/read`)
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: 'read' } : s))
      )
      window.dispatchEvent(new Event('contactRead'))
    } catch {
      // ignore
    }
  }

  // Derived state for filters
  const filteredSubmissions = (Array.isArray(submissions) ? submissions : []).filter((s) => {
    const matchSearch =
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchDate = true
    if (startDate || endDate) {
      const sDate = new Date(s.createdAt)
      const sDateWithoutTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate())
      
      if (startDate) {
        const start = new Date(startDate)
        if (sDateWithoutTime < start) matchDate = false
      }
      if (endDate) {
        const end = new Date(endDate)
        if (sDateWithoutTime > end) matchDate = false
      }
    }

    return matchSearch && matchDate
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  return (
    <div className="dashboard-wrap">
      <div className="admin-page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Contact Submissions</h1>
        <p className="page-subtitle" style={{ margin: 0 }}>Manage messages from the contact form.</p>
      </div>

      <div className="admin-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-color, #333)' }}>Start:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                title="Start Date"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-color, #333)' }}>End:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                title="End Date"
              />
            </div>
          </div>
          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="form-error" style={{ margin: 0, fontSize: '0.85rem', color: 'red' }}>
              Start date cannot be after the end date.
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading submissions…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : filteredSubmissions.length === 0 ? (
        <div className="chart-empty">No contact submissions found.</div>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Submissions</h3>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sr No</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.map((s, idx) => (
                  <tr key={s._id} style={{ background: s.status === 'new' ? 'var(--surface-3)' : 'transparent' }}>
                    <td style={{ padding: '0.6rem 1rem' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <strong>{s.name}</strong>
                      {s.status === 'new' && <span className="contact-new-badge" style={{ marginLeft: '8px', fontSize: '0.75em', padding: '2px 6px', background: 'var(--brass)', color: 'white', borderRadius: '4px' }}>NEW</span>}
                    </td>
                    <td className="mono" style={{ padding: '0.6rem 1rem' }}>{s.email}</td>
                    <td style={{ padding: '0.6rem 1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.message}>
                      {truncateMessage(s.message)}
                    </td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      {new Date(s.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                          onClick={() => {
                            setSelectedMessage(s)
                            if (s.status === 'new') handleMarkRead(s._id)
                          }}
                        >
                          View
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        alwaysShow={true}
      />

      {/* Modal for full message view */}
      {selectedMessage && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--surface-1, #fff)',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button className="modal-close-btn" onClick={() => setSelectedMessage(null)}>&times;</button>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Message Details</h2>
            <p style={{ margin: '0.5rem 0' }}><strong>Name:</strong> {selectedMessage.name}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {selectedMessage.email}</p>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-2, #f5f5f5)', borderRadius: '4px' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selectedMessage.message}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn-outline"
                style={{ padding: '0.5rem 2rem' }}
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminContacts
