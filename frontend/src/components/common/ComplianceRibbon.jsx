import { Link } from 'react-router-dom'

const ComplianceRibbon = () => {
  return (
    <aside className="compliance-ribbon" aria-label="Regulatory Notice">
      <div className="compliance-ribbon-inner">
        Indicative prices only, based on secondary research — unlisted shares are not traded on a SEBI-recognized stock exchange. Transactions are private and bilateral arrangements.{' '}
        <Link to="/disclaimer" className="compliance-ribbon-link">
          Risk & Legal Disclosures →
        </Link>
      </div>
    </aside>
  )
}

export default ComplianceRibbon