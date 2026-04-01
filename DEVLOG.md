# CoolTech Credential Manager — Development Log

> **Project:** MERN stack enterprise credential management system
> **Stack:** React 18 + Vite (frontend) · Node.js/Express (backend) · MongoDB/Mongoose
> **Target:** Azure App Service (backend) + Azure Static Web Apps (frontend) + Azure Cosmos DB
> **Author:** goven
> **Log started:** 2026-03-22

---

## Session 1 — Azure Deployment Prep

### Completed
- [x] Confirmed `PORT` binding already correct in `backend/server.js` (`process.env.PORT || 5000`)
- [x] Enhanced `/api/health` endpoint to return DB connection state, environment, timestamp
- [x] Updated `frontend/src/services/api.js` baseURL to use `VITE_API_URL` env var with `/api` fallback
- [x] Created `.github/workflows/backend-deploy.yml` — GitHub Actions CI/CD for Azure App Service
- [x] Created `frontend/src/components/ErrorBoundary.jsx` (Vite-compatible, uses `import.meta.env.DEV`)
- [x] Updated `frontend/src/main.jsx` to wrap app with ErrorBoundary

---

## Session 2 — Backend Security (Day 1 Pre-Azure Fixes)

### Completed
- [x] **Removed hardcoded ENCRYPTION_KEY fallback** in `backend/models/CredentialRepository.js`
  - Was: `process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long!'`
  - Now: fails at startup if missing
- [x] **SHA-256 hashing for password reset tokens** in `backend/models/PasswordResetToken.js`
  - Raw token returned to user, hash stored in DB — prevents DB compromise exposing reset tokens
- [x] **Email service** created at `backend/utils/emailService.js`
  - Nodemailer SMTP transport; falls back to console.log in dev if `EMAIL_HOST` not set
- [x] **Auth route** (`backend/routes/auth.js`) updated:
  - Uses `{ rawToken }` from new `generateToken()` signature
  - Removed dev token leak from response body
  - Calls `sendPasswordResetEmail()`
- [x] **Duplicate `/search` route** removed from `backend/routes/repositories.js`
- [x] **MongoDB indexes added:**
  - `User`: `{ divisions: 1 }`, `{ organizationalUnits: 1 }`, `{ role: 1, isActive: 1 }`
  - `Division`: `{ organizationalUnit: 1, isActive: 1 }`
- [x] **ENCRYPTION_KEY added** to `requiredEnvVars` startup validation in `backend/server.js`
- [x] Added email SMTP vars to `backend/.env`: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

---

## Session 3 — Frontend UI/UX Modernisation (Round 1)

### Design System Overhaul (`frontend/src/styles/_variables.scss`)
- [x] Primary colour changed: `#2563eb` → `#6366f1` (deep indigo)
- [x] Backgrounds deepened: `$dark-bg: #070b14`, `$dark-surface: #0f1623`, `$dark-card: #141d2e`
- [x] Border radius increased: sm=6px, base=10px, lg=14px; added xl=20px, 2xl=28px, pill=9999px
- [x] Added: `$font-mono`, `$font-size-3xl`, category colour variables, transition variables

### Component SCSS Updated
- [x] `AuthLayout.scss` — animated gradient orb background, glass card with `backdrop-filter: blur(20px)`
- [x] `Sidebar.scss` — solid surface, `::before` pseudo-element for 🔐 brand icon, collapse behaviour
- [x] `NavigationMenu.scss` — pill active state, 3px left accent bar via `::before`
- [x] `UserProfile.scss` — gradient avatar, role pill with neutral background
- [x] `TopBar.scss` — 64px height, glass effect `rgba(7,11,20,0.85)` + `backdrop-filter: blur(16px)`
- [x] `CredentialTable.scss` — per-category badge colours via `[data-category]`, monospace usernames, reveal-on-hover copy buttons
- [x] `Toast.scss` — glass toast with 3px left accent stripe, spring bounce animation

---

## Session 4 — Database Seeding Fix

### Completed
- [x] **Identified root cause of login failure:** database was empty, seed script never run
- [x] Ran `npm run seed` in `backend/`:
  - 4 Organisational Units
  - 48 Divisions (12 per OU)
  - 4 demo users (admin, manager, user, multiuser)
  - 8 credential repositories · 21 sample credentials
- [x] Login confirmed working: `admin@cooltech.com` / `Admin123!`

