import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import EnquireButton from '../components/common/EnquireButton'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import HeroPriceChart from '../components/home/HeroPriceChart'

import { apiBaseWithoutApi, formatINR, formatShortDate } from '../utils/format'

const PREVIEW_LIMIT = 12
const MARQUEE_DURATION = 22

const buildLogoSrc = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `${apiBaseWithoutApi()}${logoUrl}`
}

const TRENDING_BADGES = ['🔥 Trending', '⚡ High Demand', '📈 Most Active', '⭐ Top Pick']

const eventTypeClass = (type) => {
  switch (type) {
    case 'DRHP': return 'event-tag-drhp'
    case 'Funding': return 'event-tag-funding'
    case 'Leadership Change': return 'event-tag-leadership'
    default: return 'event-tag-other'
  }
}

const PM_CARDS = [
  {
    key: 'what',
    label: 'What',
    question: 'What are unlisted shares?',
    answer: (
      <p>Unlisted shares are equity shares of a company that are not listed on a recognised stock exchange (such as NSE or BSE). They are typically held by promoters, early investors, employees, or private equity funds. Transactions occur privately, often through intermediaries, and prices are negotiated rather than discovered on a public order book.</p>
    ),
  },
  {
    key: 'why',
    label: 'Why',
    question: 'Why invest before an IPO?',
    answer: (
      <p>Investing before an IPO can provide access to companies at earlier growth stages, often at lower valuations than the eventual public offering price. However, it carries higher illiquidity risk, longer holding periods, and less regulatory oversight. Investors should assess their risk tolerance and investment horizon carefully.</p>
    ),
  },
  {
    key: 'how',
    label: 'How',
    question: 'How does a purchase actually work?',
    answer: (
      <div>
        <p>It is a simple three-step process:</p>
        <ul>
          <li>Browse the price list, shortlist companies, and tap Enquire on any listing.</li>
          <li>Our team responds personally on WhatsApp or email within one business day with current availability, lot size, and next steps.</li>
          <li>Once terms are agreed, shares are transferred via demat-to-demat transfer with full documentation.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'legal',
    label: 'Legal',
    question: 'Is this SEBI-regulated?',
    answer: (
      <div>
        <p>Taurus Magnus is an information platform for unlisted and pre-IPO shares — not a stock exchange, broker, or investment adviser. We do not execute trades, hold client funds, or offer regulated investment services. All transactions are private, bilateral arrangements between buyers and sellers. Investors should seek independent financial and legal advice before transacting.</p>
        <p><strong>Capital gains tax at a glance:</strong></p>
        <ul>
          <li><strong>Short-Term Capital Gains:</strong> Shares held for 36 months or less are taxed at your applicable income tax slab rate.</li>
          <li><strong>Long-Term Capital Gains:</strong> Shares held for more than 36 months are taxed at 20% with the benefit of indexation (cost inflation index) to adjust the purchase cost for inflation.</li>
        </ul>
      </div>
    ),
  },
]

const TRUST_CARDS = [
  {
    id: 'research',
    title: 'Research-driven',
    desc: 'Every listing is verified with official MCA filings, audited financials, and direct management due diligence.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="11.5" cy="14.5" r="2.5" />
        <path d="M13.5 16.5L16 19" />
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Bank-level security',
    desc: 'Demat-to-demat settlement via CDSL/NSDL with end-to-end data encryption and documented audit trails.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="11" width="6" height="4" rx="1" />
        <path d="M10 11V9a2 2 0 0 1 4 0v2" />
      </svg>
    ),
  },
  {
    id: 'ticket',
    title: 'Low ticket size',
    desc: 'Accessible lot sizes allow retail & HNI investors to build diversified pre-IPO portfolios without large minimums.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    ),
  },
  {
    id: 'value',
    title: 'Transparent pricing',
    desc: 'Indicative price discovery based on real secondary market trades, with zero hidden markups or brokerage fees.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 6v12" />
      </svg>
    ),
  },
  {
    id: 'personal',
    title: 'Personal follow-up',
    desc: 'Dedicated private-market relationship managers guide you from enquiry to demat credit — no bots or queues.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const TrustCard = ({ card, index }) => {
  return (
    <article
      className="hts-card"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="hts-card-shimmer" aria-hidden="true" />
      <div className="hts-icon" aria-hidden="true">{card.icon}</div>
      <h3 className="hts-title">{card.title}</h3>
      <p className="hts-desc">{card.desc}</p>
      <div className="hts-card-line" aria-hidden="true" />
    </article>
  )
}

