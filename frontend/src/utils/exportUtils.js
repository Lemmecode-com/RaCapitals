/**
 * CSV / Excel Export & CSV Parsing Utilities
 * UTF-8 BOM is included (\uFEFF) to guarantee Excel / Google Sheets compatibility
 * with Indian Rupee (₹) and regional alphanumeric characters without font encoding issues.
 */

export const generateCsvString = (columns, data) => {
  const escapeCell = (val, col = null) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).trim().replace(/"/g, '""')

    // Fix for Excel converting phone numbers / long numeric identifiers (10+ digits) into scientific notation (e.g. 9.19989E+11)
    const isPhoneCol = Boolean(
      col && (
        (col.key && String(col.key).toLowerCase().includes('phone')) ||
        (col.label && String(col.label).toLowerCase().includes('phone'))
      )
    )
    const isLongNumeric = /^\+?\d{10,}$/.test(str.replace(/[\s-]/g, ''))

    if (isPhoneCol || (isLongNumeric && !col?.isNumeric)) {
      return `="${str}"`
    }

    return `"${str}"`
  }

  const headerRow = columns.map((col) => `"${String(col.label || '').replace(/"/g, '""')}"`).join(',')
  const dataRows = (data || []).map((item) => {
    return columns
      .map((col) => {
        let val
        if (typeof col.accessor === 'function') {
          val = col.accessor(item)
        } else {
          val = item[col.key]
        }
        return escapeCell(val, col)
      })
      .join(',')
  })

  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n')
}

export const exportToCsv = (filename, columns, data) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.')
    return
  }

  const csvContent = generateCsvString(columns, data)
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
 * Generates valid SpreadsheetML XML string compatible with Microsoft Excel, Google Sheets, LibreOffice
 */
export const generateExcelXml = (sheetName, columns, data) => {
  const escapeXml = (val) => {
    if (val === null || val === undefined) return ''
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const headerCells = columns
    .map(col => `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>`)
    .join('\n')

  const dataRows = (data || [])
    .map(item => {
      const cells = columns.map(col => {
        let val
        if (typeof col.accessor === 'function') {
          val = col.accessor(item)
        } else {
          val = item[col.key]
        }

        const isNum = typeof val === 'number' && !isNaN(val)
        const type = isNum ? 'Number' : 'String'
        const escaped = escapeXml(val)
        return `    <Cell ss:StyleID="Data"><Data ss:Type="${type}">${escaped}</Data></Cell>`
      }).join('\n')

      return `   <Row ss:AutoFitHeight="1">\n${cells}\n   </Row>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Taurus Magnus</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Data">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table ss:DefaultRowHeight="20">
   <Row ss:AutoFitHeight="1" ss:Height="26">
${headerCells}
   </Row>
${dataRows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitPane>
    <TopRowBottomPane>1</TopRowBottomPane>
   </SplitPane>
   <Panes>
    <Pane>
     <Number>3</Number>
    </Pane>
    <Pane>
     <Number>2</Number>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`
}

/**
 * Native Excel (.xls / .xlsx) SpreadsheetML Exporter
 */
export const exportToExcel = (filename, columns, data, sheetName = 'Export') => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.')
    return
  }

  const xml = generateExcelXml(sheetName, columns, data)
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  const cleanFilename = filename.endsWith('.xls') || filename.endsWith('.xlsx')
    ? filename
    : `${filename}.xls`
  link.setAttribute('download', cleanFilename)
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

/**
 * Standard Sample CSV Template for Share FAQs Bulk Ingestion
 */
export const downloadFaqSampleTemplate = () => {
  const headers = ['Company Name', 'Question', 'Answer', 'Order']
  const sampleRows = [
    [
      'Tata Motors',
      'What is the lock-in period after Tata Motors lists?',
      'Under current SEBI regulations, pre-IPO equity shares held by non-promoter shareholders are subject to a mandatory 6-month statutory lock-in period starting from the listing date on NSE/BSE.',
      '1'
    ],
    [
      'Tata Motors',
      'How are Tata Motors unlisted shares delivered to my demat account?',
      'Unlisted shares are transferred off-market via CDSL/NSDL Delivery Instruction Slip (DIS) or speed-e electronic transfer directly into your Demat account (Zerodha, Groww, AngelOne, etc.) within 24 to 48 business hours.',
      '2'
    ],
    [
      'Reliance Industries',
      'What is the minimum transaction lot size for Reliance Industries?',
      'The minimum investment is governed by the minimum lot size (e.g. 50 shares) multiplied by the prevailing frozen indicative price per share.',
      '1'
    ],
    [
      'Reliance Industries',
      'Can I sell my unlisted shares before the company files for IPO?',
      'Yes. You can liquidate your position on the secondary OTC unlisted market prior to IPO based on market demand and counterparty bids.',
      '2'
    ]
  ]

  const csvRows = [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))]
  const csvContent = '\uFEFF' + csvRows.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Taurus_Magnus_FAQ_Import_Template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
