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
    name: '',
    sector: '',
    industry: '',
    cin: '',
    registeredOffice: '',
    foundedYear: '',
    description: '',
    lotSize: '',
    faceValue: '',
    isin: '',
    marketCap: '',
    peRatio: '',
    pbRatio: '',
    roe: '',
    bookValue: '',
    outstandingShares: '',
    drhpFiled: false
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
      industry: company.industry || '',
      cin: company.cin || '',
      registeredOffice: company.registeredOffice || '',
      foundedYear: company.foundedYear ?? '',
      description: company.description || '',
      lotSize: company.lotSize ?? '',
      faceValue: company.faceValue ?? '',
      isin: company.isin || '',
      marketCap: company.marketCap ?? '',
      peRatio: company.peRatio ?? '',
      pbRatio: company.pbRatio ?? '',
      roe: company.roe ?? '',
      bookValue: company.bookValue ?? '',
      outstandingShares: company.outstandingShares ?? '',
      drhpFiled: Boolean(company.drhpFiled)
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
        industry: editForm.industry ? editForm.industry.trim() : '',
        cin: editForm.cin ? editForm.cin.trim() : '',
        registeredOffice: editForm.registeredOffice ? editForm.registeredOffice.trim() : '',
        foundedYear: editForm.foundedYear === '' ? null : Number(editForm.foundedYear),
        description: editForm.description.trim(),
        lotSize: editForm.lotSize === '' ? undefined : Number(editForm.lotSize),
        faceValue: editForm.faceValue === '' ? null : Number(editForm.faceValue),
        isin: editForm.isin ? editForm.isin.trim() : '',
        marketCap: editForm.marketCap === '' ? null : Number(editForm.marketCap),
        peRatio: editForm.peRatio === '' ? null : Number(editForm.peRatio),
        pbRatio: editForm.pbRatio === '' ? null : Number(editForm.pbRatio),
        roe: editForm.roe === '' ? null : Number(editForm.roe),
        bookValue: editForm.bookValue === '' ? null : Number(editForm.bookValue),
        outstandingShares: editForm.outstandingShares === '' ? null : Number(editForm.outstandingShares),
        drhpFiled: Boolean(editForm.drhpFiled)
      }
      await api.put(`/companies/${id}`, payload)
      setEditModalOpen(false)
      setFlash(`Updated "${payload.name}" successfully`)
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
      setPriceError(err?.response?.data?.message || 'Price recording failed')
    }
  }

  const toggleActive = async () => {
    const nextState = !company.isActive
    const action = nextState ? 'activate' : 'deactivate'
    try {
      await api.patch(`/companies/${id}/${action}`)
      setFlash(nextState ? 'Company activated (live)' : 'Company deactivated (hidden)')
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} company`)
    }
  }

  const handleLogoUpload = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('logo', file)
    try {
      await api.post(`/companies/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFlash('Logo updated')
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Logo upload failed')
    }
  }

  if (loading && !company) {
    return (
      <div className="dashboard-wrap">
        <p className="muted">Loading company…</p>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="dashboard-wrap">
        <p className="form-error">{error}</p>
        <Link to="/admin/listings" className="secondary-btn" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Back to Listings
        </Link>
      </div>
    )
  }

  if (!company) return null

  const latestPrice = history.length ? history[history.length - 1].price : null
  const logoSrc = company.logoUrl ? (company.logoUrl.startsWith('http') ? company.logoUrl : `${apiBaseWithoutApi()}${company.logoUrl}`) : null
  const initial = company.name ? company.name.charAt(0).toUpperCase() : '?'
  const hasLogo = Boolean(company.logoUrl)

  return (
    <div className="dashboard-wrap">
      <div className="admin-page-header">
        <div>
          <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <Link to="/admin/listings" className="muted" style={{ textDecoration: 'none' }}>Listings</Link>
            <span className="muted" style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ color: 'var(--brass)', fontWeight: 600 }}>{company.name}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>Company Management</h1>
            <span className="muted mono" style={{ fontSize: '0.85rem' }}>ID: {company._id}</span>
          </div>
        </div>

        <div className="admin-actions" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="secondary-btn" onClick={() => setPriceModalOpen(true)}>
            Update Price
          </button>
          <button
            type="button"
            className={company.isActive ? 'danger-btn' : 'secondary-btn'}
            onClick={toggleActive}
          >
            {company.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <Link to={`/company/${company._id}`} target="_blank" rel="noopener noreferrer" className="secondary-btn">
            View Live Listing ↗
          </Link>
        </div>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && <div className="flash" style={{ borderColor: 'var(--rust)', color: 'var(--error-fg)' }}>{error}</div>}

      <div className="dashboard-hero-card">
        <div className="dashboard-hero-main">
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
              <h1 style={{ margin: '0 0 0.35rem 0' }}>{company.name}</h1>
              <div className="dashboard-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                {company.sector && <span className="tag-sector">{company.sector}</span>}
                {company.drhpFiled && <span className="tag-sector" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>DRHP Filed</span>}
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

      {/* Section 1: Valuation & Trading Highlights (4 Clean Cards) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brass)', marginBottom: '0.5rem' }}>
          Valuation & Market Multiples
        </div>
        <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: 0 }}>
          <div className="metric-card metric-primary">
            <div className="metric-header">
              <span>Latest Indicative Price</span>
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
              <span>52W High / Low</span>
              <InfoTooltip text="Highest and lowest indicative transaction price over past 12 months." />
            </div>
            <div className="metric-value mono" style={{ fontSize: '1.1rem' }}>
              {formatINR(company.high52)} / {formatINR(company.low52)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Market Cap (Est.)</span>
              <InfoTooltip text="Estimated total valuation in ₹ Crores." />
            </div>
            <div className="metric-value mono">
              {company.marketCap ? `₹ ${Number(company.marketCap).toLocaleString('en-IN')} Cr` : '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>P/E Ratio</span>
              <InfoTooltip text="Price to Earnings valuation multiple." />
            </div>
            <div className="metric-value mono">
              {company.peRatio ? `${company.peRatio}x` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Share Fundamentals & Trading Rules (4 Clean Cards) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brass)', marginBottom: '0.5rem' }}>
          Share Fundamentals & Capital Structure
        </div>
        <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: 0 }}>
          <div className="metric-card">
            <div className="metric-header">
              <span>Book Value (BVPS)</span>
              <InfoTooltip text="Book value per share in ₹." />
            </div>
            <div className="metric-value mono">
              {company.bookValue ? `₹ ${company.bookValue}` : '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>P/B Ratio & ROE</span>
              <InfoTooltip text="Price to Book Value and Return on Equity." />
            </div>
            <div className="metric-value mono" style={{ fontSize: '1.1rem' }}>
              {company.pbRatio ? `${company.pbRatio}x` : '—'} / {company.roe ? `${company.roe}%` : '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Lot Size & Face Value</span>
              <InfoTooltip text="Minimum trade quantity & nominal face value." />
            </div>
            <div className="metric-value mono" style={{ fontSize: '1.1rem' }}>
              {company.lotSize ? `${company.lotSize} shs` : '—'} / {formatINR(company.faceValue)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Total Shares Outstanding</span>
              <InfoTooltip text="Total issued and registered demat shares." />
            </div>
            <div className="metric-value mono">
              {company.outstandingShares ? `${(Number(company.outstandingShares) >= 10000000 ? (Number(company.outstandingShares)/10000000).toFixed(2) + ' Cr' : Number(company.outstandingShares).toLocaleString('en-IN'))}` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Dedicated Corporate Legal & Filing Details Panel */}
      <div className="dashboard-content-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Corporate Identifiers & Regulatory Filing Info</h3>
          <span className="muted" style={{ fontSize: '0.8rem' }}>Ministry of Corporate Affairs (MCA) & Depository Records</span>
        </div>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span className="muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Corporate Identification Number (CIN)</span>
              <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brass)', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                {company.cin || '—'}
              </span>
            </div>

            <div>
              <span className="muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>ISIN (Demat Code)</span>
              <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--page-text)', letterSpacing: '0.03em' }}>
                {company.isin || '—'}
              </span>
            </div>

            <div>
              <span className="muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Founded / Incorporation Year</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {company.foundedYear || '—'}
              </span>
            </div>

            <div>
              <span className="muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Industry Sub-Classification</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {company.industry || company.sector || '—'}
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <span className="muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Registered Office (HQ Address)</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--page-text)' }}>
                {company.registeredOffice || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Description & Overview</h3>
          </div>
          <div className="card-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <p style={{ margin: 0, lineHeight: 1.65, fontSize: '0.88rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--page-text)' }}>
              {company.description || <span className="muted">No description provided. Click "Edit Details" to add one.</span>}
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

      {/* Comprehensive Edit Modal */}
      {editModalOpen && createPortal(
        <div className="admin-modal-portal modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '640px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setEditModalOpen(false)}>&times;</button>
            <h2>Edit Company Details — {company.name}</h2>
            
            <form onSubmit={submitEdit} className="admin-form">
              {/* Section 1: Basic Info */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brass)' }}>1. Basic Listing Information</h4>
                
                <label className="form-label">
                  Company Name *
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="form-input" />
                </label>

                <div className="form-row">
                  <label className="form-label">
                    Sector *
                    <input type="text" value={editForm.sector} onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })} required className="form-input" placeholder="e.g. IT, Consumer" />
                  </label>
                  <label className="form-label">
                    Industry Sub-Segment
                    <input type="text" value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} className="form-input" placeholder="e.g. Retail Commerce" />
                  </label>
                </div>

                <label className="form-label">
                  Description
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="form-input" rows={4} />
                </label>

                <label className="form-label" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                  <input
                    type="checkbox"
                    checked={editForm.drhpFiled || false}
                    onChange={(e) => setEditForm({ ...editForm, drhpFiled: e.target.checked })}
                  />
                  <span>DRHP Filed (Draft Red Herring Prospectus with SEBI)</span>
                </label>
              </div>

              {/* Section 2: Corporate Identifiers */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brass)' }}>2. Corporate Legal Identifiers</h4>
                
                <div className="form-row">
                  <label className="form-label">
                    <InfoTooltip text="Corporate Identification Number registered with MCA.">
                      CIN
                    </InfoTooltip>
                    <input type="text" value={editForm.cin} onChange={(e) => setEditForm({ ...editForm, cin: e.target.value })} className="form-input" placeholder="U72200PN..." />
                  </label>

                  <label className="form-label">
                    <InfoTooltip text="International Securities Identification Number.">
                      ISIN
                    </InfoTooltip>
                    <input type="text" value={editForm.isin} onChange={(e) => setEditForm({ ...editForm, isin: e.target.value })} className="form-input" placeholder="INE..." />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Founded Year
                    <input type="number" value={editForm.foundedYear} onChange={(e) => setEditForm({ ...editForm, foundedYear: e.target.value })} className="form-input" placeholder="e.g. 1994" />
                  </label>
                  <label className="form-label">
                    Registered Office (HQ)
                    <input type="text" value={editForm.registeredOffice} onChange={(e) => setEditForm({ ...editForm, registeredOffice: e.target.value })} className="form-input" placeholder="City, State" />
                  </label>
                </div>
              </div>

              {/* Section 3: Trading & Valuation Fundamentals */}
              <div style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brass)' }}>3. Fundamentals & Multiples</h4>
                
                <div className="form-row">
                  <label className="form-label">
                    Lot Size *
                    <input type="number" value={editForm.lotSize} onChange={(e) => setEditForm({ ...editForm, lotSize: e.target.value })} required className="form-input" />
                  </label>
                  <label className="form-label">
                    Face Value (₹)
                    <input type="number" step="0.01" value={editForm.faceValue} onChange={(e) => setEditForm({ ...editForm, faceValue: e.target.value })} className="form-input" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Market Cap (₹ Cr)
                    <input type="number" step="any" value={editForm.marketCap} onChange={(e) => setEditForm({ ...editForm, marketCap: e.target.value })} className="form-input" placeholder="e.g. 41250" />
                  </label>
                  <label className="form-label">
                    P/E Ratio
                    <input type="number" step="0.1" value={editForm.peRatio} onChange={(e) => setEditForm({ ...editForm, peRatio: e.target.value })} className="form-input" placeholder="e.g. 28.4" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    P/B Ratio
                    <input type="number" step="0.01" value={editForm.pbRatio} onChange={(e) => setEditForm({ ...editForm, pbRatio: e.target.value })} className="form-input" placeholder="e.g. 3.65" />
                  </label>
                  <label className="form-label">
                    Return on Equity (ROE %)
                    <input type="number" step="0.1" value={editForm.roe} onChange={(e) => setEditForm({ ...editForm, roe: e.target.value })} className="form-input" placeholder="e.g. 18.2" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Book Value (₹)
                    <input type="number" step="0.01" value={editForm.bookValue} onChange={(e) => setEditForm({ ...editForm, bookValue: e.target.value })} className="form-input" placeholder="e.g. 84.50" />
                  </label>
                  <label className="form-label">
                    Outstanding Shares
                    <input type="number" value={editForm.outstandingShares} onChange={(e) => setEditForm({ ...editForm, outstandingShares: e.target.value })} className="form-input" placeholder="e.g. 405668530" />
                  </label>
                </div>
              </div>

              {editError && <p className="form-error">{editError}</p>}

              <div className="modal-actions" style={{ position: 'sticky', bottom: 0, background: 'var(--card-bg)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
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
