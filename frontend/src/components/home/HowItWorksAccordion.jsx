import { useState } from 'react'
import useScrollReveal from '../../hooks/useScrollReveal'

const STEPS = [
  {
    num: '01',
    title: 'Discover a company',
    desc: 'Browse our indicative price list across sectors and shortlist opportunities that fit your thesis.',
  },
  {
    num: '02',
    title: 'Enquire, we follow up on WhatsApp',
    desc: 'Tap enquire on any listing. Our team responds personally with current availability and lot details.',
  },
  {
    num: '03',
    title: 'Shares reach your demat account',
    desc: 'Once confirmed, shares are transferred securely into your demat account with full documentation.',
  },
]

const HowItWorksAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0)
  const sectionRef = useScrollReveal()
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const handleCardClick = (i) => {
    if (isTouchDevice) {
      setOpenIndex((prev) => (prev === i ? -1 : i))
    }
  }

  return (
    <section className="how-it-works reveal" ref={sectionRef}>
      <h2 className="section-title">How it works</h2>
      <div className="accordion-bg">
        <div className="accordion-cards">
          {STEPS.map((step, i) => {
            const isOpen = openIndex === i
            return (
            <button
              key={i}
              type="button"
              className={`accordion-card ${isOpen ? 'accordion-card-open' : ''}`}
              onMouseEnter={() => !isTouchDevice && setOpenIndex(i)}
              onMouseLeave={() => !isTouchDevice && setOpenIndex(0)}
              onClick={() => handleCardClick(i)}
              aria-expanded={isOpen}
            >
                <div className="accordion-card-inner">
                  <span className="accordion-num">{step.num}</span>
                  <h3 className="accordion-title">{step.title}</h3>
                </div>
                <div className="accordion-desc-wrap">
                  <p className="accordion-desc">{step.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksAccordion
