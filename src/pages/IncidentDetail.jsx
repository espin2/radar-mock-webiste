import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, AlertTriangle, Bell, Ticket, MessageSquare,
  GitBranch, Clock, User, Users, Calendar, Activity, Cpu, MemoryStick, Container,
  FileText, Workflow, Share2, Shield, Phone, Mail, CheckCircle,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  incidents, alerts, tickets, incidentComments, incidentRelations, eventLogs,
  escalationAssignments,
  getMockMetrics, getMockPods, getMockLogs, getMockTrace, serviceGraph,
} from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
const fmtTs = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
const fmtDuration = (start, end) => {
  if (!start) return '—'
  const diff = Math.floor(((end ? new Date(end) : new Date()) - new Date(start)) / 60000)
  if (diff < 60) return `${diff} minutes`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

const LOG_COLORS = { ERROR: 'text-red-400', WARN: 'text-amber-400', INFO: 'text-slate-300', DEBUG: 'text-slate-500' }
const LOG_BG = { ERROR: 'bg-red-900/20', WARN: 'bg-amber-900/10', INFO: '', DEBUG: '' }

// ─── Service Graph SVG ────────────────────────────────────────────────────────
function ServiceGraph({ highlightService }) {
  const W = 760, H = 340
  const edgeColor = { ok: '#10b981', warn: '#f59e0b', error: '#ef4444' }
  const nodeColor = { gateway: '#6366f1', backend: '#0ea5e9', database: '#f59e0b', cache: '#8b5cf6', external: '#64748b' }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="rounded-lg bg-slate-900/50">
      <defs>
        {['Ok', 'Warn', 'Err'].map((n, i) => {
          const c = ['#10b981', '#f59e0b', '#ef4444'][i]
          return (
            <marker key={n} id={`arrow${n}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={c} />
            </marker>
          )
        })}
      </defs>
      {serviceGraph.edges.map((e, i) => {
        const from = serviceGraph.nodes.find(n => n.id === e.from)
        const to = serviceGraph.nodes.find(n => n.id === e.to)
        if (!from || !to) return null
        const color = edgeColor[e.status]
        const mid = [(from.x + to.x) / 2, (from.y + to.y) / 2]
        const markerId = e.status === 'ok' ? 'arrowOk' : e.status === 'warn' ? 'arrowWarn' : 'arrowErr'
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x - 25} y2={to.y}
              stroke={color} strokeWidth={e.status === 'error' ? 2 : 1.5}
              strokeDasharray={e.status === 'error' ? '6 3' : undefined}
              markerEnd={`url(#arrow${e.status === 'ok' ? 'Ok' : e.status === 'warn' ? 'Warn' : 'Err'})`} opacity={0.8} />
            {e.errorRate > 0 && (
              <text x={mid[0]} y={mid[1] - 5} textAnchor="middle" fontSize={9} fill={color} opacity={0.9}>{e.errorRate}%</text>
            )}
            <text x={mid[0]} y={mid[1] + 9} textAnchor="middle" fontSize={9} fill="#64748b">{e.rps}rps</text>
          </g>
        )
      })}
      {serviceGraph.nodes.map(n => {
        const isHL = n.id === highlightService
        const color = nodeColor[n.type] || '#64748b'
        const short = n.label.replace('-service', '')
        return (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            {n.alert && <circle r={24} fill="transparent" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" opacity={0.6} />}
            <circle r={20} fill={isHL ? color : `${color}33`} stroke={color} strokeWidth={isHL ? 2.5 : 1.5} />
            <text textAnchor="middle" dy="4" fontSize={10} fill="white" fontWeight="bold">
              {n.type === 'gateway' ? 'GW' : n.type === 'external' ? '👤' : n.type === 'database' ? '🗄' : n.type === 'cache' ? '⚡' : short.slice(0, 2).toUpperCase()}
            </text>
            <text textAnchor="middle" dy={32} fontSize={9} fill={isHL ? color : '#94a3b8'} fontWeight={isHL ? 'bold' : 'normal'}>{short}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Trace Waterfall ──────────────────────────────────────────────────────────
function TraceWaterfall({ trace }) {
  const { traceId, totalMs, spans } = trace
  const svcColors = {
    'api-gateway': '#6366f1', 'order-service': '#0ea5e9', 'payment-service': '#ef4444',
    'inventory-service': '#f59e0b', 'postgres': '#10b981', 'redis': '#8b5cf6',
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <span>Trace ID: <span className="font-mono text-slate-300">{traceId}</span></span>
        <span className="ml-auto">Total: <span className="text-slate-300">{totalMs}ms</span></span>
      </div>
      {spans.map(span => {
        const leftPct = (span.start / totalMs) * 100
        const widthPct = Math.max(1, (span.dur / totalMs) * 100)
        const color = svcColors[span.service] || '#64748b'
        const depth = span.parent ? (spans.find(s => s.id === span.parent)?.parent ? 2 : 1) : 0
        return (
          <div key={span.id} className="flex items-center gap-2 text-xs" style={{ paddingLeft: depth * 16 }}>
            <div className="w-36 text-right flex-shrink-0">
              <div className="text-slate-300 truncate">{span.service}</div>
              <div className="text-slate-600 truncate text-xs">{span.operation}</div>
            </div>
            <div className="flex-1 relative h-6 bg-slate-700/30 rounded">
              <div className="absolute top-0 h-full rounded flex items-center justify-end pr-1"
                style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: `${color}55`, border: `1px solid ${color}88` }}>
                <span style={{ color }} className="font-mono text-xs">{span.dur}ms</span>
              </div>
              {span.status === 'error' && <span className="absolute right-2 top-0 h-full flex items-center text-red-400 text-xs">✕</span>}
            </div>
          </div>
        )
      })}
      <div className="flex items-center ml-40 text-xs text-slate-600 border-t border-slate-700/30 pt-1 mt-2">
        <span>0</span><span className="ml-auto">{totalMs}ms</span>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'escalations', label: 'Escalations', icon: Shield },
  { id: 'metrics', label: 'Metrics', icon: Cpu },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'traces', label: 'Traces', icon: Workflow },
  { id: 'graph', label: 'Service Graph', icon: Share2 },
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'relations', label: 'Relations', icon: GitBranch },
]

const ASSIGN_TYPE_CFG = {
  user:     { bg: 'bg-sky-900/30',    border: 'border-sky-700/40',    text: 'text-sky-400',    icon: User },
  group:    { bg: 'bg-violet-900/30', border: 'border-violet-700/40', text: 'text-violet-400', icon: Users },
  schedule: { bg: 'bg-amber-900/30',  border: 'border-amber-700/40',  text: 'text-amber-400',  icon: Calendar },
}

const ESC_STATUS_CFG = {
  escalating:   'bg-red-900/30 border-red-700/40 text-red-400',
  pending:      'bg-amber-900/30 border-amber-700/40 text-amber-400',
  acknowledged: 'bg-emerald-900/30 border-emerald-700/40 text-emerald-400',
  resolved:     'bg-slate-700/30 border-slate-600/40 text-slate-400',
}

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('comments')

  const inc = incidents.find(i => i.id === parseInt(id))

  if (!inc) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={40} className="text-slate-600" />
        <p className="text-slate-400">Incident not found: ID {id}</p>
        <Link to="/incidents" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to Incidents</Link>
      </div>
    )
  }

  const alert = alerts.find(a => a.id === inc.alert_id)
  const ticket = tickets.find(t => t.id === inc.ticket_id)
  const comments = incidentComments.filter(c => c.incident_id === inc.id)
  const relations = incidentRelations.filter(r => r.parent_incident_id === inc.id || r.child_incident_id === inc.id)
  const escalations = escalationAssignments.filter(
    e => e.resource_type === 'incident' && e.resource_id === inc.id
  )
  const logs = eventLogs.filter(e =>
    (e.resource === 'incident' && e.resource_id === inc.id) ||
    (e.resource === 'ticket' && e.resource_id === inc.ticket_id)
  )

  const svcName = alert?.metadata_name || 'payment-service'
  const metrics = getMockMetrics(svcName)
  const pods = getMockPods(alert)
  const svcLogs = getMockLogs(svcName)
  const trace = getMockTrace(svcName)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-slate-600">/</span>
        <Link to="/incidents" className="text-sm text-slate-400 hover:text-slate-200">Incidents</Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-200 font-mono">INC-{String(inc.id).padStart(4, '0')}</span>
      </div>

      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-900/30 border border-violet-700/40 flex items-center justify-center">
                <AlertTriangle size={20} className="text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-mono">INC-{String(inc.id).padStart(4, '0')}</h1>
                {alert && <p className="text-sm text-slate-400">{alert.metadata_name} · {alert.alert_types} · {alert.cluster_name}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={inc.status} />
              <PriorityBadge priority={inc.priority} />
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">v{inc.version}</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-1">
                <User size={12} />
                <span>{inc.owner || 'Unassigned'}</span>
              </div>
            </div>
          </div>
          {alert?.panel_url && (
            <a href={alert.panel_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-700/50 px-3 py-2 rounded-lg transition-colors hover:bg-indigo-900/20">
              <ExternalLink size={14} /> Grafana Panel
            </a>
          )}
        </div>
      </div>

      {/* Timeline strip */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={15} className="text-slate-400" /> Incident Timeline
        </h2>
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />

          <div className="relative flex items-start gap-3">
            <div className="absolute -left-5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-800 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-400">Incident Created</p>
              <p className="text-xs text-slate-400 mt-0.5">{fmtDt(inc.created_at)}</p>
            </div>
          </div>

          {inc.acknowledged_at && (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-5 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-800 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-400">
                  Acknowledged — MTTA: {fmtDuration(inc.created_at, inc.acknowledged_at)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{fmtDt(inc.acknowledged_at)}</p>
                {inc.owner && <p className="text-xs text-slate-500 mt-0.5">by {inc.owner}</p>}
              </div>
            </div>
          )}

          {inc.resolved_at ? (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-800 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-emerald-400">
                  Resolved — MTTR: {fmtDuration(inc.created_at, inc.resolved_at)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{fmtDt(inc.resolved_at)}</p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-5 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-800 mt-0.5 animate-pulse" />
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Ongoing — {fmtDuration(inc.created_at, null)} elapsed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert message */}
      {alert && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Firing Message
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">{alert.message_firing}</p>
          </div>
          {alert.message_resolved && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved Message
              </h2>
              <p className="text-emerald-300 text-sm leading-relaxed">{alert.message_resolved}</p>
            </div>
          )}
        </div>
      )}

      {/* Linked Resources */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Linked Resources</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alert && (
            <Link to={`/alerts/${alert.id}`}
              className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-orange-900/30 border border-orange-700/40 flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Source Alert</p>
                <p className="text-sm font-medium text-orange-400 group-hover:text-orange-300 truncate">{alert.metadata_name}</p>
                <StatusBadge status={alert.status} />
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-orange-400" />
            </Link>
          )}
          {ticket && (
            <Link to={`/tickets/${ticket.id}`}
              className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-sky-900/30 border border-sky-700/40 flex items-center justify-center flex-shrink-0">
                <Ticket size={16} className="text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Ticket</p>
                <p className="text-sm font-medium text-sky-400 group-hover:text-sky-300 font-mono">TKT-{String(ticket.id).padStart(4, '0')}</p>
                <StatusBadge status={ticket.status} />
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-sky-400" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Escalation Assignments ─────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Shield size={15} className="text-indigo-400" />
            Escalation Assignments
            {escalations.length > 0 && (
              <span className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded-full">
                {escalations.length}
              </span>
            )}
          </h2>
          <Link to="/escalations" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <Shield size={11} /> Manage Policies
          </Link>
        </div>

        {escalations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl">
            <Shield size={28} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No escalation assignments for this incident</p>
          </div>
        ) : (
          <div className="space-y-3">
            {escalations.map(esc => {
              const cfg = ASSIGN_TYPE_CFG[esc.assign_type] || ASSIGN_TYPE_CFG.user
              const AssignIcon = cfg.icon
              return (
                <div key={esc.id} className={`rounded-xl border p-4 ${
                  esc.status === 'escalating' ? 'bg-red-950/20 border-red-800/40' :
                  esc.status === 'pending' ? 'bg-amber-950/20 border-amber-800/40' :
                  esc.status === 'acknowledged' ? 'bg-emerald-950/20 border-emerald-800/40' :
                  'bg-slate-700/20 border-slate-700/40'
                }`}>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <AssignIcon size={14} className={cfg.text} />
                      <div>
                        <p className={`text-sm font-semibold ${cfg.text}`}>{esc.assignee}</p>
                        <p className="text-xs text-slate-500 capitalize">{esc.assign_type}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ESC_STATUS_CFG[esc.status] || ESC_STATUS_CFG.resolved}`}>
                        {esc.status}
                      </span>
                      <span className="text-xs text-slate-500">Step {esc.current_step}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {esc.channel === 'pagerduty' ? <Phone size={12} className="text-slate-500" /> :
                       esc.channel === 'slack' ? <Bell size={12} className="text-slate-500" /> :
                       <Mail size={12} className="text-slate-500" />}
                      <span className="capitalize">{esc.channel}</span>
                    </div>
                    <Link to="/escalations" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto">
                      <Shield size={11} /> {esc.policy_name}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                    <span><Clock size={10} className="inline mr-1" />Assigned: {fmtDt(esc.assigned_at)}</span>
                    {esc.acknowledged_at && (
                      <span className="text-emerald-400">
                        <CheckCircle size={10} className="inline mr-1" />Acknowledged: {fmtDt(esc.acknowledged_at)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail tabs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-700">
          {TABS.map(({ id: tid, label, icon: Icon }) => {
            const count = tid === 'comments' ? comments.length : tid === 'events' ? logs.length : tid === 'relations' ? relations.length : null
            return (
              <button key={tid} onClick={() => setActiveTab(tid)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tid ? 'border-indigo-500 text-indigo-400 bg-slate-700/20' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                <Icon size={14} />
                {label}
                {count !== null && <span className={`text-xs px-1.5 rounded-full ${activeTab === tid ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{count}</span>}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {/* ── Escalations ── */}
          {activeTab === 'escalations' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-slate-500">{escalations.length} assignment{escalations.length !== 1 ? 's' : ''}</span>
                <Link to="/escalations" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto">
                  <Shield size={11} /> Manage Policies
                </Link>
              </div>

              {escalations.length === 0 ? (
                <div className="text-center py-10">
                  <Shield size={32} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No escalation assignments for this incident</p>
                  <Link to="/escalations" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-flex items-center gap-1">
                    View Escalation Policies →
                  </Link>
                </div>
              ) : (
                <>
                  {escalations.map(esc => {
                    const cfg = ASSIGN_TYPE_CFG[esc.assign_type] || ASSIGN_TYPE_CFG.user
                    const AssignIcon = cfg.icon
                    return (
                      <div key={esc.id} className={`rounded-xl border p-4 ${
                        esc.status === 'escalating' ? 'bg-red-950/20 border-red-800/40' :
                        esc.status === 'pending' ? 'bg-amber-950/20 border-amber-800/40' :
                        esc.status === 'acknowledged' ? 'bg-emerald-950/20 border-emerald-800/40' :
                        'bg-slate-700/20 border-slate-700/40'
                      }`}>
                        <div className="flex flex-wrap items-start gap-3">
                          {/* Assignee */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                            <AssignIcon size={14} className={cfg.text} />
                            <div>
                              <p className={`text-sm font-semibold ${cfg.text}`}>{esc.assignee}</p>
                              <p className="text-xs text-slate-500 capitalize">{esc.assign_type}</p>
                            </div>
                          </div>
                          {/* Status + step */}
                          <div className="flex flex-col gap-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ESC_STATUS_CFG[esc.status] || ESC_STATUS_CFG.resolved}`}>
                              {esc.status}
                            </span>
                            <span className="text-xs text-slate-500">Step {esc.current_step}</span>
                          </div>
                          {/* Channel */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            {esc.channel === 'pagerduty' ? <Phone size={12} className="text-slate-500" /> :
                             esc.channel === 'slack' ? <Bell size={12} className="text-slate-500" /> :
                             <Mail size={12} className="text-slate-500" />}
                            <span className="capitalize">{esc.channel}</span>
                          </div>
                          {/* Policy */}
                          <Link to="/escalations" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto">
                            <Shield size={11} /> {esc.policy_name}
                          </Link>
                        </div>
                        {/* Timestamps */}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                          <span><Clock size={10} className="inline mr-1" />Assigned: {fmtDt(esc.assigned_at)}</span>
                          {esc.acknowledged_at && (
                            <span className="text-emerald-400">
                              <CheckCircle size={10} className="inline mr-1" />Acknowledged: {fmtDt(esc.acknowledged_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* ── Comments ── */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {comments.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No comments yet.</p>}
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {c.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-slate-700/40 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-200">{c.author}</span>
                      <span className="text-xs text-slate-500">{fmtDt(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Metrics ── */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-700/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu size={16} className="text-red-400" />
                    <span className="text-sm font-semibold text-slate-200">CPU Usage — Last 30 Minutes</span>
                    <span className="ml-auto text-sm font-bold text-red-400">{metrics[metrics.length - 1]?.cpu}%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} interval={5} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                      <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '80%', fill: '#f59e0b', fontSize: 10 }} />
                      <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} dot={false} name="CPU %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MemoryStick size={16} className="text-blue-400" />
                    <span className="text-sm font-semibold text-slate-200">Memory Usage — Last 30 Minutes</span>
                    <span className="ml-auto text-sm font-bold text-blue-400">{metrics[metrics.length - 1]?.memory}%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} interval={5} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                      <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '80%', fill: '#f59e0b', fontSize: 10 }} />
                      <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} dot={false} name="Memory %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Container size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-200">Pod Status</span>
                  <span className="ml-auto text-sm text-slate-400">{pods.filter(p => p.status === 'Running').length} / {pods.length} running</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-700/50 text-xs">
                        <th className="text-left py-2 pr-4 font-medium">Pod Name</th>
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-left py-2 pr-4 font-medium">Restarts</th>
                        <th className="text-left py-2 pr-4 font-medium">CPU</th>
                        <th className="text-left py-2 pr-4 font-medium">Memory</th>
                        <th className="text-left py-2 font-medium">Node</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pods.map((pod, i) => (
                        <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/10 transition-colors">
                          <td className="py-2 pr-4 font-mono text-xs text-slate-300">{pod.name}</td>
                          <td className="py-2 pr-4">
                            <span className={`font-medium text-xs ${pod.status === 'Running' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pod.status === 'Running' ? '● ' : '✕ '}{pod.status}
                            </span>
                          </td>
                          <td className={`py-2 pr-4 text-sm ${pod.restarts > 2 ? 'text-red-400 font-medium' : 'text-slate-400'}`}>{pod.restarts}</td>
                          <td className="py-2 pr-4 text-sm text-slate-300">{pod.cpu}</td>
                          <td className="py-2 pr-4 text-sm text-slate-300">{pod.memory}</td>
                          <td className="py-2 text-xs font-mono text-slate-500">{pod.node}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Logs ── */}
          {activeTab === 'logs' && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm">
                <span className="text-slate-400 font-medium">Service:</span>
                <span className="text-indigo-400">{svcName}</span>
                <span className="ml-auto text-slate-500 text-xs">{svcLogs.length} entries</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-0.5">
                {svcLogs.map(log => (
                  <div key={log.id} className={`flex gap-3 px-2 py-1 rounded ${LOG_BG[log.level]}`}>
                    <span className="text-slate-600 flex-shrink-0 w-24">{fmtTs(log.timestamp)}</span>
                    <span className={`font-bold flex-shrink-0 w-14 ${LOG_COLORS[log.level]}`}>{log.level}</span>
                    <span className="text-slate-500 flex-shrink-0 w-28 truncate">{log.pod}</span>
                    <span className={LOG_COLORS[log.level] + ' flex-1'}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Traces ── */}
          {activeTab === 'traces' && (
            <div>
              <p className="text-sm text-slate-400 mb-5">Request trace — span-level breakdown of a representative failing request showing where time was spent and which services errored.</p>
              <TraceWaterfall trace={trace} />
            </div>
          )}

          {/* ── Service Graph ── */}
          {activeTab === 'graph' && (
            <div>
              <p className="text-sm text-slate-400 mb-3">Service dependency graph based on distributed trace data. Red dashed edges indicate elevated error rates. The highlighted node is the affected service.</p>
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                {[['#ef4444', 'Error (dashed)'], ['#f59e0b', 'Degraded'], ['#10b981', 'Healthy']].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 inline-block" style={{ background: c }} />
                    <span className="text-slate-500">{l}</span>
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border border-dashed border-red-500 inline-block" />
                  <span className="text-slate-500">Has active alert</span>
                </span>
              </div>
              <ServiceGraph highlightService={svcName} />
            </div>
          )}

          {/* ── Events ── */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {logs.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No events recorded.</p>}
              {[...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(log => (
                <div key={log.id} className="flex items-start gap-3 border-b border-slate-700/30 pb-3 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="capitalize text-sm text-slate-300">{log.event_type.replace(/_/g, ' ')}</span>
                    {log.old_value && (
                      <span className="text-slate-500 ml-2 text-sm">{log.old_value} → <span className="text-indigo-400">{log.new_value}</span></span>
                    )}
                    <div className="text-xs text-slate-600 mt-1">{fmtDt(log.created_at)} · {log.resource} #{log.resource_id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Relations ── */}
          {activeTab === 'relations' && (
            <div className="space-y-3">
              {relations.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No related incidents.</p>}
              {relations.map(r => {
                const isParent = r.parent_incident_id === inc.id
                const relatedId = isParent ? r.child_incident_id : r.parent_incident_id
                const related = incidents.find(i => i.id === relatedId)
                const relatedAlert = related ? alerts.find(a => a.id === related.alert_id) : null
                return (
                  <Link key={r.id} to={`/incidents/${relatedId}`}
                    className="flex items-center gap-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl px-4 py-3 transition-colors group">
                    <GitBranch size={16} className="text-slate-500 flex-shrink-0" />
                    <div className="flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded ${isParent ? 'bg-blue-900/40 text-blue-400' : 'bg-violet-900/40 text-violet-400'}`}>
                        {isParent ? 'Child' : 'Parent'}
                      </span>
                    </div>
                    <span className="font-mono text-slate-200 font-medium">INC-{String(relatedId).padStart(4, '0')}</span>
                    {related && <StatusBadge status={related.status} />}
                    {related && <PriorityBadge priority={related.priority} />}
                    {relatedAlert && <span className="text-slate-400 text-sm">{relatedAlert.metadata_name}</span>}
                    <ExternalLink size={13} className="ml-auto text-slate-600 group-hover:text-indigo-400" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}