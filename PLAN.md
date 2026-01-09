# Flux Finances - Development Roadmap

This document outlines the principal functionality needed for MVP release, enhancements for a stronger MVP, and advanced features for future development.

---

## 🔴 Principal Functionality - MVP Critical

These features are essential for a functional MVP release. Each addresses a core gap in the current implementation.

### 1. Transfers Between Accounts
**Priority: CRITICAL**  
**Estimated Effort: 3-4 days**

**Current Status:** Button exists in Quick Actions modal (src/features/general/quick-actions-modal.tsx:90) but is non-functional.

**Implementation Details:**
- Create transfer flow that records both an outflow from source account and inflow to destination account
- Handle transfers between different account types (cash → investment, cash → liability, etc.)
- Support transfers between accounts with different currencies (include exchange rate input)
- Update account balances immediately upon transfer creation
- Add transfer indicator/label on transactions to distinguish from normal transactions

**Why Critical:** Transfers are a fundamental operation in personal finance. Users need to move money between accounts (e.g., from checking to savings, or from checking to credit card payment).

**Database Impact:**
- Add `isTransfer` boolean to transaction table
- Add `transferId` field to link related transaction pairs
- Add `exchangeRate` field for multi-currency transfers

---

### 2. Account Balance History Management
**Priority: CRITICAL**  
**Estimated Effort: 2-3 days**

**Current Status:** Database schema has `accountBalance` table but no UI exists to manage historical balances.

**Implementation Details:**
- Create balance history management interface in Accounts page
- Add manual balance entry form with date picker
- Allow editing of historical balance entries
- Display balance history charts alongside account details
- Support bulk import of balance history
- Ensure balance changes don't create transactions (they're historical snapshots)

**Why Critical:** Without balance history, net worth charts and account progress tracking are incomplete. This is essential for tracking account growth over time.

**Database Impact:** No changes needed - table exists but needs data.

---

### 3. Recurring Transactions
**Priority: CRITICAL**  
**Estimated Effort: 5-7 days**

**Current Status:** No implementation exists.

**Implementation Details:**
- Create recurring transaction management page/section
- Define recurrence patterns: daily, weekly, bi-weekly, monthly, quarterly, yearly
- Add scheduled job processor (cron/bull) to auto-generate transactions
- Display upcoming scheduled transactions in dashboard
- Allow edit/delete of recurring patterns
- Support "nth occurrence" (e.g., every 1st and 15th of month)
- Add "end date" or "occurrences limit" options

**Why Critical:** Most users have recurring expenses (rent, subscriptions, salary) and incomes. Manual entry is error-prone and tedious.

**Database Impact:**
- Create new `recurringTransaction` table
- Fields: `frequency`, `startDate`, `endDate`, `nextOccurrence`, `occurrenceCount`, `isActive`

---

### 4. Transaction Search & Filtering Enhancement
**Priority: HIGH**  
**Estimated Effort: 2-3 days**

**Current Status:** Basic filtering exists in transactions page (category, account, date range) but lacks robust search.

**Implementation Details:**
- Add global search bar accessible from header (Cmd+K pattern)
- Implement full-text search across transaction titles, descriptions, categories
- Advanced filters: amount range, date range presets, multi-category selection
- Save custom filters for quick access
- Search with recent history/autocomplete

**Why Important:** As transaction volume grows, finding specific transactions becomes difficult. Power users need advanced search capabilities.

---

### 5. Budget History & Comparison
**Priority: HIGH**  
**Estimated Effort: 3-4 days**

**Current Status:** Only shows current month's budget progress.

**Implementation Details:**
- Display budget progress for previous months in budget rows
- Add budget comparison view (this month vs last month)
- Historical budget performance charts
- Average spending per category over time
- Budget rollover option (unused budget carries to next month)

**Why Important:** Users need to understand spending patterns over time, not just in the current month.

**Database Impact:**
- Modify budget table to support historical snapshots
- Add `rolloverAmount` and `rolloverEnabled` fields

---

### 6. Multi-Currency Support
**Priority: HIGH**  
**Estimated Effort: 4-5 days**

**Current Status:** Currency fields exist in schema but UI uses hardcoded defaults.

**Implementation Details:**
- Add currency selector to all amount inputs
- Implement real-time currency conversion using API (e.g., Open Exchange Rates)
- Store exchange rates in database for historical accuracy
- Display amounts in user's preferred currency with conversion
- Support multi-currency accounts
- Currency exchange rate history for accurate historical net worth

