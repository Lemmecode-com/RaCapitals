# Taurus Magnus — Consolidated GitHub Issue Plan

**Project:** Taurus Magnus (RA Capitals)  
**Repository:** `Lemmecode-com/RaCapitals`  
**Deployment branch:** `Racapitalsmvp`  
**Approved tagline:** `UNLISTED & PRE-IPO EQUITY`  
**Plan:** 17 consolidated GitHub issues

> This is a Markdown planning document. It is for reviewing, tracking, and copying issue specifications. A `.md` file does not execute commands or create GitHub issues automatically.

## GitHub CLI command

After reviewing an issue, create it from PowerShell with GitHub CLI:

```powershell
gh issue create --repo Lemmecode-com/RaCapitals --title "ISSUE TITLE" --body "ISSUE DESCRIPTION"
```

Replace `ISSUE TITLE` and `ISSUE DESCRIPTION` with the title and full description from the relevant issue below. Run the command once per issue. Ensure `gh auth login` has been completed and the authenticated account has access to the repository.

## Issue index

| Planning ID | Priority | Module | Dependencies | Title |
|---|---|---|---|---|
| TM-ISSUE-01 | P0-critical | Frontend | None | fix(home): resolve featured unlisted shares card click routing to company details page |
| TM-ISSUE-02 | P2-medium | Frontend | None | feat(nav): implement sticky navigation header across desktop and mobile viewports |
| TM-ISSUE-03 | P0-critical | Full Stack | None | feat(enquiry-backend): build ShareEnquiry schema, rate-limited public API, and admin lead desk |
| TM-ISSUE-04 | P0-critical | Frontend | TM-ISSUE-03 | feat(enquiry-frontend): build share purchase enquiry form on company details page |
| TM-ISSUE-06 | P1-high | Database / Backend | None | feat(financials-backend): architect multi-period financials schema, fundamentals, and individual/bulk ingestion APIs |
| TM-ISSUE-05 | P1-high | Database / Backend | TM-ISSUE-06 | feat(migration): backfill and verify historical price data and migrate legacy financial records |
| TM-ISSUE-07 | P1-high | Frontend | TM-ISSUE-01, TM-ISSUE-06 | feat(company-details): revamp details layout with complete corporate ID, fundamentals grid, and fundraise history |
| TM-ISSUE-08 | P1-high | Full Stack (Admin) | TM-ISSUE-06, TM-ISSUE-07 | feat(admin-import): implement unified bulk share import engine with template validation and audit history |
| TM-ISSUE-09 | P1-high | Full Stack (Admin) | None | feat(faq-admin): build admin share-wise FAQ management console and schema |
| TM-ISSUE-10 | P1-high | Frontend | TM-ISSUE-07, TM-ISSUE-09 | feat(faq-frontend): render dynamic, accessible FAQ accordion on individual share pages |
| TM-ISSUE-11 | P2-medium | Frontend / Backend | TM-ISSUE-07 | feat(profile-tabs): implement shareholding distribution, corporate events, and filing downloads |
| TM-ISSUE-12 | P0-critical | Full Stack | None | feat(contact-us): implement complete contact us enhancement across frontend, backend, and admin |
| TM-ISSUE-13 | P2-medium | Full Stack | TM-ISSUE-07 | feat(pricing-operations): build active catalog price updates, 1M/3M/6M/1Y/All filters, and update timestamps |
| TM-ISSUE-14 | P2-medium | Frontend / Backend | TM-ISSUE-01 | feat(home-discovery): add Trending Shares cards, expand DRHP grid (+8), and add View All deep link |
| TM-ISSUE-15 | P3-low | Database / Content | Manager approval | refactor(content-standardisation): audit descriptions, execute database backup, and update upon approval |
| TM-ISSUE-16 | P3-low | Frontend | TM-ISSUE-02 | style(animation-polish): resolve scroll animation stutter and fine-tune responsive transitions |
| TM-ISSUE-17 | P2-medium | Admin Panel / Backend | TM-ISSUE-03, TM-ISSUE-12 | feat(admin-export): implement Excel and CSV export engine for share enquiries and contact submissions |

