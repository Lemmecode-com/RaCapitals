import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency } from '../utils/format'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

const DrhpFiled = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/companies/drhp-filed')
      .then((res) => { if (active) setCompanies(res.data) })
      .catch(() => { if (active) setCompanies([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />
      <main className="page-main">
        <div className="drhp-hero-header">
          <div className="drhp-hero-badge">IPO WATCH</div>
          <h1 className="drhp-hero-title">
            DRHP-filed <span className="drhp-hero-title-accent">companies</span>
          </h1>
          <p className="drhp-hero-desc">
            Unlisted companies that have filed a Draft Red Herring Prospectus with SEBI — an early step toward an IPO. Indicative prices, for information only; a DRHP filing is not a guarantee of any IPO.
          </p>

          <div className="drhp-stepper" aria-label="IPO Pipeline Progress">
            <div className="drhp-step active">
              <div className="drhp-step-circle">1</div>
              <span className="drhp-step-label">Unlisted</span>
            </div>
            <div className="drhp-step-line active" />
            <div className="drhp-step active">
              <div className="drhp-step-circle">2</div>
              <span className="drhp-step-label">DRHP filed</span>
            </div>
            <div className="drhp-step-line" />
            <div className="drhp-step">
              <div className="drhp-step-circle">3</div>
              <span className="drhp-step-label">SEBI nod</span>
            </div>
            <div className="drhp-step-line" />
            <div className="drhp-step">
              <div className="drhp-step-circle">4</div>
              <span className="drhp-step-label">IPO</span>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : companies.length === 0 ? (
          <div className="chart-empty">No companies have filed a DRHP yet.</div>
        ) : (
          <div className="drhp-list-wrap">
            {companies.map((c) => (
              <div key={c._id} className="drhp-row-card">
                <div className="drhp-row-info">
                  <Link to={`/company/${c._id}`} className="drhp-row-name">{c.name}</Link>
                  <span className="drhp-row-sector">{c.sector || '—'}</span>
                </div>
                
                <div className="drhp-row-stats">
                  <div className="drhp-stat">
                    <span className="drhp-stat-label">Latest Price</span>
                    <span className="drhp-stat-val">
                      {c.latestPrice != null ? formatCurrency(c.latestPrice) : '—'}
                    </span>
                  </div>
                  <div className="drhp-stat">
                    <span className="drhp-stat-label">52-Week Range</span>
                    <span className="drhp-stat-val">
                      {c.high52 != null && c.low52 != null
                        ? `${formatCurrency(c.low52)} – ${formatCurrency(c.high52)}`
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="drhp-row-action">
                  <Link to={`/company/${c._id}`} className="drhp-view-btn">View Details <span>→</span></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DrhpFiled