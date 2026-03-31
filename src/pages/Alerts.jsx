import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ExternalLink, ChevronDown, ChevronUp, ChevronRight, BarChart2, X, ArrowRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import {
  alerts, ALERT_TYPES, PRIORITIES, CLUSTERS, SERVICES,
  getPriorityBreakdown,
} from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const duration = (start, end) => {
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const diff = Math.floor((e - s) / 60000)
  if (diff < 60) return `${diff}m`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

const TYPE_COLORS = {
  CPU: '#ef4444', Memory: '#f97316', Latency: '#f59e0b',
  ErrorRate: '#8b5cf6', DiskIO: '#06b6d4', Replicas: '#10b981', Network: '#6366f1',
}

const getServiceStatus = (serviceAlerts) => {
  if (serviceAlerts.some(a => a.status === 'firing')) return 'firing'
  if (serviceAlerts.some(a => a.status === 'pending')) return 'pending'
  return 'resolved'
}

// Per-service analytics panel shown when service name is clicked
function ServiceAnalyticsPanel({ svcName, svcAlerts, onClose }) {
  const [selectedType, setSelectedType] = useState(null)

  const byType = ALERT_TYPES.map(t => ({
    type: t,
    firing: svcAlerts.filter(a => a.alert_types === t && a.status === 'firing').length,
    resolved: svcAlerts.filter(a => a.alert_types === t && a.status === 'resolved').length,
  })).filter(t => t.firing + t.resolved > 0)

  const typeAlerts = selectedType
    ? svcAlerts.filter(a => a.alert_types === selectedType)
    : svcAlerts

  const allTypes = [...new Set(svcAlerts.map(a => a.alert_types))]

  return (
    <div className="bg-slate-700/30 border border-indigo-700/40 rounded-xl p-5 mt-1">
      <div className="flex items-center gap-3 mb-4">
        <BarChart2 size={16} className="text-indigo-400" />
        <span className="font-semibold text-sm text-white">{svcName}</span>
        <span className="text-xs text-slate-400">— Analytics</span>
        <Link to={`/service/${svcName}`} className="ml-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          Full Service View <ExternalLink size={11} />
        </Link>
        <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300"><X size={15} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stacked bar by type */}
        <div className="bg-slate-800/60 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Alerts by Type</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={byType} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="type" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="firing" stackId="s" fill="#ef4444" name="Firing" radius={[0, 0, 0, 0]}
                onClick={(d) => setSelectedType(selectedType === d.type ? null : d.type)} style={{ cursor: 'pointer' }} />
              <Bar dataKey="resolved" stackId="s" fill="#10b981" name="Resolved" radius={[3, 3, 0, 0]}
                onClick={(d) => setSelectedType(selectedType === d.type ? null : d.type)} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-600 mt-1 text-center">Click a bar to filter below</p>
        </div>

        {/* Summary stats */}
        <div className="bg-slate-800/60 rounded-lg p-3 space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Summary</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-2.5 text-center">
              <p className="text-2xl font-bold text-red-400">{svcAlerts.filter(a => a.status === 'firing').length}</p>
              <p className="text-xs text-slate-500">Firing</p>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-2.5 text-center">
              <p className="text-2xl font-bold text-emerald-400">{svcAlerts.filter(a => a.status === 'resolved').length}</p>
              <p className="text-xs text-slate-500">Resolved</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            {allTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? null : t)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                  selectedType === t ? 'bg-slate-600/60' : 'hover:bg-slate-700/40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[t] || '#64748b' }} />
                <span className="text-slate-300 flex-1 text-left">{t}</span>
                <span className="text-red-400">{svcAlerts.filter(a => a.alert_types === t && a.status === 'firing').length} 🔴</span>
                <span className="text-emerald-400">{svcAlerts.filter(a => a.alert_types === t && a.status === 'resolved').length} ✓</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtered alert list by type */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-medium text-slate-300">
            {selectedType ? (
              <span className="flex items-center gap-2">
                Alerts of type: <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${TYPE_COLORS[selectedType]}22`, color: TYPE_COLORS[selectedType] }}>{selectedType}</span>
                <button onClick={() => setSelectedType(null)} className="text-slate-500 hover:text-slate-300"><X size={12} /></button>
              </span>
            ) : 'All alerts for this service'}
          </p>
          <span className="text-xs text-slate-500 ml-auto">{typeAlerts.length} results</span>
        </div>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {typeAlerts.map(a => (
            <div key={a.id} className={`flex items-start gap-3 px-3 py-2 rounded-lg text-xs ${
              a.status === 'firing' ? 'bg-red-900/10 border border-red-900/20' : 'bg-slate-700/20'
            }`}>
              <StatusBadge status={a.status} />
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[a.alert_types] || '#64748b' }} />
                <span className="text-slate-300">{a.alert_types}</span>
              </span>
              <PriorityBadge priority={a.priority} />
              <span className="text-slate-400 flex-1 truncate">{a.message_firing}</span>
              <span className="text-slate-600 flex-shrink-0">{a.cluster_name}</span>
              <span className="text-slate-600 flex-shrink-0">{fmtDt(a.starts_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Alerts() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterCluster, setFilterCluster] = useState('all')
  const [expandedServices, setExpandedServices] = useState({})
  const [analyticsService, setAnalyticsService] = useState(null)

  const toggleService = (svc) =>
    setExpandedServices(prev => ({ ...prev, [svc]: !prev[svc] }))

  const toggleAnalytics = (svc) =>
    setAnalyticsService(prev => prev === svc ? null : svc)

  // Filter individual alerts
  const filteredAlerts = alerts.filter(a => {
    if (search && !a.metadata_name.toLowerCase().includes(search.toLowerCase()) &&
        !a.message_firing?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (filterPriority !== 'all' && a.priority !== filterPriority) return false
    if (filterType !== 'all' && a.alert_types !== filterType) return false
    if (filterCluster !== 'all' && a.cluster_name !== filterCluster) return false
    return true
  })

  // Group filtered alerts by service
  const serviceGroups = {}
  filteredAlerts.forEach(a => {
    if (!serviceGroups[a.metadata_name]) serviceGroups[a.metadata_name] = []
    serviceGroups[a.metadata_name].push(a)
  })

  // Sort services: firing first
  const sortedServices = Object.keys(serviceGroups).sort((a, b) => {
    const aFiring = serviceGroups[a].some(al => al.status === 'firing') ? 0 : 1
    const bFiring = serviceGroups[b].some(al => al.status === 'firing') ? 0 : 1
    return aFiring - bFiring || a.localeCompare(b)
  })

  const sortServiceAlerts = (alts) => [
    ...alts.filter(a => a.status === 'firing').sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at)),
    ...alts.filter(a => a.status !== 'firing').sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at)),
  ]

  // Global charts data
  const priorityData = getPriorityBreakdown(alerts)
  const byService = SERVICES.map(s => ({
    service: s.replace('-service', ''),
    firing: alerts.filter(a => a.metadata_name === s && a.status === 'firing').length,
    resolved: alerts.filter(a => a.metadata_name === s && a.status === 'resolved').length,
  })).filter(s => s.firing + s.resolved > 0)

  // Per-service analytics: for the dedicated section
  const serviceAnalyticsData = SERVICES.map(s => {
    const sAlerts = alerts.filter(a => a.metadata_name === s)
    return {
      service: s.replace('-service', ''),
      fullName: s,
      ...Object.fromEntries(ALERT_TYPES.map(t => [t, sAlerts.filter(a => a.alert_types === t).length])),
      total: sAlerts.length,
    }
  }).filter(s => s.total > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-sm text-slate-400 mt-1">
          {alerts.filter(a => a.status === 'firing').length} firing ·{' '}
          {alerts.filter(a => a.status === 'resolved').length} resolved ·{' '}
          {alerts.length} total across {SERVICES.filter(s => alerts.some(a => a.metadata_name === s)).length} services
        </p>
      </div>

      {/* ── Global Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Firing vs Resolved by Service */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Firing vs Resolved by Service</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byService} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="service" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} width={65} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="firing" fill="#ef4444" name="Firing" stackId="a" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" stackId="a" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Priority */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">By Priority</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={priorityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="priority" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Per-Service Analytics (stacked by alert type) ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">Per-Service Analytics by Alert Type</h2>
        <p className="text-xs text-slate-500 mb-4">Click a service name in the list below to drill down by type</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={serviceAnalyticsData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="service" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v, n) => [v, n]} />
            <Legend formatter={(v) => <span style={{ color: TYPE_COLORS[v] || '#94a3b8', fontSize: 11 }}>{v}</span>} />
            {ALERT_TYPES.filter(t => alerts.some(a => a.alert_types === t)).map(t => (
              <Bar key={t} dataKey={t} stackId="svc" fill={TYPE_COLORS[t]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by service or message..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="firing">Firing</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Types</option>
            {ALERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterCluster} onChange={e => setFilterCluster(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Clusters</option>
            {CLUSTERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-xs text-slate-500 ml-auto">{filteredAlerts.length} alerts · {sortedServices.length} services</span>
        </div>
      </div>

      {/* Grouped by Service */}
      <div className="space-y-3">
        {sortedServices.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-12 text-center text-slate-500">
            No alerts match your filters
          </div>
        )}

        {sortedServices.map(svcName => {
          const svcAlerts = sortServiceAlerts(serviceGroups[svcName])
          const svcStatus = getServiceStatus(svcAlerts)
          const isOpen = expandedServices[svcName] !== false
          const firingCount = svcAlerts.filter(a => a.status === 'firing').length
          const resolvedCount = svcAlerts.filter(a => a.status === 'resolved').length
          const topPriority = [...svcAlerts].sort((a, b) => a.priority.localeCompare(b.priority))[0]?.priority
          const showAnalytics = analyticsService === svcName

          return (
            <div key={svcName} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              {/* Service Header Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors border-b border-slate-700/50"
                onClick={() => toggleService(svcName)}
              >
                <div className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  svcStatus === 'firing' ? 'bg-red-400 animate-pulse' :
                  svcStatus === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />

                {/* Service name — click opens analytics inline */}
                <button
                  onClick={e => { e.stopPropagation(); toggleAnalytics(svcName) }}
                  className={`font-semibold text-sm hover:text-indigo-300 transition-colors flex items-center gap-1.5 ${
                    showAnalytics ? 'text-indigo-400' : 'text-white'
                  }`}
                >
                  {svcName}
                  <BarChart2 size={13} className={showAnalytics ? 'text-indigo-400' : 'text-slate-600'} />
                </button>

                <StatusBadge status={svcStatus} />
                {topPriority && <PriorityBadge priority={topPriority} />}

                <div className="flex items-center gap-3 ml-2 text-xs">
                  {firingCount > 0 && <span className="text-red-400 font-medium">{firingCount} firing</span>}
                  {resolvedCount > 0 && <span className="text-emerald-400">{resolvedCount} resolved</span>}
                </div>

                <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
                  {[...new Set(svcAlerts.map(a => a.alert_types))].map(type => (
                    <span key={type} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-700"
                      style={{ color: TYPE_COLORS[type] || '#94a3b8' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[type] || '#94a3b8' }} />
                      {type}
                    </span>
                  ))}
                  <span className="text-xs text-slate-500 ml-1">{svcAlerts.length} total</span>
                </div>
              </div>

              {/* Analytics Panel (inline, shown when service name clicked) */}
              {showAnalytics && (
                <div className="px-4 pt-2 pb-4 border-b border-slate-700/50">
                  <ServiceAnalyticsPanel
                    svcName={svcName}
                    svcAlerts={alerts.filter(a => a.metadata_name === svcName)}
                    onClose={() => setAnalyticsService(null)}
                  />
                </div>
              )}

              {/* Alerts list (expanded) */}
              {isOpen && (
                <div>
                  <div className="grid grid-cols-12 gap-2 px-8 py-2 bg-slate-700/20 border-b border-slate-700/30 text-xs text-slate-500 font-medium uppercase tracking-wider">
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-2">Cluster</div>
                    <div className="col-span-2">Started</div>
                    <div className="col-span-1">Duration</div>
                    <div className="col-span-2">Namespace</div>
                  </div>

                  {svcAlerts.map((a) => (
                    <div
                      key={a.id}
                      className={`grid grid-cols-12 gap-2 px-8 py-3 items-center text-sm border-b border-slate-700/20 cursor-pointer transition-colors hover:bg-slate-700/30 group ${
                        a.status === 'firing' ? 'bg-red-950/10' : ''
                      }`}
                      onClick={() => navigate(`/alerts/${a.id}`)}
                    >
                      <div className="col-span-2"><StatusBadge status={a.status} /></div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[a.alert_types] || '#6366f1' }} />
                          <span className="text-slate-200">{a.alert_types}</span>
                        </span>
                      </div>
                      <div className="col-span-1"><PriorityBadge priority={a.priority} /></div>
                      <div className="col-span-2 text-xs text-slate-400">
                        <div>{a.cluster_name}</div>
                        <div className="text-slate-600">{a.cluster_type}</div>
                      </div>
                      <div className="col-span-2 text-xs text-slate-400">{fmtDt(a.starts_at)}</div>
                      <div className="col-span-1 text-xs text-slate-400">{duration(a.starts_at, a.ends_at)}</div>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{a.namespace || '—'}</span>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-indigo-400 ml-2 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}