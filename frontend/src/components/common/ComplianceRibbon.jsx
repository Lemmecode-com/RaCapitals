import { Link } from 'react-router-dom'

const ComplianceRibbon = () => {
  return (
    <aside className="compliance-ribbon" aria-label="Regulatory and Pricing Notice">
      <div className="compliance-ribbon-inner">
        <span className="compliance-ribbon-badge">Notice</span>
        <span className="compliance-ribbon-text">
          Indicative prices only, based on secondary research — unlisted shares are not traded on a SEBI-recognized stock exchange. Transactions are private and bilateral arrangements.
        </span>
        <Link to="/disclaimer" className="compliance-ribbon-link">
          Private Markets & Risk Disclosures →
        </Link>
      </div>
    </aside>
  )
}

export default ComplianceRibbon