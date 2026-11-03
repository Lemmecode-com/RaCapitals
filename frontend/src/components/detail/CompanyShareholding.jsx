import { useState } from 'react'

const CompanyShareholding = ({ companyName }) => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 FY24')

  const quarters = ['Q4 FY24', 'Q3 FY24', 'Q2 FY24', 'Q1 FY24']

  const shareholdingData = {
    'Q4 FY24': [
      { category: 'Promoter & Promoter Group', percentage: 56.4, color: '#3B82F6', change: '0.0%' },
      { category: 'Domestic Institutions (DIIs & MFs)', percentage: 14.8, color: '#10B981', change: '+1.2%' },
      { category: 'Foreign Institutional Investors (FIIs)', percentage: 12.3, color: '#F59E0B', change: '-0.4%' },
      { category: 'Public & High Networth Individuals (HNIs)', percentage: 13.5, color: '#8B5CF6', change: '-0.8%' },
      { category: 'Employee Benefit Trust (ESOP)', percentage: 3.0, color: '#EC4899', change: '0.0%' }
    ],
    'Q3 FY24': [
      { category: 'Promoter & Promoter Group', percentage: 56.4, color: '#3B82F6', change: '0.0%' },
      { category: 'Domestic Institutions (DIIs & MFs)', percentage: 13.6, color: '#10B981', change: '+0.5%' },
      { category: 'Foreign Institutional Investors (FIIs)', percentage: 12.7, color: '#F59E0B', change: '-0.2%' },
      { category: 'Public & High Networth Individuals (HNIs)', percentage: 14.3, color: '#8B5CF6', change: '-0.3%' },
      { category: 'Employee Benefit Trust (ESOP)', percentage: 3.0, color: '#EC4899', change: '0.0%' }
    ],
    'Q2 FY24': [
      { category: 'Promoter & Promoter Group', percentage: 56.4, color: '#3B82F6', change: '0.0%' },
      { category: 'Domestic Institutions (DIIs & MFs)', percentage: 13.1, color: '#10B981', change: '+0.8%' },
      { category: 'Foreign Institutional Investors (FIIs)', percentage: 12.9, color: '#F59E0B', change: '-0.5%' },
      { category: 'Public & High Networth Individuals (HNIs)', percentage: 14.6, color: '#8B5CF6', change: '-0.3%' },
      { category: 'Employee Benefit Trust (ESOP)', percentage: 3.0, color: '#EC4899', change: '0.0%' }
    ],
    'Q1 FY24': [
      { category: 'Promoter & Promoter Group', percentage: 56.4, color: '#3B82F6', change: '0.0%' },
      { category: 'Domestic Institutions (DIIs & MFs)', percentage: 12.3, color: '#10B981', change: '+1.0%' },
      { category: 'Foreign Institutional Investors (FIIs)', percentage: 13.4, color: '#F59E0B', change: '+0.2%' },
      { category: 'Public & High Networth Individuals (HNIs)', percentage: 14.9, color: '#8B5CF6', change: '-1.2%' },
      { category: 'Employee Benefit Trust (ESOP)', percentage: 3.0, color: '#EC4899', change: '0.0%' }
    ]
  }

  const marqueeInvestors = [
    { name: 'Temasek Holdings', stake: '4.85%', type: 'Sovereign Wealth Fund', country: 'Singapore' },
    { name: 'Sequoia / Peak XV Partners', stake: '6.20%', type: 'Venture Capital', country: 'India / USA' },
    { name: 'SBI Mutual Fund', stake: '3.40%', type: 'Domestic Asset Manager', country: 'India' },
    { name: 'PremjiInvest', stake: '2.15%', type: 'Private Family Office', country: 'India' },
    { name: 'Canada Pension Plan (CPPIB)', stake: '3.10%', type: 'Pension Fund', country: 'Canada' }
  ]

  const currentRows = shareholdingData[selectedQuarter] || shareholdingData['Q4 FY24']

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Shareholding Pattern & Cap Table</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Quarterly equity distribution across promoters, institutional funds, and marquee private investors.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {quarters.map((q) => (
            <button
              key={q}
              type="button"
              className={`toggle-tab-btn ${selectedQuarter === q ? 'active' : ''}`}
              onClick={() => setSelectedQuarter(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Multi-color Progress Stack Bar */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--surface-card, #ffffff)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
          <span>Ownership Split ({selectedQuarter})</span>
          <span className="mono">Promoter Pledged Shares: 0.00% (Clean)</span>
        </div>

        <div style={{ display: 'flex', height: '22px', borderRadius: '999px', overflow: 'hidden', background: '#E2E8F0', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
          {currentRows.map((item, idx) => (
            <div
              key={idx}
              title={`${item.category}: ${item.percentage}%`}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                transition: 'width 0.4s ease'
              }}
            />
          ))}
        </div>

        {/* Legend Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {currentRows.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary, #475569)' }}>{item.category}:</span>
              <strong className="mono">{item.percentage}%</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Cap Table breakdown */}
      <div className="financial-table-container" style={{ marginBottom: '1.5rem' }}>
        <table className="financial-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Shareholder Category</th>
              <th style={{ textAlign: 'right' }}>Stake (%)</th>
              <th style={{ textAlign: 'right' }}>Quarterly Shift</th>
              <th style={{ textAlign: 'right' }}>Lock-in Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((r, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'left', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: r.color }} />
                    {r.category}
                  </div>
                </td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{r.percentage.toFixed(1)}%</td>
                <td className="mono" style={{ textAlign: 'right', color: r.change.startsWith('+') ? '#10B981' : r.change.startsWith('-') ? '#EF4444' : 'var(--text-secondary)' }}>
                  {r.change}
                </td>
                <td style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {r.category.includes('Promoter') ? 'Pre-IPO (6m lock-in)' : 'Free Float'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Marquee & Key Institutional Investors */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
          Marquee Institutional & Private Equity Investors
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {marqueeInvestors.map((inv, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--surface-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>{inv.name}</span>
                <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--brass)', fontWeight: 600 }}>{inv.stake}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748B)' }}>{inv.type} • {inv.country}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompanyShareholding

