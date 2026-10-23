const FALLBACK_WHATSAPP_NUMBER = '919999999999'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER

if (!import.meta.env.VITE_WHATSAPP_NUMBER) {
  console.warn('WhatsApp number not configured - using placeholder')
}

const EnquireButton = ({ companyName }) => {
  const handleClick = () => {
    const message = `Hi, I'm interested in ${companyName}. Please share more details.`
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button type="button" className="enquire-btn" onClick={handleClick}>
      Enquire on WhatsApp
    </button>
  )
}

export default EnquireButton