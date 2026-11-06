import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import PriceHistoryChart from '../components/detail/PriceHistoryChart'
import CompanyAbout from '../components/detail/CompanyAbout'
import ShareEnquiryForm from '../components/detail/ShareEnquiryForm'
import CompanyFundamentalsGrid from '../components/detail/CompanyFundamentalsGrid'
import CompanyFinancialsTable from '../components/detail/CompanyFinancialsTable'
import CompanyShareholding from '../components/detail/CompanyShareholding'
import CompanyFundingRounds from '../components/detail/CompanyFundingRounds'
import CompanyFaqAccordion from '../components/detail/CompanyFaqAccordion'
import { apiBaseWithoutApi, formatINR, formatShortDate } from '../utils/format'

const buildLogoSrc = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `${apiBaseWithoutApi()}${logoUrl}`
}

const TABS = [
  { id: 'fundamentals', label: 'Key Fundamentals' },
  { id: 'financials', label: 'Financial Statements' },
  { id: 'shareholding', label: 'Shareholding Pattern' },
  { id: 'funding', label: 'Funding & Valuation' },
  { id: 'faqs', label: 'Due Diligence & FAQs' }
]

const CompanyDetail = () => {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('fundamentals')

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await api.get(`/companies/${id}`)
        setCompany(res.data)
      } catch (err) {
        setNotFound(true)
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
            <div className="company-badge-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}>
              {company.sector && <span className="sector-badge">{company.sector}</span>}
              {company.industry && <span className="sector-badge outline" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-soft)' }}>{company.industry}</span>}
              {company.drhpFiled && <span className="sector-badge" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>DRHP Filed</span>}
            </div>
          </div>
        </header>

        {/* 2-Column Desktop Grid Layout: Main info on Left, Sticky Enquiry Form on Right */}
        <div className="company-detail-grid">
          <div className="company-detail-main">
            {/* 1. Indicative Price History Chart (Permanent Top) */}
            <section className="company-section" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Indicative Price History</h2>
                {(company.latestPriceDate || (history.length ? history[history.length - 1].recordedAt : null)) && (
                  <span className="price-as-of-badge" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Indicative Price as of: <strong style={{ color: 'var(--text-primary)' }}>{formatShortDate(company.latestPriceDate || history[history.length - 1].recordedAt)}</strong>
                  </span>
                )}
              </div>
              <PriceHistoryChart priceHistory={history} />
            </section>

            {/* 2. About Company with Read More */}
            <section className="company-section" style={{ marginBottom: '1.75rem' }}>
              <h2 className="section-title">About {company.name}</h2>
              <CompanyAbout
                description={company.description}
                companyName={company.name}
                sector={company.sector}
              />
            </section>

            {/* 3. Interactive Tab Switcher (Icons removed) */}
            <div className="detail-nav-tabs-wrapper">
              <nav className="detail-nav-tabs" aria-label="Company Data Navigation">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`detail-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 4. Active Tab Content Pane */}
            {activeTab === 'fundamentals' && (
              <div className="detail-tab-pane">
                <CompanyFundamentalsGrid company={company} latestPrice={latestPrice} />
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="detail-tab-pane">
                <CompanyFinancialsTable companyId={company._id} companyName={company.name} />
              </div>
            )}

            {activeTab === 'shareholding' && (
              <div className="detail-tab-pane">
                <CompanyShareholding companyId={company._id} companyName={company.name} />
              </div>
            )}

            {activeTab === 'funding' && (
              <div className="detail-tab-pane">
                <CompanyFundingRounds companyName={company.name} />
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="detail-tab-pane">
                <CompanyFaqAccordion companyId={company._id} companyName={company.name} />
              </div>
            )}
          </div>

          <aside className="company-detail-sidebar">
            <ShareEnquiryForm company={company} latestPrice={latestPrice} />
          </aside>
        </div>
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
