/*
  CoolTech Credential Manager — Azure Infrastructure
  ==================================================
  Deploys the full application stack:
    - Azure App Service Plan + App Service (Node.js backend)
    - Azure Static Web Apps (React frontend)
    - Azure Cosmos DB for MongoDB vCore (database)
    - Azure Application Insights + Log Analytics (monitoring)
    - Azure Monitor Alert Rules (incident detection)

  Usage:
    az deployment group create \
      --resource-group credential-manager-rg \
      --template-file infra/main.bicep \
      --parameters infra/main.bicepparam

  Required parameters (set in main.bicepparam or via --parameters flag):
    - mongoAdminPassword
    - jwtSecret
    - jwtRefreshSecret
    - encryptionKey
    - sendGridApiKey
    - alertEmailAddress
*/

targetScope = 'resourceGroup'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

@description('Azure region for primary resources (App Service, Insights)')
param location string = resourceGroup().location

@description('Azure region for Cosmos DB (must have free tier available)')
param cosmosLocation string = 'centralus'

@description('Azure region for Static Web Apps')
param staticWebAppLocation string = 'westeurope'

@description('Base name prefix for all resources')
param appName string = 'cooltech-credential'

@description('MongoDB admin password for Cosmos DB vCore')
@secure()
param mongoAdminPassword string

@description('JWT signing secret (min 64 chars)')
@secure()
param jwtSecret string

@description('JWT refresh token secret (min 64 chars — different from jwtSecret)')
@secure()
param jwtRefreshSecret string

@description('AES-256 encryption key (min 32 chars)')
@secure()
param encryptionKey string

@description('SendGrid API key for transactional email')
@secure()
param sendGridApiKey string = ''

@description('SendGrid verified sender email address')
param emailFrom string = ''

@description('Email address for Azure Monitor alert notifications')
param alertEmailAddress string

@description('Node.js version for App Service')
param nodeVersion string = '~22'

// ─── Variables ────────────────────────────────────────────────────────────────

var appServicePlanName = '${appName}-plan-${environment}'
var appServiceName = '${appName}-api-${environment}'
var cosmosAccountName = '${appName}-db-${environment}'
var staticWebAppName = '${appName}-web-${environment}'
var insightsName = '${appName}-insights-${environment}'
var logAnalyticsName = '${appName}-logs-${environment}'
var alertActionGroupName = '${appName}-alerts-${environment}'
var mongoAdminUser = 'cosmosmongoadmin'

// ─── Modules ──────────────────────────────────────────────────────────────────

module logAnalytics 'modules/insights.bicep' = {
  name: 'logAnalytics'
  params: {
    logAnalyticsName: logAnalyticsName
    insightsName: insightsName
    alertActionGroupName: alertActionGroupName
    alertEmailAddress: alertEmailAddress
    appServiceName: appServiceName
    location: location
  }
}

module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'cosmosDb'
  params: {
    cosmosAccountName: cosmosAccountName
    location: cosmosLocation
    adminUser: mongoAdminUser
    adminPassword: mongoAdminPassword
  }
}

module appService 'modules/appservice.bicep' = {
  name: 'appService'
  params: {
    appServicePlanName: appServicePlanName
    appServiceName: appServiceName
    location: location
    nodeVersion: nodeVersion
    appInsightsConnectionString: logAnalytics.outputs.appInsightsConnectionString
    mongoUri: cosmosDb.outputs.mongoUri(mongoAdminUser, mongoAdminPassword)
    jwtSecret: jwtSecret
    jwtRefreshSecret: jwtRefreshSecret
    encryptionKey: encryptionKey
    sendGridApiKey: sendGridApiKey
    emailFrom: emailFrom
  }
}

module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticWebApp'
  params: {
    staticWebAppName: staticWebAppName
    location: staticWebAppLocation
    backendApiUrl: appService.outputs.appServiceUrl
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

@description('Backend API URL')
output backendUrl string = appService.outputs.appServiceUrl

@description('Frontend Static Web App URL')
output frontendUrl string = staticWebApp.outputs.staticWebAppUrl

@description('Application Insights connection string')
output appInsightsConnectionString string = logAnalytics.outputs.appInsightsConnectionString

@description('Next step: set VITE_API_URL in GitHub repository variables to the backendUrl value')
output nextStep string = 'Set GitHub repository variable VITE_API_URL = ${appService.outputs.appServiceUrl}'
