import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import Pagination from '../../components/admin/Pagination'
import { exportToCsv, exportToExcel } from '../../utils/exportUtils'

const STATUS_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'New', label: 'New' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Closed', label: 'Closed' }
]

// Brand-consistent status badge styling (matching Taurus Magnus design system)
const getStatusBadgeStyle = (status) => {
  switch (status) {
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

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([])
  const [counts, setCounts] = useState({ new: 0, inProgress: 0, contacted: 0, closed: 0, totalAll: 0 })
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [statusModalItem, setStatusModalItem] = useState(null)
  const [newStatusValue, setNewStatusValue] = useState('New')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Prevent initial double-fetch on mount
  const isInitialMount = useRef(true)

  const fetchEnquiries = async (pageOverride, statusOverride, searchOverride) => {
    const page = pageOverride !== undefined ? pageOverride : currentPage
    const activeStatus = statusOverride !== undefined ? statusOverride : selectedStatus
    const activeSearch = searchOverride !== undefined ? searchOverride : searchTerm

    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: 10,
        status: activeStatus !== 'all' ? activeStatus : undefined,
        search: activeSearch.trim() || undefined
      }

      const res = await api.get('/enquiries/admin/share', { params })
      if (res.data) {
        setEnquiries(res.data.enquiries || [])
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 })
        if (res.data.counts) {
          setCounts(res.data.counts)
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load share purchase enquiries.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchEnquiries(1, 'all', '')
  }, [])

  // Auto-search as user types (debounced by 350ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchEnquiries(1, selectedStatus, searchTerm)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Clear flash messages
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3000)
    return () => clearTimeout(t)
  }, [flash])

  // Fast chip status change without race condition
  const handleSelectStatus = (statusId) => {
    setSelectedStatus(statusId)
    setCurrentPage(1)
    fetchEnquiries(1, statusId, searchTerm)
  }

  // Fast refresh directly to All without stale intermediate state
  const handleRefresh = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setCurrentPage(1)
    fetchEnquiries(1, 'all', '')
  }

  // Page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchEnquiries(newPage, selectedStatus, searchTerm)
  }

  // Open View modal: automatically advances fresh 'New' leads to 'In Progress'
  const handleOpenView = async (item) => {
    if (item.status === 'New') {
      const updatedItem = { ...item, status: 'In Progress' }
      setSelectedEnquiry(updatedItem)

      // Optimistically update table and counts immediately
      setEnquiries(prev => prev.map(e => e._id === item._id ? updatedItem : e))
      setCounts(prev => ({
        ...prev,
        new: Math.max(0, (prev.new || 0) - 1),
        inProgress: (prev.inProgress || 0) + 1
      }))

      // Persist to database in background
      try {
        await api.patch(`/enquiries/admin/share/${item._id}/status`, { status: 'In Progress' })
      } catch (err) {
        console.error('Failed to auto-update status to In Progress:', err)
      }
    } else {
      setSelectedEnquiry(item)
    }
  }

  const handleStatusUpdate = async (enquiryId, statusToSet) => {
    setUpdatingStatus(true)
    setError('')
    // Immediately close modal upon user action
    setStatusModalItem(null)

    // Keep previous state in case of rollback
    const previousEnquiries = enquiries
    const previousSelected = selectedEnquiry

    // Optimistically update table row & modal
    setEnquiries(prev => prev.map(item => item._id === enquiryId ? { ...item, status: statusToSet } : item))
    if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
      setSelectedEnquiry(prev => ({ ...prev, status: statusToSet }))
    }

    try {
      const res = await api.patch(`/enquiries/admin/share/${enquiryId}/status`, { status: statusToSet })
      if (res.data) {
        setFlash(`Status updated to "${statusToSet}"`)
        // Refresh counts to update the metric cards
        api.get('/enquiries/admin/share', { params: { page: 1, limit: 1 } })
          .then(r => r.data?.counts && setCounts(r.data.counts))
          .catch(() => {})
      }
    } catch (err) {
      console.error('Update status error:', err)
      // Rollback optimistic update on error so UI stays consistent with DB
      setEnquiries(previousEnquiries)
      if (previousSelected) setSelectedEnquiry(previousSelected)
      setError(err?.response?.data?.message || err?.message || 'Failed to update status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleExport = async (format = 'csv') => {
    try {
      setFlash(`Preparing ${format.toUpperCase()} export...`)

      // Fetch all matching enquiries for active screen filters (up to 2000 records)
      const res = await api.get('/enquiries/admin/share', {
        params: {
          page: 1,
          limit: 2000,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm ? searchTerm.trim() : undefined
        }
      })

      const dataset = res.data?.enquiries?.length ? res.data.enquiries : enquiries
      if (!dataset || dataset.length === 0) {
        setFlash('No enquiries available to export for the active filter.')
        return
      }

      const columns = [
        { label: 'Enquiry ID', key: '_id' },
        { label: 'Company Name', accessor: (row) => row.companyName || (row.company && row.company.name) || '—' },
        { label: 'Investor Name', key: 'name' },
        { label: 'Phone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Quantity', accessor: (row) => (row.quantity != null ? row.quantity : '—') },
        { label: 'Status', key: 'status' },
        {
          label: 'Submission Timestamp',
          accessor: (row) =>
            row.createdAt
              ? new Date(row.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '—'
        },
        { label: 'Message / Remarks', key: 'message' }
      ]

      const dateStr = new Date().toISOString().slice(0, 10)
      const baseFilename = `Share_Enquiries_${selectedStatus}_${dateStr}`

      if (format === 'excel') {
        exportToExcel(`${baseFilename}.xls`, columns, dataset, 'Share Enquiries')
      } else {
        exportToCsv(`${baseFilename}.csv`, columns, dataset)
      }

      setFlash(`Successfully exported ${dataset.length} enquiry record(s) (${format.toUpperCase()})`)
    } catch (err) {
      console.error('Export error:', err)
      setFlash('Export failed. Please try again.')
    }
  }

  return (
    <div className="dashboard-wrap">
      {/* Header matching Listings with Export Actions */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Share Enquiries</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => handleExport('excel')}
          >
            Export Excel
          </button>
        </div>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && <div className="flash" style={{ borderColor: 'var(--rust)', color: 'var(--error-fg)' }}>{error}</div>}

      {/* Sleek, Single-Row Metric Strip */}
      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <div className="metric-card metric-primary" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>Total Enquiries</div>
          <div className="metric-value" style={{ fontSize: '1.2rem' }}>{counts.totalAll || 0}</div>
        </div>
        <div className="metric-card" style={{ padding: '0.55rem 0.85rem' }}>
          <div className="metric-header" style={{ fontSize: '0.7rem' }}>New Leads</div>
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

      {/* Controls Bar - Exactly like Listings */}
      <section className="admin-controls" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name, company, phone…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchEnquiries(1, selectedStatus, searchTerm)
            }
          }}
          className="search-input"
        />
        <div className="sector-chips">
          {STATUS_CHIPS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${selectedStatus === s.id ? 'chip-active' : ''}`}
              onClick={() => handleSelectStatus(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </section>

      {/* Table Content Card - Exactly matching Listings */}
      {loading ? (
        <p className="muted">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Share Purchase Enquiries</h3>
          </div>
          <div className="card-body" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p className="muted" style={{ margin: 0 }}>No share purchase enquiries found.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Share Purchase Enquiries</h3>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Company</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Phone</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Quantity</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {item.companyName}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </td>
                    <td className="mono" style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <a href={`tel:${item.phone}`} style={{ color: 'var(--page-text)', textDecoration: 'none' }}>
                        {item.phone}
                      </a>
                    </td>
                    <td className="mono" style={{ padding: '0.6rem 0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {item.quantity ? item.quantity.toLocaleString('en-IN') : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <span
                        className="status-badge"
                        style={{
                          ...getStatusBadgeStyle(item.status),
                          borderRadius: '9999px',
                          padding: '0.2rem 0.65rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                          margin: 0
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
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
                          onClick={() => handleOpenView(item)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => {
                            setStatusModalItem(item)
                            setNewStatusValue(item.status === 'New' ? 'In Progress' : item.status)
                          }}
                        >
                          Update Status
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
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        alwaysShow={true}
      />

      {/* Modal for Quick Status Update */}
      {statusModalItem && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={() => setStatusModalItem(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setStatusModalItem(null)}>&times;</button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Update Status</h2>
            <p className="muted" style={{ fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>
              Lead: <strong>{statusModalItem.name}</strong> ({statusModalItem.companyName})
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select New Status</label>
              <select
                value={newStatusValue}
                onChange={(e) => setNewStatusValue(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px' }}
              >
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
                onClick={() => handleStatusUpdate(statusModalItem._id, newStatusValue)}
              >
                {updatingStatus ? 'Saving…' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Redesigned Modal for Full Lead Inspection */}
      {selectedEnquiry && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: '1.75rem', borderRadius: '12px' }}>
            <button className="modal-close-btn" type="button" onClick={() => setSelectedEnquiry(null)}>&times;</button>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--page-text)' }}>Enquiry Details</h2>
              <span style={{
                borderRadius: '9999px',
                padding: '0.2rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                ...getStatusBadgeStyle(selectedEnquiry.status)
              }}>
                {selectedEnquiry.status}
              </span>
            </div>

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Company
                </span>
                <p style={{ margin: '0.3rem 0 0', fontWeight: 600, fontSize: '1rem', color: 'var(--page-text)' }}>
                  {selectedEnquiry.companyName}
                </p>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Requested Quantity
                </span>
                <p className="mono" style={{ margin: '0.3rem 0 0', fontWeight: 600, fontSize: '1rem', color: 'var(--page-text)' }}>
                  {selectedEnquiry.quantity ? `${selectedEnquiry.quantity.toLocaleString('en-IN')} Shares` : '—'}
                </p>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer Name
                </span>
                <p style={{ margin: '0.3rem 0 0', fontWeight: 600, fontSize: '0.95rem', color: 'var(--page-text)' }}>
                  {selectedEnquiry.name}
                </p>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone Number
                </span>
                <p className="mono" style={{ margin: '0.3rem 0 0', fontSize: '0.95rem' }}>
                  <a href={`tel:${selectedEnquiry.phone}`} style={{ color: 'var(--brass)', textDecoration: 'none', fontWeight: 600 }}>
                    {selectedEnquiry.phone}
                  </a>
                </p>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </span>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.95rem' }}>
                  {selectedEnquiry.email ? (
                    <a href={`mailto:${selectedEnquiry.email}`} style={{ color: 'var(--brass)', textDecoration: 'none' }}>
                      {selectedEnquiry.email}
                    </a>
                  ) : <span className="muted">—</span>}
                </p>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Submission Date
                </span>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'var(--page-text)' }}>
                  {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Customer Message Box */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                Customer Message
              </span>
              <div style={{
                padding: '0.85rem 1rem',
                background: 'var(--surface-2)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                minHeight: '65px',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                color: 'var(--page-text)',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedEnquiry.message || <span className="muted" style={{ fontStyle: 'italic' }}>No additional notes provided by customer.</span>}
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="secondary-btn"
                style={{ padding: '0.45rem 1.6rem' }}
                onClick={() => setSelectedEnquiry(null)}
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

export default AdminEnquiries
