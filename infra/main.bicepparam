/*
  CoolTech Credential Manager — Deployment Parameters
  ====================================================
  Fill in ALL @secure() parameters before deploying.
  Never commit this file with real secret values to source control.

  Generate secrets with:
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  // for JWT secrets
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  // for ENCRYPTION_KEY
*/

using 'main.bicep'

// ─── Environment ──────────────────────────────────────────────────────────────
param environment = 'prod'
param appName = 'cooltech-credential'

// ─── Regions ──────────────────────────────────────────────────────────────────
param location = 'southafricanorth'      // App Service, Insights
param cosmosLocation = 'centralus'       // Cosmos DB free tier (available in centralus)
param staticWebAppLocation = 'westeurope' // Static Web Apps

// ─── Runtime ──────────────────────────────────────────────────────────────────
param nodeVersion = '~22'

// ─── Secrets (replace ALL placeholder values before deploying) ────────────────
param mongoAdminPassword = 'REPLACE_WITH_STRONG_PASSWORD'
param jwtSecret = 'REPLACE_WITH_64_CHAR_HEX'
param jwtRefreshSecret = 'REPLACE_WITH_DIFFERENT_64_CHAR_HEX'
param encryptionKey = 'REPLACE_WITH_32_CHAR_HEX'
param sendGridApiKey = 'REPLACE_WITH_SENDGRID_API_KEY'  // or leave empty to disable email
param emailFrom = 'REPLACE_WITH_VERIFIED_SENDGRID_SENDER_EMAIL'

// ─── Alerts ───────────────────────────────────────────────────────────────────
param alertEmailAddress = 'REPLACE_WITH_YOUR_EMAIL'
