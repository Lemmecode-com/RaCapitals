import { formatINR } from '../../utils/format'

const CompanyFundamentalsGrid = ({ company, latestPrice }) => {
  if (!company) return null

  // Helper to format large share counts into Crores
  const formatShares = (count) => {
    if (!count) return null
    const num = Number(count)
    if (isNaN(num)) return null
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} Cr shares`
    }
    return `${num.toLocaleString('en-IN')} shares`
  }

  // Define candidate fundamental metrics with graceful suppression if not available
  const candidateFundamentals = [
    {
      label: 'Market Cap (Est.)',
      value: company.marketCap ? `₹ ${Number(company.marketCap).toLocaleString('en-IN')} Cr` : null,
      tip: 'Estimated market valuation based on current unlisted price and total share count'
    },
    {
      label: 'Indicative Price',
      value: latestPrice ? formatINR(latestPrice) : null,
      tip: 'Latest OTC unlisted transaction benchmark price'
    },
    {
      label: 'Face Value (FV)',
      value: company.faceValue ? formatINR(company.faceValue) : null,
      tip: 'Nominal face value per share stated in corporate charter'
    },
    {
      label: 'Book Value (BVPS)',
      value: company.bookValue ? `₹ ${Number(company.bookValue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : null,
      tip: 'Total net equity divided by total outstanding shares'
    },
    {
      label: 'P/E Ratio',
      value: company.peRatio ? `${Number(company.peRatio).toFixed(1)}x` : null,
      tip: 'Price to Earnings valuation multiple'
    },
    {
      label: 'P/B Ratio',
      value: company.pbRatio ? `${Number(company.pbRatio).toFixed(1)}x` : null,
      tip: 'Price to Book Value multiple'
    },
    {
      label: 'Return on Equity (ROE)',
      value: company.roe ? `${Number(company.roe).toFixed(1)}%` : null,
      tip: 'Net profitability generated as a percentage of shareholder equity'
    },
    {
      label: 'Minimum Lot Size',
      value: company.lotSize ? `${company.lotSize} shares` : null,
      tip: 'Minimum order quantity for unlisted share purchase transactions'
    },
    {
      label: '52W Price Range',
      value: (company.low52 && company.high52) ? `${formatINR(company.low52)} – ${formatINR(company.high52)}` : null,
      tip: 'Lowest and highest recorded unlisted price over past 52 weeks'
    },
    {
      label: 'Total Shares Outstanding',
      value: formatShares(company.outstandingShares),
      tip: 'Total issued and registered demat shares'
    },
    {
      label: 'Industry Classification',
      value: company.industry || null,
      tip: 'Specific business sector segment'
    },
    {
      label: 'Founded Year',
      value: company.foundedYear ? `${company.foundedYear}` : null,
      tip: 'Original company incorporation year'
    },
    {
      label: 'CIN (Corporate ID)',
      value: company.cin || null,
      tip: 'Corporate Identification Number registered with Ministry of Corporate Affairs'
    },
    {
      label: 'ISIN (Demat Code)',
      value: company.isin || null,
      tip: 'International Securities Identification Number for electronic depository transfer'
    },
    {
      label: 'Registered Office',
      value: company.registeredOffice || null,
      tip: 'Official registered headquarters location',
      span: 2
    }
  ]

  // Suppress cards with null/empty values cleanly (prevents NaN or empty cards)
  const availableFundamentals = candidateFundamentals.filter(item => item.value !== null && item.value !== undefined)

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row">
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Company Fundamentals & Key Ratios</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Comprehensive institutional valuation metrics, profitability benchmarks, and capital structure.
          </p>
        </div>
      </div>

      {availableFundamentals.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <p className="muted">Key fundamentals and valuation ratios are currently being collated for this listing.</p>
        </div>
      ) : (
        <div className="fundamentals-grid">
          {availableFundamentals.map((f, idx) => (
            <div
              key={idx}
              className={`fundamental-card ${f.span ? `span-${f.span}` : ''}`}
              title={f.tip || ''}
            >
              <div className="fundamental-card-head">
                <span className="fundamental-label">{f.label}</span>
                {f.tip && <span className="fundamental-info-icon" title={f.tip}>ⓘ</span>}
              </div>
              <span className="fundamental-value">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CompanyFundamentalsGrid
