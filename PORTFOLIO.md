# CoolTech Credential Manager — Portfolio Documentation

> **Author:** goven
> **Certification:** Microsoft Azure Fundamentals (AZ-900) — March 17, 2026
> **Project Type:** Full-stack cloud application, personal portfolio project
> **Status:** Live in Production on Azure

---

## Project Overview

CoolTech Credential Manager is an enterprise-grade credential management system built on the MERN stack and deployed to Microsoft Azure. The application allows organisations to securely store, manage, and share credentials (usernames, passwords, API keys, etc.) across teams and divisions, with role-based access control and full audit logging.

This project was built to translate my AZ-900 Azure Fundamentals certification into hands-on cloud experience — going from theory to a fully deployed, production-grade application.

**Live URLs**
| Component | URL |
|-----------|-----|
| Frontend | https://purple-grass-0bd3c3a03.2.azurestaticapps.net |
| Backend API | https://cooltech-credential-api-ardxfdhsg0e2bxcy.southafricanorth-01.azurewebsites.net |
| Health Check | /api/health |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Azure Static Web Apps (West Europe)                │
│              React 18 + Vite SPA                                │
│              GitHub Actions CI/CD (auto-deploy)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           Azure App Service (South Africa North)                │
│           Windows · Node 22 LTS · Free F1 tier                  │
│           iisnode → Node.js/Express                             │
│           GitHub Actions CI/CD (push to main)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ MongoDB Wire Protocol
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           Azure Cosmos DB vCore (Central US)                    │
│           MongoDB 8.0 compatible · Free tier                    │
│           Automatic continuous backup · 7-day restore           │
└─────────────────────────────────────────────────────────────────┘

Observability Layer (cross-cutting):
┌───────────────────────────────────┐
│  Azure Application Insights       │
│  South Africa North               │
│  Auto-instrumented HTTP + DB deps │
└───────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios, SCSS Modules |
| Backend | Node.js, Express 4, Mongoose 7 |
| Database | MongoDB via Azure Cosmos DB vCore |
| Auth | JWT (30 min access token + 7 day refresh token) |
| Encryption | AES-256-CBC, SHA-256 key derivation |
| Email | SendGrid SMTP (Nodemailer transport) |
| Monitoring | Azure Application Insights + custom Express middleware |
| CI/CD | GitHub Actions |
| Hosting | Azure App Service + Azure Static Web Apps |

---

## Azure Services Used

### Azure App Service
Hosts the Node.js/Express backend API. Configured with:
- **Runtime:** Node 22 LTS on Windows
- **IIS/iisnode:** Windows App Service uses IIS as the web server; iisnode is the IIS module that routes HTTP requests through to the Node.js process via a named pipe (not a TCP port)
- **web.config:** Required for iisnode routing — defines the handler for `.js` files and sets the `iisnode` configuration block
- **Environment variables:** All secrets injected at runtime via App Service Configuration (never committed to source control)
- **CORS:** Configured to allow only the Static Web Apps origin

**Key learning:** Windows App Service with Node.js requires a `web.config` that IIS/iisnode uses to route requests. The named pipe mechanism means `PORT` must not be set — iisnode sets it automatically. This was a non-obvious deployment blocker that required diagnosing from IIS logs.

### Azure Static Web Apps
Hosts the React/Vite frontend. Configured with:
- **Auto-deploy:** Connected directly to GitHub — pushes to `main` trigger an automatic build and deploy via Azure's managed GitHub Actions workflow
- **SPA routing:** `staticwebapp.config.json` with `navigationFallback` rewrites all routes to `index.html`, enabling React Router to handle client-side navigation
- **Build-time env:** `VITE_API_URL` injected as a GitHub repository variable during the build step

**Key learning:** Static Web Apps only serve static files — without `navigationFallback`, direct URL access to routes like `/login` returns 404. The config file must live in `frontend/public/` so Vite copies it to the build output.

### Azure Cosmos DB (vCore)
MongoDB-compatible managed database. Configured with:
- **Tier:** Free vCore (M25), MongoDB 8.0 wire protocol
- **Backup:** Automatic continuous backup with 7-day point-in-time restore (included in vCore tier)
- **Connection:** Standard MongoDB connection string, compatible with Mongoose — no SDK changes required

**Key learning:** Cosmos DB for MongoDB (vCore) is a drop-in replacement for a MongoDB Atlas cluster. The connection string format is identical. The free tier is well-suited for portfolio/dev workloads.

