import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Company from './models/Company.js'

dotenv.config()

/**
 * Targeted Database Correction for Issue #13 Scope Clarification:
 * Only updates confirmed affected records:
 * 1. Cosmic PV Power Limited (?241.5 Cr, ?98.7 crore, ?23.7 crore, ?640 crore, ?540 crore, ?100 crore)
 * 2. Absolute Projects (India) Limited (?747 crore)
 *
 * Constraint: Strictly avoids blanket find-and-replace (? -> ₹).
 * Replaces only verified currency amounts where '?' precedes numerical amounts with crore/lakh/Cr.
 */

const TARGET_COMPANIES = [
  'Cosmic PV Power Limited',
  'Absolute Projects (India) Limited'
]

// Regex matching only currency amounts: ? followed by digits and currency units
// E.g. ?241.5 Cr, ?98.7 crore, ?747 crore, etc.
const CURRENCY_CORRUPTION_REGEX = /\?(\s*\d+(?:\.\d+)?\s*(?:cr|crore|lakh|inr|billion|million))/gi

export function correctCurrencySymbols(text) {
  if (!text) return { corrected: text, replacements: 0 }
  let count = 0
  const corrected = text.replace(CURRENCY_CORRUPTION_REGEX, (match, amount) => {
    count++
    return `₹${amount.trim()}`
  })
  return { corrected, replacements: count }
}

async function runTargetedCorrection() {
  const isDryRun = process.argv.includes('--dry-run')
  console.log(`[Targeted DB Correction] Starting... (Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE'})`)

  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in environment.')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB.')

    let totalUpdated = 0

    for (const companyName of TARGET_COMPANIES) {
      console.log(`\nChecking: "${companyName}"...`)
      const company = await Company.findOne({ name: new RegExp(`^${companyName}$`, 'i') })

      if (!company) {
        console.log(`  -> Warning: Company "${companyName}" not found in database. Skipping.`)
        continue
      }

      if (!company.description) {
        console.log(`  -> Notice: Description is empty for "${companyName}". Skipping.`)
        continue
      }

      const { corrected, replacements } = correctCurrencySymbols(company.description)

      if (replacements === 0) {
        console.log(`  -> No corrupted currency symbols found in "${companyName}". (Already clean)`)
        continue
      }

      console.log(`  -> Found ${replacements} corrupted currency symbol(s) in "${companyName}".`)

      // Print verified matches
      const matches = company.description.match(CURRENCY_CORRUPTION_REGEX) || []
      matches.forEach((m) => {
        console.log(`     Replacing: "${m}" -> "₹${m.slice(1).trim()}"`)
      })

      if (!isDryRun) {
        company.description = corrected
        await company.save()
        console.log(`  -> Successfully updated description in DB for "${companyName}".`)
        totalUpdated++
      } else {
        console.log(`  -> [DRY-RUN] Record would be updated.`)
      }
    }

    console.log(`\n=================================================`)
    console.log(`Targeted correction complete. Total records updated: ${totalUpdated}`)
    console.log(`=================================================`)
  } catch (err) {
    console.error('Database correction error:', err)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

// Run if called directly from CLI
if (process.argv[1] && process.argv[1].endsWith('fixCurrencyCorruption.js')) {
  runTargetedCorrection()
}

