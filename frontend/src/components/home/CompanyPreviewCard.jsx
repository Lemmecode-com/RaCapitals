import { Link } from 'react-router-dom'
import EnquireButton from '../common/EnquireButton'
import { apiBaseWithoutApi, formatINR } from '../../utils/format'

const CompanyPreviewCard = ({ company }) => {
  const history = company.priceHistory || []
  const latestPrice = company.latestPrice != null
    ? company.latestPrice
    : (history.length ? history[history.length - 1].price : null)
  const logoSrc = company.logoUrl
    ? `${apiBaseWithoutApi()}${company.logoUrl}`
    : null
  const initial = company.name ? company.name.charAt(0).toUpperCase() : '?'
  return (
    <article className="preview-card card-hover-tilt">
      <Link to={`/company/${company._id}`} className="preview-card-link" aria-label={`View ${company.name}`}>
        <div className="preview-card-top">
          <div className="preview-card-logo">
            {logoSrc ? (
              <img src={logoSrc} alt={`${company.name} logo`} />
            ) : (
              <span className="logo-placeholder small">{initial}</span>
            )}
          </div>
          <div className="preview-card-name-wrap">
            <h3 className="preview-card-name">{company.name}</h3>
            {company.sector && <span className="preview-card-sector">{company.sector}</span>}
          </div>
        </div>
        <div className="preview-card-mid">
          <span className="preview-card-price-label">Indicative Price</span>
          <span className="preview-card-price mono">{formatINR(latestPrice)}</span>
        </div>
        {(company.high52 != null || company.low52 != null) && (
          <p className="preview-card-range mono">
            52W High {formatINR(company.high52)} · 52W Low {formatINR(company.low52)}
          </p>
        )}
      </Link>
      <div className="preview-card-actions">
        <EnquireButton companyName={company.name} />
      </div>
    </article>
  )
}

export default CompanyPreviewCard