### Azure Application Insights
Full observability for the backend:
- **Auto-instrumentation:** SDK initialised before all other `require()` calls in `server.js` — auto-collects HTTP requests, MongoDB dependency calls, exceptions, and performance counters
- **Live metrics:** Real-time request stream, failure rates, server health
- **Connection string:** Used `APPLICATIONINSIGHTS_CONNECTION_STRING` (the current recommended format) rather than the deprecated `APPINSIGHTS_INSTRUMENTATIONKEY`

**Key learning:** Application Insights must be the first import in the entry file — if other modules load first, they won't be instrumented. The connection string format is preferred over the instrumentation key alone because it includes the ingestion endpoint, making it more reliable and region-aware.

### Azure Monitor Alerts
Three alert rules configured on the App Service:

| Rule | Signal | Threshold | Severity |
|------|--------|-----------|----------|
| High 5xx Error Rate | HTTP 5xx errors | > 5 in 5 minutes | Severity 1 (Error) |
| Slow Response Time | Response Time | avg > 2s in 5 minutes | Severity 2 (Warning) |
| App Service Unavailable | Health check % | < 100 in 1 minute | Severity 0 (Critical) |

All three rules are connected to the `CoolTech Alerts` action group, which sends email notifications to the registered address.

**Key learning:** The "Average Response Time" signal in Azure Monitor is deprecated — use "Response Time" instead. Severity 0 is the highest (Critical), not Severity 4.

---

## Security Features Implemented

### Authentication & Authorisation
- **JWT dual-token flow:** Short-lived access tokens (30 min) + long-lived refresh tokens (7 days). Access tokens are held in memory; refresh tokens in localStorage
- **Silent token refresh:** Axios response interceptor catches 401 errors, attempts `/auth/refresh`, queues concurrent failed requests, and retries them all on success — users never see a login redirect mid-session
- **Role-based access:** Three roles (`user` → `management` → `admin`) with route-level enforcement via `authorize()` middleware
- **Password reset tokens:** Raw token returned to user via email only; SHA-256 hash stored in DB — a compromised database cannot expose reset tokens

### Data Security
- **AES-256-CBC encryption at rest:** All stored passwords encrypted before writing to DB; decrypted only on explicit `/access` endpoint hit (audit logged)
- **SHA-256 key derivation:** `ENCRYPTION_KEY` env var is hashed with SHA-256 to produce a stable 32-byte key — handles any key length without slicing/padding issues
- **No hardcoded secrets:** Startup validation exits the process if any required env var is missing or empty
- **ENCRYPTION_KEY length check:** Startup exits if key is shorter than 32 characters

### API Security
- **Helmet.js:** Sets 11 HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting:** 100 req/15 min general; 5 req/15 min on auth endpoints (production values)
- **Body size limit:** `express.json({ limit: '10kb' })` prevents large payload attacks
- **ReDoS prevention:** Regex special characters escaped in all search endpoints before constructing MongoDB regex queries
- **Credential update whitelist:** Explicit `ALLOWED_UPDATE_FIELDS` array prevents mass assignment / field injection on PATCH endpoints
- **Admin pagination bounds:** Page and limit parameters clamped server-side (`page >= 1`, `limit <= 100`)

### Infrastructure Security
- **Environment variables:** All 14 production secrets set in Azure App Service Configuration — never in source control
- **CORS:** Origin restricted to Static Web Apps URL only
- **SCM Basic Auth:** Enabled only to allow publish profile download; can be disabled post-deployment

---

## Monitoring & Observability

### Custom Express Middleware (`monitor.js`)
A lightweight in-process metrics collector that runs on every request:
- **Counters:** Total requests, 4xx count, 5xx count
- **Latency:** Rolling window of last 1,000 request durations → calculates avg, p95, p99
- **Throughput:** Requests per minute (rolling 60s window)
- **Per-route breakdown:** Top 20 routes by request count

### Metrics API (`/api/metrics`)
Admin-protected endpoints exposing:
- `/api/metrics` — full operational snapshot
- `/api/metrics/db` — database ping latency, connection state, pool stats
- `/api/metrics/server` — heap usage, RSS, Node version, uptime

### Health Check (`/api/health`)
Public endpoint returning:
- DB connection state + ping latency (< 100ms target)
- Error rates (4xx, 5xx, overall %)
- Latency percentiles (avg, p95, p99)
- Memory usage (heap used/total, RSS)
- Server uptime

