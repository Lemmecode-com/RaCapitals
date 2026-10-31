import { getWhatsAppUrl } from '../../utils/whatsapp'

const EnquireButton = ({ companyName }) => {
  const handleClick = () => {
    const message = `Hi, I'm interested in ${companyName}. Please share more details.`
    const url = getWhatsAppUrl(message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button type="button" className="enquire-btn" onClick={handleClick}>
      Enquire on WhatsApp
    </button>
  )
}

export default EnquireButton