**Why Important:** Users with accounts in multiple currencies or who travel frequently need this functionality.

**Database Impact:**
- Create `exchangeRate` table (date, fromCurrency, toCurrency, rate)
- Add base currency to user preferences

---

### 7. User Onboarding Flow
**Priority: MEDIUM-HIGH**  
**Estimated Effort: 2-3 days**

**Current Status:** No onboarding exists - users land directly on empty dashboard.

**Implementation Details:**
- Create welcome wizard for new users
- Step 1: Create first account (with initial balance)
- Step 2: Set up budget categories or import existing data
- Step 3: Create initial budget
- Step 4: Import historical transactions (optional)
- Provide quick tutorial tooltips on first visit

**Why Important:** Reduces user churn by guiding users to "aha moment" faster.

---

### 8. Transaction Bulk Actions
**Priority: MEDIUM**  
**Estimated Effort: 1-2 days**

**Current Status:** No bulk operations exist.

**Implementation Details:**
- Add checkbox selection to transactions table
- Bulk category assignment
- Bulk account change
- Bulk delete with confirmation
- Bulk tag assignment (once tags are implemented)

**Why Important:** Users often need to categorize many imported transactions at once.

---

### 9. Import Modal Mobile Integration
**Priority: MEDIUM**  
**Estimated Effort: 1 hour**

**Current Status:** Import modal works but shows "Coming Soon" in mobile menu (header.tsx:91).

**Implementation Details:**
- Replace disabled import link with working DialogTrigger
- Test import functionality on mobile devices
- Ensure mobile-optimized file upload interface

**Why Important:** Mobile users shouldn't be blocked from core functionality.

---

### 10. Enhanced Export Functionality
**Priority: MEDIUM**  
**Estimated Effort: 2-3 days**

**Current Status:** Export modal exists but needs testing and enhancement.

**Implementation Details:**
- Test existing export functionality thoroughly
- Add date range selection
- Export to multiple formats (CSV, Excel, JSON, PDF)
- Include option to export all data vs. filtered data
- Add custom field selection for exports

**Why Important:** Users need to get their data out for tax purposes, analysis, or migration.

---

### 11. Settings Enhancements
**Priority: MEDIUM**  
**Estimated Effort: 2-3 days**

**Current Status:** Basic preferences exist but missing key options.

**Implementation Details:**
- Theme toggle (dark/light) - next-themes is installed but no visible toggle
- Notification preferences (email, push - infrastructure needed)
- Data backup/download settings
- Account deletion with data cleanup
- Privacy settings (data sharing opt-out)
- Timezone/date format selection

**Why Important:** Users expect control over their app experience and data.

---

### 12. Mobile Responsiveness Improvements
**Priority: MEDIUM**  
**Estimated Effort: 3-4 days**

**Current Status:** Mobile menu exists but tables and charts need optimization.

**Implementation Details:**
- Optimize tables for mobile (swipe actions, stacked layout)
- Make charts mobile-friendly (touch interaction, smaller sizes)
- Test all modals on mobile devices
- Optimize form inputs for touch
- Consider PWA enhancements (manifest exists but needs testing)

**Why Important:** Many users manage finances on mobile devices.

---

## 🟡 Extra Functionality - Nice to Have for MVP

These features would significantly enhance the MVP but aren't strictly critical for initial release.

### 1. Spending Goals & Savings Targets
**Estimated Effort: 4-5 days**

Create a goals system where users can set savings targets with:
- Goal name and description
- Target amount and target date
- Linked account for progress tracking
- Visual progress indicators
- Goal achievement celebrations
- Multiple goals support
- Priority ordering of goals

**Why Valuable:** Goals provide motivation and clear financial direction beyond just budgeting.

---

### 2. Advanced Reports & Analytics
**Estimated Effort: 5-7 days**

Build comprehensive reporting dashboard:
- Monthly/quarterly/yearly spending summaries
- Category breakdown pie charts
- Spending trend line charts
- Income vs. expense comparison
- Average daily spending
- Export reports as PDF
- Custom report builder

**Why Valuable:** Power users love deep insights into their financial patterns.

---

### 3. Bill Reminders System
**Estimated Effort: 3-4 days**

Implement bill tracking with due dates:
- Add bills with due dates
- Calendar view of upcoming bills
- Email/push notifications for approaching due dates
- Mark bills as paid
- Payment history
- Recurring bill management

**Why Valuable:** Prevents late fees and helps users stay organized.

---

