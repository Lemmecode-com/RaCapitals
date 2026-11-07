import { Link } from 'react-router-dom'

const ComplianceRibbon = () => {
  return (
    <aside className="compliance-ribbon" aria-label="Regulatory Notice">
      <div className="compliance-ribbon-inner">
        <span className="compliance-ribbon-pulse" aria-hidden="true">
          <span className="pulse-dot" />
          <span className="pulse-ring" />
        </span>
        <span className="compliance-ribbon-text">
          Indicative prices only, based on secondary research — unlisted shares are not traded on a SEBI-recognized stock exchange. Transactions are private and bilateral arrangements.{' '}
        </span>
        <Link to="/disclaimer" className="compliance-ribbon-link">
          Risk & Legal Disclosures <span className="ribbon-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  )
}

export default ComplianceRibbon