---

## TM-ISSUE-01 — fix(home): resolve featured unlisted shares card click routing to company details page

**Priority:** P0-critical  
**Module:** Frontend  
**Complexity:** Low  
**Dependencies:** None

Resolve the homepage Featured Unlisted Shares card routing issue so that each card opens its corresponding company details page (`/company/:id`).

### Scope
- Inspect `frontend/src/components/home/CompanyPreviewCard.jsx` and `frontend/src/pages/Home.jsx`.
- Make the full active card (or its explicit CTA) navigate to `/company/${company._id}` using React Router.
- Ensure valid company ObjectIds are used and preserve normal link behavior, including middle-click and open-in-new-tab.

### Acceptance criteria
- [ ] Clicking an active company card opens the correct `/company/:id` page.
- [ ] Middle-click / Open in New Tab works.
- [ ] No layout shift or browser-console navigation errors.

**Priority:** P0-critical  
**Module:** Frontend  
**Complexity:** Low  
**Dependencies:** None

<!-- TM-ISSUE-01 -->

---

## TM-ISSUE-02 — feat(nav): implement sticky navigation header across desktop and mobile viewports

**Priority:** P2-medium  
**Module:** Frontend  
**Complexity:** Low  
**Dependencies:** None

Make the primary navigation bar sticky across desktop, tablet, and mobile without disrupting document flow or the mobile navigation drawer.

### Scope
- Apply sticky positioning to the primary navbar (expected starting point: `.navbar` in `frontend/src/index.css`).
- Keep the header above page content and provide an appropriate background/border treatment when required by the existing design.
- Verify mobile drawer positioning, stacking, and clipping behavior.
- Avoid introducing a spacer or layout shift when sticky behavior engages.

### Acceptance criteria
- [ ] Navbar remains accessible at the top while scrolling.
- [ ] Works on desktop and mobile browsers, including iOS Safari and Android Chrome.
- [ ] No content jump, drawer clipping, or z-index regression.

**Priority:** P2-medium  
**Module:** Frontend  
**Complexity:** Low  
**Dependencies:** None

<!-- TM-ISSUE-02 -->

---

## TM-ISSUE-03 — feat(enquiry-backend): build ShareEnquiry schema, rate-limited public API, and admin lead desk

**Priority:** P0-critical  
**Module:** Full Stack  
**Complexity:** Medium  
**Dependencies:** None

Build the backend and admin workflow for share-specific purchase enquiries. Public submission must not require admin authentication; enquiry retrieval and management must remain JWT-protected.

### Scope
- Add `ShareEnquiry` with company ObjectId reference, company name, quantity, name, phone, optional email/message, status (`New`, `Contacted`, `In Progress`, `Closed`), and timestamps.
- Add public `POST /api/enquiries/share` with strict validation, sanitization, and IP-based rate limiting.
- Add authenticated admin endpoints:
  - `GET /api/admin/enquiries/share` with pagination, company filter, and date range.
  - `PATCH /api/admin/enquiries/share/:id/status`.
- Build `/admin/enquiries` with enquiry list, status controls, company/date filters, and a detail view for the full message.
- Ensure admin routes use the existing JWT `authMiddleware.js`.

### Acceptance criteria
- [ ] Visitors can submit without admin login.
- [ ] Invalid input is rejected and excessive requests are rate-limited.
- [ ] Admin endpoints return HTTP 401 to unauthenticated requests.
- [ ] Admins can review, filter, and update enquiry statuses.

**Priority:** P0-critical  
**Module:** Full Stack  
**Complexity:** Medium  
**Dependencies:** None

**Pending manager decisions:** Whether phone/email are both mandatory, quantity lot-size restrictions, OTP verification, and sales notifications remain unresolved. Do not add OTP or unapproved validation barriers.