const TrustSection = () => {
  const [visible, setVisible] = useState(true)
  const ref = useRef(null)
  useEffect(() => {
    setVisible(true)
  }, [])
  return (
    <section
      ref={ref}
      className={`hts-section${visible ? ' hts-section--visible' : ''}`}
      aria-labelledby="trust-heading"
    >
      <div className="hts-header">
        <p className="home-eyebrow">Why trust us</p>
        <h2 id="trust-heading" className="home-section-title">Research you can rely on</h2>
        <p className="hts-sub">Documented research, institutional diligence, and transparent private-market data.</p>
      </div>
      <div className="hts-grid">
        {TRUST_CARDS.map((card, i) => (
          <TrustCard key={card.id} card={card} index={i} />
        ))}
      </div>
    </section>
  )
}

const Home = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [faqOpen, setFaqOpen] = useState(-1)
  const [pmOpen, setPmOpen] = useState(null)
  const [topSellingCompanies, setTopSellingCompanies] = useState([])
  const [drhpCompanies, setDrhpCompanies] = useState([])
  const [events, setEvents] = useState([])
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/companies', { params: { limit: PREVIEW_LIMIT } })
        if (!cancelled) {
          setCompanies(res.data || [])
        }
      } catch (err) {
        if (!cancelled) setCompanies([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [topSellingRes, drhpRes, eventsRes, blogsRes] = await Promise.all([
          api.get('/companies/top-selling'),
          api.get('/companies/drhp-filed', { params: { limit: 9 } }),
          api.get('/events'),
          api.get('/blogs', { params: { limit: 4 } })
        ])
        if (!cancelled) {
          setTopSellingCompanies(topSellingRes.data || [])
          setDrhpCompanies(drhpRes.data || [])
          setEvents(eventsRes.data || [])
          if (Array.isArray(blogsRes.data)) {
            setBlogs(blogsRes.data)
          } else {
            setBlogs([])
          }
        }
      } catch {
        if (!cancelled) {
          setTopSellingCompanies([])
          setDrhpCompanies([])
          setEvents([])
          setBlogs([])
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const visible = useMemo(() => {
    return companies.slice(0, PREVIEW_LIMIT)
  }, [companies])

  const displayedTopSelling = useMemo(() => {
    return (topSellingCompanies || []).slice(0, 9)
  }, [topSellingCompanies])

  const displayedDrhp = useMemo(() => {
    return (drhpCompanies || []).slice(0, 9)
  }, [drhpCompanies])

  const renderShowcaseCard = (c, idx, isDrhpSection = false) => {
    const logoSrc = buildLogoSrc(c.logoUrl)
    const initial = c.name ? c.name.charAt(0).toUpperCase() : '?'
    const change = c.changePct != null ? Number(c.changePct) : null
    const isPositive = change == null || change >= 0
    const targetUrl = c._id ? `/company/${c._id}` : '/catalog'

    return (
      <Link
        to={targetUrl}
        key={c._id || `showcase-${isDrhpSection ? 'drhp' : 'top'}-${idx}`}
        className="home-showcase-card"
        aria-label={`View ${c.name} details`}
      >
        <div className="home-showcase-card-top">
          <div className="home-showcase-card-identity">
            <div className="home-showcase-card-logo">
              {logoSrc ? (
                <img src={logoSrc} alt={`${c.name} logo`} />
              ) : (
                <span className="logo-placeholder small">{initial}</span>
              )}
            </div>
            <div className="home-showcase-card-title-wrap">
              <h3 className="home-showcase-card-name" title={c.name}>{c.name}</h3>
              {c.sector && <span className="home-showcase-card-sector">{c.sector}</span>}
            </div>
          </div>
          {isDrhpSection && (
            <span className="home-showcase-badge-drhp">DRHP FILED</span>
          )}
        </div>

        <div className="home-showcase-card-mid">
          <div className="home-showcase-price-block">
            <span className="home-showcase-price-label">Indicative Price</span>
            <span className="home-showcase-price">
              {c.latestPrice != null ? formatINR(c.latestPrice) : '—'}
            </span>
          </div>
          {change != null ? (
            <span className={`home-showcase-delta ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '▲ +' : '▼ '}{Math.abs(change).toFixed(2)}%
            </span>
          ) : (
            <span className="home-showcase-lot-info">
              {c.lotSize ? `Lot: ${c.lotSize} shs` : 'Unlisted'}
            </span>
          )}
        </div>

        <div className="home-showcase-card-footer">
          <span className="home-showcase-lot-info">
            {isDrhpSection && c.drhpFiledDate
              ? `Filed: ${formatShortDate(c.drhpFiledDate)}`
              : (c.lotSize ? `Min. Lot: ${c.lotSize} shs` : 'Dematerialised')}
          </span>
          <span className="home-showcase-view-btn">
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    )
  }

  const [ffHover, setFfHover] = useState(null)
  const ffArenaRef = useRef(null)


  const toggleFaq = (index) => {
    setFaqOpen(prev => prev === index ? -1 : index)
  }

  const togglePm = (key) => {
    setPmOpen(prev => (prev === key ? null : key))
  }

  return (
    <div className="home-page-wrap">
      <Navbar />
      <ComplianceRibbon />
      <main className="home-page-main">
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-content">
              <p className="home-eyebrow">Unlisted & Pre-IPO Shares</p>
              <h1 className="home-hero-headline">
                <span className="word">Own</span>{' '}
                <span className="word">tomorrow's</span>{' '}
                <span className="word">listed</span>{' '}
                <span className="word">companies,</span>{' '}
                <span className="word">today.</span>
              </h1>
              <p className="home-hero-body">
                Taurus Magnus is an independent research and information platform designed to bring transparency
                to India&apos;s unlisted and pre-IPO equity markets. We empower forward-looking investors with
                documented fundamentals, verified corporate filings, and indicative price discovery — making
                private-market opportunities accessible, transparent, and structured.
              </p>
              <Link to="/catalog" className="home-hero-cta">Browse the price list</Link>
            </div>
            <HeroPriceChart />
          </div>
        </section>

        <section className="home-marquee-section" aria-label="Live catalog ticker">
          <div className="home-marquee-header">
            <div>
              <p className="home-eyebrow">Live Catalog</p>
              <h2 className="home-section-title">Featured Unlisted Shares</h2>
            </div>
            <Link to="/catalog" className="home-marquee-cta">View Full Price List →</Link>
          </div>
          <div className="home-marquee-track" role="region" aria-label="Scrolling company cards">
            <div className="home-marquee-content">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="home-marquee-card skeleton" />
                ))
              ) : visible.length === 0 ? (
                <div className="home-marquee-empty">No listings match your search.</div>
              ) : (
                [...visible, ...visible].map((c, i) => (
                  <Link
                    to={c._id ? `/company/${c._id}` : '/catalog'}
                    key={`${c._id || 'card'}-${i}`}
                    className="home-marquee-card"
                    aria-label={`View ${c.name} details`}
                  >
                    <div className="home-marquee-card-top">
                      <h3 className="home-marquee-card-name">{c.name}</h3>
                      {c.sector && <span className="home-marquee-card-sector">{c.sector}</span>}
                    </div>
                    <div className="home-marquee-card-mid">
                      <span className="home-marquee-card-price-label">Indicative Price</span>
                      <span className="home-marquee-card-price mono">{formatINR(c.latestPrice)}</span>
                    </div>
                    {(c.high52 != null && c.low52 != null && c.priceHistory && c.priceHistory.length >= 2) && (
                      <div className="home-marquee-card-delta">
                        {(() => {
                          const history = c.priceHistory
                          const last = history[history.length - 1].price
                          const prev = history[history.length - 2].price
                          const diff = last - prev
                          const pct = prev ? ((diff / prev) * 100).toFixed(2) : 0
                          const isPositive = diff >= 0
                          return (
                            <span className={`home-marquee-delta ${isPositive ? 'positive' : 'negative'}`}>
                              {isPositive ? '▲' : '▼'} {Math.abs(pct)}%
                            </span>
                          )
                        })()}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>



        <section
          className="ff-section"
          aria-labelledby="ff-heading"
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target.closest('.ff-section') === e.currentTarget && !e.target.closest('.ff-diamond') && !e.target.closest('.ff-expanded-panel')) {
              setPmOpen(null)
            }
          }}
        >
          <div className="home-section-header">
            <h2 id="ff-heading" className="home-section-title">Let's talk about private markets</h2>
          </div>

          {/* Diamond arrangement */}
          <div className="ff-arena" role="list" ref={ffArenaRef}>
            {PM_CARDS.map((card) => {
              const isActive = pmOpen === card.key
              const isDimmed = pmOpen !== null && !isActive
              const isHovered = ffHover === card.key && pmOpen === null
              return (
                <button
                  key={card.key}
                  type="button"
                  role="listitem"
                  className={[
                    'ff-diamond',
                    `ff-diamond--${card.key}`,
                    isActive ? 'ff-diamond--active' : '',
                    isDimmed ? 'ff-diamond--dimmed' : '',
                    isHovered ? 'ff-diamond--hovered' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={(e) => { e.stopPropagation(); setPmOpen(prev => prev === card.key ? null : card.key) }}
                  onMouseEnter={() => !isActive && setFfHover(card.key)}
                  onMouseLeave={() => setFfHover(null)}
                  aria-expanded={isActive}
                  aria-label={card.label}
                >
                  <span className="ff-diamond-inner">
                    {isActive ? (
                      <>
                        <span className="ff-diamond-label-row">
                          <span className="ff-diamond-label">{card.label}</span>
                          <span className="ff-diamond-icon" aria-hidden="true">✕</span>
                        </span>
                        <span className="ff-diamond-expanded-content">
                          <span className="ff-diamond-exp-question">{card.question}</span>
                          <span className="ff-diamond-exp-body">{card.answer}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="ff-diamond-label">{card.label}</span>
                        <span className="ff-diamond-icon" aria-hidden="true">+</span>
                      </>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mobile fallback — stacked accordion list */}
          <div className="ff-mobile-list">
            {PM_CARDS.map((card) => {
              const isOpen = pmOpen === card.key
              return (
                <div key={card.key} className={`ff-mobile-card${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="ff-mobile-btn"
                    onClick={(e) => { e.stopPropagation(); setPmOpen(prev => prev === card.key ? null : card.key) }}
                    aria-expanded={isOpen}
                  >
                    <span className="ff-mobile-btn-label">{card.label}</span>
                    <span className="ff-mobile-btn-icon" aria-hidden="true">{isOpen ? '✕' : '+'}</span>
                  </button>
                  <div className="ff-mobile-answer" aria-hidden={!isOpen}>
                    <h3 className="ff-mobile-question">{card.question}</h3>
                    <div className="ff-mobile-body">{card.answer}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <TrustSection />

        {/* Issue #5: Top Selling Shares 3x3 Grid (9 Shares) */}
        <section className="home-showcase-section home-top-selling-section" aria-labelledby="top-selling-heading">
          <div className="home-section-header">
            <div>
              <p className="home-eyebrow">MARKET DEMAND</p>
              <h2 id="top-selling-heading" className="home-section-title">Top Selling Shares</h2>
              <p className="home-section-sub">
                High-conviction unlisted companies with active secondary trading volumes and strong investor interest.
              </p>
            </div>
            <Link to="/catalog" className="home-marquee-cta">Explore all shares →</Link>
          </div>
          <div className="home-showcase-grid-3x3">
            {displayedTopSelling.length === 0 ? (
              <div className="chart-empty" style={{ gridColumn: '1 / -1' }}>No top selling shares available right now.</div>
            ) : (
              displayedTopSelling.map((c, idx) => renderShowcaseCard(c, idx, false))
            )}
          </div>
        </section>

        {/* Issue #5: DRHP Filed Shares 3x3 Grid (9 Shares) */}
        <section className="home-showcase-section home-drhp-section" aria-labelledby="drhp-heading">
          <div className="home-section-header">
            <div>
              <p className="home-eyebrow">IPO WATCH</p>
              <h2 id="drhp-heading" className="home-section-title">DRHP Filed Shares</h2>
              <p className="home-section-sub">
                Unlisted companies that have filed a Draft Red Herring Prospectus with SEBI — an early milestone toward an IPO.
              </p>
            </div>
            <Link to="/drhp-filed" className="home-marquee-cta">View all DRHP filed shares →</Link>
          </div>
          <div className="home-showcase-grid-3x3">
            {displayedDrhp.length === 0 ? (
              <div className="chart-empty" style={{ gridColumn: '1 / -1' }}>No DRHP-filed shares available right now.</div>
            ) : (
              displayedDrhp.map((c, idx) => renderShowcaseCard(c, idx, true))
            )}
          </div>
        </section>

        <section className="home-events-section" aria-labelledby="events-heading">
          <div className="home-section-header">
            <div>
              <p className="home-eyebrow">CORPORATE ACTIONS</p>
              <h2 id="events-heading" className="home-section-title">Events</h2>
              <p className="home-section-sub">
                Latest DRHP filings, leadership changes, and corporate milestones.
              </p>
            </div>
            <Link to="/events" className="home-marquee-cta">View all events →</Link>
          </div>
          {events.length === 0 ? (
            <div className="chart-empty">No events have been published yet.</div>
          ) : (
            <div className="home-events-list">
              {events.slice(0, 8).map((ev) => (
                <div className="home-event-card" key={ev._id}>
                  <div className="home-event-card-head">
                    <span className={`event-tag ${eventTypeClass(ev.eventType)}`}>{ev.eventType}</span>
                    <span className="event-date">{formatShortDate(ev.eventDate)}</span>
                  </div>
                  <h3 className="home-event-title">{ev.title}</h3>
                  {ev.description && <p className="home-event-desc">{ev.description}</p>}
                  {ev.company && (
                    <div className="home-event-company">
                      <Link to={`/company/${ev.company._id}`}>
                        🏢 {ev.company.name}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {blogs.length > 0 && (
          <section className="home-insights-section" aria-labelledby="insights-heading">
            <div className="home-section-header">
              <div>
                <p className="home-eyebrow">RESEARCH & ANALYSIS</p>
                <h2 id="insights-heading" className="home-section-title">Market Insights</h2>
              </div>
              <Link to="/insights" className="home-marquee-cta">View all insights →</Link>
            </div>
            <div className="home-insights-grid">
              {blogs.slice(0, 4).map((blog) => {
                const blogKey = blog._id || blog.id || blog.slug
                return (
                  <article key={blogKey} className="home-insight-card">
                    <div className="home-insight-badge-row">
                      <span className="home-insight-tag">{blog.category}</span>
                      <span className="home-insight-time">{blog.readTime || '5 min read'}</span>
                    </div>
                    <h3 className="home-insight-title">
                      <Link to={`/insights/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <p className="home-insight-excerpt">{blog.excerpt}</p>
                    <div className="home-insight-footer">
                      <span className="home-insight-author">{blog.author || 'RA Research Desk'}</span>
                      <Link to={`/insights/${blog.slug}`} className="home-insight-link">Read analysis →</Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <section className="home-faq-section" aria-labelledby="faq-heading">
          <div className="home-faq-header">
            <p className="home-eyebrow">Need to know</p>
            <h2 id="faq-heading" className="home-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="home-faq-grid">
            {[
              { q: 'What are unlisted shares?', a: 'Unlisted shares are equity shares of a company that are not listed on a recognised stock exchange (such as NSE or BSE). They are typically held by promoters, early investors, employees, or private equity funds. Transactions occur privately, often through intermediaries, and prices are negotiated rather than discovered on a public order book.' },
              { q: "Why buy before a company's IPO?", a: 'Investing before an IPO can provide access to companies at earlier growth stages, often at lower valuations than the eventual public offering price. However, it carries higher illiquidity risk, longer holding periods, and less regulatory oversight. Investors should assess their risk tolerance and investment horizon carefully.' },
              { q: 'How does a purchase actually work?', a: 'Browse the price list, shortlist companies, and tap Enquire on any listing. Our team responds personally on WhatsApp or email within one business day with current availability, lot size, and next steps. Once terms are agreed, shares are transferred via demat-to-demat transfer with full documentation.' },
              { q: 'Is this SEBI-regulated?', a: 'Taurus Magnus is an information platform for unlisted and pre-IPO shares — not a stock exchange, broker, or investment adviser. We do not execute trades, hold client funds, or offer regulated investment services. All transactions are private, bilateral arrangements between buyers and sellers. Investors should seek independent financial and legal advice before transacting.' },
            ].map((item, i) => (
              <article
                key={i}
                className={`home-faq-card${faqOpen === i ? ' home-faq-card--open' : ''}`}
              >
                <button
                  type="button"
                  className="home-faq-question"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={faqOpen === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className="home-faq-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="home-faq-q-text">{item.q}</span>
                  <span className="home-faq-chevron" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div id={`faq-answer-${i}`} className="home-faq-answer" role="region" aria-hidden={faqOpen !== i}>
                  <p>{item.a}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Home