import { formatINR } from '../../utils/format'

const CompanyFundamentalsGrid = ({ company, latestPrice }) => {
  // Mock institutional fundamentals (ready for dynamic backend integration in TM-ISSUE-06)
  const fundamentals = [
    { label: 'Market Cap (Est.)', value: '₹ 18,450 Cr', tip: 'Estimated market valuation based on current unlisted price and total share count' },
    { label: 'Indicative Price', value: formatINR(latestPrice || 1250), tip: 'Latest OTC unlisted transaction benchmark price' },
    { label: 'Face Value (FV)', value: formatINR(company?.faceValue || 10), tip: 'Original nominal value stated on share certificate' },
    { label: 'Book Value (BVPS)', value: '₹ 342.50', tip: 'Total equity minus liabilities divided by shares outstanding' },
    { label: 'P/E Ratio (TTM)', value: '28.4x', tip: 'Price to Earnings multiple based on trailing twelve months PAT' },
    { label: 'P/B Ratio', value: '3.65x', tip: 'Price to Book Value multiple' },
    { label: 'Return on Equity (ROE)', value: '18.2%', tip: 'Net income returned as percentage of shareholder equity' },
    { label: 'ROCE', value: '21.5%', tip: 'Return on capital employed, assessing profitability efficiency' },
    { label: 'EPS (Diluted)', value: '₹ 44.10', tip: 'Earnings per share after dilutive convertible securities' },
    { label: 'Debt to Equity', value: '0.24', tip: 'Financial leverage ratio — below 1 indicates strong balance sheet' },
    { label: '52W Range', value: `${formatINR(company?.low52 || 850)} – ${formatINR(company?.high52 || 1400)}`, tip: 'Lowest and highest transaction price observed in past year' },
    { label: 'Total Shares Outstanding', value: '14.76 Cr', tip: 'Total issued and registered demat equity shares' }
  ]

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

      <div className="fundamentals-grid">
        {fundamentals.map((f, idx) => (
          <div key={idx} className="fundamental-card">
            <span className="fundamental-label">{f.label}</span>
            <span className="fundamental-value mono">{f.value}</span>
            <span className="fundamental-tip">{f.tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompanyFundamentalsGrid

