import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { apiBaseWithoutApi, formatINR, formatShortDate } from '../../utils/format'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import InfoTooltip from '../../components/common/InfoTooltip'
import Pagination from '../../components/admin/Pagination'
import BulkImportModal from '../../components/admin/BulkImportModal'

const EMPTY_FORM = {
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
  drhpFiled: false,
  price: '',
}

const SECTORS = ['Fintech', 'Energy', 'Logistics', 'Consumer', 'Healthcare']

const AdminListings = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [priceModal, setPriceModal] = useState(null)
  const [priceValue, setPriceValue] = useState('')
  const [priceError, setPriceError] = useState('')
  const [flash, setFlash] = useState('')
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [reactivateTarget, setReactivateTarget] = useState(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchCompanies = async (sectorOverride, searchOverride) => {
    const activeSector = sectorOverride !== undefined ? sectorOverride : sector
    const activeSearch = searchOverride !== undefined ? searchOverride : search
    setLoading(true)
    try {
      const params = {}
      if (activeSector && activeSector !== 'All') params.sector = activeSector
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim()
      const res = await api.get('/companies/admin/all', { params })
      setCompanies(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    const trimmed = search.trim()
    const handler = setTimeout(() => fetchCompanies(sector, trimmed || undefined), 500)
    return () => clearTimeout(handler)
  }, [search])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (company) => {
    setEditing(company)
    setForm({
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
      drhpFiled: Boolean(company.drhpFiled),
      price: company.price ?? '',
    })
    setFormError('')
    setFieldErrors({})
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFieldErrors({})
  }

  const handleSubmitCompany = async (e) => {
    e.preventDefault()
    setFormError('')

    const errors = {}
    
    // Name validation
    if (!form.name.trim()) {
      errors.name = 'This field is required'
    } else if (form.name.trim().length > 100) {
      errors.name = 'Company name cannot exceed 100 characters'
    } else if (!/^[a-zA-Z0-9\s]+$/.test(form.name)) {
      errors.name = 'Company name cannot contain special characters'
    }

    // Sector validation
    if (!form.sector.trim()) {
      errors.sector = 'This field is required'
    }

    // Lot Size validation
    if (!form.lotSize) {
      errors.lotSize = 'This field is required'
    } else if (Number(form.lotSize) <= 0) {
      errors.lotSize = 'Lot size must be a positive number'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const payload = {
        name: form.name.trim(),
        sector: form.sector.trim(),
        industry: form.industry ? form.industry.trim() : '',
        cin: form.cin ? form.cin.trim() : '',
        registeredOffice: form.registeredOffice ? form.registeredOffice.trim() : '',
        foundedYear: form.foundedYear === '' ? null : Number(form.foundedYear),
        description: form.description.trim(),
        lotSize: form.lotSize === '' ? undefined : Number(form.lotSize),
        faceValue: form.faceValue === '' ? null : Number(form.faceValue),
        isin: form.isin ? form.isin.trim() : '',
        marketCap: form.marketCap === '' ? null : Number(form.marketCap),
        peRatio: form.peRatio === '' ? null : Number(form.peRatio),
        pbRatio: form.pbRatio === '' ? null : Number(form.pbRatio),
        roe: form.roe === '' ? null : Number(form.roe),
        bookValue: form.bookValue === '' ? null : Number(form.bookValue),
        outstandingShares: form.outstandingShares === '' ? null : Number(form.outstandingShares),
        drhpFiled: Boolean(form.drhpFiled),
      }
      if (editing) {
        await api.put(`/companies/${editing._id}`, payload)
        if (form.price !== '' && Number(form.price) > 0 && Number(form.price) !== Number(editing.price)) {
          try {
            await api.post(`/prices/${editing._id}`, { price: Number(form.price) })
          } catch (e) {
            // non-blocking price update
          }
        }
        setFlash(`Updated "${payload.name}"`)
      } else {
        const createRes = await api.post('/companies', payload)
        if (form.price !== '' && Number(form.price) > 0 && createRes?.data?._id) {
          try {
            await api.post(`/prices/${createRes.data._id}`, { price: Number(form.price) })
          } catch (e) {
            // non-blocking price update
          }
        }
        setFlash(`Created "${payload.name}"`)
      }
      closeForm()
      await fetchCompanies()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Save failed')
    }
  }

  const toggleActive = async (company) => {
    if (company.isActive) {
      setDeactivateTarget(company)
    } else {
      setReactivateTarget(company)
    }
  }

  const confirmReactivate = async () => {
    if (!reactivateTarget) return
    const target = reactivateTarget
    setReactivateTarget(null)
    try {
      await api.patch(`/companies/${target._id}/activate`)
      setFlash(`Reactivated "${target.name}"`)
      await fetchCompanies()
    } catch (err) {
      setFlash(err?.response?.data?.message || 'Action failed')
    }
  }

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return
    const target = deactivateTarget
    setDeactivateTarget(null)
    try {
      await api.patch(`/companies/${target._id}/deactivate`)
      setFlash(`Deactivated "${target.name}"`)
      await fetchCompanies()
    } catch (err) {
      setFlash(err?.response?.data?.message || 'Action failed')
    }
  }

  const openPriceModal = (company) => {
    setPriceModal(company)
    setPriceValue('')
    setPriceError('')
  }

  const closePriceModal = () => {
    setPriceModal(null)
    setPriceValue('')
    setPriceError('')
  }

  const handleSubmitPrice = async (e) => {
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
      await api.post(`/prices/${priceModal._id}`, { price: num })
      setFlash(`Price updated for "${priceModal.name}"`)
      closePriceModal()
      await fetchCompanies()
    } catch (err) {
      setPriceError(err?.response?.data?.message || 'Price update failed')
    }
  }

  const handleLogoUpload = async (company, file) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('logo', file)
      await api.post(`/companies/${company._id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFlash(`Logo updated for "${company.name}"`)
      await fetchCompanies()
    } catch (err) {
      setFlash(err?.response?.data?.message || 'Logo upload failed')
    }
  }

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3000)
    return () => clearTimeout(t)
  }, [flash])

  const handleSetHeroFeatured = async (company) => {
    try {
      await api.patch(`/companies/${company._id}/featured`)
      setFlash(`Set "${company.name}" as Homepage Hero Stock`)
      await fetchCompanies()
    } catch (err) {
      setFlash(err?.response?.data?.message || 'Failed to update hero stock')
    }
  }

  const renderActionsForCard = (c) => (
    <div className="actions-cell">
      <Link to={`/admin/companies/${c._id}`} className="row-action-btn">View</Link>
      <button type="button" className="row-action-btn" onClick={() => openEdit(c)}>Edit</button>
      <button type="button" className="row-action-btn" onClick={() => openPriceModal(c)}>Update Price</button>
      <button
        type="button"
        className="row-action-btn"
        onClick={() => handleSetHeroFeatured(c)}
        title="Set as Homepage Hero Stock"
        style={c.isHeroFeatured ? { color: 'var(--brass, #2563eb)', fontWeight: 600 } : {}}
      >
        {c.isHeroFeatured ? '⭐ Hero Stock' : 'Set as Hero'}
      </button>
      <button type="button" className="row-action-btn" onClick={() => toggleActive(c)}>
        {c.isActive ? 'Deactivate' : 'Activate'}
      </button>
      <label className="row-action-btn upload-btn-label">
        {c.logoUrl ? 'Replace Logo' : 'Upload Logo'}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) handleLogoUpload(c, file)
          }}
        />
      </label>
    </div>
  )

  // Pagination logic
  const totalPages = Math.ceil(companies.length / itemsPerPage)
  const paginatedCompanies = companies.slice(
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
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Listings</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setImportModalOpen(true)}
          >
            Bulk Import
          </button>
          <button type="button" className="primary-btn" onClick={openCreate}>+ Add New Listing</button>
        </div>
      </div>

      {flash && <div className="flash">{flash}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface-2, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⭐</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Homepage Hero Featured Stock:</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--brass, #2563eb)', fontWeight: 600 }}>
              {companies.find(c => c.isHeroFeatured)?.name || 'Goodluck Defence and Aerospace Ltd (Default)'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: '240px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={companies.find(c => c.isHeroFeatured)?._id || ''}
            onChange={(e) => {
              const chosen = companies.find(c => c._id === e.target.value)
              if (chosen) handleSetHeroFeatured(chosen)
            }}
          >
            <option value="" disabled>Change featured stock…</option>
            {companies.filter(c => c.isActive).map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="admin-controls" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') fetchCompanies() }}
          className="search-input"
        />
        <div className="sector-chips">
          {['All', ...SECTORS].map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${sector === s ? 'chip-active' : ''}`}
              onClick={() => { setSector(s); fetchCompanies(s, search) }}
            >
              {s}
            </button>
          ))}
        </div>
        <button type="button" className="secondary-btn" onClick={() => fetchCompanies()}>Refresh</button>
      </section>

      {loading ? (
        <p className="muted">Loading listings…</p>
      ) : companies.length === 0 ? (
        <p className="muted">No companies found.</p>
      ) : (
        <div className="dashboard-content-card">
          <div className="card-header">
            <h3>Company Listings</h3>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', width: '48px' }}>Logo</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Name</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Sector</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Latest Price</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCompanies.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <div className="dashboard-hero-logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }}>
                        {c.logoUrl ? (
                          <img src={`${apiBaseWithoutApi()}${c.logoUrl}`} alt={`${c.name} logo`} />
                        ) : (
                          <span className="logo-placeholder small" style={{ fontSize: '1rem' }}>{(c.name || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>{c.name}</span>
                        {c.isHeroFeatured && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(37, 99, 235, 0.12)',
                              color: '#2563eb',
                              fontWeight: 700,
                              border: '1px solid rgba(37, 99, 235, 0.3)'
                            }}
                            title="Currently featured on Homepage Hero"
                          >
                            ⭐ Hero
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>{c.sector || '—'}</td>
                    <td className="mono" style={{ padding: '0.6rem 0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {c.latestPrice == null ? (
                        <button type="button" className="set-price-link" onClick={() => openPriceModal(c)}>Set price</button>
                      ) : (
                        <button
                          type="button"
                          className="table-action-link"
                          onClick={() => openPriceModal(c)}
                          title="Click to update price"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            font: 'inherit',
                            color: 'var(--brass, #b08d57)',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          {formatINR(c.latestPrice)}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                        <span className={`status-badge ${c.isActive ? 'status-live' : 'status-off'}`} style={{ margin: 0 }}>
                          {c.isActive ? 'Live' : 'Deactivated'}
                        </span>
                        {c.drhpFiled && <span className="drhp-badge" style={{ margin: 0 }}>DRHP</span>}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                      {renderActionsForCard(c)}
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
      />

      {formOpen && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: '640px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={closeForm}>&times;</button>
            <h2>{editing ? `Edit Listing — ${editing.name}` : 'Add New Share Listing'}</h2>
            
            <form onSubmit={handleSubmitCompany} className="admin-form">
              {/* Section 1: Basic Info */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brass)' }}>1. Basic Listing Information</h4>
                
                <label className="form-label">
                  Company Name *
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" placeholder="e.g. Tata Technologies" />
                  {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
                </label>

                <div className="form-row">
                  <label className="form-label">
                    Sector *
                    <input type="text" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} list="sector-list" className="form-input" placeholder="e.g. IT, Consumer" />
                    {fieldErrors.sector && <span className="form-error">{fieldErrors.sector}</span>}
                    <datalist id="sector-list">
                      {SECTORS.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </label>
                  <label className="form-label">
                    Industry Sub-Segment
                    <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="form-input" placeholder="e.g. Engineering R&D Services" />
                  </label>
                </div>

                <label className="form-label">
                  Description (optional)
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" rows={3} placeholder="Brief summary of company business and background..." />
                </label>

                <label className="form-label" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                  <input
                    type="checkbox"
                    checked={form.drhpFiled}
                    onChange={(e) => setForm({ ...form, drhpFiled: e.target.checked })}
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
                    <input type="text" value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} className="form-input" placeholder="U72200PN..." />
                  </label>

                  <label className="form-label">
                    <InfoTooltip text="International Securities Identification Number — a unique code for the share.">
                      ISIN
                    </InfoTooltip>
                    <input type="text" value={form.isin} onChange={(e) => setForm({ ...form, isin: e.target.value })} className="form-input" placeholder="INE..." />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Founded Year
                    <input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} className="form-input" placeholder="e.g. 1994" />
                  </label>
                  <label className="form-label">
                    Registered Office (HQ)
                    <input type="text" value={form.registeredOffice} onChange={(e) => setForm({ ...form, registeredOffice: e.target.value })} className="form-input" placeholder="City, State" />
                  </label>
                </div>
              </div>

              {/* Section 3: Trading & Valuation Fundamentals */}
              <div style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brass)' }}>3. Fundamentals & Multiples</h4>
                
                <div className="form-row">
                  <label className="form-label">
                    Indicative Price (₹)
                    <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="form-input" placeholder="e.g. 1050" />
                  </label>
                  <label className="form-label">
                    Lot Size *
                    <input type="number" value={form.lotSize} onChange={(e) => setForm({ ...form, lotSize: e.target.value })} className="form-input" placeholder="e.g. 50" />
                    {fieldErrors.lotSize && <span className="form-error">{fieldErrors.lotSize}</span>}
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Face Value (₹)
                    <input type="number" step="0.01" value={form.faceValue} onChange={(e) => setForm({ ...form, faceValue: e.target.value })} className="form-input" placeholder="e.g. 2" />
                  </label>
                  <label className="form-label">
                    Total Shares Outstanding
                    <input type="number" value={form.outstandingShares} onChange={(e) => setForm({ ...form, outstandingShares: e.target.value })} className="form-input" placeholder="e.g. 405668530" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Market Cap (₹ Cr)
                    <input type="number" step="any" value={form.marketCap} onChange={(e) => setForm({ ...form, marketCap: e.target.value })} className="form-input" placeholder="e.g. 41250" />
                  </label>
                  <label className="form-label">
                    P/E Ratio
                    <input type="number" step="0.1" value={form.peRatio} onChange={(e) => setForm({ ...form, peRatio: e.target.value })} className="form-input" placeholder="e.g. 28.4" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    P/B Ratio
                    <input type="number" step="0.01" value={form.pbRatio} onChange={(e) => setForm({ ...form, pbRatio: e.target.value })} className="form-input" placeholder="e.g. 3.65" />
                  </label>
                  <label className="form-label">
                    Return on Equity (ROE %)
                    <input type="number" step="0.1" value={form.roe} onChange={(e) => setForm({ ...form, roe: e.target.value })} className="form-input" placeholder="e.g. 18.2" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    Book Value (₹)
                    <input type="number" step="0.01" value={form.bookValue} onChange={(e) => setForm({ ...form, bookValue: e.target.value })} className="form-input" placeholder="e.g. 84.50" />
                  </label>
                  <div />
                </div>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions" style={{ position: 'sticky', bottom: 0, background: 'var(--card-bg)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="secondary-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="primary-btn">{editing ? 'Save Changes' : 'Create Listing'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        title="Deactivate listing?"
        message={
          deactivateTarget
            ? `This will hide "${deactivateTarget.name}" from the public price list. You can reactivate it anytime.`
            : ''
        }
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(reactivateTarget)}
        title="Reactivate listing?"
        message={
          reactivateTarget
            ? `This will make "${reactivateTarget.name}" visible on the public price list again.`
            : ''
        }
        confirmLabel="Reactivate"
        cancelLabel="Cancel"
        variant="primary"
        onConfirm={confirmReactivate}
        onCancel={() => setReactivateTarget(null)}
      />

      {priceModal && createPortal(
        <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={closePriceModal}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={closePriceModal}>&times;</button>
            <h2>Update Price — {priceModal.name}</h2>
            <form onSubmit={handleSubmitPrice} className="admin-form">
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--paper-2, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)', fontSize: '0.85rem' }}>
                <div>Current Indicative Price: <strong>{priceModal.latestPrice != null ? formatINR(priceModal.latestPrice) : 'Not set'}</strong></div>
                {priceModal.latestPriceDate && (
                  <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Last recorded: {formatShortDate(priceModal.latestPriceDate)}
                  </div>
                )}
              </div>
              <label className="form-label">
                New Price (₹) *
                <input type="number" step="0.01" min="0" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} required className="form-input" placeholder="e.g. 1250" />
              </label>
              {priceError && <p className="form-error">{priceError}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closePriceModal}>Cancel</button>
                <button type="submit" className="primary-btn">Save Price</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <BulkImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={(count) => {
          setFlash(`Successfully imported ${count} listing(s)`)
          fetchCompanies()
        }}
      />
    </div>
  )
}

export default AdminListings