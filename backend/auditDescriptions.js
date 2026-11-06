import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Company from './models/Company.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/racapitals'

async function runAudit() {
  console.log('--- Company Description Standardisation Audit Engine ---')
  console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@'))

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    const companies = await Company.find({}).sort({ name: 1 }).lean()
    console.log(`Analyzing ${companies.length} company records...`)

    const auditResults = {
      timestamp: new Date().toISOString(),
      totalCompanies: companies.length,
      metrics: {
        missingCount: 0,
        shortCount: 0, // < 120 chars
        needsStandardisationCount: 0,
        wellFormedCount: 0
      },
      flaggedRecords: []
    }

    for (const comp of companies) {
      const desc = comp.description ? comp.description.trim() : ''
      const charCount = desc.length
      const wordCount = desc ? desc.split(/\s+/).length : 0

      const flags = []
      if (!desc) {
        flags.push('MISSING_DESCRIPTION')
        auditResults.metrics.missingCount++
      } else if (charCount < 120) {
        flags.push('INSUFFICIENT_LENGTH')
        auditResults.metrics.shortCount++
      }

      // Check formatting consistency (e.g. unclosed HTML tags, trailing ellipsis)
      if (desc.endsWith('...') || desc.endsWith('…')) {
        flags.push('FRAGMENTED_OR_TRUNCATED')
      }

      const hasHtml = /<[a-z][\s\S]*>/i.test(desc)

      if (flags.length > 0) {
        auditResults.metrics.needsStandardisationCount++
        auditResults.flaggedRecords.push({
          id: comp._id,
          name: comp.name,
          sector: comp.sector,
          charCount,
          wordCount,
          flags,
          hasHtml,
          currentSnippet: desc ? desc.slice(0, 150) + (desc.length > 150 ? '...' : '') : '[EMPTY]'
        })
      } else {
        auditResults.metrics.wellFormedCount++
      }
    }

    // Save report to disk
    const reportDir = path.resolve(__dirname, 'reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    const reportPath = path.resolve(reportDir, 'descriptions_audit_report.json')
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2), 'utf8')

    console.log('\n================ AUDIT SUMMARY ================')
    console.log(`Total Companies Analyzed: ${auditResults.totalCompanies}`)
    console.log(`Missing Descriptions:    ${auditResults.metrics.missingCount}`)
    console.log(`Short / Incomplete:      ${auditResults.metrics.shortCount}`)
    console.log(`Flagged for Review:      ${auditResults.metrics.needsStandardisationCount}`)
    console.log(`Well-Formed Records:     ${auditResults.metrics.wellFormedCount}`)
    console.log(`Audit report generated:  ${reportPath}`)
    console.log('================================================\n')
    console.log('NOTE: Under Issue #39, no database records are modified without stakeholder approval.')
    console.log('To backup production collection before applying changes, run: mongodump --uri="<MONGODB_URI>" --collection=companies')

  } catch (err) {
    console.error('Audit failed:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

runAudit()

