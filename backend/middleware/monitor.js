/**
 * Request Monitoring Middleware
 *
 * Tracks in-memory metrics for all incoming requests:
 * - Total request count and throughput
 * - Error rates (4xx / 5xx)
 * - Response latency (per-request and rolling averages)
 * - Per-endpoint breakdown
 *
 * Stats reset on server restart. For persistent metrics use Application Insights.
 */

const stats = {
  startTime: Date.now(),
  totalRequests: 0,
  errorCount4xx: 0,
  errorCount5xx: 0,
  latencySamples: [],          // rolling window — last 1000 requests
  perRoute: {},                // { 'GET /api/health': { count, errors, totalMs } }
}

const MAX_SAMPLES = 1000

function recordRequest(method, path, statusCode, durationMs) {
  stats.totalRequests++

  if (statusCode >= 500) stats.errorCount5xx++
  else if (statusCode >= 400) stats.errorCount4xx++

  // Rolling latency window
  stats.latencySamples.push(durationMs)
  if (stats.latencySamples.length > MAX_SAMPLES) stats.latencySamples.shift()

  // Per-route stats (normalise dynamic segments)
  const routeKey = `${method} ${path.replace(/\/[a-f0-9]{24}/g, '/:id')}`
  if (!stats.perRoute[routeKey]) {
    stats.perRoute[routeKey] = { count: 0, errors: 0, totalMs: 0, maxMs: 0 }
  }
  const r = stats.perRoute[routeKey]
  r.count++
  r.totalMs += durationMs
  if (durationMs > r.maxMs) r.maxMs = durationMs
  if (statusCode >= 400) r.errors++
}

function getStats() {
  const samples = stats.latencySamples
  const sorted = [...samples].sort((a, b) => a - b)
  const avg = samples.length ? Math.round(samples.reduce((s, v) => s + v, 0) / samples.length) : 0
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0
  const p99 = sorted.length ? sorted[Math.floor(sorted.length * 0.99)] : 0
  const uptimeSeconds = Math.floor((Date.now() - stats.startTime) / 1000)
  const errorRate = stats.totalRequests
    ? ((stats.errorCount4xx + stats.errorCount5xx) / stats.totalRequests * 100).toFixed(2)
    : '0.00'

  return {
    uptime: {
      seconds: uptimeSeconds,
      human: formatUptime(uptimeSeconds),
    },
    requests: {
      total: stats.totalRequests,
      errorRate4xx: stats.errorCount4xx,
      errorRate5xx: stats.errorCount5xx,
      errorRatePercent: parseFloat(errorRate),
    },
    latency: {
      avgMs: avg,
      p95Ms: p95,
      p99Ms: p99,
      sampleSize: samples.length,
      withinTarget: avg < 100,   // target: <100ms
    },
    throughput: {
      requestsPerMinute: uptimeSeconds > 0
        ? Math.round((stats.totalRequests / uptimeSeconds) * 60)
        : 0,
    },
    perRoute: Object.entries(stats.perRoute)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .reduce((acc, [key, val]) => {
        acc[key] = {
          count: val.count,
          errors: val.errors,
          avgMs: val.count ? Math.round(val.totalMs / val.count) : 0,
          maxMs: val.maxMs,
        }
        return acc
      }, {}),
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

// Express middleware
function monitorMiddleware(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    recordRequest(req.method, req.path, res.statusCode, Date.now() - start)
  })
  next()
}

module.exports = { monitorMiddleware, getStats }
