/*
  App Service Module — CoolTech Credential Manager
  =================================================
  Provisions:
    - App Service Plan (Windows, Free F1 tier)
    - App Service (Node.js backend API)

  Windows is used because the existing deployment targets Windows App Service
  with iisnode for IIS → Node.js routing. The web.config in backend/ handles
  the IIS configuration.

  To switch to Linux (recommended for production paid tiers):
    - Change kind to 'linux'
    - Change reserved to true
    - Remove web.config from backend/
    - Set startup command to 'node server.js'
*/

param appServicePlanName string
param appServiceName string
param location string
param nodeVersion string

@secure()
param appInsightsConnectionString string
@secure()
param mongoUri string
@secure()
param jwtSecret string
@secure()
param jwtRefreshSecret string
@secure()
param encryptionKey string
@secure()
param sendGridApiKey string
@secure()
param emailFrom string

// ─── App Service Plan ─────────────────────────────────────────────────────────

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'F1'     // Free tier — upgrade to B1/B2 for production always-on
    tier: 'Free'
    size: 'F1'
    family: 'F'
    capacity: 1
  }
  kind: 'windows'
  properties: {
    reserved: false
  }
}

// ─── App Service ──────────────────────────────────────────────────────────────

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  kind: 'app'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      // Node.js version on Windows App Service
      nodeVersion: nodeVersion
      // Disable default hostnames redirect — let CORS handle origins
      use32BitWorkerProcess: true
      // Always On is not available on Free tier; set to false
      alwaysOn: false
      // Environment variables injected as App Settings
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: nodeVersion
        }
        {
          name: 'MONGO_URI'
          value: mongoUri
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'JWT_REFRESH_SECRET'
          value: jwtRefreshSecret
        }
        {
          name: 'ENCRYPTION_KEY'
          value: encryptionKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
        // EMAIL — optional; leave empty to fall back to console.log in prod
        {
          name: 'EMAIL_HOST'
          value: 'smtp.sendgrid.net'
        }
        {
          name: 'EMAIL_PORT'
          value: '587'
        }
        {
          name: 'EMAIL_SECURE'
          value: 'false'
        }
        {
          name: 'EMAIL_USER'
          value: 'apikey'
        }
        {
          name: 'EMAIL_PASS'
          value: sendGridApiKey
        }
        {
          name: 'EMAIL_FROM'
          value: emailFrom
        }
        // CORS origin — set after Static Web App is provisioned
        // Update FRONTEND_URL after first deploy
        {
          name: 'FRONTEND_URL'
          value: 'https://placeholder.azurestaticapps.net'
        }
      ]
    }
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServiceId string = appService.id

// ─── Post-deploy note ─────────────────────────────────────────────────────────
// After Static Web App URL is known, update FRONTEND_URL app setting:
//   az webapp config appsettings set \
//     --name <app-service-name> \
//     --resource-group <rg> \
//     --settings FRONTEND_URL=https://<static-web-app-url>
