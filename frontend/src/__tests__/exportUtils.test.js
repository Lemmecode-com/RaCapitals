import { describe, it, expect } from 'vitest'
import { generateExcelXml, generateCsvString } from '../utils/exportUtils'

describe('Export Utilities (TM-ISSUE-17)', () => {
  it('generates well-formed SpreadsheetML XML with columns and data rows', () => {
    const columns = [
      { label: 'Enquiry ID', key: '_id' },
      { label: 'Company Name', key: 'company' },
      { label: 'Investor Name', key: 'name' },
      { label: 'Quantity', key: 'quantity' }
    ]

    const data = [
      { _id: 'enq-101', company: 'Tata Tech', name: 'Rohan Sharma', quantity: 250 },
      { _id: 'enq-102', company: 'NSE India', name: 'Priya & Associates', quantity: 100 }
    ]

    const xml = generateExcelXml('Share Enquiries', columns, data)

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<Worksheet ss:Name="Share Enquiries">')
    expect(xml).toContain('<Data ss:Type="String">Enquiry ID</Data>')
    expect(xml).toContain('<Data ss:Type="String">Tata Tech</Data>')
    expect(xml).toContain('<Data ss:Type="Number">250</Data>')
    // Tests XML entity escaping for &
    expect(xml).toContain('Priya &amp; Associates')
  })

  it('correctly handles custom accessors and null values in XML', () => {
    const columns = [
      { label: 'Full Name', accessor: (row) => `${row.firstName} ${row.lastName}` },
      { label: 'Phone', key: 'phone' }
    ]

    const data = [
      { firstName: 'Aarav', lastName: 'Patil', phone: null }
    ]

    const xml = generateExcelXml('Contacts', columns, data)

    expect(xml).toContain('<Data ss:Type="String">Aarav Patil</Data>')
    expect(xml).toContain('<Data ss:Type="String"></Data>')
  })

  it('formats phone numbers in CSV as text formula to prevent Excel scientific notation', () => {
    const columns = [
      { label: 'Name', key: 'name' },
      { label: 'Phone', key: 'phone' }
    ]

    const data = [
      { name: 'Kiran', phone: '919989123456' },
      { name: 'Sameer', phone: '7869504484' }
    ]

    const csv = generateCsvString(columns, data)

    // Ensures phone numbers are escaped with ="..." so Excel does not convert them to e.g. 9.19989E+11
    expect(csv).toContain('="919989123456"')
    expect(csv).toContain('="7869504484"')
    expect(csv).toContain('"Name","Phone"')
  })
})
