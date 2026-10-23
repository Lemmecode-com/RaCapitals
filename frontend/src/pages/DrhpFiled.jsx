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
        <div className="page-header">
          <Link to="/catalog" className="back-pill">← Back to Price List</Link>
          <h1>DRHP Filed</h1>
          <p className="page-subtitle">Companies that have filed their Draft Red Herring Prospectus.</p>
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