### Azure Application Insights
- Auto-collected: all HTTP requests, MongoDB dependency calls, exceptions
- Live Metrics: real-time request stream during active sessions
- Alerts: three Azure Monitor rules for proactive incident detection

---

## CI/CD Pipeline

### Backend (GitHub Actions → Azure App Service)
**Trigger:** Push to `main` that modifies files under `backend/**`

```
Push to main
    └─► GitHub Actions runner (Ubuntu)
            ├─► actions/checkout
            ├─► actions/setup-node (Node 22)
            ├─► npm install (backend/)
            └─► azure/webapps-deploy
                    └─► Publish profile auth → App Service
```

**Secrets required:**
- `AZURE_WEBAPP_PUBLISH_PROFILE` — downloaded from App Service Overview → Publish Profile

**Variables required:**
- `AZURE_WEBAPP_NAME` — the App Service name

### Frontend (Azure-managed GitHub Actions → Static Web Apps)
**Trigger:** Push to any branch (Azure auto-generates the workflow)

```
Push to main
    └─► Azure-managed runner
            ├─► actions/checkout
            ├─► actions/setup-node
            ├─► Vite build (with VITE_API_URL injected)
            └─► Azure Static Web Apps deploy action
```

**Variables required:**
- `VITE_API_URL` — GitHub repository variable, injected at build time

---

## Data Model Overview

```
OrganisationalUnit
    └─► Division (many per OU)
            └─► CredentialRepository (many per Division)
                    └─► Credential (many per repo, password encrypted)

User
    ├─► role: user | management | admin
    ├─► divisions: [Division._id]       ← access control
    └─► organizationalUnits: [OU._id]   ← access control

ActivityLog  (TTL: 90 days auto-delete)
    ├─► user, action, resource, resourceId
    └─► timestamp (indexed for TTL)

PasswordResetToken
    ├─► tokenHash (SHA-256)   ← stored in DB
    └─► rawToken              ← sent to user via email only
```

---

## Technical Challenges & Solutions

### 1. iisnode Named Pipe vs TCP Port
**Problem:** Azure App Service on Windows uses IIS + iisnode to host Node.js. iisnode passes requests to Node via a Windows named pipe, not a TCP port. Setting `PORT=8080` as an environment variable caused `EADDRINUSE` because Node tried to bind to port 8080 while iisnode expected the named pipe.

**Solution:** Removed `PORT` from App Service environment variables entirely. iisnode automatically sets `PORT` to the named pipe path at runtime. The `web.config` file is required to tell IIS which file to pass requests to.

**Lesson:** Windows App Service and Linux App Service behave differently for Node.js. The `web.config` and named pipe behaviour are Windows-specific — a detail not covered in most Node.js deployment guides.

### 2. SPA Routing on Static Web Apps
**Problem:** Azure Static Web Apps serves static files. Navigating directly to `https://app.azurestaticapps.net/login` returns 404 because there is no `login` directory or file — React Router handles that route client-side.

**Solution:** Added `frontend/public/staticwebapp.config.json` with a `navigationFallback` rule that rewrites all non-asset routes to `/index.html`. Vite copies `public/` contents to the build output, so the config is automatically included in every deploy.

### 3. API URL Double /api Path
**Problem:** The frontend `api.js` constructs the base URL as `${VITE_API_URL}/api`. The `VITE_API_URL` GitHub variable was initially set to `https://<backend>/api`, resulting in `/api/api/auth/login` — a 404 on every API call.

**Solution:** `VITE_API_URL` must be the base URL without the `/api` suffix. The variable was corrected, the frontend rebuilt, and the issue resolved.

### 4. Encryption Key Derivation
**Problem:** The original code used `Buffer.from(ENCRYPTION_KEY.slice(0, 32))` — if the key was a hex string longer than 32 characters, slicing 32 characters is not the same as taking 16 bytes (hex encodes 2 chars per byte). This risked subtle decryption failures depending on key format.

**Solution:** Replaced with `crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()` — always produces exactly 32 bytes regardless of input length or encoding. Production database was reseeded with the same `ENCRYPTION_KEY` to keep encrypted values consistent.

### 5. Application Insights on Windows Dev Machine
**Problem:** `npm install applicationinsights` on Windows pulled in hundreds of native dependencies and hit file locking errors. The local `node_modules` became corrupted.

**Solution:** Added `applicationinsights` directly to `package.json` without running `npm install` locally. GitHub Actions runs on Ubuntu — the Linux runner has no file locking issues and installs successfully on every deploy.

