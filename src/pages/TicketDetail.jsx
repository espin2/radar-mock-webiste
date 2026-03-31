
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, Ticket, Bell, AlertTriangle, Clock,
  ChevronUp, CheckCircle, Shield, User, Users, Calendar, Phone, Mail,
} from 'lucide-react'
import { tickets, alerts, incidents, escalationAssignments } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const fmtDuration = (start, end) => {
  if (!end) return '—'
  const diff = Math.floor((new Date(end) - new Date(start)) / 60000)
  if (diff < 60) return `${diff} minutes`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

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

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ticket = tickets.find(t => t.id === parseInt(id))

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Ticket size={40} className="text-slate-600" />
        <p className="text-slate-400">Ticket not found: ID {id}</p>
        <Link to="/tickets" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to Tickets</Link>
      </div>
    )
  }

  const alert = alerts.find(a => a.id === ticket.alert_id)
  const incident = incidents.find(i => i.ticket_id === ticket.id)
  const escalations = escalationAssignments.filter(
    e => e.resource_type === 'ticket' && e.resource_id === ticket.id
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-slate-600">/</span>
        <Link to="/tickets" className="text-sm text-slate-400 hover:text-slate-200">Tickets</Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-200">TKT-{String(ticket.id).padStart(4, '0')}</span>
      </div>

      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-900/30 border border-sky-700/40 flex items-center justify-center">
                <Ticket size={20} className="text-sky-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-mono">TKT-{String(ticket.id).padStart(4, '0')}</h1>
                {alert && <p className="text-sm text-slate-400">{alert.metadata_name} · {alert.alert_types}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">v{ticket.version}</span>
              {ticket.escalated_at && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-900/30 border border-red-800/40 text-red-400">
                  <ChevronUp size={10} /> Escalated
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1">
            <div>Created: {fmtDt(ticket.created_at)}</div>
            {ticket.updated_at && <div>Updated: {fmtDt(ticket.updated_at)}</div>}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={15} className="text-slate-400" /> Ticket Timeline
        </h2>
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />

          {/* Created */}
          <div className="relative flex items-start gap-3">
            <div className="absolute -left-5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-800 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-400">Ticket Created</p>
              <p className="text-xs text-slate-400 mt-0.5">{fmtDt(ticket.created_at)}</p>
            </div>
          </div>

          {/* Escalated */}
          {ticket.escalated_at && (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-5 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-800 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <ChevronUp size={12} /> Escalated
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{fmtDt(ticket.escalated_at)}</p>
                {ticket.escalation_reason && (
                  <p className="text-xs text-slate-500 mt-1 bg-red-900/10 border border-red-900/20 rounded px-2 py-1">{ticket.escalation_reason}</p>
                )}
              </div>
            </div>
          )}

          {/* Closed */}
          {ticket.closure_at ? (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-800 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={12} /> Closed — TTR: {fmtDuration(ticket.created_at, ticket.closure_at)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{fmtDt(ticket.closure_at)}</p>
                {ticket.closure_reason && (
                  <p className="text-xs text-slate-500 mt-1 bg-emerald-900/10 border border-emerald-900/20 rounded px-2 py-1">{ticket.closure_reason}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-5 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-800 mt-0.5 animate-pulse" />
              <div>
                <p className="text-xs font-medium text-slate-500">Ongoing — not yet closed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Escalation Assignments ─────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={15} className="text-indigo-400" /> Escalation Assignments
          {escalations.length > 0 && (
            <span className="ml-1 text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded-full">
              {escalations.length}
            </span>
          )}
        </h2>

        {escalations.length === 0 ? (
          <div className="text-center py-6">
            <Shield size={28} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No escalation assignments for this ticket</p>
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
          </div>
        )}
      </div>

      {/* Linked Resources */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Linked Resources</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alert */}
          {alert ? (
            <Link to={`/alerts/${alert.id}`}
              className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-orange-900/30 border border-orange-700/40 flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Source Alert</p>
                <p className="text-sm font-medium text-orange-400 group-hover:text-orange-300 truncate">
                  {alert.metadata_name} · {alert.alert_types}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={alert.status} />
                  <PriorityBadge priority={alert.priority} />
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-orange-400" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 bg-slate-700/20 rounded-lg p-4 opacity-50">
              <div className="w-9 h-9 rounded-lg bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-slate-500" />
              </div>
              <div><p className="text-xs text-slate-500 mb-0.5">Source Alert</p><p className="text-sm text-slate-600">Not linked</p></div>
            </div>
          )}

          {/* Incident */}
          {incident ? (
            <Link to={`/incidents/${incident.id}`}
              className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg p-4 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-violet-900/30 border border-violet-700/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Incident</p>
                <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300 font-mono">
                  INC-{String(incident.id).padStart(4, '0')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={incident.status} />
                  <PriorityBadge priority={incident.priority} />
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-violet-400" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 bg-slate-700/20 rounded-lg p-4 opacity-50">
              <div className="w-9 h-9 rounded-lg bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-slate-500" />
              </div>
              <div><p className="text-xs text-slate-500 mb-0.5">Incident</p><p className="text-sm text-slate-600">No incident for this ticket</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
