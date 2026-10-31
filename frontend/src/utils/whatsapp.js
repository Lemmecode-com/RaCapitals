const FALLBACK_WHATSAPP_NUMBER = '919149169733'

export const getWhatsAppNumber = () => {
  return import.meta.env.VITE_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER
}

export const getWhatsAppDisplayNumber = () => {
  const num = getWhatsAppNumber()
  if (num.length === 12 && num.startsWith('91')) {
    return `+91 ${num.slice(2, 7)} ${num.slice(7)}`
  }
  return num
}

export const getWhatsAppUrl = (message = '') => {
  const number = getWhatsAppNumber()
  return message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`
}
