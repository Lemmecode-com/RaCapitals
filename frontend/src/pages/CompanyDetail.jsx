import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Footer from '../components/common/Footer'
import InfoTooltip from '../components/common/InfoTooltip'
import Navbar from '../components/common/Navbar'
import PriceHistoryChart from '../components/detail/PriceHistoryChart'
import CompanyAbout from '../components/detail/CompanyAbout'
import ShareEnquiryForm from '../components/detail/ShareEnquiryForm'
import CompanyFundamentalsGrid from '../components/detail/CompanyFundamentalsGrid'
import CompanyFinancialsTable from '../components/detail/CompanyFinancialsTable'
import CompanyShareholding from '../components/detail/CompanyShareholding'
import CompanyFundingRounds from '../components/detail/CompanyFundingRounds'
import CompanyFaqAccordion from '../components/detail/CompanyFaqAccordion'
import { apiBaseWithoutApi, formatINR } from '../utils/format'

const buildLogoSrc = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `${apiBaseWithoutApi()}${logoUrl}`
}

const TABS = [
  { id: 'overview', label: 'Overview & Chart', icon: '📈' },
  { id: 'fundamentals', label: 'Fundamentals', icon: '🏛️' },
  { id: 'financials', label: 'Financial Statements', icon: '📑' },
  { id: 'shareholding', label: 'Shareholding Pattern', icon: '👥' },
  { id: 'funding', label: 'Funding & Valuation', icon: '🚀' },
  { id: 'faqs', label: 'Due Diligence & FAQs', icon: '❓' },
  { id: 'all', label: 'View All Sections', icon: '📑' }
]

const CompanyDetail = () => {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

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
            <div className="company-id-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
              {company.isin && <span><strong style={{ color: 'var(--brass)' }}>ISIN:</strong> <span className="mono">{company.isin}</span></span>}
              {company.cin && <span><strong style={{ color: 'var(--brass)' }}>CIN:</strong> <span className="mono">{company.cin}</span></span>}
              {company.foundedYear && <span><strong style={{ color: 'var(--brass)' }}>Founded:</strong> {company.foundedYear}</span>}
              {company.registeredOffice && <span><strong style={{ color: 'var(--brass)' }}>HQ:</strong> {company.registeredOffice}</span>}
            </div>
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

        {/* 2-Column Desktop Grid Layout: Main info on Left, Sticky Enquiry Form on Right */}
        <div className="company-detail-grid">
          <div className="company-detail-main">
            {/* Interactive Tab Switcher */}
            <div className="detail-nav-tabs-wrapper">
              <nav className="detail-nav-tabs" aria-label="Company Data Navigation">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`detail-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* TAB: Overview & Chart */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <div className="detail-tab-pane">
                <section className="company-section">
                  <h2 className="section-title">About {company.name}</h2>
                  <CompanyAbout
                    description={company.description}
                    companyName={company.name}
                    sector={company.sector}
                  />
                </section>

                <section className="company-section">
                  <h2 className="section-title">Indicative Price History</h2>
                  <PriceHistoryChart priceHistory={history} />
                </section>
              </div>
            )}

            {/* TAB: Key Fundamentals */}
            {(activeTab === 'fundamentals' || activeTab === 'all') && (
              <div className="detail-tab-pane">
                <CompanyFundamentalsGrid company={company} latestPrice={latestPrice} />
              </div>
            )}

            {/* TAB: Financial Statements */}
            {(activeTab === 'financials' || activeTab === 'all') && (
              <div className="detail-tab-pane">
                <CompanyFinancialsTable companyId={company._id} companyName={company.name} />
              </div>
            )}

            {/* TAB: Shareholding & Cap Table */}
            {(activeTab === 'shareholding' || activeTab === 'all') && (
              <div className="detail-tab-pane">
                <CompanyShareholding companyName={company.name} />
              </div>
            )}

            {/* TAB: Funding & Valuation */}
            {(activeTab === 'funding' || activeTab === 'all') && (
              <div className="detail-tab-pane">
                <CompanyFundingRounds companyName={company.name} />
              </div>
            )}

            {/* TAB: FAQs & Due Diligence */}
            {(activeTab === 'faqs' || activeTab === 'all') && (
              <div className="detail-tab-pane">
                <CompanyFaqAccordion companyName={company.name} />
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
