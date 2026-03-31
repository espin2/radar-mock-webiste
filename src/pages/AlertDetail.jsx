import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, Bell, Ticket, AlertTriangle, Server,
  TrendingUp, History, Hash, CheckCircle, Clock, ChevronUp, Star,
  Zap, ChevronDown, ChevronRight,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { alerts, tickets, incidents } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const duration = (start, end) => {
  if (!start) return '—'
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const diff = Math.floor((e - s) / 60000)
  if (diff < 60) return `${diff} minutes`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}h ${m}m`
}

const fmtDuration = (start, end) => {
  if (!start || !end) return '—'
  const diff = Math.floor((new Date(end) - new Date(start)) / 60000)
  if (diff < 60) return `${diff}m`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

const TYPE_COLORS = {
  CPU: '#ef4444', Memory: '#f97316', Latency: '#f59e0b',
  ErrorRate: '#8b5cf6', DiskIO: '#06b6d4', Replicas: '#10b981', Network: '#6366f1',
}

const SEV_COLORS = {
  SEV1: { bg: 'bg-red-900/30', border: 'border-red-700/40', text: 'text-red-400' },
  SEV2: { bg: 'bg-orange-900/30', border: 'border-orange-700/40', text: 'text-orange-400' },
  SEV3: { bg: 'bg-amber-900/30', border: 'border-amber-700/40', text: 'text-amber-400' },
  SEV4: { bg: 'bg-slate-700/30', border: 'border-slate-600/40', text: 'text-slate-400' },
}

function seededRand(seed, i) {
  return ((Math.sin(seed * 9301 + i * 49297 + 233) * 10000) % 1 + 1) / 2
}

function generateAlertHistory(alertObj, days = 30) {
  const s = alertObj.id * 17 + alertObj.metadata_name.length * 3
  const history = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const baseFiringProb = alertObj.priority === 'P1' ? 0.55 : alertObj.priority === 'P2' ? 0.40 : alertObj.priority === 'P3' ? 0.25 : 0.15
    const rand = seededRand(s, i)
    const fired = rand < baseFiringProb ? 1 : 0
    const isToday = i === 0
    const firingToday = isToday && alertObj.status === 'firing' ? 1 : (isToday && alertObj.status === 'resolved' ? 0 : fired)
    const triggerCount = firingToday ? Math.floor(seededRand(s + 100, i) * 3) + 1 : 0
    const durationMin = firingToday ? Math.floor(seededRand(s + 200, i) * 120) + 5 : 0
    history.push({ date: label, fired: firingToday, triggers: triggerCount, durationMin, resolved: firingToday ? (isToday && alertObj.status === 'firing' ? 0 : 1) : 0 })
  }
  return history
}

function generateHistoricalTickets(alertObj, realTicket) {
  const s = alertObj.id * 23 + 5
  const STATUSES = ['closed', 'closed', 'closed', 'open', 'escalated']
  const CLOSE_REASONS = [
    'Auto-resolved after metric returned to normal',
    'Manually resolved by on-call engineer',
    'Root cause identified and patched',
    'Temporary spike — no action required',
    'Threshold tuned to reduce noise',
  ]
  const ESCALATION_REASONS = [
    'No response within SLA window',
    'Severity escalated due to customer impact',
    'Required senior engineer involvement',
  ]
  const hist = []
  const now = new Date()
  if (realTicket) {
    hist.push({
      id: `TKT-${String(realTicket.id).padStart(4, '0')}`, realId: realTicket.id,
      status: realTicket.status, priority: realTicket.priority,
      created_at: realTicket.created_at, closure_at: realTicket.closure_at,
      escalated: !!realTicket.escalated_at, closure_reason: realTicket.closure_reason, isReal: true,
    })
  }
  for (let i = 0; i < 5; i++) {
    const daysBack = Math.floor(seededRand(s, i) * 25) + 2
    const createdDate = new Date(now)
    createdDate.setDate(createdDate.getDate() - daysBack)
    createdDate.setHours(Math.floor(seededRand(s, i + 30) * 23))
    createdDate.setMinutes(Math.floor(seededRand(s, i + 60) * 59))
    const statusIdx = Math.floor(seededRand(s, i + 90) * STATUSES.length)
    const status = STATUSES[statusIdx]
    const escalated = seededRand(s, i + 120) > 0.75
    const closureMins = Math.floor(seededRand(s, i + 150) * 180) + 10
    const closureDate = status === 'closed' ? new Date(createdDate.getTime() + closureMins * 60000) : null
    const closeReasonIdx = Math.floor(seededRand(s, i + 180) * CLOSE_REASONS.length)
    hist.push({
      id: `TKT-HIST-${alertObj.id}-${i + 1}`, realId: null, status,
      priority: alertObj.priority, created_at: createdDate.toISOString(),
      closure_at: closureDate?.toISOString() || null, escalated,
      closure_reason: status === 'closed' ? CLOSE_REASONS[closeReasonIdx] : null,
      escalation_reason: escalated ? ESCALATION_REASONS[Math.floor(seededRand(s, i + 210) * ESCALATION_REASONS.length)] : null,
      isReal: false,
    })
  }
  return hist.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

function generateHistoricalIncidents(alertObj, realIncident) {
  const s = alertObj.id * 31 + 11
  const STATUSES = ['resolved', 'resolved', 'resolved', 'open', 'investigating']
  const SEVERITIES = ['SEV1', 'SEV2', 'SEV2', 'SEV3', 'SEV3']
  const ROOT_CAUSES = [
    'Memory leak in service causing OOM restarts', 'Upstream dependency latency spike',
    'Database connection pool exhaustion', 'Misconfigured HPA causing replica thrash',
    'Network partition between availability zones', 'DNS resolution failure in cluster',
    'Sudden traffic spike exceeding capacity',
  ]
  const RESOLUTIONS = [
    'Rolled back to previous deployment', 'Increased resource limits and restarted pods',
    'Fixed upstream service configuration', 'Scaled out replicas and tuned HPA thresholds',
    'Network policy updated to fix connectivity', 'Hotfix deployed and validated in production',
  ]
  const hist = []
  const now = new Date()
  if (realIncident) {
    hist.push({
      id: `INC-${String(realIncident.id).padStart(4, '0')}`, realId: realIncident.id,
      status: realIncident.status, severity: realIncident.severity, title: realIncident.title,
      created_at: realIncident.created_at, resolved_at: realIncident.resolved_at,
      root_cause: realIncident.root_cause, resolution: realIncident.resolution, isReal: true,
    })
  }
  for (let i = 0; i < 4; i++) {
    const daysBack = Math.floor(seededRand(s, i) * 28) + 2
    const createdDate = new Date(now)
    createdDate.setDate(createdDate.getDate() - daysBack)
    createdDate.setHours(Math.floor(seededRand(s, i + 30) * 23))
    createdDate.setMinutes(Math.floor(seededRand(s, i + 60) * 59))
    const statusIdx = Math.floor(seededRand(s, i + 90) * STATUSES.length)
    const status = STATUSES[statusIdx]
    const sevIdx = Math.floor(seededRand(s, i + 100) * SEVERITIES.length)
    const severity = SEVERITIES[sevIdx]
    const resolutionMins = Math.floor(seededRand(s, i + 150) * 240) + 15
    const resolvedDate = status === 'resolved' ? new Date(createdDate.getTime() + resolutionMins * 60000) : null
    const rcIdx = Math.floor(seededRand(s, i + 180) * ROOT_CAUSES.length)
    const resIdx = Math.floor(seededRand(s, i + 210) * RESOLUTIONS.length)
    hist.push({
      id: `INC-HIST-${alertObj.id}-${i + 1}`, realId: null, status, severity,
      title: `${alertObj.alert_types} incident on ${alertObj.metadata_name}`,
      created_at: createdDate.toISOString(), resolved_at: resolvedDate?.toISOString() || null,
      root_cause: status === 'resolved' ? ROOT_CAUSES[rcIdx] : null,
      resolution: status === 'resolved' ? RESOLUTIONS[resIdx] : null, isReal: false,
    })
  }
  return hist.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

function generateEventHistory(alertObj) {
  const s = alertObj.id * 13 + 7
  const events = []
  const now = new Date()
  events.push({ type: alertObj.status === 'firing' ? 'firing' : 'resolved', time: alertObj.starts_at, label: alertObj.status === 'firing' ? 'Currently Firing' : 'Most Recent Resolved' })
  if (alertObj.ends_at) events.push({ type: 'resolved', time: alertObj.ends_at, label: 'Resolved' })
  for (let i = 1; i <= 6; i++) {
    const daysBack = Math.floor(seededRand(s, i) * 13) + 1
    const hoursBack = Math.floor(seededRand(s, i + 10) * 23)
    const firingDate = new Date(now)
    firingDate.setDate(firingDate.getDate() - daysBack)
    firingDate.setHours(hoursBack)
    const resolvedDate = new Date(firingDate.getTime() + (Math.floor(seededRand(s, i + 20) * 90) + 5) * 60000)
    events.push({ type: 'firing', time: firingDate.toISOString(), label: 'Fired' })
    events.push({ type: 'resolved', time: resolvedDate.toISOString(), label: 'Resolved' })
  }
  return events.filter(e => e.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10)
}

const HistoryTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-200 font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// Collapsible section wrapper
function CollapsibleSection({ title, icon, badge, defaultOpen = false, accentColor = 'text-slate-400', children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-700/30 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className={accentColor}>{icon}</span>
        <span className="font-semibold text-sm text-slate-200">{title}</span>
        {badge}
        <div className={`ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} className="text-slate-500" />
        </div>
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-700/50">{children}</div>}
    </div>
  )
}

