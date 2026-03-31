import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, Bell, Ticket, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  alerts, tickets, incidents, incidentComments, eventLogs, SERVICES,
  computeMTTA, computeMTTR, getAlertVolumeByDay,
} from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import StatCard from '../components/StatCard'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fmtDuration = (start, end) => {
  if (!start) return '—'
  const diff = Math.floor((end ? new Date(end) : new Date()) - new Date(start)) / 60000
  if (diff < 60) return `${Math.round(diff)}m`
  return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m`
}

const fmtTime = (min) => {
  if (!min) return '—'
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

const SERVICE_COLORS = {
  'payment-service': '#6366f1',
  'user-service': '#0ea5e9',
  'api-gateway': '#f59e0b',
  'order-service': '#10b981',
  'notification-service': '#8b5cf6',
  'inventory-service': '#ef4444',
  'auth-service': '#f97316',
  'analytics-service': '#ec4899',
}

export default function ServiceDashboard() {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState(serviceName || '')
  const [activeTab, setActiveTab] = useState('alerts')

  const selectedService = serviceName || ''

  const serviceAlerts = alerts.filter(a => a.metadata_name === selectedService)
  const serviceTickets = tickets.filter(t => {
    const alert = alerts.find(a => a.id === t.alert_id)
    return alert?.metadata_name === selectedService
  })
  const serviceIncidents = incidents.filter(i => {
    const alert = alerts.find(a => a.id === i.alert_id)
    return alert?.metadata_name === selectedService
  })
  const serviceIncidentIds = serviceIncidents.map(i => i.id)
  const serviceComments = incidentComments.filter(c => serviceIncidentIds.includes(c.incident_id))
  const serviceLogs = eventLogs.filter(e => {
    if (e.resource === 'alert') return serviceAlerts.some(a => a.id === e.resource_id)
    if (e.resource === 'ticket') return serviceTickets.some(t => t.id === e.resource_id)
    if (e.resource === 'incident') return serviceIncidents.some(i => i.id === e.resource_id)
    return false
  })

  const mtta = computeMTTA(serviceIncidents)
  const mttr = computeMTTR(serviceIncidents)
  const alertVolume = getAlertVolumeByDay(serviceAlerts, 10)
  const color = SERVICE_COLORS[selectedService] || '#6366f1'

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/service/${search.trim()}`)
  }

  const selectService = (svc) => {
    setSearch(svc)
    navigate(`/service/${svc}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Service View</h1>
        <p className="text-sm text-slate-400 mt-1">Unified alert, ticket, and incident view by service (metadata_name)</p>
      </div>

      {/* Service Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <form onSubmit={handleSearch} className="flex gap-3 items-center mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search service name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            Go
          </button>
        </form>

        {/* Service quick-select */}
        <div className="flex flex-wrap gap-2">
          {SERVICES.map(svc => {
            const c = SERVICE_COLORS[svc] || '#6366f1'
            const firingCount = alerts.filter(a => a.metadata_name === svc && a.status === 'firing').length
            return (
              <button
                key={svc}
                onClick={() => selectService(svc)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedService === svc
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
                {svc}
                {firingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1 rounded-full">{firingCount}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* No service selected */}
      {!selectedService && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Search size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Select a service above to view its alerts, tickets, and incidents</p>
        </div>
      )}

      {/* Service not found */}
      {selectedService && serviceAlerts.length === 0 && serviceTickets.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">No data found for service: <span className="text-indigo-400 font-medium">{selectedService}</span></p>
        </div>
      )}

      {/* Service Dashboard */}
      {selectedService && (serviceAlerts.length > 0 || serviceTickets.length > 0) && (
        <>
          {/* Service Header */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: color }} />
            <h2 className="text-xl font-bold text-white">{selectedService}</h2>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-slate-400 text-sm">{serviceAlerts[0]?.service_type}</span>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Firing Alerts"
              value={serviceAlerts.filter(a => a.status === 'firing').length}
              subtitle={`${serviceAlerts.length} total`}
              icon={Bell}
              color={serviceAlerts.filter(a => a.status === 'firing').length > 0 ? 'red' : 'emerald'}
            />
            <StatCard
              title="Open Tickets"
              value={serviceTickets.filter(t => ['open', 'in_progress', 'escalated'].includes(t.status)).length}
              subtitle={`${serviceTickets.length} total`}
              icon={Ticket}
              color="amber"
            />
            <StatCard
              title="Active Incidents"
              value={serviceIncidents.filter(i => i.status !== 'resolved').length}
              subtitle={`${serviceIncidents.length} total`}
              icon={AlertTriangle}
              color="violet"
            />
            <StatCard
              title="MTTR"
              value={fmtTime(mttr)}
              subtitle={`MTTA: ${fmtTime(mtta)}`}
              icon={ChevronDown}
              color="sky"
            />
          </div>

          {/* Alert volume chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Alert Volume — Last 10 Days</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={alertVolume} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="svcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke={color} fill="url(#svcGrad)" strokeWidth={2} name="Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tabs */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex border-b border-slate-700">
              {[
                { id: 'alerts', label: `Alerts (${serviceAlerts.length})`, icon: Bell },
                { id: 'tickets', label: `Tickets (${serviceTickets.length})`, icon: Ticket },
                { id: 'incidents', label: `Incidents (${serviceIncidents.length})`, icon: AlertTriangle },
                { id: 'timeline', label: `Timeline (${serviceLogs.length})`, icon: ChevronDown },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-indigo-500 text-indigo-400 bg-slate-700/20'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  {serviceAlerts.length === 0 && <p className="text-slate-500 text-sm">No alerts for this service.</p>}
                  {serviceAlerts.map(a => (
                    <div key={a.id} className="flex items-start gap-4 bg-slate-700/30 rounded-lg px-4 py-3">
                      <StatusBadge status={a.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-200">{a.alert_types}</span>
                          <PriorityBadge priority={a.priority} />
                          <span className="text-xs text-slate-500">{a.cluster_name} · {a.namespace}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{a.message_firing}</p>
                        {a.message_resolved && <p className="text-xs text-emerald-400 mt-0.5">{a.message_resolved}</p>}
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>Started: {fmtDt(a.starts_at)}</span>
                          <span>Duration: {fmtDuration(a.starts_at, a.ends_at)}</span>
                          {a.resource_usage && <span>Usage: {a.resource_usage}</span>}
                          {a.threshold_value && <span>Threshold: {a.threshold_value}</span>}
                        </div>
                      </div>
                      {a.panel_url && (
                        <a href={a.panel_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 flex-shrink-0">
                          Panel <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tickets Tab */}
              {activeTab === 'tickets' && (
                <div className="space-y-3">
                  {serviceTickets.length === 0 && <p className="text-slate-500 text-sm">No tickets for this service.</p>}
                  {serviceTickets.map(t => (
                    <div key={t.id} className="flex items-start gap-4 bg-slate-700/30 rounded-lg px-4 py-3">
                      <div>
                        <span className="font-mono text-xs text-slate-400">TKT-{String(t.id).padStart(4, '0')}</span>
                      </div>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 font-mono">{t.deduplication_id}</p>
                        <div className="flex gap-4 mt-1 text-xs text-slate-500">
                          <span>Created: {fmtDt(t.created_at)}</span>
                          {t.escalated_at && <span className="text-red-400">Escalated: {fmtDt(t.escalated_at)}</span>}
                          {t.closure_at && <span className="text-emerald-400">Closed: {fmtDt(t.closure_at)}</span>}
                        </div>
                        {t.closure_reason && <p className="text-xs text-slate-400 mt-1">{t.closure_reason}</p>}
                        {t.escalation_reason && <p className="text-xs text-red-400 mt-1">{t.escalation_reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Incidents Tab */}
              {activeTab === 'incidents' && (
                <div className="space-y-3">
                  {serviceIncidents.length === 0 && <p className="text-slate-500 text-sm">No incidents for this service.</p>}
                  {serviceIncidents.map(inc => {
                    const comments = incidentComments.filter(c => c.incident_id === inc.id)
                    return (
                      <div key={inc.id} className="bg-slate-700/30 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="font-mono text-sm font-bold text-white">INC-{String(inc.id).padStart(4, '0')}</span>
                          <StatusBadge status={inc.status} />
                          <PriorityBadge priority={inc.priority} />
                          <span className="text-xs text-slate-400">{inc.owner || 'Unassigned'}</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-500">
                          <span>Created: {fmtDt(inc.created_at)}</span>
                          {inc.acknowledged_at && <span className="text-amber-400">Ack: {fmtDt(inc.acknowledged_at)}</span>}
                          {inc.resolved_at && <span className="text-emerald-400">Resolved: {fmtDt(inc.resolved_at)}</span>}
                          {comments.length > 0 && <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>}
                        </div>
                        {comments.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-slate-700/50 pt-2">
                            {comments.map(c => (
                              <div key={c.id} className="flex gap-2 text-xs">
                                <span className="text-slate-500 flex-shrink-0">{c.author.split('@')[0]}:</span>
                                <span className="text-slate-300">{c.content}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className="space-y-2">
                  {serviceLogs.length === 0 && <p className="text-slate-500 text-sm">No events recorded.</p>}
                  {[...serviceLogs]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(log => (
                      <div key={log.id} className="flex items-start gap-3 text-xs py-1.5 border-b border-slate-700/30 last:border-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="capitalize text-slate-300">{log.event_type.replace(/_/g, ' ')}</span>
                          {log.old_value && (
                            <span className="text-slate-500 ml-1">{log.old_value} → <span className="text-indigo-400">{log.new_value}</span></span>
                          )}
                          <div className="text-slate-600 mt-0.5">{fmtDt(log.created_at)} · {log.resource} #{log.resource_id}</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}