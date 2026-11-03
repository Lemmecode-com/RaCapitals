import { useState } from 'react'

const CompanyFinancialsTable = ({ companyName }) => {
  const [periodType, setPeriodType] = useState('annual') // 'annual' | 'quarterly'

  const annualData = [
    { metric: 'Revenue from Operations', fy22: '₹ 4,820 Cr', fy23: '₹ 6,340 Cr', fy24: '₹ 8,910 Cr', fy25e: '₹ 11,250 Cr', growth: '+26.3%' },
    { metric: 'Other Income', fy22: '₹ 112 Cr', fy23: '₹ 145 Cr', fy24: '₹ 210 Cr', fy25e: '₹ 280 Cr', growth: '+33.3%' },
    { metric: 'Total Revenue', fy22: '₹ 4,932 Cr', fy23: '₹ 6,485 Cr', fy24: '₹ 9,120 Cr', fy25e: '₹ 11,530 Cr', growth: '+26.4%', isBold: true },
    { metric: 'Operating Expenses (Opex)', fy22: '₹ 3,980 Cr', fy23: '₹ 5,120 Cr', fy24: '₹ 6,850 Cr', fy25e: '₹ 8,420 Cr', growth: '+22.9%' },
    { metric: 'EBITDA (Operating Profit)', fy22: '₹ 952 Cr', fy23: '₹ 1,365 Cr', fy24: '₹ 2,270 Cr', fy25e: '₹ 3,110 Cr', growth: '+37.0%', isBold: true },
    { metric: 'EBITDA Margin', fy22: '19.7%', fy23: '21.5%', fy24: '25.5%', fy25e: '27.6%', growth: '+2.1 bps' },
    { metric: 'Depreciation & Amortization', fy22: '₹ 180 Cr', fy23: '₹ 230 Cr', fy24: '₹ 310 Cr', fy25e: '₹ 390 Cr', growth: '+25.8%' },
    { metric: 'Finance Costs (Interest)', fy22: '₹ 65 Cr', fy23: '₹ 78 Cr', fy24: '₹ 85 Cr', fy25e: '₹ 92 Cr', growth: '+8.2%' },
    { metric: 'Profit Before Tax (PBT)', fy22: '₹ 707 Cr', fy23: '₹ 1,057 Cr', fy24: '₹ 1,875 Cr', fy25e: '₹ 2,628 Cr', growth: '+40.1%' },
    { metric: 'Tax Expense', fy22: '₹ 175 Cr', fy23: '₹ 265 Cr', fy24: '₹ 470 Cr', fy25e: '₹ 655 Cr', growth: '+39.3%' },
    { metric: 'Net Profit (PAT)', fy22: '₹ 532 Cr', fy23: '₹ 792 Cr', fy24: '₹ 1,405 Cr', fy25e: '₹ 1,973 Cr', growth: '+40.4%', isHighlight: true },
    { metric: 'PAT Margin', fy22: '11.0%', fy23: '12.5%', fy24: '15.8%', fy25e: '17.5%', growth: '+1.7 bps' },
    { metric: 'Diluted EPS (₹)', fy22: '₹ 16.4', fy23: '₹ 24.5', fy24: '₹ 44.1', fy25e: '₹ 61.8', growth: '+40.1%' },
    { metric: 'Shareholder Net Worth', fy22: '₹ 2,450 Cr', fy23: '₹ 3,240 Cr', fy24: '₹ 5,050 Cr', fy25e: '₹ 7,020 Cr', growth: '+39.0%', isBold: true }
  ]

  const quarterlyData = [
    { metric: 'Revenue from Operations', fy22: '₹ 2,120 Cr', fy23: '₹ 2,280 Cr', fy24: '₹ 2,390 Cr', fy25e: '₹ 2,560 Cr', growth: '+7.1%' },
    { metric: 'EBITDA', fy22: '₹ 520 Cr', fy23: '₹ 580 Cr', fy24: '₹ 630 Cr', fy25e: '₹ 710 Cr', growth: '+12.7%', isBold: true },
    { metric: 'Net Profit (PAT)', fy22: '₹ 310 Cr', fy23: '₹ 365 Cr', fy24: '₹ 410 Cr', fy25e: '₹ 485 Cr', growth: '+18.3%', isHighlight: true }
  ]

  const activeRows = periodType === 'annual' ? annualData : quarterlyData
  const columns = periodType === 'annual' ? ['FY22 (A)', 'FY23 (A)', 'FY24 (A)', 'FY25 (E)'] : ['Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25 (E)']

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Financial Performance & Statements</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Historical audited financial statements and consolidated earnings trends.
          </p>
        </div>
        <div className="period-toggle-wrap" style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            className={`toggle-tab-btn ${periodType === 'annual' ? 'active' : ''}`}
            onClick={() => setPeriodType('annual')}
          >
            Annual Financials
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

      <div className="financial-table-container">
        <table className="financial-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', minWidth: '220px' }}>Financial Metric (in ₹ Cr)</th>
              {columns.map((c, i) => (
                <th key={i} style={{ textAlign: 'right' }}>{c}</th>
              ))}
              <th style={{ textAlign: 'right' }}>YoY Growth</th>
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row, idx) => (
              <tr
                key={idx}
                className={`${row.isBold ? 'row-bold' : ''} ${row.isHighlight ? 'row-highlight' : ''}`}
              >
                <td style={{ textAlign: 'left', fontWeight: row.isBold || row.isHighlight ? 600 : 400 }}>
                  {row.metric}
                </td>
                <td className="mono" style={{ textAlign: 'right' }}>{row.fy22}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{row.fy23}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{row.fy24}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--brass)' }}>{row.fy25e}</td>
                <td className="mono" style={{ textAlign: 'right', color: '#10B981', fontWeight: 600 }}>{row.growth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CompanyFinancialsTable

