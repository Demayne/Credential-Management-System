# Infrastructure as Code — CoolTech Credential Manager

This directory contains Azure Bicep templates that provision the complete application infrastructure. Running these templates from a fresh Azure subscription produces an identical environment to the current production deployment.

## Why IaC?

| Without IaC | With IaC |
|-------------|----------|
| Manual portal clicks — error-prone and undocumented | Declarative files in source control — every resource is defined in code |
| Hard to reproduce (disaster recovery, new regions) | `az deployment group create` reproduces the entire stack in minutes |
| Handover requires lengthy runbooks | A new developer clones the repo and runs one command |
| Configuration drift — portal changes not tracked | Every change goes through Git — full audit trail |

## Structure

```
infra/
├── main.bicep          ← Entry point — orchestrates all modules
├── main.bicepparam     ← Parameter values (fill in before deploying)
├── INFRASTRUCTURE.md   ← This file
└── modules/
    ├── appservice.bicep   ← App Service Plan + App Service (Node.js backend)
    ├── cosmosdb.bicep     ← Cosmos DB vCore (MongoDB-compatible database)
    ├── staticwebapp.bicep ← Static Web Apps (React frontend)
    └── insights.bicep     ← Log Analytics + App Insights + Alert Rules
```

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [Bicep CLI](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/install) installed (`az bicep install`)
- An Azure subscription with Contributor access
- A resource group created (or use the create command below)

## Deploying from Scratch

### Step 1 — Configure Parameters

Edit `infra/main.bicepparam` and replace all `REPLACE_WITH_...` values:

```bash
# Generate JWT_SECRET and JWT_REFRESH_SECRET (must be different)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Never commit `main.bicepparam` with real secret values. Add it to `.gitignore` if your policy requires it, or use Azure Key Vault references.

### Step 2 — Login and Select Subscription

```bash
az login
az account set --subscription "<your-subscription-id>"
```

### Step 3 — Create Resource Group (if needed)

```bash
az group create \
  --name credential-manager-rg \
  --location southafricanorth
```

### Step 4 — Validate the Templates

```bash
az deployment group validate \
  --resource-group credential-manager-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

### Step 5 — Deploy

```bash
az deployment group create \
  --resource-group credential-manager-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam \
  --name cooltech-$(date +%Y%m%d-%H%M%S)
```

The deployment takes approximately 5–10 minutes. Cosmos DB vCore provisioning is the slowest step.

### Step 6 — Post-Deploy Steps

After deployment completes, two manual steps remain:

**A. Link Static Web App to GitHub**

The Static Web App resource is created but the GitHub Actions workflow that deploys the frontend must be generated:

```bash
az staticwebapp create \
  --name <static-web-app-name> \
  --resource-group credential-manager-rg \
  --source https://github.com/<your-org>/<your-repo> \
  --branch main \
  --app-location ./frontend \
  --output-location dist \
  --login-with-github
```

Or link it through the Azure Portal → Static Web App → Deployment → GitHub.

**B. Update App Service FRONTEND_URL**

Once the Static Web App URL is known, update the CORS origin on App Service:

```bash
az webapp config appsettings set \
  --name <app-service-name> \
  --resource-group credential-manager-rg \
  --settings FRONTEND_URL=https://<static-web-app-hostname>
```

**C. Set GitHub repository variable**

In your GitHub repository → Settings → Variables → Repository variables:
```
VITE_API_URL = https://<app-service-hostname>
```

**D. Seed the database**

```bash
cd backend
# Temporarily set MONGO_URI in .env to the production connection string
npm run seed
# Revert .env after seeding
```

## Updating Infrastructure

To update existing resources (e.g., upgrading App Service plan from F1 to B1):

1. Edit the relevant Bicep file (e.g., change `'F1'` to `'B1'` in `appservice.bicep`)
2. Run the deploy command again — Bicep is idempotent, it only changes what differs

```bash
az deployment group create \
  --resource-group credential-manager-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

## Tearing Down

To remove all resources:

```bash
az group delete \
  --name credential-manager-rg \
  --yes \
  --no-wait
```

> This deletes everything in the resource group including the database. Make sure you have exported any data you need first.

## Resources Provisioned

| Resource | Type | SKU | Region |
|----------|------|-----|--------|
| App Service Plan | `Microsoft.Web/serverfarms` | F1 (Free) | South Africa North |
| App Service | `Microsoft.Web/sites` | Windows, Node 22 | South Africa North |
| Cosmos DB vCore | `Microsoft.DocumentDB/mongoClusters` | M25 Free / MongoDB 8.0 | Central US |
| Static Web Apps | `Microsoft.Web/staticSites` | Free | West Europe |
| Log Analytics Workspace | `Microsoft.OperationalInsights/workspaces` | PerGB2018 | South Africa North |
| Application Insights | `Microsoft.Insights/components` | workspace-based | South Africa North |
| Alert Action Group | `Microsoft.Insights/actionGroups` | — | Global |
| Alert: High 5xx Rate | `Microsoft.Insights/metricAlerts` | Severity 1 | Global |
| Alert: Slow Response | `Microsoft.Insights/metricAlerts` | Severity 2 | Global |
| Alert: Unavailable | `Microsoft.Insights/metricAlerts` | Severity 0 | Global |

## Upgrading for Production

The current templates use free-tier resources suitable for a portfolio project. For a production workload serving real users, make these changes:

| Change | Bicep file | Line to update |
|--------|-----------|----------------|
| App Service: F1 → B2 (always-on, custom domain) | `appservice.bicep` | SKU name/tier |
| App Service: Windows → Linux (simpler deployment, no iisnode) | `appservice.bicep` | kind, reserved |
| Cosmos DB: Free → M30 (more RAM, production SLA) | `cosmosdb.bicep` | sku in nodeGroupSpecs |
| Log Analytics: 30 days → 90 days retention | `insights.bicep` | retentionInDays |
| Static Web Apps: Free → Standard (custom domain TLS) | `staticwebapp.bicep` | SKU name/tier |
