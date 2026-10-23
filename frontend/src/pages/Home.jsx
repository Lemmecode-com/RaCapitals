import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import EnquireButton from '../components/common/EnquireButton'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

import { formatINR, formatShortDate } from '../utils/format'
import { MOCK_BLOGS } from '../data/mockBlogs'

const PREVIEW_LIMIT = 12
const MARQUEE_DURATION = 22

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
    desc: 'Every listing is backed by documented due diligence and direct verification with company management.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Bank-level security',
    desc: 'Data encrypted in transit and at rest. Demat-to-demat transfers with full audit trails.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: 'ticket',
    title: 'Low ticket size',
    desc: 'Accessible lot sizes let you build a diversified pre-IPO portfolio without outsized capital.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'personal',
    title: 'Personal follow-up',
    desc: 'Every enquiry is handled by a person on our team — no ticket queues, no auto-replies.',
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
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
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
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
        <p className="hts-sub">Five years of offline deal-making, now transparent and online.</p>
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
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')
  const [faqOpen, setFaqOpen] = useState(-1)
  const [pmOpen, setPmOpen] = useState(null)
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
        const [drhpRes, eventsRes, blogsRes] = await Promise.all([
          api.get('/companies/drhp-filed'),
          api.get('/events'),
          api.get('/blogs', { params: { limit: 3 } })
        ])
        if (!cancelled) {
          setDrhpCompanies(drhpRes.data || [])
          setEvents(eventsRes.data || [])
          if (Array.isArray(blogsRes.data) && blogsRes.data.length > 0) {
            setBlogs(blogsRes.data)
          } else {
            setBlogs(MOCK_BLOGS.slice(0, 3))
          }
        }
      } catch {
        if (!cancelled) {
          setDrhpCompanies([])
          setEvents([])
          setBlogs(MOCK_BLOGS.slice(0, 3))
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const sectorsAvailable = useMemo(() => {
    const set = new Set()
    companies.forEach((c) => { if (c.sector) set.add(c.sector) })
    return ['All', ...Array.from(set).sort()]
  }, [companies])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return companies
      .filter((c) => sector === 'All' || c.sector === sector)
      .filter((c) => !q || (c.name || '').toLowerCase().includes(q))
      .slice(0, PREVIEW_LIMIT)
  }, [companies, sector, search])

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
                Taurus Magnus has spent the last five years helping investors access unlisted and pre-IPO equity
                through an offline network built on trust, diligence, and direct relationships. This platform
                brings that research and access online — clearly, transparently, and without the noise of a
                live trading terminal.
              </p>
              <Link to="/catalog" className="home-hero-cta">Browse the price list</Link>
            </div>
            <div className="home-hero-chart-card" aria-label="Indicative price chart">
              <div className="home-hero-chart-header">
                <span className="home-hero-chart-sub">Indicative Price History</span>
                <span className="home-hero-chart-live">
                  <span className="home-hero-chart-dot" />
                  Live Feed
                </span>
              </div>
              <div className="home-hero-chart-price-row">
                <span className="home-hero-chart-current-price">₹5.75</span>
                <span className="home-hero-chart-gain">▲ +310.71% <span>over Max</span></span>
              </div>
              <div className="home-hero-chart-wrapper">
                <svg className="home-hero-chart-svg" viewBox="0 0 500 220" preserveAspectRatio="none" role="img" aria-label="Upward trending price chart with volume bars">
                  <defs>
                    <linearGradient id="hero-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line className="hero-grid-line" x1="0" y1="50" x2="500" y2="50" />
                  <line className="hero-grid-line" x1="0" y1="110" x2="500" y2="110" />
                  <line className="hero-grid-line" x1="0" y1="170" x2="500" y2="170" />
                  <g className="hero-volume-bars">
                    <rect x="12" y="180" width="16" height="45" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="52" y="165" width="16" height="60" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="92" y="150" width="16" height="75" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="132" y="170" width="16" height="55" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="172" y="130" width="16" height="95" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="212" y="160" width="16" height="65" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="252" y="140" width="16" height="85" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="292" y="115" width="16" height="110" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="332" y="155" width="16" height="70" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="372" y="100" width="16" height="125" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="412" y="80" width="16" height="145" rx="3" fill="#2563eb" opacity="0.12" />
                    <rect x="452" y="45" width="16" height="180" rx="3" fill="#2563eb" opacity="0.12" />
                  </g>
                  <line className="hero-chart-ref-line" x1="20" y1="225" x2="20" y2="209" />
                  <path className="hero-chart-area" d="M 20,209 L 43,209 L 66,207 L 90,207 L 113,207 L 136,205 L 159,202 L 182,198 L 205,88 L 228,143 L 251,176 L 274,121 L 297,172 L 320,128 L 343,187 L 367,154 L 390,128 L 413,99 L 436,114 L 459,88 L 459,225 L 20,225 Z" fill="url(#hero-blue-gradient)" />
                  <path className="hero-chart-line" d="M 20,209 L 43,209 L 66,207 L 90,207 L 113,207 L 136,205 L 159,202 L 182,198 L 205,88 L 228,143 L 251,176 L 274,121 L 297,172 L 320,128 L 343,187 L 367,154 L 390,128 L 413,99 L 436,114 L 459,88" />
                </svg>
                <div className="hero-chart-tooltip" role="status" aria-label="Sample price point">₹1.19 · Apr 2022</div>
              </div>
              <div className="home-hero-chart-controls">
                <div className="home-timeframe-group">
                  <button className="home-tf-btn">1M</button>
                  <button className="home-tf-btn">6M</button>
                  <button className="home-tf-btn">1Y</button>
                  <button className="home-tf-btn">3Y</button>
                  <button className="home-tf-btn active">MAX</button>
                </div>
              </div>
            </div>
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
                  <article key={`${c._id}-${i}`} className="home-marquee-card">
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
                  </article>
                ))
              )}
            </div>
          </div>
          <style jsx>{`
            .home-marquee-track {
              overflow: hidden;
              position: relative;
            }
            .home-marquee-content {
              display: flex;
              gap: 1rem;
              animation: marqueeScroll ${MARQUEE_DURATION}s linear infinite;
              width: max-content;
            }
            @keyframes marqueeScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
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

        <section className="home-drhp-section" aria-labelledby="drhp-heading">
          <div className="home-section-header">
            <h2 id="drhp-heading" className="home-section-title">DRHP Filed</h2>
            <Link to="/drhp-filed" className="home-marquee-cta">View all →</Link>
          </div>
          <div className="home-drhp-grid">
            {drhpCompanies.length === 0 ? (
              <div className="chart-empty">No companies have filed a DRHP yet.</div>
            ) : (
              drhpCompanies.slice(0, 4).map((c) => (
                <Link to={`/company/${c._id}`} key={c._id} className="home-drhp-card">
                  <div className="home-drhp-card-head">
                    <h3 className="home-drhp-card-name">{c.name}</h3>
                    {c.drhpFiled && <span className="drhp-badge">DRHP</span>}
                  </div>
                  <p className="home-drhp-card-sector">{c.sector || '—'}</p>
                  <div className="home-drhp-card-foot">
                    <span className="home-drhp-card-price">
                      {c.latestPrice != null ? formatINR(c.latestPrice) : '—'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="home-events-section" aria-labelledby="events-heading">
          <div className="home-section-header">
            <h2 id="events-heading" className="home-section-title">Events</h2>
            <Link to="/events" className="home-marquee-cta">View all →</Link>
          </div>
          {events.length === 0 ? (
            <div className="chart-empty">No events have been published yet.</div>
          ) : (
            <div className="home-events-list">
              {events.slice(0, 5).map((ev) => (
                <div className="home-event-card" key={ev._id}>
                  <div className="home-event-card-head">
                    <span className={`event-tag ${eventTypeClass(ev.eventType)}`}>{ev.eventType}</span>
                    <span className="event-date">{formatShortDate(ev.eventDate)}</span>
                  </div>
                  <h3 className="home-event-title">{ev.title}</h3>
                  {ev.description && <p className="home-event-desc">{ev.description}</p>}
                  {ev.company && (
                    <p className="home-event-company">
                      Company: <Link to={`/company/${ev.company._id}`}>{ev.company.name}</Link>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="home-insights-section" aria-labelledby="insights-heading">
          <div className="home-section-header">
            <div>
              <p className="home-eyebrow">RESEARCH & ANALYSIS</p>
              <h2 id="insights-heading" className="home-section-title">Market Insights</h2>
            </div>
            <Link to="/insights" className="home-marquee-cta">View all insights →</Link>
          </div>
          <div className="home-insights-grid">
            {(blogs.length > 0 ? blogs : MOCK_BLOGS.slice(0, 3)).map((blog) => {
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