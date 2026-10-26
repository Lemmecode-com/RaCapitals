import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { formatShortDate, apiBaseWithoutApi } from '../utils/format'

const resolveCoverSrc = (coverImage) => {
  if (!coverImage) return ''
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  return `${apiBaseWithoutApi()}${coverImage}`
}

const InsightDetail = () => {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [allBlogs, setAllBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    let isMounted = true
    setLoading(true)
    setNotFound(false)

    // Fetch the single article by slug
    api
      .get(`/blogs/${slug}`)
      .then((res) => {
        if (!isMounted) return
        if (res.data) {
          setBlog(res.data)
        } else {
          setNotFound(true)
        }
      })
      .catch((err) => {
        console.warn('API error fetching article by slug:', err)
        if (isMounted) setNotFound(true)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  // Fetch all blogs for related articles matching
  useEffect(() => {
    let isMounted = true
    api
      .get('/blogs')
      .then((res) => {
        if (!isMounted) return
        if (Array.isArray(res.data)) {
          setAllBlogs(res.data)
        } else {
          setAllBlogs([])
        }
      })
      .catch(() => {
        if (isMounted) setAllBlogs([])
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | Taurus Magnus Insights`
    } else if (notFound) {
      document.title = 'Insight Not Found | Taurus Magnus'
    }
  }, [blog, notFound])

  const relatedArticles = useMemo(() => {
    if (!blog || allBlogs.length === 0) return []

    if (blog.relatedSlugs && blog.relatedSlugs.length > 0) {
      const matched = allBlogs.filter((b) => blog.relatedSlugs.includes(b.slug))
      if (matched.length > 0) return matched
    }
    return allBlogs
      .filter((b) => b.slug !== blog.slug && b.category === blog.category)
      .slice(0, 2)
  }, [blog, allBlogs])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleWhatsAppEnquiry = () => {
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999'
    const message = `Hi Taurus Magnus team, I read your insight "${blog?.title}". I would like to enquire about availability and lot pricing for these unlisted shares.`
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleWhatsAppShare = () => {
    const text = `Read this insightful analysis on Taurus Magnus: "${blog?.title}"\n${window.location.href}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <Navbar />
        <ComplianceRibbon />
        <main className="page-main insight-detail-page">
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>⏳ Loading article…</div>
            <p style={{ fontSize: '0.95rem' }}>Preparing full research report & financial disclosures</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !blog) {
    return (
      <div className="page-wrap">
        <Navbar />
        <ComplianceRibbon />
        <main className="page-main insight-detail-page">
          <div className="insight-not-found">
            <h2>Insight Article Not Found</h2>
            <p>The market insight you are looking for does not exist or may have been relocated.</p>
            <Link to="/insights" className="back-pill">← Back to All Insights</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const authorInitials = (blog.author || 'RA')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />

      <main className="page-main insight-detail-page">
        {/* Navigation Row */}
        <div className="insight-top-bar">
          <Link to="/insights" className="insight-back-link">
            <span>←</span> All Market Insights
          </Link>
        </div>

        {/* Article Header */}
        <article className="insight-article-container">
          <header className="insight-article-header">
            <div className="insight-article-badge-row">
              <span className="insight-cat-tag">{blog.category}</span>
              <span className="insight-read-badge">⏱ {blog.readTime || '5 min read'}</span>
              <span className="insight-date-badge">📅 {formatShortDate(blog.publishedDate)}</span>
            </div>

            <h1 className="insight-article-title">{blog.title}</h1>
            {blog.subtitle && <p className="insight-article-subtitle">{blog.subtitle}</p>}

            <div className="insight-author-bar">
              <div className="insight-author-left">
                <div className="insight-author-avatar-large">
                  {authorInitials}
                </div>
                <div>
                  <div className="insight-author-fullname">{blog.author || 'RA Research Desk'}</div>
                  <div className="insight-author-role-sub">{blog.authorRole || 'Equity & Private Markets Analyst'}</div>
                </div>
              </div>

              <div className="insight-share-actions">
                <button
                  type="button"
                  className="insight-share-btn"
                  onClick={handleShare}
                  title="Copy link to clipboard"
                >
                  {copied ? '✓ Copied' : '🔗 Copy Link'}
                </button>
                <button
                  type="button"
                  className="insight-wa-share-btn"
                  onClick={handleWhatsAppShare}
                  title="Share on WhatsApp"
                >
                  💬 Share
                </button>
              </div>
            </div>
          </header>

          {/* Featured Cover Image */}
          {blog.coverImage && (
            <div className="insight-cover-image-box">
              <img
                src={resolveCoverSrc(blog.coverImage)}
                alt={blog.title}
                className="insight-cover-img"
              />
              <div className="insight-cover-caption">
                Source: Taurus Magnus Private Markets Intelligence & Financial Filings
              </div>
            </div>
          )}

          {/* Article HTML Content */}
          <div
            className="insight-article-body"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />

          {/* Tags */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="insight-tags-row">
              <span className="insight-tags-label">Topics:</span>
              {blog.tags.map((t) => (
                <span key={t} className="insight-tag-chip">#{t}</span>
              ))}
            </div>
          )}

          {/* High-Converting WhatsApp CTA Box */}
          <section className="insight-cta-box">
            <div className="insight-cta-accent-icon">✦</div>
            <div className="insight-cta-text">
              <h3>Interested in unlisted shares of this company?</h3>
              <p>
                Our private market desk facilitates direct demat-to-demat off-market transfers with transparent pricing, verified ISINs, and full compliance support.
              </p>
              <div className="insight-cta-features">
                <span>✓ Verified Demat Settlement</span>
                <span>✓ Direct Counterparty Matching</span>
                <span>✓ Transparent Lot Sizes</span>
              </div>
            </div>
            <div className="insight-cta-btn-wrap">
              <button
                type="button"
                className="insight-cta-whatsapp-btn"
                onClick={handleWhatsAppEnquiry}
              >
                <span>💬</span> Enquire on WhatsApp
              </button>
              <p className="insight-cta-note">Instant response on business days</p>
            </div>
          </section>

          {/* SEBI Compliance & Risk Disclaimer */}
          <div className="insight-disclaimer-box">
            <strong>Disclaimer:</strong> This article is published solely for educational and informational purposes and does not constitute financial advice, investment endorsement, or an offer to buy or sell securities. Unlisted equity shares carry illiquidity risk and are not traded on a stock exchange order book. Investors should conduct independent due diligence or consult a registered investment advisor.
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="insight-related-section">
            <div className="insight-related-header">
              <h2>Related Research & Insights</h2>
              <Link to="/insights" className="insight-related-all-link">
                View all articles →
              </Link>
            </div>

            <div className="insight-related-grid">
              {relatedArticles.map((rel) => {
                const relKey = rel._id || rel.id || rel.slug
                return (
                  <div key={relKey} className="insight-related-card">
                    <div className="insight-related-meta">
                      <span className="insight-related-cat">{rel.category}</span>
                      <span>•</span>
                      <span>{rel.readTime || '5 min read'}</span>
                    </div>
                    <h4 className="insight-related-title">
                      <Link to={`/insights/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="insight-related-excerpt">{rel.excerpt}</p>
                    <Link to={`/insights/${rel.slug}`} className="insight-related-link">
                      Read article <span>→</span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default InsightDetail