### 4. Enhanced Investment Tracking
**Estimated Effort: 4-6 days**

Go beyond account-level tracking:
- Individual holdings/stocks per investment account
- Performance metrics (ROI, YTD return, etc.)
- Dividend tracking and reinvestment
- Portfolio allocation breakdown
- Buy/sell transaction history for investments
- Real-time price updates (API integration)

**Why Valuable:** Investment-focused users need granular tracking beyond simple account balances.

---

### 5. Debt Management Tools
**Estimated Effort: 3-4 days**

Add debt-focused features:
- Track debt payoff progress
- Debt payoff calculators (snowball vs. avalanche methods)
- Minimum payment tracking
- Interest rate and balance visualization
- Payoff date projections
- Multiple debt tracking

**Why Valuable:** Many users specifically want to manage and eliminate debt.

---

### 6. Transaction Duplicate Detection
**Estimated Effort: 2-3 days**

Smart duplicate detection:
- Auto-detect potential duplicate transactions (same amount, similar date, same account)
- Suggest merging duplicates
- Duplicate management interface
- Confidence scoring for duplicate suggestions

**Why Valuable:** Prevents inflated spending numbers and reduces manual cleanup work.

---

### 7. Transaction Notes & Tags
**Estimated Effort: 2 days**

Enhance transaction metadata:
- Add notes field to transactions (longer than description)
- Implement tags system for flexible categorization
- Multiple tags per transaction
- Tag-based filtering
- Common tags suggestions

**Why Valuable:** Notes provide context; tags offer flexible categorization beyond fixed categories.

---

### 8. Split Transactions
**Estimated Effort: 2-3 days**

Allow splitting transactions:
- Split single transaction across multiple categories
- Partial splits with remaining amount
- Common for receipts like groceries vs. household items

**Why Valuable:** Increases categorization accuracy for complex purchases.

---

### 9. Subcategory Support
**Estimated Effort: 1-2 days**

**Current Status:** Database schema supports parent categories but UI doesn't use them.

**Implementation Details:**
- Enable subcategory creation in settings
- Display subcategories in category dropdowns
- Group budgets by parent categories
- Expandable category tree views

**Why Valuable:** Better organization for users with detailed categorization needs.

---

### 10. Budget Alerts
**Estimated Effort: 2 days**

Proactive budget notifications:
- Alert when approaching budget limit (e.g., 80%, 90%, 100%)
- Customizable alert thresholds per category
- Daily/weekly summary emails
- Budget status dashboard indicator

**Why Valuable:** Helps users stay on track without constantly checking the app.

---

## 🟢 Advanced Features - Post-MVP

These features represent significant development effort and should be considered for v2.0+ releases.

### 1. Bank Account Aggregation (Plaid/YNAB Integration)
**Estimated Effort: 3-4 weeks**

Integrate with financial data providers:
- Plaid or similar service integration
- Automatic transaction sync from banks
- Automatic balance updates
- Support multiple institutions
- Connection management (add, remove, refresh)
- Transaction enrichment (merchant categorization, logos)

**Why Advanced:** Complex integration, regulatory compliance, ongoing maintenance, service costs.

---

### 2. AI-Powered Financial Insights
**Estimated Effort: 4-6 weeks**

Machine learning features:
- Spending pattern recognition and categorization
- Anomaly detection (unusual spending alerts)
- Budget recommendations based on history
- Financial health scoring
- Predictive cash flow forecasting
- Natural language query ("How much did I spend on groceries this month?")

**Why Advanced:** Requires ML expertise, large datasets, and infrastructure.

---

### 3. Collaborative Features (Family/Shared Accounts)
**Estimated Effort: 3-4 weeks**

Multi-user support:
- Shared accounts (family, partners)
- Shared budgets with permissions
- Expense splitting
- Collaborative categorization
- Activity logs
- Invite and permission management

**Why Advanced:** Significant complexity in permissions, data isolation, and sync.

---

### 4. Advanced Financial Modeling
**Estimated Effort: 3-5 weeks**

Sophisticated projections:
- Cash flow forecasting (months/years ahead)
- Net worth projections with scenarios
- Retirement planning calculators
- Investment growth projections
- What-if scenario modeling
- Monte Carlo simulations for uncertainty

**Why Advanced:** Complex math, requires financial planning expertise.

---

### 5. Tax Reporting Integration
**Estimated Effort: 2-3 weeks**

Tax-focused features:
- Tag transactions as tax-deductible
- Generate tax summaries by category
- Income/expense reports for tax prep
- Export to tax software formats (TurboTax, etc.)
- Mileage tracking for business expenses
- Capital gains tracking for investments

