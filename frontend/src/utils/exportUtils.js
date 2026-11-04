/**
 * CSV / Excel Export & CSV Parsing Utilities
 * UTF-8 BOM is included (\uFEFF) to guarantee Excel / Google Sheets compatibility
 * with Indian Rupee (₹) and regional alphanumeric characters without font encoding issues.
 */

export const exportToCsv = (filename, columns, data) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.')
    return
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const headerRow = columns.map((col) => escapeCell(col.label)).join(',')
  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        let val
        if (typeof col.accessor === 'function') {
          val = col.accessor(item)
        } else {
          val = item[col.key]
        }
        return escapeCell(val)
      })
      .join(',')
  })

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Standard CSV Parser handling quotes, commas, and multiline values
 */
export const parseCsv = (text) => {
  const lines = []
  let currentRow = []
  let currentField = ''
  let insideQuotes = false

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'
        i++ // skip escaped quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim())
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow)
      }
      currentRow = []
      currentField = ''
    } else {
      currentField += char
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow)
    }
  }

  if (lines.length === 0) return []

  const rawHeaders = lines[0]
  const cleanHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const data = []

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r]
    const obj = { _rawRowNumber: r + 1 }
    rawHeaders.forEach((rawH, idx) => {
      const cleanKey = cleanHeaders[idx]
      const val = row[idx] !== undefined ? row[idx] : ''
      obj[cleanKey] = val
      obj[rawH] = val
    })
    data.push(obj)
  }

  return data
}

/**
 * Downloads a pre-formatted sample CSV template for listing shares
 */
export const downloadListingSampleTemplate = () => {
  const headers = [
    'Company Name',
    'Sector',
    'Industry',
    'Indicative Price',
    'Lot Size',
    'Face Value',
    'CIN',
    'ISIN',
    'Market Cap Cr',
    'PE Ratio',
    'PB Ratio',
    'Book Value',
    'ROE Percent',
    'Outstanding Shares',
    'Founded Year',
    'Registered Office',
    'DRHP Filed',
    'Description'
  ]

  const sampleRows = [
    [
      'Tata Technologies Ltd',
      'Technology',
      'Engineering R&D Services',
      '1050',
      '100',
      '2',
      'U72200PN1994PLC013313',
      'INE142M01025',
      '42500',
      '55.4',
      '12.1',
      '84.5',
      '23.2',
      '405668530',
      '1994',
      'Pune, Maharashtra',
      'true',
      'Global product engineering and digital services company.'
    ],
    [
      'NSE India Ltd',
      'Fintech',
      'Financial Exchanges',
      '3850',
      '50',
      '1',
      'U67120MH1992PLC069769',
      'INE705A01016',
      '190000',
      '38.2',
      '18.4',
      '210.0',
      '28.5',
      '495000000',
      '1992',
      'Bandra Kurla Complex, Mumbai',
      'true',
      'Leading stock exchange of India.'
    ]
  ]

  const csvRows = [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))]
  const csvContent = '\uFEFF' + csvRows.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Taurus_Magnus_Share_Import_Template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

