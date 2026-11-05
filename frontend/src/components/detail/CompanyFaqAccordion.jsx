import { useState, useEffect } from 'react'
import api from '../../services/api'

const FALLBACK_FAQS = [
  {
    _id: 'fb-1',
    question: 'How do I purchase unlisted shares of {COMPANY_NAME}?',
    answer: 'The process is completely digital and compliant. 1) Submit your purchase enquiry with desired quantity. 2) Our desk confirms real-time inventory and frozen block price. 3) You provide your Demat Client Master Report (CMR) copy and complete payment via bank transfer. 4) Shares are credited directly to your CDSL/NSDL Demat account within 24-48 business hours.'
  },
  {
    _id: 'fb-2',
    question: 'How are unlisted shares delivered to my Demat account?',
    answer: 'Unlisted shares are transferred off-market via CDSL/NSDL Delivery Instruction Slip (DIS) or speed-e electronic transfer directly into your Demat account (Zerodha, Groww, AngelOne, ICICI Direct, HDFC Sky, etc.). You can view them in your portfolio holdings statement under the assigned ISIN.'
  },
  {
    _id: 'fb-3',
    question: 'What is the lock-in period once {COMPANY_NAME} files for IPO and lists?',
    answer: 'Under current SEBI (Issue of Capital and Disclosure Requirements) regulations, all pre-IPO equity shares held by non-promoter shareholders are subject to a mandatory 6-month lock-in period starting from the listing date on NSE/BSE. After 6 months, shares become freely tradeable on the stock exchange.'
  },
  {
    _id: 'fb-4',
    question: 'What are the capital gains tax rules for unlisted shares in India?',
    answer: 'Under the Indian Income Tax Act, if unlisted shares are held for more than 24 months, gains are classified as Long-Term Capital Gains (LTCG) and taxed at 12.5% (post-July 2024 budget revision). If held for 24 months or less, gains are treated as Short-Term Capital Gains (STCG) and taxed at your applicable individual income tax slab rates.'
  },
  {
    _id: 'fb-5',
    question: 'Can I sell my unlisted shares before {COMPANY_NAME} goes public?',
    answer: 'Yes. You are not forced to hold until the IPO. Taurus Magnus operates an active secondary OTC unlisted desk and can help you liquidate your position anytime based on prevailing market demand and counterparty interest.'
  },
  {
    _id: 'fb-6',
    question: 'What is the minimum transaction ticket size?',
    answer: 'Minimum investment is determined by the minimum lot size (e.g. 50 shares) multiplied by the prevailing indicative share price, generally starting from ₹25,000 to ₹1,00,000 depending on the script.'
  }
]

const CompanyFaqAccordion = ({ companyId, companyName }) => {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCustom, setIsCustom] = useState(false)
  const [openIdx, setOpenIdx] = useState(0)

  useEffect(() => {
    let isMounted = true

    const fetchFaqs = async () => {
      setLoading(true)
      try {
        if (companyId) {
          const res = await api.get(`/companies/${companyId}/faqs`)
          if (isMounted) {
            if (res.data?.faqs && res.data.faqs.length > 0) {
              setFaqs(res.data.faqs)
              setIsCustom(Boolean(res.data.isCustom))
            } else {
              setFaqs(FALLBACK_FAQS.map(f => ({
                ...f,
                question: f.question.replace(/\{COMPANY_NAME\}/g, companyName || 'this company'),
                answer: f.answer.replace(/\{COMPANY_NAME\}/g, companyName || 'this company')
              })))
              setIsCustom(false)
            }
          }
        } else {
          setFaqs(FALLBACK_FAQS.map(f => ({
            ...f,
            question: f.question.replace(/\{COMPANY_NAME\}/g, companyName || 'this company'),
            answer: f.answer.replace(/\{COMPANY_NAME\}/g, companyName || 'this company')
          })))
        }
      } catch (err) {
        if (isMounted) {
          // Graceful fallback to static standard questions
          setFaqs(FALLBACK_FAQS.map(f => ({
            ...f,
            question: f.question.replace(/\{COMPANY_NAME\}/g, companyName || 'this company'),
            answer: f.answer.replace(/\{COMPANY_NAME\}/g, companyName || 'this company')
          })))
          setIsCustom(false)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchFaqs()

    return () => { isMounted = false }
  }, [companyId, companyName])

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx)
  }

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Frequently Asked Questions & Investor Due Diligence</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Official guidelines, SEBI regulations, demat delivery mechanics, and share-specific transaction diligence.
          </p>
        </div>
        {isCustom && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            background: '#EFF6FF',
            color: '#1D4ED8',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            border: '1px solid #BFDBFE'
          }}>
            Company Verified Diligence
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ height: '56px', background: '#F3F4F6', borderRadius: '8px', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="chart-empty">No FAQs available for this company.</div>
      ) : (
        <div className="faq-accordion-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            const faqId = faq._id || `faq-${idx}`
            return (
              <div
                key={faqId}
                className={`faq-item-card ${isOpen ? 'open' : ''}`}
                style={{
                  background: 'var(--surface-card, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faqId}`}
                  id={`faq-btn-${faqId}`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.95rem 1.25rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary, #111827)',
                    fontWeight: 600,
                    fontSize: '0.93rem',
                    gap: '1rem'
                  }}
                >
                  <span style={{ flex: 1 }}>{faq.question}</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                      flexShrink: 0,
                      opacity: 0.6
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faqId}`}
                    role="region"
                    aria-labelledby={`faq-btn-${faqId}`}
                    className="faq-answer-content"
                    style={{
                      padding: '0 1.25rem 1rem 1.25rem',
                      color: 'var(--text-secondary, #4B5563)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      borderTop: '1px solid var(--border-light, #f3f4f6)',
                      paddingTop: '0.75rem'
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CompanyFaqAccordion
