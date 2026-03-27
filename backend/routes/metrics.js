/**
 * Metrics Route
 *
 * Exposes detailed operational metrics for monitoring dashboards.
 * Covers: uptime, error rates, latency, throughput, DB health, resource usage.
 *
 * All endpoints require admin authentication.
 *
 * GET /api/metrics         — full metrics payload
 * GET /api/metrics/db      — database health only
 * GET /api/metrics/server  — server resource usage only
 */

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { protect, authorize } = require('../middleware/auth')
const { getStats } = require('../middleware/monitor')

router.use(protect)
router.use(authorize('admin'))

// @route  GET /api/metrics
// @desc   Full operational metrics
// @access Private (Admin)
router.get('/', async (req, res) => {
  try {
    const [dbHealth, serverHealth] = await Promise.allSettled([
      getDatabaseHealth(),
      getServerHealth(),
    ])

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      requests: getStats(),
      database: dbHealth.status === 'fulfilled' ? dbHealth.value : { error: dbHealth.reason?.message },
      server: serverHealth.status === 'fulfilled' ? serverHealth.value : { error: serverHealth.reason?.message },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to collect metrics' })
  }
})

// @route  GET /api/metrics/db
// @desc   Database health only
// @access Private (Admin)
router.get('/db', async (req, res) => {
  try {
    const db = await getDatabaseHealth()
    res.json({ success: true, timestamp: new Date().toISOString(), database: db })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to collect DB metrics' })
  }
})

// @route  GET /api/metrics/server
// @desc   Server resource usage only
// @access Private (Admin)
router.get('/server', async (req, res) => {
  try {
    const server = await getServerHealth()
    res.json({ success: true, timestamp: new Date().toISOString(), server })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to collect server metrics' })
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getDatabaseHealth() {
  const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const state = stateMap[mongoose.connection.readyState] || 'unknown'

  let pingMs = null
  let pingOk = false
  try {
    const start = Date.now()
    await mongoose.connection.db.admin().ping()
    pingMs = Date.now() - start
    pingOk = true
  } catch {
    pingOk = false
  }

  const pool = mongoose.connection.client?.topology?.s?.pool ?? null

  return {
    status: state,
    healthy: state === 'connected' && pingOk,
    pingMs,
    pingWithinTarget: pingMs !== null && pingMs < 100,
    connections: {
      active: pool?.totalConnectionCount ?? mongoose.connections.length,
      available: pool?.availableConnectionCount ?? null,
    },
    host: mongoose.connection.host ?? null,
    dbName: mongoose.connection.name ?? null,
  }
}

function getServerHealth() {
  const mem = process.memoryUsage()
  const uptimeSeconds = Math.floor(process.uptime())

  return {
    uptimeSeconds,
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapUsedPercent: Math.round((mem.heapUsed / mem.heapTotal) * 100),
    },
    node: process.version,
    platform: process.platform,
    pid: process.pid,
  }
}

module.exports = router
