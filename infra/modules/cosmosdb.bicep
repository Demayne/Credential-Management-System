/*
  Cosmos DB Module — CoolTech Credential Manager
  ===============================================
  Provisions:
    - Azure Cosmos DB for MongoDB (vCore) cluster
    - Free tier M25 node (512 GB storage, 2 vCores)
    - MongoDB 8.0 wire protocol compatibility
    - Automatic continuous backup (included in vCore)

  The vCore model uses a standard MongoDB connection string, making it
  a drop-in replacement for MongoDB Atlas with no application code changes.

  IMPORTANT: Only one free tier Cosmos DB cluster is allowed per Azure subscription.
  If the free tier is already in use, set enableFreeTier = false and choose a paid SKU.
*/

param cosmosAccountName string
param location string
param adminUser string

@secure()
param adminPassword string

@description('Enable the free tier vCore cluster (one per subscription)')
param enableFreeTier bool = true

// ─── Cosmos DB vCore Cluster ──────────────────────────────────────────────────

resource cosmosCluster 'Microsoft.DocumentDB/mongoClusters@2024-02-15-preview' = {
  name: cosmosAccountName
  location: location
  properties: {
    administratorLogin: adminUser
    administratorLoginPassword: adminPassword
    serverVersion: '8.0'
    nodeGroupSpecs: [
      {
        kind: 'Shard'
        nodeCount: 1
        sku: enableFreeTier ? 'Free' : 'M25'
        diskSizeGB: enableFreeTier ? 32 : 128
        enableHa: false   // High availability not available on free tier
      }
    ]
  }
}

// ─── Firewall Rule — Allow Azure Services ─────────────────────────────────────
// This allows App Service to connect. For tighter security in production,
// replace with App Service outbound IPs.

resource firewallAllowAzure 'Microsoft.DocumentDB/mongoClusters/firewallRules@2024-02-15-preview' = {
  parent: cosmosCluster
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output cosmosClusterFqdn string = cosmosCluster.properties.connectionString ?? '${cosmosAccountName}.mongocluster.cosmos.azure.com'

// mongoUri function — called from main.bicep with the admin credentials
// Format: mongodb+srv://<user>:<pass>@<host>/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
output mongoUri func(user string, password string) string = (user, password) =>
  'mongodb+srv://${user}:${password}@${cosmosAccountName}.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'