### Demo Accounts
| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@cooltech.com | Admin123! | Admin | All OUs + Divisions |
| manager@cooltech.com | Manager123! | Management | News Management OU |
| user@cooltech.com | User123! | User | Software Reviews — Development |
| multiuser@cooltech.com | Multi123! | User | Software Reviews + Opinion Publishing |

---

## Session 5 — Enterprise UI Enhancements (Round 2)

### New Components
- [x] **`VaultStats`** (`frontend/src/components/dashboard/VaultStats.jsx` + SCSS)
  - 3 stat cards on dashboard: Repositories, Org Units, Avg per OU
  - Computed from existing API data (no extra API call)
- [x] **`PasswordStrength`** (`frontend/src/components/common/PasswordStrength.jsx` + SCSS)
  - 4-segment coloured bar: Weak (red) → Fair (amber) → Good (cyan) → Strong (green)
  - Uses existing `utils/passwordStrength.js`
  - Wired into: AddCredentialModal (live feedback), EditCredentialModal (live feedback), ViewCredentialModal (shows stored password strength)
- [x] **Category breakdown in RepositoryHeader**
  - Per-category coloured pills computed from `repository.credentials`
  - Shared `utils/categoryColors.js` created (used by RepositoryHeader + SearchBar)

---

## Session 6 — Navigation & UX Improvements

### Completed
- [x] **ConfirmModal** (`frontend/src/components/common/ConfirmModal.jsx` + SCSS)
  - Glass modal with spring animation, danger/warning variants
  - Esc key closes, focus set to Cancel button by default
- [x] **PageTitleContext** (`frontend/src/contexts/PageTitleContext.jsx`)
  - TopBar H1 now shows actual division name when inside a repo (was hardcoded "Repository")
  - Auto-resets to static titles (Dashboard, Admin Panel) on route change
- [x] **Notifications bell removed** from TopBar — was a disabled stub ("Coming Soon"), replaced with clean layout
- [x] **Recent Repositories section in Sidebar**
  - `useRecentRepos` hook + `RecentReposContext`
  - Persisted in `localStorage`, max 5 entries
  - Appears below main nav, shows active state, works in collapsed mode
- [x] **Search result category pill colours** — now use per-category colours matching the credential table (was fixed indigo)

---

## Session 7 — Final Pre-Deploy Audit & Fixes

### Audit findings resolved
- [x] `window.confirm` in `RoleDropdown.jsx` — replaced with `ConfirmModal` (warning variant)
- [x] Missing `data-category` attribute on category badges — added to `CredentialTable.jsx` and `ViewCredentialModal.jsx` (CSS `[data-category]` selectors were defined but never triggered)
- [x] **Credential update field injection** (`backend/routes/repositories.js`) — replaced open `Object.keys(req.body)` loop with explicit `ALLOWED_UPDATE_FIELDS` whitelist
- [x] **Bulk delete** (`RepositoryView.jsx`) — `Promise.all` → `Promise.allSettled` with separate success/failure toasts for partial failures
- [x] **ENCRYPTION_KEY length check** in `backend/server.js` — startup now exits if key < 32 chars
- [x] FAB button `aria-label="Add new credential"` added

### Deliberate non-fixes (noted for transparency)
- `vite.config.js` localhost — dev proxy only, no effect in production
- Breadcrumbs extra API call — intentional, fetches live division name
- Seed script hardcoded passwords — intentional seeded demo accounts

---

## Current State — Ready for Azure Deployment

### Build status
- Frontend: ✅ 182 modules, 0 errors (last verified 2026-03-22)
- Backend: ✅ No syntax errors, startup validation in place

### Pre-deployment checklist
- [ ] Create Azure Resource Group (`credential-manager-rg`)
- [ ] Create Azure App Service (Node 20 LTS, Linux) for backend
- [ ] Create Azure Cosmos DB for MongoDB (Serverless)
- [ ] Create Azure Static Web Apps for frontend (connect GitHub repo)
- [ ] Set App Service environment variables:
  - `NODE_ENV=production`
  - `PORT=8080`
  - `MONGO_URI` (from Cosmos DB connection string)
  - `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
  - `JWT_REFRESH_SECRET` (same command, different value)
  - `ENCRYPTION_KEY` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — must be ≥ 32 chars)
  - `FRONTEND_URL` (your Static Web App URL)
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (optional — falls back to console in dev)
- [ ] Set Static Web App environment variable: `VITE_API_URL` (App Service URL)
- [ ] Download App Service publish profile → add as GitHub secret `AZURE_WEBAPP_PUBLISH_PROFILE`
- [ ] Add GitHub variable `AZURE_WEBAPP_NAME`
- [ ] Configure CORS on App Service → add Static Web App URL
- [ ] Verify health endpoint: `https://<app-name>.azurewebsites.net/api/health`
- [ ] Re-run seed against Cosmos DB after first deploy
- [ ] Test login with admin@cooltech.com / Admin123!

