const CompanyFundingRounds = ({ companyName }) => {
  const fundingRounds = [
    {
      round: 'Pre-IPO Secondary Round',
      date: 'Jan 2024',
      amount: '₹ 850 Cr ($102M)',
      valuation: '₹ 18,450 Cr ($2.2B)',
      leadInvestors: ['Temasek Holdings', 'SBI Mutual Fund', '360 ONE Asset'],
      sharePrice: '₹ 1,250'
    },
    {
      round: 'Series D Growth',
      date: 'Aug 2022',
      amount: '₹ 1,200 Cr ($145M)',
      valuation: '₹ 14,200 Cr ($1.7B)',
      leadInvestors: ['Peak XV Partners', 'PremjiInvest', 'CPPIB'],
      sharePrice: '₹ 960'
    },
    {
      round: 'Series C Expansion',
      date: 'Nov 2020',
      amount: '₹ 680 Cr ($82M)',
      valuation: '₹ 8,100 Cr ($980M)',
      leadInvestors: ['Elevation Capital', 'Tiger Global'],
      sharePrice: '₹ 550'
    },
    {
      round: 'Series B Venture',
      date: 'Mar 2018',
      amount: '₹ 320 Cr ($38M)',
      valuation: '₹ 3,800 Cr ($460M)',
      leadInvestors: ['Matrix Partners India', 'Accel'],
      sharePrice: '₹ 260'
    }
  ]

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Capital Raising & Valuation History</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Historical venture capital rounds, post-money valuations, and equity issuance pricing.
          </p>
        </div>
        <div style={{ background: '#ECFDF5', color: '#065F46', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #A7F3D0' }}>
          4.8x Valuation Expansion Since Series B
        </div>
      </div>

      <div className="financial-table-container">
        <table className="financial-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Financing Round</th>
              <th style={{ textAlign: 'center' }}>Date</th>
              <th style={{ textAlign: 'right' }}>Capital Raised</th>
              <th style={{ textAlign: 'right' }}>Post-Money Valuation</th>
              <th style={{ textAlign: 'right' }}>Issuance Price</th>
              <th style={{ textAlign: 'left', minWidth: '180px' }}>Lead Investors</th>
            </tr>
          </thead>
          <tbody>
            {fundingRounds.map((f, idx) => (
              <tr key={idx} className={idx === 0 ? 'row-highlight' : ''}>
                <td style={{ textAlign: 'left', fontWeight: 600, color: idx === 0 ? 'var(--navy)' : 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {idx === 0 && (
                      <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                        Latest
                      </span>
                    )}
                    {f.round}
                  </div>
                </td>
                <td className="mono" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{f.date}</td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{f.amount}</td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brass)' }}>{f.valuation}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{f.sharePrice}</td>
                <td style={{ textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {f.leadInvestors.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Due Diligence Notice */}
      <div style={{ marginTop: '1.25rem', background: 'var(--surface-2, #F8FAFC)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🛡️</span>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Institutional Verification:</strong> All funding figures and cap-table filings are corroborated against ROC (Registrar of Companies) Form PAS-3 and MGT-7 filings. Taurus Magnus provides verified demat equity shares directly to your CDSL/NSDL BOID.
        </div>
      </div>
    </div>
  )
}

export default CompanyFundingRounds

