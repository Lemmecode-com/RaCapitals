import { useState } from 'react'
import api from '../../services/api'
import { getWhatsAppUrl } from '../../utils/whatsapp'
import { formatINR } from '../../utils/format'

const ShareEnquiryForm = ({ company, latestPrice }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    name: '',
    phone: '',
    email: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  const handleChange = (field) => (e) => {
    let val = e.target.value
    if (field === 'phone') {
      // Strictly digits only, max 10 digits (no 11th digit or special characters allowed)
      val = val.replace(/\D/g, '').slice(0, 10)
    } else if (field === 'name') {
      // Strictly letters and spaces only, no digits or special characters allowed
      val = val.replace(/[^a-zA-Z\s]/g, '')
    }
    setFormData(prev => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError('')
  }

  const validate = () => {
    const nextErrors = {}

    // Quantity validation (optional, but if provided must be a positive integer)
    if (formData.quantity !== '') {
      const parsed = parseInt(formData.quantity, 10)
      if (isNaN(parsed) || parsed <= 0) {
        nextErrors.quantity = 'Please enter a valid positive quantity.'
      }
    }

    // Full name validation (required, letters and spaces only, 2-70 characters)
    const nameTrimmed = formData.name.trim()
    const nameRegex = /^[a-zA-Z\s]{2,70}$/
    if (!nameTrimmed) {
      nextErrors.name = 'Full name is required.'
    } else if (nameTrimmed.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.'
    } else if (!nameRegex.test(nameTrimmed)) {
      nextErrors.name = 'Name can only contain letters and spaces (no numbers or special characters).'
    } else if (nameTrimmed.length > 70) {
      nextErrors.name = 'Name cannot exceed 70 characters.'
    }

    // Phone number validation (required, strictly 10 digits)
    const phoneTrimmed = formData.phone.trim()
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneTrimmed) {
      nextErrors.phone = 'Mobile number is required.'
    } else if (!phoneRegex.test(phoneTrimmed) || phoneTrimmed.length !== 10) {
      nextErrors.phone = 'Mobile number must be exactly 10 digits.'
    }

    // Email validation (REQUIRED, must include @ and domain with .)
    const emailTrimmed = formData.email.trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailTrimmed) {
      nextErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(emailTrimmed)) {
      nextErrors.email = 'Please enter a valid email address (e.g. name@domain.com).'
    }

    // Message length limit (optional)
    if (formData.message.trim().length > 1000) {
      nextErrors.message = 'Message cannot exceed 1000 characters.'
    }

    return nextErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        company: company._id,
        companyName: company.name,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : undefined,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        message: formData.message.trim() || undefined
      }

      const res = await api.post('/enquiries/share', payload)
      if (res.data) {
        setSuccessMessage(
          res.data.message || `Thank you! Your purchase enquiry for ${company.name} has been received.`
        )
        // Reset form
        setFormData({
          quantity: '',
          name: '',
          phone: '',
          email: '',
          message: ''
        })
        setErrors({})
      }
    } catch (err) {
      console.error('Enquiry submission error:', err)
      if (err?.response?.status === 429) {
        setServerError('Too many enquiry requests. Please wait a few minutes before trying again.')
      } else {
        setServerError(
          err?.response?.data?.message || 'Failed to submit enquiry. Please try again or reach out on WhatsApp.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleWhatsAppClick = () => {
    const qtyText = formData.quantity ? ` (${formData.quantity} shares)` : ''
    const msg = `Hi Taurus Magnus, I'm interested in purchasing shares of ${company.name}${qtyText}. Please share current availability and procedure.`
    window.open(getWhatsAppUrl(msg), '_blank', 'noopener,noreferrer')
  }

  // Calculate indicative total if price and quantity are available
  const parsedQty = parseInt(formData.quantity, 10)
  const indicativeTotal = (!isNaN(parsedQty) && parsedQty > 0 && latestPrice) ? parsedQty * latestPrice : null

  return (
    <div className="share-enquiry-card">
      <div className="share-enquiry-header">
        <div className="share-enquiry-badge">PURCHASE ENQUIRY</div>
      </div>

      {successMessage && (
        <div className="share-enquiry-alert share-enquiry-success" role="status">
          <div className="share-enquiry-alert-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Enquiry Received!</strong>
              <p>{successMessage}</p>
            </div>
          </div>
          <button
            type="button"
            className="share-enquiry-alert-close"
            onClick={() => setSuccessMessage('')}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      )}

      {serverError && (
        <div className="share-enquiry-alert share-enquiry-error" role="alert">
          <div className="share-enquiry-alert-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Submission Error</strong>
              <p>{serverError}</p>
            </div>
          </div>
          <button
            type="button"
            className="share-enquiry-alert-close"
            onClick={() => setServerError('')}
            aria-label="Close error"
          >
            &times;
          </button>
        </div>
      )}

      <form className="share-enquiry-form" onSubmit={handleSubmit} noValidate>
        {/* Hidden association fields (bound automatically) */}
        <input type="hidden" name="company" value={company._id} />
        <input type="hidden" name="companyName" value={company.name} />

        <div className="share-enquiry-grid">
          {/* Requested Quantity */}
          <div className="share-enquiry-field">
            <label className="share-enquiry-label" htmlFor="enquiry-quantity">
              Requested Quantity (Shares)
              {company.lotSize ? (
                <span className="share-enquiry-hint">Lot size: {company.lotSize}</span>
              ) : null}
            </label>
            <input
              id="enquiry-quantity"
              type="number"
              min="1"
              step="1"
              className={`share-enquiry-input mono ${errors.quantity ? 'is-invalid' : ''}`}
              placeholder={company.lotSize ? `e.g. ${company.lotSize}` : 'e.g. 100'}
              value={formData.quantity}
              onChange={handleChange('quantity')}
            />
            {indicativeTotal ? (
              <span className="share-enquiry-est">
                Est. Value: ~{formatINR(indicativeTotal)} (@ {formatINR(latestPrice)}/sh)
              </span>
            ) : null}
            {errors.quantity && <span className="share-enquiry-err-msg">{errors.quantity}</span>}
          </div>

          {/* Full Name */}
          <div className="share-enquiry-field">
            <label className="share-enquiry-label" htmlFor="enquiry-name">
              Full Name <span className="share-enquiry-required">*</span>
            </label>
            <input
              id="enquiry-name"
              type="text"
              autoComplete="name"
              maxLength={70}
              className={`share-enquiry-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Rohan Joshi"
              value={formData.name}
              onChange={handleChange('name')}
            />
            {errors.name && <span className="share-enquiry-err-msg">{errors.name}</span>}
          </div>

          {/* Phone Number */}
          <div className="share-enquiry-field">
            <label className="share-enquiry-label" htmlFor="enquiry-phone">
              Mobile Number <span className="share-enquiry-required">*</span>
            </label>
            <input
              id="enquiry-phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              autoComplete="tel"
              className={`share-enquiry-input mono ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="10-digit number"
              value={formData.phone}
              onChange={handleChange('phone')}
            />
            {errors.phone && <span className="share-enquiry-err-msg">{errors.phone}</span>}
          </div>

          {/* Email Address */}
          <div className="share-enquiry-field">
            <label className="share-enquiry-label" htmlFor="enquiry-email">
              Email Address <span className="share-enquiry-required">*</span>
            </label>
            <input
              id="enquiry-email"
              type="email"
              autoComplete="email"
              className={`share-enquiry-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. rohan@example.com"
              value={formData.email}
              onChange={handleChange('email')}
            />
            {errors.email && <span className="share-enquiry-err-msg">{errors.email}</span>}
          </div>
        </div>

        {/* Optional Message */}
        <div className="share-enquiry-field full-width">
          <label className="share-enquiry-label" htmlFor="enquiry-message">
            Message or Specific Questions <span className="share-enquiry-opt">(Optional)</span>
          </label>
          <textarea
            id="enquiry-message"
            rows="2"
            className={`share-enquiry-textarea ${errors.message ? 'is-invalid' : ''}`}
            placeholder="Preferences, timeline, or questions (optional)..."
            value={formData.message}
            onChange={handleChange('message')}
          />
          {errors.message && <span className="share-enquiry-err-msg">{errors.message}</span>}
        </div>

        {/* Actions bar: Submit button + WhatsApp alternative */}
        <div className="share-enquiry-actions">
          <button
            type="submit"
            className="share-enquiry-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Submitting Enquiry…
              </span>
            ) : (
              'Submit Share Purchase Enquiry'
            )}
          </button>

          <div className="share-enquiry-or-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="share-enquiry-whatsapp-btn"
            onClick={handleWhatsAppClick}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.058.376-.058c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
            </svg>
            Enquire on WhatsApp
          </button>
        </div>
      </form>
    </div>
  )
}

export default ShareEnquiryForm

