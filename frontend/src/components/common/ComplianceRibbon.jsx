import { Link } from 'react-router-dom'

const ComplianceRibbon = () => {
  return (
    <aside className="compliance-ribbon" aria-label="Regulatory Notice">
      <div className="compliance-ribbon-inner">
        <span className="pulse-dot" aria-hidden="true" />
        <span>Indicative prices only. Unlisted shares are not traded on a SEBI-recognized stock exchange — transactions are private & bilateral.</span>
        <Link to="/disclaimer" className="compliance-ribbon-link">
          Risk & Legal Disclosures →
        </Link>
      </div>
    </aside>
  )
}

export default ComplianceRibbon