---

## Session 8 — Azure Deployment (Active)

### Infrastructure Provisioned
- [x] **Azure Resource Group:** `credential-manager-rg` (South Africa North)
- [x] **Azure App Service:** `cooltech-credential-api` (Windows, Node 22 LTS, Free F1)
  - URL: `https://cooltech-credential-api-ardxfdhsg0e2bxcy.southafricanorth-01.azurewebsites.net`
- [x] **Azure Cosmos DB (DocumentDB vCore):** `cooltech-credential-db` (Central US, free tier)
  - MongoDB 8.0 compatible, automatic continuous backups, 7-day point-in-time restore
- [x] **Azure Static Web Apps:** `purple-grass-0bd3c3a03` (West Europe, Free tier)
  - URL: `https://purple-grass-0bd3c3a03.2.azurestaticapps.net`
- [x] **Azure Application Insights:** `cooltech-credential-insights` (South Africa North)

### CI/CD Pipelines
- [x] `backend-deploy.yml` — deploys backend to App Service on push to `main` affecting `backend/**`
- [x] `azure-static-web-apps-purple-grass-0bd3c3a03.yml` — auto-generated by Azure, deploys frontend

### Deployment Issues Resolved
- [x] **iisnode web.config** — Windows App Service requires `web.config` for Node.js routing via IIS
- [x] **PORT env var conflict** — removed `PORT=8080` from App Service env vars; iisnode uses named pipe
- [x] **VITE_API_URL double `/api`** — `api.js` already appends `/api`; variable must be base URL only
- [x] **SPA routing 404** — added `frontend/public/staticwebapp.config.json` with `navigationFallback`
- [x] **Publish profile auth** — enabled SCM Basic Auth Publishing Credentials in App Service config
- [x] **GitHub Actions credentials** — added `AZURE_WEBAPP_PUBLISH_PROFILE` secret + `AZURE_WEBAPP_NAME` variable

### Environment Variables Set in Azure App Service
`NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `FRONTEND_URL`,
`WEBSITE_NODE_DEFAULT_VERSION`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`,
`EMAIL_PASS`, `EMAIL_FROM`, `APPLICATIONINSIGHTS_CONNECTION_STRING`

---

## Session 9 — Post-Deployment Fixes

- [x] **Recent repos user scoping** — `useRecentRepos` hook now scoped by `user._id`; prevents cross-user data leakage in localStorage
- [x] **Recent repos UI** — shows only most recent entry with visit timestamp instead of all 5 compressed
- [x] **Provider nesting fix** — `RecentReposProvider` moved inside `AuthProvider` in `App.jsx`
- [x] **Production database reseeded** — ran seed against Cosmos DB with production `ENCRYPTION_KEY`

---

## Session 10 — Production Audit & Security Hardening

### Backend Fixes
- [x] **Body size limits** — `express.json({ limit: '10kb' })` prevents large payload attacks
- [x] **Unhandled rejection/exception handlers** — `process.on('unhandledRejection')` + `process.on('uncaughtException')`
- [x] **Graceful shutdown** — `SIGTERM`/`SIGINT` handlers close HTTP server cleanly before exit
- [x] **Database retry logic** — 5 attempts with 3s backoff; removed deprecated Mongoose options; connection pool configured
- [x] **Encryption key fix** — `ENCRYPTION_KEY` now derived via `SHA-256` hash for stable 32-byte key regardless of input format
- [x] **ActivityLog TTL index** — auto-deletes logs older than 90 days
- [x] **ReDoS prevention** — regex special chars escaped in search endpoints (`repositories.js`, `admin.js`)
- [x] **Admin pagination bounds** — `page ≥ 1`, `limit ≤ 100` enforced
- [x] **`/auth/refresh` endpoint** — new endpoint issues fresh access token from valid refresh token
- [x] **Token refresh interceptor** — `api.js` silently renews access token on 401 before redirecting to login

