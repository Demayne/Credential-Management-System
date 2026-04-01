/*
  Application Insights & Alerts Module — CoolTech Credential Manager
  ===================================================================
  Provisions:
    - Log Analytics Workspace (backing store for Application Insights)
    - Application Insights component (workspace-based)
    - Alert Action Group (email notifications)
    - 3 Azure Monitor Alert Rules:
        1. High 5xx error rate    (Severity 1 — Error)
        2. Slow response time     (Severity 2 — Warning)
        3. App Service unavailable (Severity 0 — Critical)
*/

param logAnalyticsName string
param insightsName string
param alertActionGroupName string
param alertEmailAddress string
param appServiceName string
param location string

// ─── Log Analytics Workspace ──────────────────────────────────────────────────

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30     // Free tier allows up to 31 days
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ─── Application Insights ─────────────────────────────────────────────────────

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    RetentionInDays: 30
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ─── Alert Action Group ───────────────────────────────────────────────────────

resource alertActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: alertActionGroupName
  location: 'global'
  properties: {
    groupShortName: 'CoolTechAlrt'
    enabled: true
    emailReceivers: [
      {
        name: 'Primary Contact'
        emailAddress: alertEmailAddress
        useCommonAlertSchema: true
      }
    ]
  }
}

// ─── Helper: App Service Resource ID ─────────────────────────────────────────

var appServiceResourceId = resourceId('Microsoft.Web/sites', appServiceName)

// ─── Alert Rule 1: High 5xx Error Rate ────────────────────────────────────────

resource alert5xx 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'High 5xx Error Rate'
  location: 'global'
  properties: {
    description: 'HTTP 5xx server errors exceeded 5 in a 5-minute window'
    severity: 1
    enabled: true
    scopes: [appServiceResourceId]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'Http5xx'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'Http5xx'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'GreaterThan'
          threshold: 5
          timeAggregation: 'Total'
        }
      ]
    }
    actions: [
      {
        actionGroupId: alertActionGroup.id
      }
    ]
    autoMitigate: true
  }
}

// ─── Alert Rule 2: Slow Response Time ─────────────────────────────────────────

resource alertSlowResponse 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'Slow Response Time'
  location: 'global'
  properties: {
    description: 'Average HTTP response time exceeded 2 seconds over a 5-minute window'
    severity: 2
    enabled: true
    scopes: [appServiceResourceId]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'AverageResponseTime'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'HttpResponseTime'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'GreaterThan'
          threshold: 2
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [
      {
        actionGroupId: alertActionGroup.id
      }
    ]
    autoMitigate: true
  }
}

// ─── Alert Rule 3: App Service Unavailable ────────────────────────────────────

resource alertUnavailable 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'App Service Unavailable'
  location: 'global'
  properties: {
    description: 'App Service health check availability dropped below 100% — possible outage'
    severity: 0
    enabled: true
    scopes: [appServiceResourceId]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT1M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HealthCheckStatus'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'HealthCheckStatus'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'LessThan'
          threshold: 100
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [
      {
        actionGroupId: alertActionGroup.id
      }
    ]
    autoMitigate: true
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output appInsightsConnectionString string = appInsights.properties.ConnectionString
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output logAnalyticsWorkspaceId string = logAnalytics.id
