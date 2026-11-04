import { useState, useEffect } from 'react'
import api from '../../services/api'

const CompanyFinancialsTable = ({ companyId, companyName }) => {
  const [periodType, setPeriodType] = useState('annual') // 'annual' | 'quarterly'
  const [statements, setStatements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!companyId) return

    let isMounted = true
    const fetchFinancials = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/companies/${companyId}/financials?period=${periodType}`)
        if (isMounted) {
          setStatements(res.data.statements || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load financial statements.')
          setStatements([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFinancials()

    return () => {
      isMounted = false
    }
  }, [companyId, periodType])

  // Metric definitions for rendering rows
  const METRIC_ROWS = [
    { key: 'revenue', label: 'Revenue from Operations', format: 'cr', isGrowthKey: 'revenueYoY' },
    { key: 'otherIncome', label: 'Other Income', format: 'cr' },
    { key: 'totalRevenue', label: 'Total Revenue', format: 'cr', isBold: true },
    { key: 'operatingExpenses', label: 'Operating Expenses (Opex)', format: 'cr' },
    { key: 'ebitda', label: 'EBITDA (Operating Profit)', format: 'cr', isBold: true, isGrowthKey: 'ebitdaYoY' },
    { key: 'ebitdaMargin', label: 'EBITDA Margin (OPM)', format: 'percent' },
    { key: 'depreciation', label: 'Depreciation & Amortization', format: 'cr' },
    { key: 'financeCosts', label: 'Finance Costs (Interest)', format: 'cr' },
    { key: 'pbt', label: 'Profit Before Tax (PBT)', format: 'cr' },
    { key: 'tax', label: 'Tax Expense', format: 'cr' },
    { key: 'pat', label: 'Net Profit (PAT)', format: 'cr', isHighlight: true, isGrowthKey: 'patYoY' },
    { key: 'patMargin', label: 'PAT Margin', format: 'percent' },
    { key: 'eps', label: 'Diluted EPS (₹)', format: 'inr', isGrowthKey: 'epsYoY' },
    { key: 'netWorth', label: 'Shareholder Net Worth', format: 'cr', isBold: true, annualOnly: true }
  ]

  const formatCellValue = (val, formatType) => {
    if (val === null || val === undefined) return '—'
    const num = Number(val)
    if (isNaN(num)) return '—'

    switch (formatType) {
      case 'cr':
        return `₹ ${num.toLocaleString('en-IN')} Cr`
      case 'percent':
        return `${num.toFixed(1)}%`
      case 'inr':
        return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`
      default:
        return num.toLocaleString('en-IN')
    }
  }

  // Render YoY Growth indicator pill
  const renderGrowthBadge = (metric) => {
    if (!metric.isGrowthKey || statements.length < 2) return <span className="growth-badge growth-neutral">—</span>

    // Grab latest available statement's growth delta
    const latestStmt = statements[statements.length - 1]
    const delta = latestStmt?.growth?.[metric.isGrowthKey]

    if (delta === null || delta === undefined) {
      return <span className="growth-badge growth-neutral">—</span>
    }

    if (delta > 0) {
      return (
        <span className="growth-badge growth-positive">
          ↑ +{delta.toFixed(1)}%
        </span>
      )
    }

    if (delta < 0) {
      return (
        <span className="growth-badge growth-negative">
          ↓ {delta.toFixed(1)}%
        </span>
      )
    }

    return <span className="growth-badge growth-neutral">0.0%</span>
  }

  // Filter out annual-only rows if in quarterly mode
  const activeRows = METRIC_ROWS.filter(row => !row.annualOnly || periodType === 'annual')

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Financial Performance & Statements</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Historical audited financial statements and consolidated earnings trends for {companyName || 'the company'}.
          </p>
        </div>
        <div className="period-toggle-wrap" style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            className={`toggle-tab-btn ${periodType === 'annual' ? 'active' : ''}`}
            onClick={() => setPeriodType('annual')}
          >
            Annual Statements
          </button>
          <button
            type="button"
            className={`toggle-tab-btn ${periodType === 'quarterly' ? 'active' : ''}`}
            onClick={() => setPeriodType('quarterly')}
          >
            Quarterly Results
          </button>
        </div>
      </div>

      {loading ? (
        <div className="financial-loading-state" style={{ padding: '3rem 1rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <p className="muted">Loading multi-period financial statements…</p>
        </div>
      ) : error ? (
        <div className="financial-error-state" style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <p className="muted" style={{ color: '#EF4444' }}>{error}</p>
        </div>
      ) : statements.length === 0 ? (
        <div className="financial-empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Audited financial statements for {companyName || 'this company'} ({periodType === 'annual' ? 'Annual' : 'Quarterly'}) are currently being collated or filed.
          </p>
        </div>
      ) : (
        <>
          <div className="financial-table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', minWidth: '220px' }}>Financial Metric (in ₹ Cr)</th>
                  {statements.map((stmt, idx) => {
                    const label = periodType === 'quarterly'
                      ? `${stmt.quarter || ''} ${stmt.financialYear}`
                      : `${stmt.financialYear} ${stmt.isEstimate ? '(E)' : '(A)'}`
                    return (
                      <th key={stmt._id || idx} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {label}
                      </th>
                    )
                  })}
                  <th style={{ textAlign: 'right', minWidth: '110px' }}>Latest YoY</th>
                </tr>
              </thead>
              <tbody>
                {activeRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`${row.isBold ? 'row-bold' : ''} ${row.isHighlight ? 'row-highlight' : ''}`}
                  >
                    <td style={{ textAlign: 'left', fontWeight: row.isBold || row.isHighlight ? 600 : 400 }}>
                      {row.label}
                    </td>
                    {statements.map((stmt, sIdx) => {
                      const val = stmt[row.key]
                      const isEst = stmt.isEstimate
                      return (
                        <td
                          key={sIdx}
                          className="mono"
                          style={{
                            textAlign: 'right',
                            color: isEst ? 'var(--brass)' : 'inherit'
                          }}
                        >
                          {formatCellValue(val, row.format)}
                        </td>
                      )
                    })}
                    <td style={{ textAlign: 'right' }}>
                      {renderGrowthBadge(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="financial-footnotes-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-soft, #888)' }}>
            <span>* Figures in ₹ Crores unless specified otherwise. (A) = Audited, (E) = Consensus Estimate.</span>
            <span>Data updated per latest statutory filings</span>
          </div>
        </>
      )}
    </div>
  )
}

export default CompanyFinancialsTable
