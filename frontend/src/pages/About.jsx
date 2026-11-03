import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import FloatingParticles from '../components/common/FloatingParticles'

const ABOUT_SECTIONS = [
  {
    title: 'Who we are',
    body: 'Taurus Magnus is a research-focused intermediary for unlisted and pre-IPO shares in India. We work directly with company management, early investors, and promoters to verify fundamentals before any listing is presented to clients.'
  },
  {
    title: 'What we do',
    body: 'We maintain a curated price list across sectors, supported by documented due diligence. Every enquiry is handled by a person on our team — no ticket queues, no auto-replies. We believe transparency and personal follow-up are non-negotiable.'
  },
  {
    title: 'How it works',
    body: 'Browse the price list, shortlist opportunities, and tap Enquire. Our team responds on WhatsApp or email within one business day with current availability, lot size, and next steps. Once confirmed, shares move via demat-to-demat transfer.'
  },
  {
    title: 'Our track record',
    body: 'Five years of offline track record in unlisted and pre-IPO equity. We have helped hundreds of investors access companies before they list, with a focus on risk-aware allocation and clear communication.'
  }
]

const About = () => {
  return (
    <div className="page-wrap">
      <Navbar />
      <main className="page-main">
        <div className="particles-container">
          <FloatingParticles />
        </div>
        <header className="page-header">
          <p className="eyebrow">About us</p>
          <h1>Research-driven access to unlisted and pre-IPO equity</h1>
          <p className="muted">
            Taurus Magnus has spent the last five years helping investors access unlisted and pre-IPO equity
            through an offline network built on trust, diligence, and direct relationships.
          </p>
        </header>

        <section className="about-section">
          <div className="about-grid">
            {ABOUT_SECTIONS.map((section) => (
              <div key={section.title} className="about-card">
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-cta-section">
          <Link to="/catalog" className="primary-btn about-cta-btn">Browse the Price List</Link>
          <Link to="/contact" className="secondary-btn">Contact us</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default About
