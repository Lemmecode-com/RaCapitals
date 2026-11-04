import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import Pagination from '../../components/admin/Pagination'
import { exportToCsv } from '../../utils/exportUtils'

const STATUS_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'New', label: 'New' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Closed', label: 'Closed' }
]

// Normalizes legacy status ('new', 'read') to 4-stage lifecycle
const normalizeStatus = (status) => {
  if (!status) return 'New'
  const lower = String(status).toLowerCase().trim()
  if (lower === 'new') return 'New'
  if (lower === 'in progress') return 'In Progress'
  if (lower === 'contacted' || lower === 'read') return 'Contacted'
  if (lower === 'closed') return 'Closed'
  return status
}

const getStatusBadgeStyle = (status) => {
  const norm = normalizeStatus(status)
  switch (norm) {
    case 'New':
      return { background: 'var(--brass, #2563EB)', color: '#FFFFFF' }
    case 'In Progress':
      return { background: 'rgba(var(--brass-rgb, 37, 99, 235), 0.15)', color: 'var(--brass, #2563EB)' }
    case 'Contacted':
      return { background: 'rgba(var(--brass-rgb, 37, 99, 235), 0.08)', color: 'var(--brass, #2563EB)', border: '1px solid rgba(var(--brass-rgb, 37, 99, 235), 0.25)' }
    case 'Closed':
      return { background: 'rgba(167, 179, 194, 0.22)', color: 'var(--muted, #6B7280)' }
    default:
      return { background: 'var(--surface-2)', color: 'var(--page-text)' }
  }
}

const AdminContacts = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modals
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [statusModalItem, setStatusModalItem] = useState(null)
  const [newStatusValue, setNewStatusValue] = useState('New')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const truncateMessage = (text) => {
    if (!text) return ''
    let truncated = text
    const words = text.split(' ')
    if (words.length > 5) {
      truncated = words.slice(0, 5).join(' ') + '…'
    }
    if (truncated.length > 45) {
      return truncated.slice(0, 45) + '…'
    }
    return truncated
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/contact')
      setSubmissions(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load contact submissions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Flash message autohide
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3000)
    return () => clearTimeout(t)
  }, [flash])

  const handleUpdateStatus = async (item, newStatus) => {
    setUpdatingStatus(true)
    const norm = normalizeStatus(newStatus)
    setSubmissions((prev) =>
      prev.map((s) => (s._id === item._id ? { ...s, status: norm } : s))
    )
    if (selectedMessage && selectedMessage._id === item._id) {
      setSelectedMessage((prev) => ({ ...prev, status: norm }))
    }
    setStatusModalItem(null)
    setFlash(`Status updated to "${norm}"`)

    try {
      await api.patch(`/contact/${item._id}/status`, { status: norm })
    } catch {
      try {
        await api.patch(`/contact/${item._id}/read`)
      } catch {
        // silent
      }
    } finally {
      setUpdatingStatus(false)
      window.dispatchEvent(new Event('contactRead'))
    }
  }

  const handleOpenView = (item) => {
    setSelectedMessage(item)
    if (normalizeStatus(item.status) === 'New') {
      // Auto advance to In Progress when admin views it
      handleUpdateStatus(item, 'In Progress')
    }
  }

  const handleRefresh = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
    fetchSubmissions()
  }

  // Calculate Metrics
  const counts = {
    totalAll: submissions.length,
    new: submissions.filter((s) => normalizeStatus(s.status) === 'New').length,
    inProgress: submissions.filter((s) => normalizeStatus(s.status) === 'In Progress').length,
    contacted: submissions.filter((s) => normalizeStatus(s.status) === 'Contacted').length,
    closed: submissions.filter((s) => normalizeStatus(s.status) === 'Closed').length
  }

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((s) => {
    const norm = normalizeStatus(s.status)
    if (selectedStatus !== 'all' && norm !== selectedStatus) {
      return false
    }

    const searchLow = searchTerm.toLowerCase().trim()
    if (searchLow) {
      const matchSearch =
        (s.name && s.name.toLowerCase().includes(searchLow)) ||
        (s.email && s.email.toLowerCase().includes(searchLow)) ||
        (s.phone && s.phone.toLowerCase().includes(searchLow)) ||
        (s.message && s.message.toLowerCase().includes(searchLow))
      if (!matchSearch) return false
    }

    if (startDate || endDate) {
      const sDate = new Date(s.createdAt)
      const sDateWithoutTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate())
      if (startDate) {
        const start = new Date(startDate)
        if (sDateWithoutTime < start) return false
      }
      if (endDate) {
        const end = new Date(endDate)
        if (sDateWithoutTime > end) return false
      }
    }

    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // Export Engine
  const handleExport = (format = 'csv') => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) {
      setFlash('No contact submissions available to export.')
      return
    }

    const columns = [
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', key: 'phone' },
      { label: 'Status', accessor: (row) => normalizeStatus(row.status) },
      {
        label: 'Date',
        accessor: (row) =>
          new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
      { label: 'Message', key: 'message' },
    ]

    const filename = `Contact_Submissions_${selectedStatus}_${new Date().toISOString().slice(0, 10)}.csv`
    exportToCsv(filename, columns, filteredSubmissions)
    setFlash(`Exported ${filteredSubmissions.length} contact records (${format.toUpperCase()})`)
  }

  return (
    <div className="dashboard-wrap">
      {/* Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Contact Submissions</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="secondary-btn"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => handleExport('csv')}
            title="Download CSV file for current view"
          >
            <span>📥</span> Export CSV
          </button>
          <button
            type="button"
            className="secondary-btn"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => handleExport('excel')}
            title="Download Excel-compatible file"
          >
            <span>📊</span> Export Excel
          </button>
        </div>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && <div className="flash" style={{ borderColor: 'var(--rust)', color: 'var(--error-fg)' }}>{error}</div>}

      {/* Sleek 5-Metric Strip */}
      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <div className="metric-card metric-primary" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>Total Messages</div>
          <div className="metric-value" style={{ fontSize: '1.2rem' }}>{counts.totalAll || 0}</div>
        </div>
        <div className="metric-card" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>New Inquiries</div>
          <div className="metric-value" style={{ fontSize: '1.2rem', color: 'var(--brass)' }}>{counts.new || 0}</div>
        </div>
        <div className="metric-card" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>In Progress</div>
          <div className="metric-value" style={{ fontSize: '1.2rem' }}>{counts.inProgress || 0}</div>
        </div>
        <div className="metric-card" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>Contacted</div>
          <div className="metric-value" style={{ fontSize: '1.2rem' }}>{counts.contacted || 0}</div>
        </div>
        <div className="metric-card" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>Closed</div>
          <div className="metric-value" style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>{counts.closed || 0}</div>
        </div>
      </div>

      {/* Controls Bar */}
      <section className="admin-controls" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, message…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ minWidth: '240px', flex: '1 1 240px' }}
        />
        <div className="sector-chips">
          {STATUS_CHIPS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${selectedStatus === s.id ? 'chip-active' : ''}`}
              onClick={() => {
                setSelectedStatus(s.id)
                setCurrentPage(1)
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            title="Start Date"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
            title="End Date"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          />
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </section>

      {/* Table Content Card */}
      {loading ? (
        <p className="muted">Loading contact submissions…</p>
      ) : filteredSubmissions.length === 0 ? (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Contact Messages</h3>
          </div>
          <div className="card-body" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p className="muted" style={{ margin: 0 }}>No contact messages found.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Contact Messages</h3>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.map((s) => {
                  const statusNormalized = normalizeStatus(s.status)
                  return (
                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {s.name}
                      </td>
                      <td className="mono" style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <a href={`mailto:${s.email}`} style={{ color: 'var(--page-text)', textDecoration: 'none' }}>
                          {s.email}
                        </a>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.message}>
                        {truncateMessage(s.message)}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span
                          className="status-badge"
                          style={{
                            ...getStatusBadgeStyle(statusNormalized),
                            borderRadius: '9999px',
                            padding: '0.2rem 0.65rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                            margin: 0
                          }}
                        >
                          {statusNormalized}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="row-action-btn"
                            onClick={() => handleOpenView(s)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="row-action-btn"
                            onClick={() => {
                              setStatusModalItem(s)
                              setNewStatusValue(statusNormalized === 'New' ? 'In Progress' : statusNormalized)
                            }}
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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

      {/* Modal for View Details */}
      {selectedMessage && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={() => setSelectedMessage(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '90%' }}>
            <button className="modal-close-btn" type="button" onClick={() => setSelectedMessage(null)}>&times;</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Message Details</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedMessage.name}</h3>
                <span className="mono muted" style={{ fontSize: '0.85rem' }}>{selectedMessage.email}</span>
              </div>
              <span
                className="status-badge"
                style={{
                  ...getStatusBadgeStyle(selectedMessage.status),
                  borderRadius: '9999px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {normalizeStatus(selectedMessage.status)}
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Message Content</label>
              <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)', maxHeight: '220px', overflowY: 'auto' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span>Received: {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    const item = selectedMessage
                    setSelectedMessage(null)
                    setStatusModalItem(item)
                    setNewStatusValue(normalizeStatus(item.status))
                  }}
                >
                  Change Status
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal for Quick Status Update */}
      {statusModalItem && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={() => setStatusModalItem(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <button className="modal-close-btn" type="button" onClick={() => setStatusModalItem(null)}>&times;</button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Update Contact Status</h2>
            <p className="muted" style={{ fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>
              Contact: <strong>{statusModalItem.name}</strong> ({statusModalItem.email})
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select New Status</label>
              <select
                value={newStatusValue}
                onChange={(e) => setNewStatusValue(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.95rem' }}
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Contacted">Contacted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setStatusModalItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus(statusModalItem, newStatusValue)}
              >
                {updatingStatus ? 'Updating…' : 'Save Status'}
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