<!-- TM-ISSUE-03 -->

---

## TM-ISSUE-04 — feat(enquiry-frontend): build share purchase enquiry form on company details page

**Priority:** P0-critical  
**Module:** Frontend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-03

Add a share-specific purchase enquiry form to each company details page and associate each submission with the active company automatically.

### Scope
- Add a form to `CompanyDetail.jsx` with quantity, full name, mobile number, email, and optional message.
- Bind the active company `_id` and company name into the request; visitors must not select the company manually.
- Submit to public `POST /api/enquiries/share`.
- Provide loading, success, and validation/error feedback; reset the form after successful submission.
- Follow approved form validation rules only.

### Acceptance criteria
- [ ] Submission contains the correct company association.
- [ ] Form communicates loading, success, and validation states.
- [ ] Successful submission resets the form.
- [ ] Layout works on mobile and desktop.

**Priority:** P0-critical  
**Module:** Frontend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-03

**Pending manager decisions:** Mandatory phone/email rules, lot-size validation, and OTP verification are not finalized.

<!-- TM-ISSUE-04 -->

---

## TM-ISSUE-06 — feat(financials-backend): architect multi-period financials schema, fundamentals, and individual/bulk ingestion APIs

**Priority:** P1-high  
**Module:** Database / Backend  
**Complexity:** High  
**Dependencies:** None

Design and implement the multi-year financial data architecture and backend ingestion capabilities for company fundamentals and the three financial statements.

### Scope
- Extend `Company` with available fundamentals: market cap, P/E, P/B, ROE, book value, face value, and outstanding shares.
- Create `CompanyFinancials` supporting company reference, financial year, Annual/Quarterly period, optional quarter, Income Statement, Balance Sheet, Cash Flow, timestamps, and a compound uniqueness constraint across company/year/period/quarter.
- Support future financial years without schema redesign.
- Add APIs:
  - Public `GET /api/companies/:id/financials`, with period filtering.
  - Authenticated `POST /api/admin/companies/:id/financials` for individual-company entry/update.
  - Authenticated `POST /api/admin/financials/bulk-import` for multi-company spreadsheet ingestion and row-level validation errors.
- Add an individual financial editor to the company admin edit page and a bulk financial upload interface.
- Preserve financial data structures for:
  - Income Statement: revenue, operating expenses, EBITDA, depreciation, PAT, EPS.
  - Balance Sheet: current/non-current assets, equity, reserves, debt, liabilities.
  - Cash Flow: operating, investing, and financing activities.

### Acceptance criteria
- [ ] Annual and quarterly periods can be stored and queried.
- [ ] Financial records are returned in financial-year order.
- [ ] Individual and bulk ingestion are available to authorized admins.
- [ ] Invalid periods and non-numeric monetary values are rejected with useful errors.
- [ ] Future fiscal years require no structural schema change.

**Priority:** P1-high  
**Module:** Database / Backend  
**Complexity:** High  
**Dependencies:** None

**Pending manager decisions:** Fixed versus dynamic statement line items, financial import template, and fundamentals data source remain open.

**Overlap check:** Existing repository issue #21 concerns financial statements management in the admin company panel. Review it before creating this issue; this issue should own the broader schema, fundamentals, public retrieval API, individual/bulk ingestion architecture, while #21 should be closed, narrowed, or linked if it duplicates part of this scope.

<!-- TM-ISSUE-06 -->

---

## TM-ISSUE-05 — feat(migration): backfill and verify historical price data and migrate legacy financial records

**Priority:** P1-high  
**Module:** Database / Backend  
**Complexity:** High  
**Dependencies:** TM-ISSUE-06

Backfill available historical share-price records and migrate legacy financial records into the revised data architecture. The financial migration must run only after the `CompanyFinancials` schema from TM-ISSUE-06 is available.

