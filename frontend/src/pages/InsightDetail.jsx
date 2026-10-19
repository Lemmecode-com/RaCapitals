import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { MOCK_BLOGS } from '../data/mockBlogs'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { formatShortDate } from '../utils/format'

const InsightDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const blog = useMemo(() => {
    return MOCK_BLOGS.find((b) => b.slug === slug)
  }, [slug])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (blog) {
      document.title = `${blog.title} | Taurus Magnus Insights`
    } else {
      document.title = 'Insight Not Found | Taurus Magnus'
    }
  }, [blog])

  const relatedArticles = useMemo(() => {
    if (!blog) return []
    if (blog.relatedSlugs && blog.relatedSlugs.length > 0) {
      return MOCK_BLOGS.filter((b) => blog.relatedSlugs.includes(b.slug))
    }
    return MOCK_BLOGS.filter((b) => b.id !== blog.id && b.category === blog.category).slice(0, 2)
  }, [blog])

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

  if (!blog) {
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

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />

      <main className="page-main insight-detail-page">
        {/* Navigation / Breadcrumb Row */}
        <div className="insight-top-bar">
          <Link to="/insights" className="insight-back-link">
            <span>←</span> All Market Insights
          </Link>
          <div className="insight-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/insights">Insights</Link>
            <span>/</span>
            <span className="current">{blog.category}</span>
          </div>
        </div>

        {/* Article Header */}
        <article className="insight-article-container">
          <header className="insight-article-header">
            <div className="insight-article-badge-row">
              <span className="insight-cat-tag">{blog.category}</span>
              <span className="insight-read-badge">⏱ {blog.readTime}</span>
              <span className="insight-date-badge">📅 {formatShortDate(blog.publishedDate)}</span>
            </div>

            <h1 className="insight-article-title">{blog.title}</h1>
            <p className="insight-article-subtitle">{blog.subtitle}</p>

            <div className="insight-author-bar">
              <div className="insight-author-left">
                <div className="insight-author-avatar-large">
                  {blog.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="insight-author-fullname">{blog.author}</div>
                  <div className="insight-author-role-sub">{blog.authorRole}</div>
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
          <div className="insight-cover-image-box">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="insight-cover-img"
            />
            <div className="insight-cover-caption">
              Source: Taurus Magnus Private Markets Intelligence & Financial Filings
            </div>
          </div>

          {/* Article HTML Content */}
          <div
            className="insight-article-body"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />

          {/* Tags */}
          <div className="insight-tags-row">
            <span className="insight-tags-label">Topics:</span>
            {blog.tags.map((t) => (
              <span key={t} className="insight-tag-chip">#{t}</span>
            ))}
          </div>

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
              {relatedArticles.map((rel) => (
                <div key={rel.id} className="insight-related-card">
                  <div className="insight-related-meta">
                    <span className="insight-related-cat">{rel.category}</span>
                    <span>•</span>
                    <span>{rel.readTime}</span>
                  </div>
                  <h4 className="insight-related-title">
                    <Link to={`/insights/${rel.slug}`}>{rel.title}</Link>
                  </h4>
                  <p className="insight-related-excerpt">{rel.excerpt}</p>
                  <Link to={`/insights/${rel.slug}`} className="insight-related-link">
                    Read article <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default InsightDetail
