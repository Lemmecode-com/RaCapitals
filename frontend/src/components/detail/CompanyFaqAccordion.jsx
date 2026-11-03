import { useState } from 'react'

const CompanyFaqAccordion = ({ companyName }) => {
  const [openIdx, setOpenIdx] = useState(0)

  const faqs = [
    {
      q: `How do I purchase unlisted shares of ${companyName || 'this company'}?`,
      a: 'The process is completely digital and compliant. 1) Submit your purchase enquiry with desired quantity. 2) Our desk confirms real-time inventory and frozen block price. 3) You provide your Demat Client Master Report (CMR) copy and complete payment via bank transfer. 4) Shares are credited directly to your CDSL/NSDL Demat account within 24-48 business hours.'
    },
    {
      q: 'How are unlisted shares delivered to my Demat account?',
      a: 'Unlisted shares are transferred off-market via CDSL/NSDL Delivery Instruction Slip (DIS) or speed-e electronic transfer directly into your Demat account (Zerodha, Groww, AngelOne, ICICI Direct, HDFC Sky, etc.). You can view them in your portfolio holdings statement under the assigned ISIN.'
    },
    {
      q: 'What is the lock-in period once the company files for IPO and lists?',
      a: 'Under current SEBI (Issue of Capital and Disclosure Requirements) regulations, all pre-IPO equity shares held by non-promoter shareholders are subject to a mandatory 6-month lock-in period starting from the listing date on NSE/BSE. After 6 months, shares become freely tradeable on the stock exchange.'
    },
    {
      q: 'What are the capital gains tax rules for unlisted shares in India?',
      a: 'Under the Indian Income Tax Act, if unlisted shares are held for more than 24 months, gains are classified as Long-Term Capital Gains (LTCG) and taxed at 12.5% (post-July 2024 budget revision). If held for 24 months or less, gains are treated as Short-Term Capital Gains (STCG) and taxed at your applicable individual income tax slab rates.'
    },
    {
      q: 'Can I sell my unlisted shares before the company goes public?',
      a: 'Yes. You are not forced to hold until the IPO. Taurus Magnus operates an active secondary OTC unlisted desk and can help you liquidate your position anytime based on prevailing market demand and counterparty interest.'
    },
    {
      q: 'What is the minimum transaction ticket size?',
      a: 'Minimum investment is determined by the minimum lot size (e.g. 50 shares) multiplied by the prevailing indicative share price, generally starting from ₹25,000 to ₹1,00,000 depending on the script.'
    }
  ]

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx)
  }

  return (
    <div className="detail-tab-pane">
      <div className="section-header-row" style={{ marginBottom: '1.25rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Frequently Asked Questions & Investor Due Diligence</h2>
        <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
          Key regulatory guidelines, demat delivery mechanics, lock-in rules, and taxation overview.
        </p>
      </div>

      <div className="faq-accordion-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className={`faq-item-card ${isOpen ? 'open' : ''}`}
              style={{
                background: 'var(--surface-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.94rem',
                  color: isOpen ? 'var(--navy)' : 'var(--text-primary)',
                  gap: '1rem'
                }}
              >
                <span>{faq.q}</span>
                <span style={{ fontSize: '1.1rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--brass)' }}>
                  ▼
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 1.25rem 1.15rem 1.25rem', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-secondary, #475569)', borderTop: '1px solid var(--border-subtle, #F1F5F9)', paddingTop: '0.85rem' }}>
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CompanyFaqAccordion

