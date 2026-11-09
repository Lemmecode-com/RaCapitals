import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Footer from '../components/common/Footer'
import FloatingParticles from '../components/common/FloatingParticles'
import { getWhatsAppUrl } from '../utils/whatsapp'

const CORE_PILLARS = [
  {
    number: '01',
    theme: 'Why We Started',
    title: 'The Rejection of Informal Dealer Networks',
    summary:
      'For decades, private unlisted shares in India traded in the shadows — confined to closed dealer syndicates, informal telephone calls, and opaque markups. Taurus Magnus was founded as an institutional alternative: replacing sales pressure and backdoor dealing with an open, documented web platform where research precedes every conversation.',
    highlight: 'Replacing shadow trading with documented institutional intelligence.'
  },
  {
    number: '02',
    theme: 'The Information Void',
    title: 'Ending the Era of Unverified Whispers',
    summary:
      'In traditional unlisted markets, reliable data was virtually nonexistent. Investors were forced to rely on unverified rumors, forwarded WhatsApp screenshots, and cherry-picked valuations without ever seeing an audited balance sheet. We bridge this information chasm by sourcing, standardizing, and presenting verifiable statutory filings directly from statutory records.',
    highlight: 'Zero speculative rumors. 100% verified statutory corporate disclosures.'
  },
  {
    number: '03',
    theme: 'Institutional Due Diligence',
    title: 'Research-First Analytical Rigor',
    summary:
      'We treat unlisted equities with the forensic seriousness typically reserved for private equity institutions. Before any enterprise is featured, our research desk evaluates multi-year audited MCA filings, DRHP draft prospectuses, revenue CAGRs, debt structures, contingent liabilities, and peer-group valuation multiples.',
    highlight: 'Institutional financial scrutiny applied to every private enterprise.'
  },
  {
    number: '04',
    theme: 'Radical Transparency',
    title: 'Honest Financials & Indicative Price Discovery',
    summary:
      'We believe transparency is the ultimate safeguard for investor capital. We publish multi-year Profit & Loss statements, balance sheet breakdowns, cash flow trends, and shareholding patterns. Indicative valuations reflect genuine market activity — free from hidden broker spreads, with safe settlement strictly via official demat-to-demat depository transfer.',
    highlight: 'Clear multi-year financials and safe demat-to-demat settlement.'
  },
  {
    number: '05',
    theme: 'Democratizing Private Markets',
    title: 'Leveling the Playing Field for Forward-Looking Investors',
    summary:
      'India’s most dynamic economic expansion is compounding outside the public stock exchanges, inside ambitious private and pre-IPO enterprises. For too long, this wealth creation engine was an exclusive enclave for ultra-HNIs and institutional funds. Our mission is to democratize private-market intelligence so every informed investor can own tomorrow’s champions today.',
    highlight: 'Opening institutional-grade private equity intelligence to all.'
  }
]

const METHODOLOGY_STEPS = [
  {
    step: '1',
    title: 'Statutory MCA Extraction',
    desc: 'Direct retrieval of audited annual accounts, Form AOC-4, and MGT-7 filings directly from the Ministry of Corporate Affairs.'
  },
  {
    step: '2',
    title: 'Forensic Health & Governance',
    desc: 'Auditor notes review, related-party transaction scrutiny, debt covenants check, and cash burn sustainability analysis.'
  },
  {
    step: '3',
    title: 'Peer Benchmarking & Multiples',
    desc: 'Comparative valuation modeling against listed industry peers (P/E, P/B, EV/EBITDA, and DRHP indicative price bands).'
  },
  {
    step: '4',
    title: 'Depository & Lock-in Verification',
    desc: 'ISIN verification with NSDL/CDSL depositories, demat credit confirmation, and statutory 6-month pre-IPO lock-in education.'
  }
]

const About = () => {
  useEffect(() => {
    document.title = 'About Us | Taurus Magnus — Research-Driven Private Market Platform'
  }, [])

  const handleEnquireNow = () => {
    const message = 'Hi Taurus Magnus team, I would like to enquire about current unlisted share availability, lot pricing, and indicative valuations.'
    const url = getWhatsAppUrl(message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page-wrap about-page-wrap">
      <Navbar />
      <ComplianceRibbon />

      <main className="page-main about-page-main">
        <div className="particles-container">
          <FloatingParticles />
        </div>

        {/* Hero Section */}
        <header className="about-hero-header">
          <div className="about-hero-badge">
            <span className="about-badge-dot" />
            OUR ORIGIN & PHILOSOPHY
          </div>
          <h1 className="about-hero-title">
            A market that traded in the shadows — rebuilt on{' '}
            <span className="about-hero-accent">research and radical transparency.</span>
          </h1>
          <p className="about-hero-subtitle">
            Taurus Magnus is an independent research and financial information platform built to bring clarity,
            documentary integrity, and institutional diligence to India&apos;s unlisted and pre-IPO equity markets.
          </p>

          {/* Quick Credibility Strip */}
          <div className="about-stats-strip">
            <div className="about-stat-card">
              <span className="about-stat-val">100%</span>
              <span className="about-stat-label">MCA-Verified Filings</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-val">Zero</span>
              <span className="about-stat-label">Hidden Dealer Markups</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-val">Demat</span>
              <span className="about-stat-label">Depository Safe Transfers</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-val">Research-1st</span>
              <span className="about-stat-label">Institutional Diligence</span>
            </div>
          </div>
        </header>

        {/* Issue #12: Enquire Now CTA directly above About Us Section */}
        <div className="about-enquire-bar">
          <div className="about-enquire-bar-content">
            <div className="about-enquire-badge">
              <span className="about-enquire-pulse" aria-hidden="true" />
              DIRECT ACCESS TO RESEARCH DESK
            </div>
            <p className="about-enquire-text">
              Interested in current unlisted share availability, lot pricing, or statutory DRHP filings?
            </p>
          </div>
          <div className="about-enquire-actions">
            <button
              type="button"
              className="about-enquire-now-btn"
              onClick={handleEnquireNow}
              id="about-enquire-now-cta"
              aria-label="Enquire Now on WhatsApp"
            >
              <svg className="enquire-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.39C16.31 14.27 15.09 13.67 14.86 13.58C14.64 13.5 14.47 13.46 14.31 13.7C14.14 13.95 13.66 14.51 13.51 14.68C13.37 14.84 13.22 14.87 12.98 14.74C12.73 14.62 11.94 14.36 11 13.52C10.26 12.87 9.77 12.06 9.62 11.82C9.48 11.57 9.61 11.44 9.73 11.32C9.84 11.21 9.98 11.03 10.1 10.89C10.22 10.74 10.27 10.64 10.35 10.47C10.43 10.31 10.39 10.16 10.33 10.04C10.27 9.92 9.77 8.7 9.57 8.2C9.37 7.72 9.17 7.78 9.02 7.77C8.88 7.77 8.71 7.76 8.55 7.76C8.38 7.76 8.11 7.82 7.89 8.07C7.66 8.31 7.03 8.9 7.03 10.11C7.03 11.32 7.91 12.49 8.03 12.65C8.16 12.82 9.77 15.3 12.23 16.36C12.82 16.61 13.27 16.76 13.63 16.88C14.22 17.07 14.76 17.04 15.19 16.98C15.67 16.91 16.67 16.37 16.88 15.79C17.09 15.2 17.09 14.7 17.03 14.6C16.96 14.5 16.81 14.44 16.56 14.39Z" />
              </svg>
              <span>Enquire Now</span>
            </button>
            <Link to="/contact" className="about-enquire-secondary-btn">
              Contact Desk →
            </Link>
          </div>
        </div>

        {/* Section: The Founders' Story */}
        <section className="about-section about-story-section" id="about-us-section">
          <div className="about-section-heading-wrap">
            <p className="about-section-eyebrow">THE GENESIS</p>
            <h2 className="about-section-title">How Two College Dropouts Challenged the Shadow Market</h2>
          </div>

          <div className="about-story-grid">
            <div className="about-story-narrative">
              <p className="about-lead-para">
                In India&apos;s rapidly accelerating economy, some of the most innovative and profitable companies —
                from disruptive technology firms to decade-old manufacturing powerhouses — were choosing to remain
                private for longer. Behind this surge of private wealth, however, lay a sobering reality: the
                unlisted shares of these enterprises were trading in an opaque, fragmented shadow market.
              </p>
              <p>
                The genesis of Taurus Magnus took root when two young college students — deeply passionate about
                capital markets, forensic accounting, and business valuations — ventured into the unlisted shares
                space to understand how private Indian enterprises were actually traded and evaluated. What they
                found was startling.
              </p>
              <p>
                The unlisted ecosystem was dominated by loose telephone cartels and secretive WhatsApp groups.
                Share prices were quoted arbitrarily, brokers pocketed opaque bid-ask spreads of 15% to 25%, and
                prospective buyers were fed speculative gossip with virtually zero access to audited balance
                sheets, DRHP draft filings, or regulatory records.
              </p>
              <p>
                Convinced that the existing market operated on information asymmetry and high-pressure salesmanship
                rather than fiduciary truth, they made an audacious decision: they stepped away from formal college
                degrees to build the platform they wished existed.
              </p>
              <blockquote className="about-pullquote">
                &ldquo;We did not build Taurus Magnus to be another anonymous unlisted share brokerage. We built it
                to be an independent research platform where documented facts replace whispers, and where
                transparent pricing replaces hidden dealer margins.&rdquo;
              </blockquote>
              <p>
                Today, Taurus Magnus stands as a dedicated research and information destination for unlisted and
                pre-IPO equity — democratizing institutional-grade data, corporate event tracking, and indicative
                price discovery for forward-looking investors across India.
              </p>
            </div>

            <div className="about-story-sidebar">
              <div className="about-sidebar-card">
                <div className="about-sidebar-badge">OUR COMPASS</div>
                <h3>Research First, Transparency Always</h3>
                <ul className="about-sidebar-list">
                  <li>
                    <span className="about-list-bullet">✓</span>
                    <div>
                      <strong>Documented Over Speculation</strong>
                      <p>Every data point is anchored in MCA statutory filings and regulatory DRHP submissions.</p>
                    </div>
                  </li>
                  <li>
                    <span className="about-list-bullet">✓</span>
                    <div>
                      <strong>No Aggressive Pressure</strong>
                      <p>We do not push speculative IPO trades or promise unrealistic short-term gains.</p>
                    </div>
                  </li>
                  <li>
                    <span className="about-list-bullet">✓</span>
                    <div>
                      <strong>Direct Demat Safety</strong>
                      <p>Transactions settle directly demat-to-demat through official CDSL/NSDL depository accounts.</p>
                    </div>
                  </li>
                  <li>
                    <span className="about-list-bullet">✓</span>
                    <div>
                      <strong>Independent Perspective</strong>
                      <p>We operate as an objective information aggregator, untethered from dealer commission incentives.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section: The 5 Core Pillars */}
        <section className="about-section about-pillars-section">
          <div className="about-section-heading-wrap text-center">
            <p className="about-section-eyebrow">FIVE FOUNDATIONAL PRINCIPLES</p>
            <h2 className="about-section-title">The Tenets That Define Our Research Architecture</h2>
            <p className="about-section-sub">
              Built from the ground up to counter opacity, protect capital, and elevate the standard of private equity analysis in India.
            </p>
          </div>

          <div className="about-pillars-grid">
            {CORE_PILLARS.map((pillar) => (
              <div key={pillar.number} className="about-pillar-card">
                <div className="about-pillar-top">
                  <span className="about-pillar-number">{pillar.number}</span>
                  <span className="about-pillar-theme">{pillar.theme}</span>
                </div>
                <h3 className="about-pillar-title">{pillar.title}</h3>
                <p className="about-pillar-summary">{pillar.summary}</p>
                <div className="about-pillar-highlight">
                  <span className="about-highlight-icon">⚡</span>
                  <span>{pillar.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: 4-Step Diligence Framework */}
        <section className="about-section about-framework-section">
          <div className="about-section-heading-wrap text-center">
            <p className="about-section-eyebrow">OUR METHODOLOGY</p>
            <h2 className="about-section-title">How We Build Institutional Research</h2>
            <p className="about-section-sub">
              A four-stage forensic pipeline applied to unlisted and pre-IPO enterprises before they appear on our platform.
            </p>
          </div>

          <div className="about-framework-grid">
            {METHODOLOGY_STEPS.map((step) => (
              <div key={step.step} className="about-framework-card">
                <div className="about-step-indicator">{step.step}</div>
                <h4 className="about-framework-card-title">{step.title}</h4>
                <p className="about-framework-card-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: What We Are vs What We Are Not */}
        <section className="about-section about-boundary-section">
          <div className="about-section-heading-wrap text-center">
            <p className="about-section-eyebrow">ETHICAL & REGULATORY CLARITY</p>
            <h2 className="about-section-title">Institutional Integrity & Clear Boundaries</h2>
          </div>

          <div className="about-boundary-grid">
            <div className="about-boundary-card boundary-card-positive">
              <div className="boundary-card-header">
                <span className="boundary-icon-positive">✔</span>
                <h3>What Taurus Magnus Is</h3>
              </div>
              <ul className="boundary-list">
                <li>An independent research, financial data, and private market analytics platform.</li>
                <li>A provider of audited MCA financial statements, shareholding breakdowns, and DRHP insights.</li>
                <li>A transparent indicative valuation aggregator based on observable secondary market transactions.</li>
                <li>A strong advocate for investor education, statutory lock-in awareness, and risk transparency.</li>
              </ul>
            </div>

            <div className="about-boundary-card boundary-card-negative">
              <div className="boundary-card-header">
                <span className="boundary-icon-negative">✕</span>
                <h3>What Taurus Magnus Is NOT</h3>
              </div>
              <ul className="boundary-list">
                <li>Not a SEBI-registered stock exchange or an authorized electronic trading facility.</li>
                <li>Not an aggressive speculative trading desk or high-pressure phone brokerage.</li>
                <li>Not a portfolio manager or provider of guaranteed returns or assured listing profits.</li>
                <li>Not a dealer in paper or physical share transfers — all transactions are strictly electronic demat.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta-section">
          <div className="about-cta-inner">
            <h2>Empower Your Private Market Decisions with Documented Research</h2>
            <p>
              Explore our curated intelligence directory of 80+ pre-IPO and high-growth unlisted enterprises across technology, financial services, healthcare, and manufacturing.
            </p>
            <div className="about-cta-buttons">
              <Link to="/catalog" className="primary-btn about-cta-btn">
                Browse Research Catalog
              </Link>
              <Link to="/contact" className="secondary-btn">
                Contact Research Desk
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About