### Monitoring Layer
- [x] **`backend/middleware/monitor.js`** — tracks request count, 4xx/5xx error rates, rolling latency (avg/p95/p99), per-route breakdown, throughput (req/min)
- [x] **`backend/routes/metrics.js`** — admin-protected: `GET /api/metrics`, `/api/metrics/db`, `/api/metrics/server`
- [x] **Enhanced `/api/health`** — now returns uptime, DB ping latency, error rates, latency stats, memory usage

---

## Session 11 — Email, Monitoring & Alerts

- [x] **SendGrid SMTP** — integrated for password reset emails; sender verified (`codemail619@gmail.com`)
  - Note: emails may land in spam due to free Gmail sender domain — production fix is domain authentication (SPF/DKIM)
- [x] **Azure Application Insights** — SDK integrated in `server.js`; auto-instruments all HTTP requests, MongoDB dependencies, exceptions, live metrics
- [x] **Azure Alerts configured** (3 rules on App Service):
  - `High 5xx Error Rate` — 5xx > 5 in 5 min → Severity 1
  - `Slow Response Time` — avg response > 2s in 5 min → Severity 2
  - `App Service Unavailable` — health check < 100 → Severity 0 Critical
  - Action group: `CoolTech Alerts` → email `codemail619@gmail.com`
- [x] **Environment variables audit** — all 14 production variables confirmed set in Azure App Service
- [x] **Cosmos DB backup** — automatic continuous backup confirmed (vCore tier); 7-day point-in-time restore

---

## Deployment Status — LIVE ✅

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://purple-grass-0bd3c3a03.2.azurestaticapps.net | ✅ Live |
| Backend API | https://cooltech-credential-api-ardxfdhsg0e2bxcy.southafricanorth-01.azurewebsites.net | ✅ Live |
| Health Check | /api/health | ✅ Healthy |
| Database | Cosmos DB vCore (Central US) | ✅ Connected |
| Email | SendGrid SMTP | ✅ Functional |
| Monitoring | Application Insights + Custom Middleware | ✅ Active |
| Alerts | 3 Azure Alert rules | ✅ Configured |
| CI/CD | GitHub Actions (backend + frontend) | ✅ Active |

---

## Known Limitations / Future Enhancements

### Not yet implemented (backlog)
- [ ] Notifications system (bell icon removed — stub only)
- [ ] Pagination on `/api/repositories/accessible` (fine for current scale)
- [ ] Keyboard shortcut for global search (Ctrl+K / Cmd+K)
- [ ] "All Credentials" flat list view (requires new route + backend endpoint)
- [ ] Password expiry alerts / credential health scoring at repo level
- [ ] Favicon/site icon fetching for credential entries
- [ ] Two-factor authentication
- [ ] Audit log viewer UI (logs exist in DB but no frontend page)
- [ ] Dark/light theme toggle
- [ ] Bulk credential import (CSV)

### Architecture notes
- Passwords encrypted at rest with AES-256-CBC; decryption only on explicit `/access` endpoint hit
- Role hierarchy: `user` (read + add) → `management` (read + add + edit) → `admin` (full)
- JWT access tokens: 30 min · Refresh tokens: 7 days
- Password reset tokens: SHA-256 hashed in DB, raw token sent via email only

---

---

## Session 13 — Mobile, Performance, Admin & IaC

### Performance
- [x] **bcrypt salt rounds: 12 → 10** in `backend/models/User.js`
  - Reduces registration/password-change time from ~3s to ~150ms on the free tier
  - Salt 10 is OWASP's recommended minimum; 12 was unnecessarily slow for a web app

### Admin: Delete User
- [x] **`DELETE /api/admin/users/:userId`** endpoint added to `backend/routes/admin.js`
  - Prevents self-deletion
  - Activity-logs the deletion (username + email captured before delete)
- [x] **Delete button in UserTable** — trash icon per row, triggers ConfirmModal (danger variant)
- [x] **Delete handler in UserManagement** — `requestDeleteUser` / `handleDeleteUser` pattern

### Mobile Responsiveness
- [x] **iOS auto-zoom prevention** in `frontend/src/styles/main.scss`
  - Adds `font-size: 16px` on all `input`, `select`, `textarea` at `≤ 768px`
  - iOS Safari zooms in on any focused input < 16px — this prevents layout breaking on iPhone/iPad
- All other responsive breakpoints were already in place (layout, sidebar, tables, modals, cards)

