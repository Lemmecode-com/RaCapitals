import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import ConfirmDialog from '../common/ConfirmDialog'

const INITIAL_FORM = {
  financialYear: '',
  periodType: 'annual',
  quarter: '',
  isEstimate: false,
  isAudited: true,
  isPublished: true,
  // P&L
  revenue: '',
  otherIncome: '',
  operatingExpenses: '',
  depreciation: '',
  financeCosts: '',
  tax: '',
  pat: '',
  eps: '',
  netWorth: '',
  // Balance Sheet
  totalAssets: '',
  totalLiabilities: '',
  totalEquity: '',
  totalDebt: '',
  // Cash Flow
  operatingCashFlow: '',
  investingCashFlow: '',
  financingCashFlow: '',
  netCashFlow: '',
  notes: ''
}

export default function AdminFinancialsManager({ companyId, companyName }) {
  const [statements, setStatements] = useState([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState('')
  const [error, setError] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pnl') // 'pnl' | 'balanceSheet' | 'cashFlow'
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 3500)
    return () => clearTimeout(t)
  }, [flash])

  const loadFinancials = async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/financials/company/${companyId}?period=all`)
      setStatements(res.data?.statements || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load financial statements')
      setStatements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinancials()
  }, [companyId])

  // Open Create
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData(INITIAL_FORM)
    setActiveTab('pnl')
    setFormError('')
    setIsModalOpen(true)
  }

  // Open Edit
  const handleOpenEdit = (rec) => {
    setEditingId(rec._id)
    setFormData({
      financialYear: rec.financialYear || '',
      periodType: rec.periodType || 'annual',
      quarter: rec.quarter || '',
      isEstimate: Boolean(rec.isEstimate),
      isAudited: rec.isAudited !== undefined ? Boolean(rec.isAudited) : true,
      isPublished: rec.isPublished !== undefined ? Boolean(rec.isPublished) : true,
      revenue: rec.revenue ?? '',
      otherIncome: rec.otherIncome ?? '',
      operatingExpenses: rec.operatingExpenses ?? '',
      depreciation: rec.depreciation ?? '',
      financeCosts: rec.financeCosts ?? '',
      tax: rec.tax ?? '',
      pat: rec.pat ?? '',
      eps: rec.eps ?? '',
      netWorth: rec.netWorth ?? '',
      totalAssets: rec.totalAssets ?? '',
      totalLiabilities: rec.totalLiabilities ?? '',
      totalEquity: rec.totalEquity ?? '',
      totalDebt: rec.totalDebt ?? '',
      operatingCashFlow: rec.operatingCashFlow ?? '',
      investingCashFlow: rec.investingCashFlow ?? '',
      financingCashFlow: rec.financingCashFlow ?? '',
      netCashFlow: rec.netCashFlow ?? '',
      notes: rec.notes || ''
    })
    setActiveTab('pnl')
    setFormError('')
    setIsModalOpen(true)
  }

  // Toggle publish
  const handleTogglePublish = async (rec) => {
    try {
      const res = await api.patch(`/financials/${rec._id}/publish`, {
        isPublished: !rec.isPublished
      })
      setFlash(res.data?.message || 'Status updated')
      loadFinancials()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update publish status')
    }
  }

  // Handle Field Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Submit Modal
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.financialYear.trim()) {
      setFormError('Financial year is required (e.g. FY2024-25 or FY25).')
      return
    }

    // Check at least one financial metric is entered
    const metricsToCheck = [
      'revenue', 'otherIncome', 'operatingExpenses', 'depreciation', 'financeCosts',
      'tax', 'pat', 'eps', 'netWorth', 'totalAssets', 'totalLiabilities',
      'totalEquity', 'totalDebt', 'operatingCashFlow', 'investingCashFlow',
      'financingCashFlow', 'netCashFlow'
    ]

    const hasAnyMetric = metricsToCheck.some(
      (k) => formData[k] !== '' && formData[k] !== null && !isNaN(Number(formData[k]))
    )

    if (!hasAnyMetric) {
      setFormError('Please enter at least one financial value across P&L, Balance Sheet, or Cash Flow.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/financials/company/${companyId}`, formData)
      setFlash(editingId ? 'Financial statement updated successfully' : 'Financial statement created successfully')
      setIsModalOpen(false)
      loadFinancials()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save financial statement')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.delete(`/financials/${deleteTarget._id}`)
      setFlash('Financial statement deleted successfully')
      setDeleteTarget(null)
      loadFinancials()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete statement')
    } finally {
      setIsDeleting(false)
    }
  }

  // Helpers to inspect completeness
  const hasPnl = (s) => (s.revenue !== undefined && s.revenue !== null && s.revenue !== 0) || (s.pat !== undefined && s.pat !== null && s.pat !== 0)
  const hasBs = (s) => (s.totalAssets !== null && s.totalAssets !== undefined && s.totalAssets !== 0) || (s.totalLiabilities !== null && s.totalLiabilities !== undefined)
  const hasCf = (s) => s.operatingCashFlow !== null && s.operatingCashFlow !== undefined

  return (
    <div className="admin-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>
            Financial Statements Management
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
            Manage P&amp;L, Balance Sheet, and Cash Flow statements for <strong>{companyName}</strong>.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={handleOpenCreate}
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span>+ Add Financial Statement</span>
        </button>
      </div>

      {flash && <div className="form-success" style={{ marginBottom: '1rem' }}>{flash}</div>}
      {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Statements Table */}
      {loading ? (
        <p className="muted" style={{ padding: '1.5rem 0', textAlign: 'center' }}>Loading financial statements...</p>
      ) : statements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '1px dashed #e5e7eb', borderRadius: '8px', color: '#6b7280' }}>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>No financial statements have been recorded for this company yet.</p>
          <button type="button" className="secondary-btn" onClick={handleOpenCreate} style={{ fontSize: '0.82rem' }}>
            Add First Statement
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151' }}>Financial Year</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151' }}>Period</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151' }}>Profit &amp; Loss</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151' }}>Balance Sheet</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151' }}>Cash Flow</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((rec) => {
                const pnlOk = hasPnl(rec)
                const bsOk = hasBs(rec)
                const cfOk = hasCf(rec)

                return (
                  <tr key={rec._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#111827' }}>
                      {rec.financialYear}
                      {rec.isEstimate && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Est.</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize', color: '#4b5563' }}>
                      {rec.periodType === 'quarterly' ? `${rec.quarter || ''} Quarterly` : 'Annual'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {pnlOk ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#166534', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          ✓ Available (Rev: ₹{rec.revenue} Cr)
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          ⚠ Missing P&amp;L
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {bsOk ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#166534', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          ✓ Available (Assets: ₹{rec.totalAssets} Cr)
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          – Not filled
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {cfOk ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#166534', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          ✓ Available (Ops: ₹{rec.operatingCashFlow} Cr)
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          – Not filled
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(rec)}
                        title="Click to toggle publish status"
                        style={{
                          background: rec.isPublished ? '#dcfce7' : '#f3f4f6',
                          color: rec.isPublished ? '#166534' : '#6b7280',
                          border: `1px solid ${rec.isPublished ? '#86efac' : '#d1d5db'}`,
                          borderRadius: '999px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {rec.isPublished ? '● Published' : '○ Draft'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleOpenEdit(rec)}
                        style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => setDeleteTarget(rec)}
                        style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Statement Modal */}
      {isModalOpen && createPortal(
        <div className="admin-modal-portal modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '780px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              {editingId ? `Edit Financial Statement — ${formData.financialYear}` : `Add Financial Statement — ${companyName}`}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 1.25rem 0' }}>
              Enter monetary values in ₹ Crore (Cr) for standardisation.
            </p>

            <form onSubmit={handleSubmit} className="admin-form">
              {formError && <p className="form-error" style={{ marginBottom: '1rem' }}>{formError}</p>}

              {/* Top metadata fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Financial Year *
                  <input
                    type="text"
                    name="financialYear"
                    value={formData.financialYear}
                    onChange={handleChange}
                    placeholder="e.g. FY2024-25 or FY25"
                    required
                    className="form-input"
                  />
                </label>

                <label className="form-label" style={{ margin: 0 }}>
                  Period Type
                  <select name="periodType" value={formData.periodType} onChange={handleChange} className="form-input">
                    <option value="annual">Annual</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </label>

                {formData.periodType === 'quarterly' && (
                  <label className="form-label" style={{ margin: 0 }}>
                    Quarter
                    <select name="quarter" value={formData.quarter} onChange={handleChange} className="form-input">
                      <option value="">Select quarter</option>
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </label>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="isAudited" checked={formData.isAudited} onChange={handleChange} />
                    Audited
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
                    Published
                  </label>
                </div>
              </div>

              {/* Statement Type Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('pnl')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === 'pnl' ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === 'pnl' ? '#2563eb' : '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📈 Profit &amp; Loss (P&amp;L)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('balanceSheet')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === 'balanceSheet' ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === 'balanceSheet' ? '#2563eb' : '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ⚖️ Balance Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cashFlow')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === 'cashFlow' ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === 'cashFlow' ? '#2563eb' : '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  💵 Cash Flow Statement
                </button>
              </div>

              {/* Tab 1: P&L Fields */}
              {activeTab === 'pnl' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <label className="form-label">
                    Revenue from Operations (₹ Cr)
                    <input type="number" step="0.01" name="revenue" value={formData.revenue} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Other Income (₹ Cr)
                    <input type="number" step="0.01" name="otherIncome" value={formData.otherIncome} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Operating Expenses (₹ Cr)
                    <input type="number" step="0.01" name="operatingExpenses" value={formData.operatingExpenses} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Depreciation &amp; Amortization (₹ Cr)
                    <input type="number" step="0.01" name="depreciation" value={formData.depreciation} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Finance Costs / Interest (₹ Cr)
                    <input type="number" step="0.01" name="financeCosts" value={formData.financeCosts} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Tax Expense (₹ Cr)
                    <input type="number" step="0.01" name="tax" value={formData.tax} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Profit After Tax (PAT / Net Profit) (₹ Cr)
                    <input type="number" step="0.01" name="pat" value={formData.pat} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Diluted EPS (₹)
                    <input type="number" step="0.01" name="eps" value={formData.eps} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Total Shareholder Net Worth (₹ Cr)
                    <input type="number" step="0.01" name="netWorth" value={formData.netWorth} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                </div>
              )}

              {/* Tab 2: Balance Sheet Fields */}
              {activeTab === 'balanceSheet' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <label className="form-label">
                    Total Assets (₹ Cr)
                    <input type="number" step="0.01" name="totalAssets" value={formData.totalAssets} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Total Liabilities (₹ Cr)
                    <input type="number" step="0.01" name="totalLiabilities" value={formData.totalLiabilities} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Total Equity / Net Worth (₹ Cr)
                    <input type="number" step="0.01" name="totalEquity" value={formData.totalEquity} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Total Debt / Borrowings (₹ Cr)
                    <input type="number" step="0.01" name="totalDebt" value={formData.totalDebt} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                </div>
              )}

              {/* Tab 3: Cash Flow Fields */}
              {activeTab === 'cashFlow' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <label className="form-label">
                    Operating Cash Flow (CFO) (₹ Cr)
                    <input type="number" step="0.01" name="operatingCashFlow" value={formData.operatingCashFlow} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Investing Cash Flow (CFI) (₹ Cr)
                    <input type="number" step="0.01" name="investingCashFlow" value={formData.investingCashFlow} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Financing Cash Flow (CFF) (₹ Cr)
                    <input type="number" step="0.01" name="financingCashFlow" value={formData.financingCashFlow} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                  <label className="form-label">
                    Net Cash Flow (₹ Cr)
                    <input type="number" step="0.01" name="netCashFlow" value={formData.netCashFlow} onChange={handleChange} className="form-input" placeholder="0.00" />
                  </label>
                </div>
              )}

              {/* Notes */}
              <label className="form-label" style={{ marginTop: '0.85rem' }}>
                Admin Notes (Internal / Auditing)
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="form-input"
                  placeholder="Optional notes regarding auditor comments, restatements, or accounting standards..."
                />
              </label>

              {/* Actions */}
              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Statement' : 'Save Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Financial Statement"
          message={`Are you sure you want to delete the financial record for ${deleteTarget.financialYear} (${deleteTarget.periodType})? This action cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

