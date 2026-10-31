import { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import FloatingParticles from '../components/common/FloatingParticles'
import api from '../services/api'
import { getWhatsAppUrl, getWhatsAppDisplayNumber } from '../utils/whatsapp'

const ContactMailIcon = () => (
  <svg className="contact-card-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const ContactOfficeIcon = () => (
  <svg className="contact-card-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21V6l8-3 8 3v15" />
    <path d="M4 21h16" />
    <path d="M9 10h.01M9 14h.01M9 18h.01M15 10h.01M15 14h.01M15 18h.01" />
  </svg>
)

const ContactPhoneIcon = () => (
  <svg className="contact-card-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const ContactBriefcaseIcon = () => (
  <svg className="contact-card-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="1.5" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </svg>
)

const CONTACT_EMAIL = 'taurusmagnus2026@gmail.com'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const next = {}
    
    // Name validation
    if (!form.name.trim()) {
      next.name = 'Please enter your name.'
    } else if (form.name.trim().length > 50) {
      next.name = 'Name cannot exceed 50 characters.'
    } else if (/\d/.test(form.name)) {
      next.name = 'Name cannot contain numbers.'
    }
    
    // Email validation
    if (!form.email.trim()) {
      next.email = 'Please enter your email.'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.'
    }
    
    // Message validation
    if (!form.message.trim()) {
      next.message = 'Please enter a message.'
    } else if (form.message.trim().length > 1000) {
      next.message = 'Message cannot exceed 1000 characters.'
    }
    
    return next
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    setSubmitting(true)
    try {
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim()
      })
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setErrors({ form: 'Something went wrong. Please try again later.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrap">
      <Navbar />
      <main className="page-main">
        <div className="particles-container">
          <FloatingParticles />
        </div>
        <header className="page-header">
          <p className="eyebrow">Contact us</p>
          <h1>Get in touch with Taurus Magnus</h1>
          <p className="muted">
            We respond to every WhatsApp and email enquiry within one business day.
          </p>
        </header>

        <section className="contact-info-grid">
          <div className="contact-card contact-card-compact">
            <ContactBriefcaseIcon />
            <div className="contact-card-body">
              <h3>Company</h3>
              <p>Taurus Magnus</p>
            </div>
          </div>
          <div className="contact-card contact-card-compact">
            <ContactOfficeIcon />
            <div className="contact-card-body">
              <h3>Registered Office</h3>
              <p>SA CAPITALS, Shivam Colony<br />Behat Road, Saharanpur<br />Uttar Pradesh, India</p>
            </div>
          </div>
          <div className="contact-card contact-card-compact">
            <ContactMailIcon />
            <div className="contact-card-body">
              <h3>Email</h3>
              <p className="mono"><a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'inherit', textDecoration: 'none' }}>{CONTACT_EMAIL}</a></p>
            </div>
          </div>
          <div className="contact-card contact-card-compact">
            <ContactPhoneIcon />
            <div className="contact-card-body">
              <h3>Phone / WhatsApp</h3>
              <p className="mono"><a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{getWhatsAppDisplayNumber()}</a></p>
            </div>
          </div>
        </section>

        <section className="contact-form-section">
          <h2 className="section-title">Send us a message</h2>
          {success && (
            <div className="form-success" style={{ position: 'relative', paddingRight: '2.5rem' }}>
              Thank you! Your message has been sent. We will get back to you Soon
              <button 
                type="button"
                className="modal-close-btn"
                onClick={() => setSuccess(false)}
                style={{ top: '50%', transform: 'translateY(-50%)', right: '0.5rem' }}
                aria-label="Close message"
              >
                &times;
              </button>
            </div>
          )}
          {errors.form && <p className="form-error">{errors.form}</p>}
          <form className="admin-form contact-form" onSubmit={handleSubmit} noValidate>
            <label className="form-label">
              Name
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Your full name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </label>
            <label className="form-label">
              Email
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </label>
            <label className="form-label">
              Message
              <textarea
                className="form-input contact-form-textarea"
                value={form.message}
                onChange={handleChange('message')}
                placeholder="How can we help?"
                rows={5}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && <span className="form-error">{errors.message}</span>}
            </label>
            <button type="submit" className="contact-form-submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          </section>
        </main>
        <Footer />
      </div>
  )
}

export default Contact