### Scope
- Create `backend/scripts/migrateHistoricalPrices.js` to collate available historical price logs, validate Company references, and insert `PriceHistory` records in chronological order.
- Make price migration idempotent so reruns do not create duplicates.
- Create `backend/scripts/migrateFinancialRecords.js` to map legacy financial records into the approved `CompanyFinancials` schema from TM-ISSUE-06.
- Create `backend/scripts/verifyMigrations.js` to compare source and destination counts, detect orphan references, verify date ordering, and validate numeric integrity.
- Produce a clear migration/verification report.

### Acceptance criteria
- [ ] Price backfill is chronological and idempotent.
- [ ] Legacy financial records are migrated without data loss.
- [ ] Verification checks record counts, references, ordering, and numeric values.
- [ ] Scripts provide actionable failure output and can be safely rerun.

**Priority:** P1-high  
**Module:** Database / Backend  
**Complexity:** High  
**Dependencies:** TM-ISSUE-06 (must be completed first)

<!-- TM-ISSUE-05 -->

---

## TM-ISSUE-07 — feat(company-details): revamp details layout with complete corporate ID, fundamentals grid, and fundraise history

**Priority:** P1-high  
**Module:** Frontend  
**Complexity:** High  
**Dependencies:** TM-ISSUE-01, TM-ISSUE-06

Modernize `CompanyDetail.jsx` into an institutional-grade company/share profile using the data made available by the backend architecture.

### Scope
- Create a clear company header with logo, name, sector, DRHP status, and relevant tags.
- Display corporate identification fields when available: ISIN, CIN, sector, industry, headquarters, year founded, and face value.
- Display available fundamentals: market cap, P/E, P/B, ROE, book value, face value, outstanding shares, and lot size.
- Standardize About-section typography, paragraph spacing, lists, and tables.
- Add accessible Read More / Read Less behavior for long descriptions without imposing an unapproved fixed character/word threshold.
- Display fundraise history when data exists: round/series, date, valuation, capital raised, and lead investors.
- Suppress empty metrics/sections and prevent `null`, `NaN`, or blank containers.
- Format numeric values using the project's INR formatting conventions.

### Acceptance criteria
- [ ] All seven corporate identification fields display when data exists.
- [ ] Available fundamentals and fundraise history render correctly.
- [ ] Read More / Read Less is accessible and functional.
- [ ] Empty sections are hidden and numeric values are formatted cleanly.
- [ ] Responsive layout is verified from 375px mobile through desktop/large displays.

**Priority:** P1-high  
**Module:** Frontend  
**Complexity:** High  
**Dependencies:** TM-ISSUE-01, TM-ISSUE-06

<!-- TM-ISSUE-07 -->

---

## TM-ISSUE-08 — feat(admin-import): implement unified bulk share import engine with template validation and audit history

**Priority:** P1-high  
**Module:** Full Stack (Admin)  
**Complexity:** High  
**Dependencies:** TM-ISSUE-06, TM-ISSUE-07

Implement exactly one consolidated “Import Shares” feature in the Admin Panel. It must cover templates, upload, preview, validation, duplicate handling, database ingestion, price logging, and import audit history.

### Scope
- Add one “Import Shares” action in `AdminListings.jsx`.
- Provide downloadable `.xlsx` and `.csv` templates. Final mandatory/optional columns must follow manager approval.
- Support file upload and client-side preview.
- Implement `POST /api/admin/import/shares` with server-side validation, ISIN format checks, database duplicate detection by ISIN and/or company name, and description-structure validation.
- Provide row-by-row validation errors with row numbers and reasons.
- Create/update company records and log initial indicative prices in append-only `PriceHistory`.
- Record each batch in `ImportHistory`: timestamp, filename, total rows, success count, duplicate count, and error count.
- Do not build a second or separate bulk share import tool.

### Acceptance criteria
- [ ] There is one consolidated import workflow only.
- [ ] Templates can be downloaded and uploaded.
- [ ] Validation reports identify exact row numbers and errors.
- [ ] Company creation/update and initial price logging follow the approved policy.
- [ ] Import history is retained and viewable.

**Priority:** P1-high  
**Module:** Full Stack (Admin)  
**Complexity:** High  
**Dependencies:** TM-ISSUE-06, TM-ISSUE-07

**Pending manager decisions:** Final template columns, atomic versus partial processing, and duplicate handling policy. Do not assume these choices.

<!-- TM-ISSUE-08 -->

---

## TM-ISSUE-09 — feat(faq-admin): build admin share-wise FAQ management console and schema

**Priority:** P1-high  
**Module:** Full Stack (Admin)  
**Complexity:** Medium  
**Dependencies:** None

Build the administrative data model and management console for FAQs associated with individual companies/shares.

### Scope
- Create `ShareFaq` with company reference, question, answer, order, publish flag, and timestamps.
- Add authenticated CRUD APIs under `/api/admin/faqs`.
- Build `/admin/faqs` with company selection, create/edit/delete, ordering, and publish/unpublish controls.
- Ensure unpublished FAQs are excluded from public responses.
- Add automated tests for FAQ CRUD and publication behavior.

### Acceptance criteria
- [ ] Admins can create, edit, reorder, publish/unpublish, and delete company FAQs.
- [ ] Public APIs expose only published FAQs.
- [ ] Company association and ordering are respected.
- [ ] Automated tests cover CRUD behavior.

**Priority:** P1-high  
**Module:** Full Stack (Admin)  
**Complexity:** Medium  
**Dependencies:** None

**Pending manager approval:** FAQ architecture is unresolved. Global template, company-specific FAQs, or the recommended hybrid override model must be approved before finalizing the public-facing behavior.

<!-- TM-ISSUE-09 -->

---

## TM-ISSUE-10 — feat(faq-frontend): render dynamic, accessible FAQ accordion on individual share pages

**Priority:** P1-high  
**Module:** Frontend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-07, TM-ISSUE-09

Render a dynamic, accessible FAQ accordion on individual company details pages using the manager-approved FAQ architecture.

### Scope
- Add an FAQ accordion to `CompanyDetail.jsx`.
- Fetch published FAQs for the active company through `GET /api/companies/:id/faqs`.
- Support keyboard operation and ARIA attributes such as `aria-expanded` and `aria-controls`.
- Support `{COMPANY_NAME}` substitution only if the approved architecture uses global FAQ templates.
- Hide the section when no published FAQs are available.

### Acceptance criteria
- [ ] Questions expand/collapse their associated answers.
- [ ] Only published, relevant FAQs are displayed.
- [ ] Keyboard and screen-reader accessibility are supported.
- [ ] Empty FAQ sections are suppressed.

**Priority:** P1-high  
**Module:** Frontend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-07, TM-ISSUE-09, manager approval of FAQ architecture

<!-- TM-ISSUE-10 -->

---

## TM-ISSUE-11 — feat(profile-tabs): implement shareholding distribution, corporate events, and filing downloads

**Priority:** P2-medium  
**Module:** Frontend / Backend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-07

Extend the company details profile with corporate events, shareholding pattern, leadership/board information, and statutory document downloads.

### Scope
- Connect the existing `Event` collection to company-specific profile milestones where a valid company association exists.
- Display shareholding distribution (Promoter, Institutional, Public, ESOP/Other) through a chart and breakdown table when data is available.
- Display leadership and Board of Directors profiles with name, role, and overview when available.
- Add a structured annual report/statutory filings area with document metadata and verified download links.
- Suppress unavailable tabs/sections rather than rendering empty tables or containers.

### Acceptance criteria
- [ ] Company-linked events are displayed for the correct company.
- [ ] Shareholding and leadership sections render only when data exists.
- [ ] Filing links are valid and open securely in a new tab.
- [ ] No empty tabs, tables, or blank content blocks appear.

**Priority:** P2-medium  
**Module:** Frontend / Backend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-07

