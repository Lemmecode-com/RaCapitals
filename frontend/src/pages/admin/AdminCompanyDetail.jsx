import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { apiBaseWithoutApi, formatINR } from '../../utils/format'
import InfoTooltip from '../../components/common/InfoTooltip'

const AdminCompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  const [priceModalOpen, setPriceModalOpen] = useState(false)
  const [priceValue, setPriceValue] = useState('')
  const [priceError, setPriceError] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', sector: '', description: '', lotSize: '', faceValue: '', isin: '',
  })
  const [editError, setEditError] = useState('')

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [companyRes, historyRes] = await Promise.all([
        api.get(`/companies/${id}`),
        api.get(`/prices/${id}`),
      ])
      setCompany(companyRes.data)
      setHistory(historyRes.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load company')
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [id])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3000)
    return () => clearTimeout(t)
  }, [flash])

  useEffect(() => {
    if (!editModalOpen && !priceModalOpen) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setEditModalOpen(false)
        setPriceModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [editModalOpen, priceModalOpen])

  const openEdit = () => {
    setEditForm({
      name: company.name || '',
      sector: company.sector || '',
      description: company.description || '',
      lotSize: company.lotSize ?? '',
      faceValue: company.faceValue ?? '',
      isin: company.isin || '',
    })
    setEditError('')
    setEditModalOpen(true)
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    setEditError('')

    // Validate
    if (!editForm.name.trim()) {
      setEditError('Company name is required')
      return
    } else if (editForm.name.trim().length > 100) {
      setEditError('Company name cannot exceed 100 characters')
      return
    } else if (!/^[a-zA-Z0-9\s]+$/.test(editForm.name)) {
      setEditError('Company name cannot contain special characters')
      return
    }
    
    if (!editForm.sector.trim()) {
      setEditError('Sector is required')
      return
    }
    
    if (!editForm.lotSize) {
      setEditError('Lot size is required')
      return
    } else if (Number(editForm.lotSize) <= 0) {
      setEditError('Lot size must be a positive number')
      return
    }

    try {
      const payload = {
        name: editForm.name.trim(),
        sector: editForm.sector.trim(),
        description: editForm.description.trim(),
        lotSize: editForm.lotSize === '' ? undefined : Number(editForm.lotSize),
        faceValue: editForm.faceValue === '' ? undefined : Number(editForm.faceValue),
        isin: editForm.isin.trim(),
      }
      await api.put(`/companies/${id}`, payload)
      setEditModalOpen(false)
      setFlash(`Updated "${payload.name}"`)
      await loadAll()
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Save failed')
    }
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setPriceError('')
    if (!priceValue) {
      setPriceError('Price is required')
      return
    }
    const num = Number(priceValue)
    if (Number.isNaN(num) || num <= 0) {
      setPriceError('Enter a valid positive number')
      return
    }
    try {
      await api.post(`/prices/${id}`, { price: num })
      setPriceModalOpen(false)
      setPriceValue('')
      setFlash(`Price recorded: ${formatINR(num)}`)
      await loadAll()
    } catch (err) {
      setPriceError(err?.response?.data?.message || 'Price update failed')
    }
  }

  const handleLogoUpload = async (file) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('logo', file)
      await api.post(`/companies/${id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFlash('Logo updated')
      await loadAll()
    } catch (err) {
      setFlash(err?.response?.data?.message || 'Logo upload failed')
    }
  }

  if (loading) {
    return (
      <div className="admin-wrap">
        <p className="muted">Loading company…</p>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="admin-wrap">
        <Link to="/admin/listings" className="back-pill">← Back to listings</Link>
        <p className="form-error">{error || 'Company not found'}</p>
      </div>
    )
  }

  const latestPrice = company.priceHistory && company.priceHistory.length
    ? company.priceHistory[company.priceHistory.length - 1].price
    : (history.length ? history[history.length - 1].price : null)

  const logoSrc = company.logoUrl ? `${apiBaseWithoutApi()}${company.logoUrl}` : null
  const initial = company.name ? company.name.charAt(0).toUpperCase() : '?'
  const hasLogo = !!company.logoUrl

  return (
    <div className="dashboard-wrap">
      {flash && <div className="flash" style={{ marginBottom: '1.5rem' }}>{flash}</div>}

      <div className="dashboard-hero-card">
        <div className="dashboard-hero-left">
          <Link to="/admin/listings" className="back-btn-subtle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to listings
          </Link>
          <div className="dashboard-hero-content">
            <div className="dashboard-hero-logo">
              {logoSrc ? (
                <img src={logoSrc} alt={`${company.name} logo`} />
              ) : (
                <span className="logo-placeholder">{initial}</span>
              )}
              <label className="upload-overlay" title={hasLogo ? 'Replace Logo' : 'Upload Logo'}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) handleLogoUpload(file)
                  }}
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </label>
            </div>
            <div className="dashboard-hero-text">
              <h1>{company.name}</h1>
              <div className="dashboard-tags">
                {company.sector && <span className="tag-sector">{company.sector}</span>}
                <span className={`tag-status ${company.isActive ? 'live' : 'off'}`}>
                  {company.isActive ? 'Live' : 'Deactivated'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-hero-actions">
          <button type="button" className="secondary-btn" onClick={openEdit}>
            Edit Details
          </button>
        </div>
      </div>

      <div className="dashboard-metrics-grid">
        <div className="metric-card metric-primary">
          <div className="metric-header">
            <span>Latest Price</span>
            <InfoTooltip text="An estimated price based on our own research — not sourced from a live stock exchange." />
          </div>
          <div className="metric-value">
            {latestPrice == null ? (
              <button type="button" className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }} onClick={() => setPriceModalOpen(true)}>
                Set Price
              </button>
            ) : (
              <span className="mono">{formatINR(latestPrice)}</span>
            )}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span>52W High</span>
            <InfoTooltip text="Highest indicative price recorded over the last 12 months." />
          </div>
          <div className="metric-value mono">{formatINR(company.high52)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>52W Low</span>
            <InfoTooltip text="Lowest indicative price recorded over the last 12 months." />
          </div>
          <div className="metric-value mono">{formatINR(company.low52)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Lot Size</span>
            <InfoTooltip text="Minimum number of shares you can enquire about in one transaction." />
          </div>
          <div className="metric-value mono">{company.lotSize ?? '—'}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Face Value</span>
            <InfoTooltip text="The share's original nominal value set at incorporation." />
          </div>
          <div className="metric-value mono">{formatINR(company.faceValue)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>ISIN</span>
            <InfoTooltip text="International Securities Identification Number." />
          </div>
          <div className="metric-value mono" style={{ fontSize: '1.25rem' }}>{company.isin || '—'}</div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Description</h3>
          </div>
          <div className="card-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <p style={{ margin: 0, lineHeight: 1.65, fontSize: '0.88rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--page-text)' }}>
              {company.description || <span className="muted">No description provided.</span>}
            </p>
          </div>
        </div>

        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Price History <span className="muted" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>({history.length} records)</span></h3>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: '450px', overflowY: 'auto' }}>
            {history.length === 0 ? (
              <p className="muted" style={{ padding: '1rem', margin: 0, fontSize: '0.85rem' }}>No price records yet. Use "Update Price" to add the first one.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recorded At</th>
                    <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((p, idx) => (
                    <tr key={p._id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="mono" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>{new Date(p.recordedAt).toLocaleString('en-IN')}</td>
                      <td className="mono" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600, textAlign: 'right' }}>{formatINR(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {priceModalOpen && createPortal(
        <div className="admin-modal-portal modal-backdrop" onClick={() => setPriceModalOpen(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setPriceModalOpen(false)}>&times;</button>
            <h2>Update Price — {company.name}</h2>
            <form onSubmit={submitPrice} className="admin-form">
              <label className="form-label">
                New Price (₹) *
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  required
                  className="form-input"
                />
              </label>
              {priceError && <p className="form-error">{priceError}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setPriceModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Price</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {editModalOpen && createPortal(
        <div className="admin-modal-portal modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setEditModalOpen(false)}>&times;</button>
            <h2>Edit — {company.name}</h2>
            <form onSubmit={submitEdit} className="admin-form">
              <label className="form-label">
                Name *
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="form-input" />
              </label>
              <label className="form-label">
                Sector *
                <input type="text" value={editForm.sector} onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })} required className="form-input" />
              </label>
              <label className="form-label">
                Description
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="form-input" rows={6} />
              </label>
              <div className="form-row">
                <label className="form-label">
                  <InfoTooltip text="Minimum number of shares a buyer must purchase in one transaction.">
                    Lot Size
                  </InfoTooltip>
                  <input type="number" value={editForm.lotSize} onChange={(e) => setEditForm({ ...editForm, lotSize: e.target.value })} className="form-input" />
                </label>
                <label className="form-label">
                  <InfoTooltip text="The share's original nominal value set at incorporation — unrelated to its current market price.">
                    Face Value
                  </InfoTooltip>
                  <input type="number" step="0.01" value={editForm.faceValue} onChange={(e) => setEditForm({ ...editForm, faceValue: e.target.value })} className="form-input" />
                </label>
              </div>
              <label className="form-label">
                <InfoTooltip text="International Securities Identification Number — a unique code for the share. Leave blank if not yet assigned.">
                  ISIN
                </InfoTooltip>
                <input type="text" value={editForm.isin} onChange={(e) => setEditForm({ ...editForm, isin: e.target.value })} className="form-input" />
              </label>
              <label className="form-label" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editForm.drhpFiled || false}
                  onChange={(e) => setEditForm({ ...editForm, drhpFiled: e.target.checked })}
                />
                <span>DRHP Filed</span>
              </label>
              {editError && <p className="form-error">{editError}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminCompanyDetail