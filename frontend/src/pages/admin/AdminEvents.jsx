import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import Pagination from '../../components/admin/Pagination'

const EMPTY_FORM = {
  title: '',
  description: '',
  company: '',
  eventDate: '',
  eventType: 'Other'
}

const EVENT_TYPES = ['DRHP', 'Funding', 'Leadership Change', 'Other']

const eventTypeClass = (type) => {
  switch (type) {
    case 'DRHP': return 'event-tag-drhp'
    case 'Funding': return 'event-tag-funding'
    case 'Leadership Change': return 'event-tag-leadership'
    default: return 'event-tag-other'
  }
}

const AdminEvents = () => {
  const [events, setEvents] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchAll = async () => {
    try {
      const [evRes, coRes] = await Promise.all([
        api.get('/events'),
        api.get('/companies/admin/all')
      ])
      setEvents(Array.isArray(evRes.data) ? evRes.data : [])
      setCompanies(Array.isArray(coRes.data) ? coRes.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (event) => {
    setEditing(event)
    setForm({
      title: event.title || '',
      description: event.description || '',
      company: event.company?._id || event.company || '',
      eventDate: event.eventDate ? event.eventDate.slice(0, 10) : '',
      eventType: event.eventType || 'Other'
    })
    setFormError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim()) {
      return setFormError('Title is required')
    } else if (form.title.trim().length > 150) {
      return setFormError('Title cannot exceed 150 characters')
    }
    
    if (!form.eventDate) {
      return setFormError('Event date is required')
    }
    
    if (!form.description.trim()) {
      return setFormError('Description is required')
    } else if (form.description.trim().length < 10) {
      return setFormError('Description must be at least 10 characters long')
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        company: form.company || undefined,
        eventDate: new Date(form.eventDate).toISOString(),
        eventType: form.eventType
      }
      if (editing) {
        await api.put(`/events/${editing._id}`, payload)
      } else {
        await api.post('/events', payload)
      }
      closeForm()
      await fetchAll()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await api.delete(`/events/${confirmId}`)
      setConfirmId(null)
      await fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(events.length / itemsPerPage)
  const paginatedEvents = events.slice(
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
      <div className="admin-page-header">
        <h1>Events</h1>
        <button className="primary-btn" onClick={openCreate}>+ Add New Event</button>
      </div>

      {loading ? (
        <p className="muted">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="chart-empty">No events yet. Click "+ Add New Event" to create one.</div>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Event History</h3>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((ev) => (
                  <tr key={ev._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{ev.title}</td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    {ev.company ? (
                      <Link to={`/admin/companies/${ev.company._id}`}>{ev.company.name}</Link>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.6rem 1rem' }}>{new Date(ev.eventDate).toLocaleDateString()}</td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <span className={`event-tag ${eventTypeClass(ev.eventType)}`}>{ev.eventType}</span>
                  </td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="row-action-btn" onClick={() => openEdit(ev)}>Edit</button>
                      <button className="row-action-btn delete-btn" onClick={() => setConfirmId(ev._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {formOpen && (
        <div className="modal-backdrop event-modal-backdrop" onClick={closeForm}>
            <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={closeForm}>&times;</button>
            <h2>{editing ? 'Edit Event' : 'Add New Event'}</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label className="form-label">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Title</span>
                  <span style={{ fontSize: '0.75rem', color: (form.title || '').length >= 150 ? 'var(--danger, #e74c3c)' : 'var(--text-muted, #888)' }}>
                    {(form.title || '').length}/150
                  </span>
                </div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  maxLength={150}
                />
              </label>
              <div className="form-row">
                <label className="form-label">
                  Event Type
                  <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="form-input">
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="form-label">
                  Event Date
                  <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="form-input" />
                </label>
              </div>
              <label className="form-label">
                Company (optional)
                <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="form-input">
                  <option value="">— General —</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                Description
                <textarea
                  className="form-input"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="row-action-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Event"
          message="Are you sure you want to permanently delete this event?"
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}

export default AdminEvents