**Pending manager decision:** Storage location for statutory PDF documents (server filesystem versus cloud object storage) remains open.

<!-- TM-ISSUE-11 -->

---

## TM-ISSUE-12 — feat(contact-us): implement complete contact us enhancement across frontend, backend, and admin

**Priority:** P0-critical  
**Module:** Full Stack  
**Complexity:** Medium  
**Dependencies:** None

Implement the complete Contact Us enhancement, including a public phone field, backend persistence, and an administrative submissions viewer.

### Scope
- Add a Phone Number field to `Contact.jsx` alongside name, email, and message.
- Validate and sanitize phone input according to the approved validation standard.
- Extend `ContactSubmission` with a phone field and update `POST /api/contact` to persist it.
- Update `AdminContacts.jsx` to display phone numbers and complete message details in a detail view/drawer/modal.
- Add date-range filtering and search by sender name or email.
- Do not add unapproved click-to-dial or WhatsApp actions.

### Acceptance criteria
- [ ] Contact submissions persist phone alongside name, email, and message.
- [ ] Admin listing shows phone and complete message details.
- [ ] Date filters and sender search work correctly.
- [ ] Existing contact submission functionality remains intact.

**Priority:** P0-critical  
**Module:** Full Stack  
**Complexity:** Medium  
**Dependencies:** None

**Pending manager decision:** Phone format validation versus SMS OTP verification remains unresolved. Do not add OTP unless approved.

<!-- TM-ISSUE-12 -->

---

## TM-ISSUE-13 — feat(pricing-operations): build active catalog price updates, 1M/3M/6M/1Y/All filters, and update timestamps

**Priority:** P2-medium  
**Module:** Full Stack  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-07

Add an admin workflow for updating current indicative share prices and improve price history chart filtering and timestamp clarity.

### Scope
- Add an admin price update workflow in `AdminListings.jsx`.
- Add `POST /api/prices/:companyId` to append a new `PriceHistory` record; do not mutate historical records.
- Recalculate/update `latestPrice`, `high52`, and `low52` as required by the existing data model.
- Add `1M`, `3M`, `6M`, `1Y`, and `ALL` range filters to `PriceHistoryChart.jsx`.
- Display “Indicative Price as of: DD MMM YYYY” on company cards and details pages using the latest recorded price date.

### Acceptance criteria
- [ ] Price update creates a new append-only history record.
- [ ] Current catalog price reflects the latest update.
- [ ] Chart ranges filter the dataset correctly.
- [ ] Timestamp reflects the latest `recordedAt` value.
- [ ] Existing historical price records remain unchanged.

**Priority:** P2-medium  
**Module:** Full Stack  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-07

<!-- TM-ISSUE-13 -->

---

## TM-ISSUE-14 — feat(home-discovery): add Trending Shares cards, expand DRHP grid (+8), and add View All deep link

**Priority:** P2-medium  
**Module:** Frontend / Backend  
**Complexity:** Low  
**Dependencies:** TM-ISSUE-01

Improve homepage discovery with a Trending Shares showcase and DRHP section updates while preserving the approved Taurus Magnus brand identity.

### Scope
- Add a “Trending Shares” section to `Home.jsx`.
- Update the DRHP Filed heading and subtitle to match the approved client reference.
- Expand the DRHP showcase by eight additional companies, subject to confirmation of the final intended total.
- Add a “View All DRHP Filed Shares” action linking to `/drhp-filed`.
- Verify the approved tagline “UNLISTED & PRE-IPO EQUITY” in the homepage brand lockup.
- Refine Hero typography/alignment only where specified; do not invent interactive mechanics.

### Acceptance criteria
- [ ] Trending Shares section displays the approved selection of shares.
- [ ] DRHP heading/subtitle match the approved reference.
- [ ] View All routes to `/drhp-filed`.
- [ ] DRHP grid is responsive.
- [ ] Approved tagline is displayed correctly.