### 6. SendGrid From Address Mismatch
**Problem:** SendGrid rejected outbound email with `550 Unauthenticated senders not allowed` because `EMAIL_FROM` did not exactly match the verified Sender Identity in the SendGrid dashboard.

**Solution:** Corrected `EMAIL_FROM` in Azure App Service environment variables to exactly match the verified sender email address. Format must be a plain email address — display name format (`Name <email>`) is not required.

---

## Environment Variables (Production)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` — enables production behaviour throughout |
| `MONGO_URI` | Cosmos DB vCore connection string |
| `JWT_SECRET` | Signs access tokens (64-byte random hex) |
| `JWT_REFRESH_SECRET` | Signs refresh tokens (separate 64-byte random hex) |
| `ENCRYPTION_KEY` | AES-256 encryption key for stored passwords (≥ 32 chars) |
| `FRONTEND_URL` | Static Web Apps URL — used for CORS origin |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~22` — pins Node version on Windows App Service |
| `EMAIL_HOST` | `smtp.sendgrid.net` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` (STARTTLS on port 587) |
| `EMAIL_USER` | `apikey` (literal string for SendGrid) |
| `EMAIL_PASS` | SendGrid API key |
| `EMAIL_FROM` | Verified sender email address |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights telemetry ingestion |

---

## Deployment Checklist (Completed)

- [x] Azure Resource Group created (`credential-manager-rg`, South Africa North)
- [x] Azure App Service provisioned (Windows, Node 22 LTS, Free F1)
- [x] Azure Cosmos DB vCore provisioned (MongoDB 8.0, free tier, Central US)
- [x] Azure Static Web Apps provisioned (Free tier, West Europe)
- [x] Azure Application Insights provisioned (South Africa North)
- [x] `web.config` added for iisnode routing
- [x] `staticwebapp.config.json` added for SPA routing fallback
- [x] All 14 environment variables set in App Service Configuration
- [x] GitHub Actions backend workflow configured with publish profile
- [x] GitHub Actions frontend workflow auto-generated by Azure
- [x] `VITE_API_URL` set as GitHub repository variable
- [x] Database seeded against Cosmos DB (production ENCRYPTION_KEY)
- [x] Health endpoint verified: returns `"status": "healthy"`
- [x] Login verified: `admin@cooltech.com` / `Admin123!`
- [x] SendGrid SMTP verified: password reset email received
- [x] Application Insights receiving telemetry
- [x] Three Azure Monitor alerts configured
- [x] Cosmos DB automatic continuous backup confirmed

---

## Known Limitations & Future Roadmap

| Item | Notes |
|------|-------|
| Email spam classification | SendGrid via Gmail domain → emails land in spam. Fix: add SPF/DKIM records on a custom domain |
| Free tier cold starts | F1 App Service sleeps after inactivity — first request after sleep has ~5s latency |
| No custom domain or TLS cert | Using Azure default domains (`*.azurewebsites.net`, `*.azurestaticapps.net`) |
| Notifications system | Bell icon removed — stub only, not implemented |
| Two-factor authentication | Not implemented |
| Bulk credential import (CSV) | Not implemented |
| Audit log viewer UI | Logs stored in DB but no frontend page to view them |
| Keyboard shortcut (Ctrl+K) | Global search shortcut not yet wired |

---

## What I Learned

**Cloud fundamentals applied in practice:**
- Azure resource hierarchy: Subscription → Resource Group → Resources
- How Azure App Service, Static Web Apps, Cosmos DB, and Application Insights fit together and interact
- The difference between PaaS tiers and their constraints (free tier cold starts, Windows vs Linux App Service behaviour)
- How GitHub Actions integrates with Azure for automated deployments

**Production engineering:**
- Environment variable management as the boundary between development and production
- Why you cannot use the same database seed across environments without accounting for the encryption key
- How IIS/iisnode works differently from a typical Linux + nginx/PM2 Node.js setup
- The importance of health endpoints as a deployment verification mechanism

**Security engineering in practice:**
- JWT dual-token patterns and the tradeoffs between security and UX
- Why password reset tokens must be hashed before storage (same principle as passwords)
- Rate limiting and ReDoS as distinct attack surfaces requiring separate mitigations
- Why `ENCRYPTION_KEY` derivation matters for AES key length consistency

---

*Document created: 2026-03-30*
*DEVLOG: See [DEVLOG.md](DEVLOG.md) for session-by-session development log*