**Why Advanced:** Tax laws vary by jurisdiction; regulatory considerations.

---

### 6. Native Mobile Applications
**Estimated Effort: 6-10 weeks (per platform)**

iOS and Android apps:
- React Native or native implementation
- Offline mode with sync
- Biometric authentication (Face ID, Touch ID)
- Quick transaction entry widgets
- Push notifications
- Camera receipt scanning (OCR)

**Why Advanced:** Significant development effort, separate codebase or framework.

---

### 7. Subscription Management
**Estimated Effort: 2-3 weeks**

Track recurring subscriptions:
- Automatic detection of recurring transactions
- Subscription dashboard with all recurring expenses
- Cost analysis and optimization suggestions
- Cancel reminders
- Duplicate subscription detection
- Category-based subscription tracking

**Why Advanced:** Requires sophisticated transaction pattern detection.

---

### 8. API & Third-Party Integrations
**Estimated Effort: 4-6 weeks**

Open ecosystem:
- RESTful API for developers
- Webhooks for automation (Zapier, IFTTT)
- Integration with accounting software (QuickBooks, Xero)
- Import from other apps (YNAB, Mint, PocketSmith)
- Custom integrations marketplace

**Why Advanced:** Security concerns, authentication, documentation, maintenance.

---

### 9. Financial Calendar
**Estimated Effort: 2-3 weeks**

Calendar-centric view:
- Full calendar view of financial events
- Bills, income, goals on calendar
- Drag-and-drop date changes
- Calendar reminders and notifications
- Month/week/day views
- Filterable event types

**Why Advanced:** Complex UI, data management, but very user-friendly.

---

### 10. Advanced Workspaces & Teams
**Estimated Effort: 5-7 weeks**

Multi-tenant features:
- Separate workspaces for different purposes (personal, business)
- Team expense tracking
- Approval workflows for business expenses
- Advanced permission management
- Audit logs and compliance
- Billing per workspace

**Why Advanced:** Enterprise-level complexity, security, compliance requirements.

---

## 🎯 MVP Release Priority Order

### Phase 1 - Core Functionality (2-3 weeks)
1. **Transfers Between Accounts** - Fundamental operation
2. **Account Balance History Management** - Enables net worth tracking
3. **Transaction Bulk Actions** - Improves efficiency

### Phase 2 - Automation & Organization (3-4 weeks)
4. **Recurring Transactions** - Reduces manual entry
5. **Transaction Search Enhancement** - Power user feature
6. **Budget History & Comparison** - Better insights

### Phase 3 - Polish & Experience (2-3 weeks)
7. **User Onboarding Flow** - Reduces churn
8. **Import Modal Mobile Integration** - Quick win
9. **Enhanced Export Functionality** - Data portability
10. **Mobile Responsiveness Improvements** - Better UX

### Phase 4 - Advanced Features (4-5 weeks)
11. **Multi-Currency Support** - International users
12. **Settings Enhancements** - User control
13. **Spending Goals** - Motivation feature
14. **Advanced Reports** - Power user analytics

**Total MVP Timeline: 11-15 weeks** (3-4 months)

---

## 📊 Technical Considerations

### Database Migrations Needed
- `recurringTransaction` table
- Add transfer fields to `transaction` table
- `exchangeRate` table for multi-currency
- Historical budget snapshots

### Background Jobs Required
- Recurring transaction generation (daily/hourly)
- Exchange rate updates (daily)
- Notification processing

### Third-Party Services
- Currency exchange rate API (e.g., Open Exchange Rates, exchangerate-api)
- Email service (for notifications) - optional for MVP
- PDF generation library

### Performance Considerations
- Implement pagination for large transaction lists
- Add database indexes for search fields
- Consider caching for frequently accessed data
- Optimize net worth calculation queries

### Security Enhancements
- Implement rate limiting for API endpoints
- Add audit logging for sensitive operations
- Secure file uploads for imports
- Sanitize exported data

---

## 🚀 Next Steps

1. **Review and Prioritize:** Adjust priorities based on user feedback and business goals
2. **Set Sprint Goals:** Break down features into 2-week sprint deliverables
3. **Estimate & Refine:** Get more detailed estimates from development team
4. **Set Milestones:** Define clear MVP release criteria and dates
5. **Start Development:** Begin with Phase 1 critical features

---

*Last Updated: 2025*
*Version: 1.0*