**Priority:** P2-medium  
**Module:** Frontend / Backend  
**Complexity:** Low  
**Dependencies:** TM-ISSUE-01

**Pending manager decisions:** Trending selection mechanism (dynamic enquiry count versus admin selection), whether DRHP means eight additional or eight total, and exact Hero functionality. Tagline text itself is approved.

<!-- TM-ISSUE-14 -->

---

## TM-ISSUE-15 — refactor(content-standardisation): audit descriptions, execute database backup, and update upon approval

**Priority:** P3-low  
**Module:** Database / Content  
**Complexity:** Medium  
**Dependencies:** Manager approval

Execute a controlled company-description standardisation workflow. Production content must not be changed until the description structure and replacement copy receive stakeholder approval.

### Scope
- Audit company descriptions for incomplete, fragmented, outdated, or inconsistent formatting.
- Prepare replacement descriptions using the manager-approved heading, paragraph, and bullet conventions.
- Generate and verify a production `companies` collection backup (`mongodump`) before any production update.
- Submit proposed content for stakeholder review and sign-off.
- Apply approved changes only after explicit approval and retain an audit record of changes.

### Acceptance criteria
- [ ] Audit identifies records requiring attention.
- [ ] Backup is generated and verified before production modification.
- [ ] Replacement copy receives formal sign-off before publishing.
- [ ] Production changes are logged and performed only after approval.

**Priority:** P3-low  
**Module:** Database / Content  
**Complexity:** Medium  
**Dependencies:** Manager approval of description structure and replacement content

<!-- TM-ISSUE-15 -->

---

## TM-ISSUE-16 — style(animation-polish): resolve scroll animation stutter and fine-tune responsive transitions

**Priority:** P3-low  
**Module:** Frontend  
**Complexity:** Low  
**Dependencies:** TM-ISSUE-02

Stabilize scroll-driven animations and eliminate stutter, flickering, and premature reveal triggers across desktop and mobile.

### Scope
- Audit observer thresholds and root margins in `useScrollReveal.js`.
- Review opacity/transform transitions and avoid expensive scroll handlers where possible.
- Verify native scrolling remains smooth and animations do not interfere with content visibility.
- Test Safari, Chrome, Edge, and mobile viewport behavior.

### Acceptance criteria
- [ ] No visible flicker or repeated animation triggering during rapid scrolling.
- [ ] Reveal transitions remain smooth on desktop and mobile.
- [ ] No regression to native scrolling or sticky navigation.

**Priority:** P3-low  
**Module:** Frontend  
**Complexity:** Low  
**Dependencies:** TM-ISSUE-02

<!-- TM-ISSUE-16 -->

---

## TM-ISSUE-17 — feat(admin-export): implement Excel and CSV export engine for share enquiries and contact submissions

**Priority:** P2-medium  
**Module:** Admin Panel / Backend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-03, TM-ISSUE-12

Implement Excel (`.xlsx`) and CSV exports for share-specific enquiries and general Contact Us submissions.

### Scope
- Add “Export to Excel” and “Export to CSV” actions to `/admin/enquiries` and `/admin/contacts`.
- Share enquiry export fields: Enquiry ID, Company Name, Investor Name, Phone, Email, Quantity, Submission Timestamp, Status.
- Contact export fields: ID, Name, Phone, Email, Message, Submission Timestamp.
- Respect active filters, including date range, company, and enquiry status.
- Enforce the manager-approved export permission model.

### Acceptance criteria
- [ ] Both `.xlsx` and `.csv` formats download and open correctly.
- [ ] Exported columns contain the specified fields.
- [ ] Active screen filters are applied to exported data.
- [ ] Export endpoints enforce the approved admin authorization rules.

**Priority:** P2-medium  
**Module:** Admin Panel / Backend  
**Complexity:** Medium  
**Dependencies:** TM-ISSUE-03, TM-ISSUE-12

**Pending manager decision:** Whether exports are available to all authenticated admins or Super Admin only.

<!-- TM-ISSUE-17 -->



