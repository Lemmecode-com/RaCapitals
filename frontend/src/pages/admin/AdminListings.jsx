import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { apiBaseWithoutApi, formatINR } from '../../utils/format'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import InfoTooltip from '../../components/common/InfoTooltip'
import Pagination from '../../components/admin/Pagination'

const EMPTY_FORM = {
  name: '',
  sector: '',
  description: '',
  lotSize: '',
  faceValue: '',
  isin: '',
  drhpFiled: false,
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
      description: company.description || '',
      lotSize: company.lotSize ?? '',
      faceValue: company.faceValue ?? '',
      isin: company.isin || '',
      drhpFiled: Boolean(company.drhpFiled),
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
        description: form.description.trim(),
        lotSize: form.lotSize === '' ? undefined : Number(form.lotSize),
        faceValue: form.faceValue === '' ? undefined : Number(form.faceValue),
        isin: form.isin.trim(),
        drhpFiled: Boolean(form.drhpFiled),
      }
      if (editing) {
        await api.put(`/companies/${editing._id}`, payload)
        setFlash(`Updated "${payload.name}"`)
      } else {
        await api.post('/companies', payload)
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

  const renderActionsForCard = (c) => (
    <div className="actions-cell">
      <Link to={`/admin/companies/${c._id}`} className="row-action-btn">View</Link>
      <button type="button" className="row-action-btn" onClick={() => openEdit(c)}>Edit</button>
      <button type="button" className="row-action-btn" onClick={() => openPriceModal(c)}>Update Price</button>
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
      <div className="admin-page-header">
        <div>
          <h1>Listings</h1>
        </div>
        <button type="button" className="primary-btn" onClick={openCreate}>+ Add New Listing</button>
      </div>

      {flash && <div className="flash">{flash}</div>}

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
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{c.name}</td>
                    <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>{c.sector || '—'}</td>
                    <td className="mono" style={{ padding: '0.6rem 0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {c.latestPrice == null ? (
                        <button type="button" className="set-price-link" onClick={() => openPriceModal(c)}>Set price</button>
                      ) : (
                        formatINR(c.latestPrice)
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={closeForm}>&times;</button>
            <h2>{editing ? 'Edit Listing' : 'Add New Listing'}</h2>
            <form onSubmit={handleSubmitCompany} className="admin-form">
              <label className="form-label">
                Name *
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
                {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
              </label>
              <label className="form-label">
                Sector *
                <input type="text" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} list="sector-list" className="form-input" />
                {fieldErrors.sector && <span className="form-error">{fieldErrors.sector}</span>}
                <datalist id="sector-list">
                  {SECTORS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </label>
              <label className="form-label">
                Description (optional)
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" rows={4} />
              </label>
              <div className="form-row">
                <label className="form-label">
                  <InfoTooltip text="Minimum number of shares a buyer must purchase in one transaction.">
                    Lot Size *
                  </InfoTooltip>
                  <input type="number" value={form.lotSize} onChange={(e) => setForm({ ...form, lotSize: e.target.value })} className="form-input" />
                  {fieldErrors.lotSize && <span className="form-error">{fieldErrors.lotSize}</span>}
                </label>
                <label className="form-label">
                  <InfoTooltip text="The share's original nominal value set at incorporation — unrelated to its current market price.">
                    Face Value (optional)
                  </InfoTooltip>
                  <input type="number" step="0.01" value={form.faceValue} onChange={(e) => setForm({ ...form, faceValue: e.target.value })} className="form-input" />
                </label>
              </div>
              <label className="form-label">
                <InfoTooltip text="International Securities Identification Number — a unique code for the share. Leave blank if not yet assigned.">
                  ISIN (optional)
                </InfoTooltip>
                <input type="text" value={form.isin} onChange={(e) => setForm({ ...form, isin: e.target.value })} className="form-input" />
              </label>
              <label className="form-label" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.drhpFiled}
                  onChange={(e) => setForm({ ...form, drhpFiled: e.target.checked })}
                />
                <span>DRHP Filed</span>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
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
              <label className="form-label">
                New Price (₹) *
                <input type="number" step="0.01" min="0" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} required className="form-input" />
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
    </div>
  )
}

export default AdminListings