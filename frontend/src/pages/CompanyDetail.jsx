import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import EnquireButton from '../components/common/EnquireButton'
import Footer from '../components/common/Footer'
import InfoTooltip from '../components/common/InfoTooltip'
import Navbar from '../components/common/Navbar'
import FloatingParticles from '../components/common/FloatingParticles'
import PriceHistoryChart from '../components/detail/PriceHistoryChart'
import { apiBaseWithoutApi, formatINR } from '../utils/format'

const buildLogoSrc = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `${apiBaseWithoutApi()}${logoUrl}`
}

const CompanyDetail = () => {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await api.get(`/companies/${id}`)
        setCompany(res.data)
      } catch (err) {
        if (err?.response?.status === 404) {
          setNotFound(true)
        } else {
          setNotFound(true)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [id])

  if (loading) {
    return (
      <div className="page-wrap">
        <Navbar />
        <ComplianceRibbon />
        <main className="page-main"><p className="muted">Loading company…</p></main>
        <Footer />
      </div>
    )
  }

  if (notFound || !company) {
    return (
      <div className="page-wrap">
        <Navbar />
        <ComplianceRibbon />
        <main className="page-main"><p className="muted">Company not found.</p></main>
        <Footer />
      </div>
    )
  }

  const logoSrc = buildLogoSrc(company.logoUrl)
  const initial = company.name ? company.name.charAt(0).toUpperCase() : '?'
  const history = company.priceHistory || []
  const latestPrice = history.length ? history[history.length - 1].price : null

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />
      <main className="page-main">
        <div className="particles-container">
          <FloatingParticles />
        </div>
        <header className="company-header">
          <div className="company-logo">
            {logoSrc ? (
              <button
                type="button"
                className="company-logo-thumb-btn"
                onClick={() => setIsLightboxOpen(true)}
                aria-label={`View full-size ${company.name} logo`}
              >
                <img src={logoSrc} alt={`${company.name} logo`} className="company-logo-thumb" />
              </button>
            ) : (
              <span className="logo-placeholder">{initial}</span>
            )}
          </div>
          <div className="company-header-text">
            <h1>{company.name}</h1>
            {company.sector && <span className="sector-badge">{company.sector}</span>}
            {company.isin && <p className="muted mono">ISIN: {company.isin}</p>}
          </div>
        </header>

        <section className="company-stats">
          <div className="stat-card">
            <p className="stat-label">
              <InfoTooltip text="An estimated price based on our own research — not sourced from a live stock exchange.">
                Indicative Price
              </InfoTooltip>
            </p>
            <p className="stat-value mono">{formatINR(latestPrice)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">
              <InfoTooltip text="Highest and lowest indicative price recorded over the last 12 months.">
                52W High
              </InfoTooltip>
            </p>
            <p className="stat-value mono">{formatINR(company.high52)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">
              <InfoTooltip text="Highest and lowest indicative price recorded over the last 12 months.">
                52W Low
              </InfoTooltip>
            </p>
            <p className="stat-value mono">{formatINR(company.low52)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">
              <InfoTooltip text="Minimum number of shares you can enquire about in one transaction.">
                Lot Size
              </InfoTooltip>
            </p>
            <p className="stat-value mono">{company.lotSize ?? '—'}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Face Value</p>
            <p className="stat-value mono">{formatINR(company.faceValue)}</p>
          </div>
        </section>

        {company.description && (
          <section className="company-section">
            <h2 className="section-title">About</h2>
            <p>{company.description}</p>
          </section>
        )}

        <section className="company-section">
          <h2 className="section-title">Price History</h2>
          <PriceHistoryChart priceHistory={history} />
        </section>

        <section className="company-enquire">
          <EnquireButton companyName={company.name} />
        </section>
      </main>

      {isLightboxOpen && logoSrc && (
        <div
          className="logo-lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${company.name} logo preview`}
        >
          <button
            type="button"
            className="logo-lightbox-close"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false) }}
            aria-label="Close logo preview"
          >
            ✕
          </button>
          <img
            src={logoSrc}
            alt={`${company.name} logo`}
            className="logo-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CompanyDetail