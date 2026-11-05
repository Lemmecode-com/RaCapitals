import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import ConfirmDialog from '../common/ConfirmDialog'

const TEMPLATE_EXCHANGE = [
  { category: 'Financial Institutions', percentage: '' },
  { category: 'Bodies Corporate', percentage: '' },
  { category: 'Individuals', percentage: '' },
  { category: 'Others', percentage: '' }
]

const TEMPLATE_PROMOTER = [
  { category: 'Promoter & Promoter Group', percentage: '' },
  { category: 'Domestic Institutions (DIIs)', percentage: '' },
  { category: 'Foreign Institutional (FIIs)', percentage: '' },
  { category: 'Public & Retail (HNIs)', percentage: '' },
  { category: 'Employee Trust (ESOP)', percentage: '' }
]

export default function AdminShareholdingManager({ companyId, companyName }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState('')
  const [error, setError] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    financialYear: '',
    breakdown: TEMPLATE_EXCHANGE
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Auto-hide flash
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3500)
    return () => clearTimeout(t)
  }, [flash])

  const loadShareholdings = async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/companies/${companyId}/shareholding`)
      setRecords(res.data?.records || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load shareholding records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShareholdings()
  }, [companyId])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRecord(null)
    setFormData({
      financialYear: '',
      breakdown: TEMPLATE_EXCHANGE.map((t) => ({ ...t }))
    })
    setFormError('')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (rec) => {
    setEditingRecord(rec)
    setFormData({
      financialYear: rec.financialYear || '',
      breakdown:
        Array.isArray(rec.breakdown) && rec.breakdown.length > 0
          ? rec.breakdown.map((b) => ({ category: b.category, percentage: b.percentage }))
          : TEMPLATE_EXCHANGE.map((t) => ({ ...t }))
    })
    setFormError('')
    setIsModalOpen(true)
  }

  // Category Row Handlers
  const handleCategoryChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.breakdown]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, breakdown: updated }
    })
  }

  const handleAddCategoryRow = () => {
    setFormData((prev) => ({
      ...prev,
      breakdown: [...prev.breakdown, { category: '', percentage: '' }]
    }))
  }

  const handleRemoveCategoryRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      breakdown: prev.breakdown.filter((_, i) => i !== index)
    }))
  }

  const handleApplyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      breakdown: template.map((t) => ({ ...t }))
    }))
  }

  // Calculated Live Total
  const currentTotal = formData.breakdown.reduce((sum, item) => {
    const val = parseFloat(item.percentage)
    return sum + (Number.isNaN(val) ? 0 : val)
  }, 0)

  // Submit Save
  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')

    const cleanFY = formData.financialYear.trim().toUpperCase()
    if (!cleanFY) {
      setFormError('Financial Year (e.g. FY26) is required.')
      return
    }

    if (!formData.breakdown || formData.breakdown.length === 0) {
      setFormError('Please add at least one shareholder category.')
      return
    }

    for (let i = 0; i < formData.breakdown.length; i++) {
      const b = formData.breakdown[i]
      if (!b.category || !b.category.trim()) {
        setFormError(`Row ${i + 1}: Category name is required.`)
        return
      }
      const val = parseFloat(b.percentage)
      if (b.percentage === '' || Number.isNaN(val) || val < 0) {
        setFormError(`Row ${i + 1} (${b.category}): Valid non-negative percentage is required.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        financialYear: cleanFY,
        promoterPledgedPercentage: 0,
        breakdown: formData.breakdown.map((b) => ({
          category: b.category.trim(),
          percentage: parseFloat(b.percentage)
        }))
      }

      await api.post(`/companies/${companyId}/shareholding`, payload)
      setFlash(`Shareholding pattern for ${cleanFY} saved successfully.`)
      setIsModalOpen(false)
      loadShareholdings()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save shareholding pattern.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.delete(`/admin/shareholding/${deleteTarget._id}`)
      setFlash(`Shareholding record for ${deleteTarget.financialYear} deleted successfully.`)
      setDeleteTarget(null)
      loadShareholdings()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete record.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="dashboard-content-card" style={{ marginBottom: '1.25rem' }}>
      {/* Header */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-sans, system-ui, sans-serif)', fontSize: '0.92rem', fontWeight: 600, color: 'var(--page-text)' }}>
            Shareholding Pattern & Cap Table{' '}
            <span className="muted" style={{ fontWeight: 'normal', fontSize: '0.82rem' }}>
              ({records.length} {records.length === 1 ? 'period' : 'periods'})
            </span>
          </h3>
          <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem' }}>
            Manage historical ownership distribution across financial institutions, corporates, and public investors.
          </p>
        </div>

        <button type="button" className="secondary-btn" onClick={handleOpenCreate} style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}>
          + Add Shareholding Period
        </button>
      </div>

      {flash && <div className="flash" style={{ margin: '0.75rem 1.25rem 0' }}>{flash}</div>}
      {error && <div className="flash" style={{ margin: '0.75rem 1.25rem 0', borderColor: 'var(--rust)', color: 'var(--error-fg)' }}>{error}</div>}

      {/* Body Table */}
      <div className="card-body" style={{ padding: 0 }}>
        {loading ? (
          <p className="muted" style={{ padding: '1.25rem', margin: 0, fontSize: '0.85rem' }}>
            Loading shareholding records…
          </p>
        ) : records.length === 0 ? (
          <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
            <p className="muted" style={{ margin: '0 0 0.75rem 0', fontSize: '0.88rem' }}>
              No shareholding pattern records added yet for {companyName}.
            </p>
            <button type="button" className="secondary-btn" onClick={handleOpenCreate}>
              + Add First Financial Year
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  <th style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', width: '130px' }}>
                    Period
                  </th>
                  <th style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                    Equity Breakdown
                  </th>
                  <th style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', width: '110px', textAlign: 'right' }}>
                    Total %
                  </th>
                  <th style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', width: '130px', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                      <span
                        className="mono"
                        style={{
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          color: 'var(--page-text)',
                          background: 'var(--surface-2)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {rec.periodLabel || rec.financialYear}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                      {/* Visual Stacked Progress Bar */}
                      <div
                        style={{
                          display: 'flex',
                          height: '6px',
                          borderRadius: '999px',
                          overflow: 'hidden',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          marginBottom: '0.45rem',
                          maxWidth: '460px'
                        }}
                      >
                        {(rec.breakdown || []).map((b, bIdx) => (
                          <div
                            key={bIdx}
                            title={`${b.category}: ${b.percentage}%`}
                            style={{
                              width: `${Math.max(0, Math.min(100, Number(b.percentage) || 0))}%`,
                              backgroundColor: b.color || '#3B82F6'
                            }}
                          />
                        ))}
                      </div>

                      {/* Category Breakdown Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                        {(rec.breakdown || []).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: b.color || '#3B82F6', flexShrink: 0 }} />
                            <span style={{ color: 'var(--page-text)', opacity: 0.85 }}>{b.category}:</span>
                            <strong className="mono" style={{ color: 'var(--page-text)', fontWeight: 600 }}>{Number(b.percentage).toFixed(2)}%</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      {Math.abs(Number(rec.totalPercentage) - 100) < 0.05 ? (
                        <span className="mono" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#166534' }}>
                          {Number(rec.totalPercentage || 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span
                          className="mono"
                          title="Total is not 100%"
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#854d0e',
                            background: '#fef9c3',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            border: '1px solid #fde047',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {Number(rec.totalPercentage || 0).toFixed(2)}% ⚠️
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div className="actions-cell" style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => handleOpenEdit(rec)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="row-action-btn delete-btn"
                          onClick={() => setDeleteTarget(rec)}
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
        )}
      </div>

      {/* Add / Edit Shareholding Modal */}
      {isModalOpen &&
        createPortal(
          <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div
              className="modal modal-wide"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    {editingRecord ? `Edit Shareholding (${editingRecord.financialYear})` : 'Add Shareholding Pattern'}
                  </h2>
                  <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem' }}>
                    {companyName}
                  </p>
                </div>
                <button className="modal-close-btn" type="button" onClick={() => setIsModalOpen(false)}>
                  &times;
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave}>
                {formError && (
                  <div className="flash" style={{ marginBottom: '1rem', borderColor: 'var(--rust)', color: 'var(--error-fg)' }}>
                    {formError}
                  </div>
                )}

                {/* Section 1: Period */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Financial Year *
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. FY26, FY25, FY24"
                      value={formData.financialYear}
                      onChange={(e) => setFormData({ ...formData, financialYear: e.target.value.toUpperCase() })}
                      required
                    />
                    <span className="muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                      Format: FY26, FY25, etc.
                    </span>
                  </label>
                </div>

                {/* Section 2: Categories Builder */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Shareholder Categories & Percentages *</div>
                      <div className="muted" style={{ fontSize: '0.78rem' }}>Enter percentage shareholding for each class.</div>
                    </div>

                    {/* Template Quick Fills */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => handleApplyTemplate(TEMPLATE_EXCHANGE)}
                      >
                        Reset to 4 Standard Categories
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => handleApplyTemplate(TEMPLATE_PROMOTER)}
                      >
                        Promoter / Institutional Template
                      </button>
                    </div>
                  </div>

                  {/* Rows with robust CSS Grid layout preventing overlap */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    {formData.breakdown.map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '22px 1fr 115px 34px',
                          gap: '0.65rem',
                          alignItems: 'center',
                          background: 'var(--surface-2)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <span className="muted mono" style={{ fontSize: '0.78rem', textAlign: 'center' }}>
                          #{idx + 1}
                        </span>

                        <input
                          type="text"
                          className="form-input"
                          style={{ margin: 0, width: '100%' }}
                          placeholder="Category Name (e.g. Financial Institutions)"
                          value={row.category}
                          onChange={(e) => handleCategoryChange(idx, 'category', e.target.value)}
                          required
                        />

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="form-input"
                            style={{ margin: 0, paddingRight: '1.6rem', textAlign: 'right', width: '100%' }}
                            placeholder="0.00"
                            value={row.percentage}
                            onChange={(e) => handleCategoryChange(idx, 'percentage', e.target.value)}
                            required
                          />
                          <span style={{ position: 'absolute', right: '0.5rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--muted)', pointerEvents: 'none' }}>
                            %
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-outline danger"
                          style={{
                            padding: 0,
                            width: '32px',
                            height: '34px',
                            fontSize: '1rem',
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px'
                          }}
                          disabled={formData.breakdown.length <= 1}
                          onClick={() => handleRemoveCategoryRow(idx)}
                          title="Remove row"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      onClick={handleAddCategoryRow}
                    >
                      + Add Category Row
                    </button>

                    {/* Live Total Indicator */}
                    <div
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        background: Math.abs(currentTotal - 100) < 0.05 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        border: Math.abs(currentTotal - 100) < 0.05 ? '1px solid #86efac' : '1px solid #fde047',
                        color: Math.abs(currentTotal - 100) < 0.05 ? '#15803d' : '#854d0e',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Total: <span className="mono">{currentTotal.toFixed(2)}%</span>
                      {Math.abs(currentTotal - 100) >= 0.05 && (
                        <span style={{ fontSize: '0.78rem', fontWeight: 'normal', marginLeft: '0.4rem' }}>
                          (Standard is 100%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={submitting}>
                    {submitting ? 'Saving…' : editingRecord ? 'Update Shareholding' : 'Save Shareholding'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Shareholding Record"
          message={`Are you sure you want to delete the shareholding pattern for ${deleteTarget.financialYear}? This will remove it from the public profile.`}
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete Record'}
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

