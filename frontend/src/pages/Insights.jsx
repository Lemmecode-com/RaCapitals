import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_BLOGS, BLOG_CATEGORIES } from '../data/mockBlogs'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { formatShortDate } from '../utils/format'

const Insights = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    document.title = 'Market Insights & Pre-IPO Research | Taurus Magnus'
  }, [])

  const filteredBlogs = useMemo(() => {
    return MOCK_BLOGS.filter((blog) => {
      const matchesCategory =
        selectedCategory === 'All' || blog.category === selectedCategory

      const matchesSearch =
        !searchQuery.trim() ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Featured blog (swiggy valuation analysis)
  const featuredBlog = useMemo(() => {
    if (selectedCategory !== 'All' || searchQuery.trim()) return null
    return MOCK_BLOGS.find((b) => b.featured) || MOCK_BLOGS[0]
  }, [selectedCategory, searchQuery])

  // Remaining articles
  const gridBlogs = useMemo(() => {
    if (!featuredBlog) return filteredBlogs
    return filteredBlogs.filter((b) => b.id !== featuredBlog.id)
  }, [filteredBlogs, featuredBlog])

  const categoryCounts = useMemo(() => {
    const counts = { All: MOCK_BLOGS.length }
    MOCK_BLOGS.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1
    })
    return counts
  }, [])

  const handleWhatsAppDesk = () => {
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999'
    const message = `Hi Taurus Magnus team, I was reading your Market Insights and would like to enquire about current pre-IPO opportunities.`
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />

      <main className="page-main insights-page">
        {/* Page Header */}
        <header className="insights-header">
          <div className="insights-badge">RESEARCH & MARKET INTELLIGENCE</div>
          <h1 className="insights-title">Unlisted & Pre-IPO Insights</h1>
          <p className="insights-subtitle">
            In-depth valuation analyses, Demat transfer guides, DRHP breakdowns, and regulatory updates curated for private equity investors.
          </p>

          {/* Search Bar */}
          <div className="insights-search-wrap">
            <div className="insights-search-box">
              <svg className="insights-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by topic, company (e.g. Swiggy, NSE), or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="insights-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="insights-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <nav className="insights-categories" aria-label="Filter insights by category">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`insights-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="insights-cat-count">{categoryCounts[cat] || 0}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Featured Spotlight Banner (when on All and no search) */}
        {featuredBlog && (
          <section className="insights-featured-section">
            <div className="insights-featured-badge-label">
              <span>★</span> FEATURED DEEP DIVE
            </div>
            <article className="insights-featured-card">
              <div className="insights-featured-image-wrap">
                <img
                  src={featuredBlog.coverImage}
                  alt={featuredBlog.title}
                  className="insights-featured-img"
                  loading="lazy"
                />
                <div className="insights-featured-overlay-pill">
                  {featuredBlog.category}
                </div>
              </div>

              <div className="insights-featured-body">
                <div className="insights-meta-row">
                  <span className="insights-meta-tag">{featuredBlog.category}</span>
                  <span className="insights-meta-divider">•</span>
                  <span className="insights-meta-time">{featuredBlog.readTime}</span>
                  <span className="insights-meta-divider">•</span>
                  <span className="insights-meta-date">{formatShortDate(featuredBlog.publishedDate)}</span>
                </div>

                <h2 className="insights-featured-title">
                  <Link to={`/insights/${featuredBlog.slug}`}>
                    {featuredBlog.title}
                  </Link>
                </h2>

                <p className="insights-featured-excerpt">
                  {featuredBlog.excerpt}
                </p>

                <div className="insights-featured-footer">
                  <div className="insights-author-info">
                    <div className="insights-author-avatar">RA</div>
                    <div>
                      <div className="insights-author-name">{featuredBlog.author}</div>
                      <div className="insights-author-role">{featuredBlog.authorRole}</div>
                    </div>
                  </div>

                  <Link to={`/insights/${featuredBlog.slug}`} className="insights-read-btn">
                    Read Analysis <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Articles Grid */}
        <section className="insights-grid-section">
          {filteredBlogs.length === 0 ? (
            <div className="insights-empty-state">
              <div className="insights-empty-icon">🔍</div>
              <h3>No insights found</h3>
              <p>We couldn't find any articles matching your search query "{searchQuery}".</p>
              <button
                type="button"
                className="insights-reset-btn"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="insights-cards-grid">
              {gridBlogs.map((blog) => (
                <article key={blog.id} className="insight-card">
                  <Link to={`/insights/${blog.slug}`} className="insight-card-media-link">
                    <div className="insight-card-img-wrap">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="insight-card-img"
                        loading="lazy"
                      />
                      <span className="insight-card-cat-badge">{blog.category}</span>
                    </div>
                  </Link>

                  <div className="insight-card-content">
                    <div className="insight-card-meta">
                      <span className="insight-card-time">{blog.readTime}</span>
                      <span className="insights-meta-divider">•</span>
                      <span className="insight-card-date">{formatShortDate(blog.publishedDate)}</span>
                    </div>

                    <h3 className="insight-card-title">
                      <Link to={`/insights/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="insight-card-excerpt">
                      {blog.excerpt}
                    </p>

                    <div className="insight-card-tags">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="insight-tag-pill">#{tag}</span>
                      ))}
                    </div>

                    <div className="insight-card-footer">
                      <div className="insight-card-author">
                        <span className="insight-author-name">{blog.author}</span>
                      </div>
                      <Link to={`/insights/${blog.slug}`} className="insight-card-link">
                        Read <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Advisory / WhatsApp Banner */}
        <section className="insights-advisory-banner">
          <div className="insights-advisory-content">
            <div className="insights-advisory-badge">INSTITUTIONAL & HNI ADVISORY</div>
            <h2>Looking to acquire shares in these pre-IPO counters?</h2>
            <p>
              Get verified lot sizes, current counterparty availability, and complete Demat transfer documentation guidance from our private markets desk.
            </p>
          </div>
          <button
            type="button"
            className="insights-advisory-cta"
            onClick={handleWhatsAppDesk}
          >
            <span>💬</span> Enquire on WhatsApp
          </button>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Insights
