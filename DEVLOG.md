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

*Log last updated: 2026-03-22*