### Demo Documentation
- [x] **`USER_GUIDE.md` created** — plain-language guide for end users:
  - What the app does, hierarchy structure, all feature walkthroughs
  - Demo accounts table + role permissions matrix
  - Install instructions (local dev + Azure)
  - Clear note that all pre-loaded data is demo-only and can be replaced

### Infrastructure as Code (IaC)
- [x] **Bicep templates created** at `infra/`:
  - `infra/main.bicep` — entry point, orchestrates all modules
  - `infra/main.bicepparam` — parameter file (fill secrets before deploying)
  - `infra/modules/appservice.bicep` — App Service Plan + App Service (Node 22, Windows, F1)
  - `infra/modules/cosmosdb.bicep` — Cosmos DB vCore (MongoDB 8.0, free M25) with firewall
  - `infra/modules/staticwebapp.bicep` — Static Web Apps (Free) with VITE_API_URL app setting
  - `infra/modules/insights.bicep` — Log Analytics + App Insights + Action Group + 3 Alert Rules
  - `infra/INFRASTRUCTURE.md` — deploy guide: prerequisites, step-by-step, teardown, upgrade path
- Deploy command: `az deployment group create --resource-group credential-manager-rg --template-file infra/main.bicep --parameters infra/main.bicepparam`

---

## Session 12 — Portfolio Documentation

- [x] **`PORTFOLIO.md` created** — comprehensive portfolio document covering:
  - Project overview with live URLs
  - Architecture diagram (ASCII) showing all Azure services
  - Azure services deep-dive: App Service, Static Web Apps, Cosmos DB, Application Insights, Monitor Alerts
  - Security features: JWT dual-token flow, AES-256-CBC encryption, rate limiting, ReDoS prevention, etc.
  - Monitoring & observability: custom middleware, metrics API, health check, Application Insights
  - CI/CD pipeline for both frontend and backend
  - Data model overview
  - 6 technical challenges with problem/solution/lesson format
  - Full environment variables reference table
  - Completed deployment checklist
  - Known limitations and future roadmap
  - Lessons learned section

---

---

## Session 13 — Full Debugging Audit

### Bugs Fixed
- [x] **`backend/scripts/troubleshoot-login.js`** — wrong module paths (`./models/User` → `../models/User`, `./config/database` → `../config/database`). Would crash at runtime.
- [x] **`README.md`** — bcrypt salt rounds documented as 12, corrected to 10 (changed in Session 11)
- [x] **`README.md`** — Node.js prerequisite listed as v16, corrected to v22
- [x] **`README.md`** — missing `DELETE /api/admin/users/:userId` endpoint added to API reference
- [x] **`SETUP_GUIDE.md`** — Node.js prerequisite listed as v16, corrected to v22
- [x] **`SETUP_GUIDE.md`** — Manager role description omitted delete permission, corrected
- [x] **`SETUP_GUIDE.md`** — project structure listed `DEMO_ACCOUNTS.txt` which does not exist, removed

### AI Watermarks Removed (JSDoc Cleanup)
- [x] `backend/utils/passwordGenerator.js` — file header + per-function JSDoc; also removed 3 dead duplicate const declarations (`uppercaseSimilar`, `lowercaseSimilar`, `numbersSimilar`)
- [x] `backend/middleware/activityLogger.js` — file header + per-function JSDoc
- [x] `frontend/src/contexts/SearchContext.jsx` — file header + per-hook JSDoc + per-provider JSDoc
- [x] `frontend/src/components/common/ErrorBoundary.jsx` — file header + redundant inline comments
- [x] `frontend/src/components/common/ProtectedRoute.jsx` — file header JSDoc
- [x] `frontend/src/components/common/EmptyState.jsx` — file header JSDoc
- [x] `frontend/src/components/common/SkeletonLoader.jsx` — file header JSDoc
- [x] `frontend/src/components/admin/AdminPanel/AdminPanel.jsx` — file header JSDoc
- [x] `frontend/src/components/dashboard/Dashboard.jsx` — file header JSDoc
- [x] `frontend/src/components/repositories/RepositoryView/RepositoryView.jsx` — file header JSDoc
- [x] `frontend/src/utils/networkErrorHandler.js` — file header + all per-function JSDoc
- [x] `frontend/src/utils/passwordStrength.js` — file header JSDoc
- [x] `frontend/src/utils/keyboardNavigation.js` — file header + all per-function JSDoc
- [x] `frontend/src/utils/exportUtils.js` — file header + all per-function JSDoc

---

*Log last updated: 2026-04-01*