export default function AlertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const alert = alerts.find(a => a.id === parseInt(id))

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Bell size={40} className="text-slate-600" />
        <p className="text-slate-400">Alert not found: ID {id}</p>
        <Link to="/alerts" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to Alerts</Link>
      </div>
    )
  }

  const ticket = tickets.find(t => t.alert_id === alert.id)
  const incident = incidents.find(i => i.alert_id === alert.id)
  const typeColor = TYPE_COLORS[alert.alert_types] || '#6366f1'

  const history = generateAlertHistory(alert, 30)
  const eventHistory = generateEventHistory(alert)
  const ticketHistory = generateHistoricalTickets(alert, ticket)
  const latestTicket = ticketHistory[0] || null
  const incidentHistory = generateHistoricalIncidents(alert, incident)
  const latestIncident = incidentHistory[0] || null

  const totalTriggers = history.reduce((s, d) => s + d.triggers, 0)
  const firingDays = history.filter(d => d.fired).length
  const avgDuration = history.filter(d => d.durationMin > 0).reduce((s, d, _, a) => s + d.durationMin / a.length, 0)
  const maxDuration = Math.max(...history.map(d => d.durationMin))

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-slate-600">/</span>
        <Link to="/alerts" className="text-sm text-slate-400 hover:text-slate-200">Alerts</Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-200">Alert #{alert.id}</span>
      </div>

      {/* ── Header card ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${typeColor}22`, border: `1.5px solid ${typeColor}55` }}>
                <Bell size={20} style={{ color: typeColor }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{alert.metadata_name}</h1>
                <p className="text-sm text-slate-400">{alert.alert_types} · {alert.cluster_name}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={alert.status} />
              <PriorityBadge priority={alert.priority} />
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{alert.service_type}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{alert.cluster_type}</span>
              {alert.namespace && <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">ns: {alert.namespace}</span>}
            </div>
          </div>
          {alert.panel_url && (
            <a href={alert.panel_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-700/50 px-3 py-2 rounded-lg transition-colors hover:bg-indigo-900/20">
              <ExternalLink size={14} /> Open in Grafana
            </a>
          )}
        </div>
      </div>

      {/* ── Current Event Timeline ────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Current Event Timeline</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div><p className="text-xs text-slate-500 mb-1">Fired At</p><p className="text-slate-200">{fmtDt(alert.starts_at)}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Resolved At</p><p className={alert.ends_at ? 'text-emerald-400' : 'text-slate-500'}>{fmtDt(alert.ends_at)}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Duration</p><p className="text-slate-200">{duration(alert.starts_at, alert.ends_at)}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Created At</p><p className="text-slate-200">{fmtDt(alert.created_at)}</p></div>
        </div>
      </div>

      {/* ── Firing / Resolved Messages ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Firing Message
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">{alert.message_firing || '—'}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved Message
          </h2>
          <p className={`text-sm leading-relaxed ${alert.message_resolved ? 'text-emerald-300' : 'text-slate-600 italic'}`}>
            {alert.message_resolved || 'Alert not yet resolved'}
          </p>
        </div>
      </div>

      {/* ── Resources & Metrics ──────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Server size={15} className="text-slate-400" /> Resources & Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['CPU / Memory Usage', alert.resource_usage, 'text-slate-200'],
            ['Resource Request', alert.resource_request, 'text-slate-200'],
            ['Resource Free', alert.resource_free, 'text-slate-200'],
            ['Threshold Value', alert.threshold_value, alert.threshold_value ? 'text-amber-400' : 'text-slate-600'],
          ].map(([label, val, cls]) => (
            <div key={label} className="bg-slate-700/40 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`font-medium ${cls}`}>{val ?? '—'}</p>
            </div>
          ))}
        </div>
        {(alert.replicas_available !== null || alert.replicas_desired !== null) && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2">Replicas</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: alert.replicas_desired ?? 0 }, (_, i) => (
                  <div key={i} className={`w-5 h-5 rounded ${i < (alert.replicas_available ?? 0) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                ))}
              </div>
              <span className="text-sm text-slate-300">{alert.replicas_available ?? 0} / {alert.replicas_desired ?? 0} available</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Linked Resources ─────────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Linked Resources</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link to={`/service/${alert.metadata_name}`}
            className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
            <div className="w-9 h-9 rounded-lg bg-indigo-900/40 border border-indigo-700/40 flex items-center justify-center flex-shrink-0">
              <Server size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Service View</p>
              <p className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 truncate">{alert.metadata_name}</p>
            </div>
            <ExternalLink size={13} className="text-slate-600 group-hover:text-indigo-400" />
          </Link>

          {ticket ? (
            <Link to={`/tickets/${ticket.id}`}
              className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-sky-900/40 border border-sky-700/40 flex items-center justify-center flex-shrink-0">
                <Ticket size={16} className="text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Ticket</p>
                <p className="text-sm font-medium text-sky-400 group-hover:text-sky-300">TKT-{String(ticket.id).padStart(4, '0')}</p>
                <StatusBadge status={ticket.status} />
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-sky-400" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 bg-slate-700/20 rounded-lg p-4 opacity-50">
              <div className="w-9 h-9 rounded-lg bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                <Ticket size={16} className="text-slate-500" />
              </div>
              <div><p className="text-xs text-slate-500 mb-0.5">Ticket</p><p className="text-sm text-slate-600">No ticket created</p></div>
            </div>
          )}

          {incident ? (
            <Link to={`/incidents/${incident.id}`}
              className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-violet-900/40 border border-violet-700/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Incident</p>
                <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">INC-{String(incident.id).padStart(4, '0')}</p>
                <StatusBadge status={incident.status} />
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-violet-400" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 bg-slate-700/20 rounded-lg p-4 opacity-50">
              <div className="w-9 h-9 rounded-lg bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-slate-500" />
              </div>
              <div><p className="text-xs text-slate-500 mb-0.5">Incident</p><p className="text-sm text-slate-600">No incident created</p></div>
            </div>
          )}
        </div>
      </div>

      {/* ── Alert History Analytics ───────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <History size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">Alert History — Last 30 Days</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            [totalTriggers, 'Total Triggers', null, typeColor],
            [firingDays, 'Days Firing', 'text-red-400', null],
            [`${Math.round(avgDuration)}m`, 'Avg Duration', 'text-amber-400', null],
            [`${maxDuration}m`, 'Longest Event', 'text-slate-300', null],
          ].map(([val, label, cls, color]) => (
            <div key={label} className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${cls || ''}`} style={color ? { color } : {}}>{val}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-slate-500" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Firing & Resolved Over Time</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="firedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<HistoryTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
              <Area type="monotone" dataKey="fired" stroke="#ef4444" fill="url(#firedGrad)" strokeWidth={1.5} name="Fired" dot={false} />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolvedGrad)" strokeWidth={1.5} name="Resolved" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash size={13} className="text-slate-500" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Triggers per Day</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<HistoryTooltip />} />
              <Bar dataKey="triggers" name="Triggers" radius={[3, 3, 0, 0]}>
                {history.map((entry, i) => (
                  <Cell key={i} fill={entry.triggers === 0 ? '#1e293b' : entry.triggers >= 3 ? '#ef4444' : entry.triggers === 2 ? '#f97316' : typeColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Firing/Resolved Events Timeline ───────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <History size={15} className="text-slate-400" /> Recent Firing/Resolved Events
        </h2>
        <div className="relative pl-6 space-y-3">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />
          {eventHistory.map((ev, i) => (
            <div key={i} className="relative flex items-start gap-3">
              <div className={`absolute -left-5 w-3 h-3 rounded-full border-2 border-slate-800 mt-0.5 ${ev.type === 'firing' ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <div>
                <p className={`text-xs font-medium ${ev.type === 'firing' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {ev.type === 'firing' ? '🔴 Alert Fired' : '✅ Alert Resolved'}
                  {ev.label !== ev.type && <span className="text-slate-500 font-normal ml-1">— {ev.label}</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{fmtDt(ev.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Metadata ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Metadata</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          {[
            ['Alert ID', `#${alert.id}`], ['Path', alert.path || '—'], ['State', alert.state],
            ['Cluster', alert.cluster_name], ['Cluster Type', alert.cluster_type], ['Namespace', alert.namespace || '—'],
            ['Alert Type', alert.alert_types], ['Service Type', alert.service_type],
            ['Parent Alert', alert.parent_alert ? `#${alert.parent_alert}` : 'None'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-500">{k}</p>
              <p className="text-slate-300 font-mono text-xs mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TICKET SECTION — Latest always visible, history is collapsible
      ════════════════════════════════════════════════════════════════════════ */}

      {/* Latest Ticket */}
      {latestTicket && (
        <div className={`border rounded-xl p-5 ${
          latestTicket.status === 'escalated' ? 'bg-red-950/20 border-red-800/40' :
          latestTicket.status === 'open' ? 'bg-amber-950/20 border-amber-800/40' :
          'bg-slate-800 border-slate-700'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-200">Latest Ticket from this Alert</h2>
            {latestTicket.isReal && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/40">Current</span>
            )}
          </div>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                latestTicket.status === 'escalated' ? 'bg-red-900/30 border-red-700/40' :
                latestTicket.status === 'closed' ? 'bg-emerald-900/30 border-emerald-700/40' : 'bg-sky-900/30 border-sky-700/40'
              }`}>
                <Ticket size={18} className={latestTicket.status === 'escalated' ? 'text-red-400' : latestTicket.status === 'closed' ? 'text-emerald-400' : 'text-sky-400'} />
              </div>
              <div>
                {latestTicket.isReal && latestTicket.realId ? (
                  <Link to={`/tickets/${latestTicket.realId}`} className="text-lg font-bold text-sky-400 hover:text-sky-300 font-mono transition-colors">{latestTicket.id}</Link>
                ) : (
                  <p className="text-lg font-bold text-slate-300 font-mono">{latestTicket.id}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">Created {fmtDt(latestTicket.created_at)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge status={latestTicket.status} />
              <PriorityBadge priority={latestTicket.priority} />
              {latestTicket.escalated && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/40">
                  <ChevronUp size={10} /> Escalated
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Closure: </span>
                {latestTicket.closure_at ? (
                  <span className="text-emerald-400 flex items-center gap-1 inline-flex"><CheckCircle size={11} /> {fmtDt(latestTicket.closure_at)}</span>
                ) : <span className="text-slate-600">Not closed</span>}
              </div>
              {latestTicket.closure_at && (
                <div><span className="text-slate-500">TTR: </span><span className="text-slate-300">{fmtDuration(latestTicket.created_at, latestTicket.closure_at)}</span></div>
              )}
            </div>
          </div>
          {latestTicket.closure_reason && (
            <div className="mt-3 text-xs bg-emerald-900/10 border border-emerald-900/20 rounded-lg px-3 py-2 text-emerald-300">
              <span className="text-emerald-500 font-medium mr-1">Resolution:</span>{latestTicket.closure_reason}
            </div>
          )}
          {latestTicket.escalation_reason && (
            <div className="mt-3 text-xs bg-red-900/10 border border-red-900/20 rounded-lg px-3 py-2 text-red-300">
              <span className="text-red-400 font-medium mr-1">Escalation reason:</span>{latestTicket.escalation_reason}
            </div>
          )}
        </div>
      )}

      {/* Ticket History — collapsible */}
      <CollapsibleSection
        title="Ticket History"
        icon={<Ticket size={16} />}
        accentColor="text-sky-400"
        badge={
          <span className="ml-2 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {ticketHistory.length} tickets
          </span>
        }
      >
        <div className="pt-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-sky-400">{ticketHistory.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{ticketHistory.filter(t => t.status === 'closed').length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Closed</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-400">{ticketHistory.filter(t => t.escalated).length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Escalated</p>
            </div>
          </div>
          {/* Rows */}
          <div className="space-y-2">
            {ticketHistory.map((tkt, i) => (
              <div key={tkt.id} className={`rounded-lg border px-4 py-3 transition-colors ${
                i === 0 ? 'border-sky-700/40 bg-sky-900/10' :
                tkt.status === 'escalated' ? 'border-red-900/30 bg-red-950/10' :
                'border-slate-700/40 bg-slate-700/10 hover:bg-slate-700/20'
              }`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />}
                    {tkt.isReal && tkt.realId ? (
                      <Link to={`/tickets/${tkt.realId}`} className="font-mono text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">{tkt.id}</Link>
                    ) : (
                      <span className="font-mono text-sm text-slate-400">{tkt.id}</span>
                    )}
                    {tkt.isReal && <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400">current</span>}
                  </div>
                  <StatusBadge status={tkt.status} />
                  <PriorityBadge priority={tkt.priority} />
                  {tkt.escalated && <span className="flex items-center gap-1 text-xs text-red-400"><ChevronUp size={11} /> escalated</span>}
                  <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto"><Clock size={11} /><span>{fmtDt(tkt.created_at)}</span></div>
                  {tkt.closure_at && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={11} /> TTR: {fmtDuration(tkt.created_at, tkt.closure_at)}</span>}
                </div>
                {tkt.closure_reason && <p className="text-xs text-slate-500 mt-2 truncate"><span className="text-slate-600">Closed: </span>{tkt.closure_reason}</p>}
                {tkt.escalation_reason && <p className="text-xs text-red-500/70 mt-1 truncate"><span className="text-red-600">Escalated: </span>{tkt.escalation_reason}</p>}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ════════════════════════════════════════════════════════════════════════
          INCIDENT SECTION — Latest always visible, history is collapsible
      ════════════════════════════════════════════════════════════════════════ */}

      {/* Latest Incident */}
      {latestIncident && (() => {
        const sev = SEV_COLORS[latestIncident.severity] || SEV_COLORS.SEV3
        const isActive = latestIncident.status === 'open' || latestIncident.status === 'investigating'
        return (
          <div className={`border rounded-xl p-5 ${isActive ? `${sev.bg} ${sev.border}` : 'bg-slate-800 border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-slate-200">Latest Incident from this Alert</h2>
              {latestIncident.isReal && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/40">Current</span>
              )}
            </div>
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${latestIncident.status === 'resolved' ? 'bg-emerald-900/30 border-emerald-700/40' : `${sev.bg} ${sev.border}`}`}>
                  <AlertTriangle size={18} className={latestIncident.status === 'resolved' ? 'text-emerald-400' : sev.text} />
                </div>
                <div>
                  {latestIncident.isReal && latestIncident.realId ? (
                    <Link to={`/incidents/${latestIncident.realId}`} className="text-lg font-bold text-violet-400 hover:text-violet-300 font-mono transition-colors">{latestIncident.id}</Link>
                  ) : (
                    <p className="text-lg font-bold text-slate-300 font-mono">{latestIncident.id}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{latestIncident.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Created {fmtDt(latestIncident.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={latestIncident.status} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${sev.bg} ${sev.border} ${sev.text}`}>{latestIncident.severity}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500">Resolved: </span>
                  {latestIncident.resolved_at ? (
                    <span className="text-emerald-400 flex items-center gap-1 inline-flex"><CheckCircle size={11} /> {fmtDt(latestIncident.resolved_at)}</span>
                  ) : <span className="text-slate-600">Not resolved</span>}
                </div>
                {latestIncident.resolved_at && (
                  <div><span className="text-slate-500">TTR: </span><span className="text-slate-300">{fmtDuration(latestIncident.created_at, latestIncident.resolved_at)}</span></div>
                )}
              </div>
            </div>
            {latestIncident.root_cause && (
              <div className="mt-3 text-xs bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-2 text-slate-300">
                <span className="text-slate-500 font-medium mr-1">Root Cause:</span>{latestIncident.root_cause}
              </div>
            )}
            {latestIncident.resolution && (
              <div className="mt-2 text-xs bg-emerald-900/10 border border-emerald-900/20 rounded-lg px-3 py-2 text-emerald-300">
                <span className="text-emerald-500 font-medium mr-1">Resolution:</span>{latestIncident.resolution}
              </div>
            )}
          </div>
        )
      })()}

      {/* Incident History — collapsible */}
      <CollapsibleSection
        title="Incident History"
        icon={<AlertTriangle size={16} />}
        accentColor="text-violet-400"
        badge={
          <span className="ml-2 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {incidentHistory.length} incidents
          </span>
        }
      >
        <div className="pt-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-violet-400">{incidentHistory.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{incidentHistory.filter(i => i.status === 'resolved').length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-400">{incidentHistory.filter(i => i.severity === 'SEV1' || i.severity === 'SEV2').length}</p>
              <p className="text-xs text-slate-500 mt-0.5">SEV1/SEV2</p>
            </div>
          </div>
          {/* Rows */}
          <div className="space-y-2">
            {incidentHistory.map((inc, i) => {
              const sev = SEV_COLORS[inc.severity] || SEV_COLORS.SEV3
              const isActive = inc.status === 'open' || inc.status === 'investigating'
              return (
                <div key={inc.id} className={`rounded-lg border px-4 py-3 transition-colors ${
                  i === 0 ? 'border-violet-700/40 bg-violet-900/10' :
                  isActive ? `${sev.border} ${sev.bg}` :
                  'border-slate-700/40 bg-slate-700/10 hover:bg-slate-700/20'
                }`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />}
                      {inc.isReal && inc.realId ? (
                        <Link to={`/incidents/${inc.realId}`} className="font-mono text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">{inc.id}</Link>
                      ) : (
                        <span className="font-mono text-sm text-slate-400">{inc.id}</span>
                      )}
                      {inc.isReal && <span className="text-xs px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-400">current</span>}
                    </div>
                    <StatusBadge status={inc.status} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${sev.bg} ${sev.border} ${sev.text}`}>{inc.severity}</span>
                    <span className="text-xs text-slate-500 truncate max-w-xs hidden sm:block">{inc.title}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto"><Clock size={11} /><span>{fmtDt(inc.created_at)}</span></div>
                    {inc.resolved_at && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={11} /> TTR: {fmtDuration(inc.created_at, inc.resolved_at)}</span>}
                  </div>
                  {inc.root_cause && <p className="text-xs text-slate-500 mt-2 truncate"><span className="text-slate-600">Root cause: </span>{inc.root_cause}</p>}
                  {inc.resolution && <p className="text-xs text-emerald-600/70 mt-1 truncate"><span className="text-emerald-700">Resolution: </span>{inc.resolution}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}