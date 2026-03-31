import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronDown, ChevronUp, MessageSquare, GitBranch, Clock, User, Activity, ArrowRight, Shield } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  incidents, alerts, tickets, incidentComments, incidentRelations, escalationAssignments,
  PRIORITIES, computeMTTA, computeMTTR, getPriorityBreakdown,
  getMTTAByDay, getMTTRByDay,
} from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import StatCard from '../components/StatCard'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fmtDuration = (start, end) => {
  if (!end) {
    const diff = Math.floor((new Date() - new Date(start)) / 60000)
    if (diff < 60) return `${diff}m`
    return `${Math.floor(diff / 60)}h ${diff % 60}m`
  }
  const diff = Math.floor((new Date(end) - new Date(start)) / 60000)
  if (diff < 60) return `${diff}m`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

const fmtTime = (min) => {
  if (!min) return '—'
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

export default function Incidents() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const mtta = computeMTTA(incidents)
  const mttr = computeMTTR(incidents)
  const mttaByDay = getMTTAByDay(incidents, 14)
  const mttrByDay = getMTTRByDay(incidents, 14)
  const priorityBreakdown = getPriorityBreakdown(incidents)

  const filtered = incidents
    .filter(i => {
      const alert = alerts.find(a => a.id === i.alert_id)
      if (search && !alert?.metadata_name.toLowerCase().includes(search.toLowerCase()) &&
          !i.owner?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== 'all' && i.status !== filterStatus) return false
      if (filterPriority !== 'all' && i.priority !== filterPriority) return false
      return true
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'created_at') return dir * (new Date(a.created_at) - new Date(b.created_at))
      if (sortBy === 'priority') return dir * (a.priority.localeCompare(b.priority))
      if (sortBy === 'status') return dir * (a.status.localeCompare(b.status))
      return 0
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Incidents</h1>
        <p className="text-sm text-slate-400 mt-1">
          {incidents.filter(i => i.status === 'open').length} open ·{' '}
          {incidents.filter(i => i.status === 'acknowledged').length} acknowledged ·{' '}
          {incidents.filter(i => i.status === 'resolved').length} resolved
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="MTTA" value={fmtTime(mtta)} subtitle="Mean Time to Acknowledge" icon={Clock} color="sky" />
        <StatCard title="MTTR" value={fmtTime(mttr)} subtitle="Mean Time to Resolve" icon={Activity} color="violet" />
        <StatCard title="Active Incidents" value={incidents.filter(i => i.status !== 'resolved').length}
          subtitle={`${incidents.filter(i => i.status === 'open').length} unacknowledged`} icon={ChevronUp} color="red" />
        <StatCard title="Resolved" value={incidents.filter(i => i.status === 'resolved').length}
          subtitle={`${Math.round(incidents.filter(i => i.status === 'resolved').length / incidents.length * 100)}% resolution rate`}
          icon={ChevronDown} color="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">By Priority</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={priorityBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                dataKey="count" nameKey="priority" paddingAngle={3}>
                {priorityBreakdown.map((_, i) => <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#64748b'][i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">MTTA Trend (min)</h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={mttaByDay} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Line type="monotone" dataKey="mtta" stroke="#38bdf8" strokeWidth={2} dot={false} name="MTTA (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">MTTR Trend (min)</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mttrByDay} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="mttr" fill="#7c3aed" radius={[2, 2, 0, 0]} name="MTTR (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search by service or owner..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} results</span>
        </div>
      </div>

      {/* Incident Cards — click to open detail page */}
      <div className="space-y-3">
        {filtered.map(inc => {
          const alert = alerts.find(a => a.id === inc.alert_id)
          const ticket = tickets.find(t => t.id === inc.ticket_id)
          const comments = incidentComments.filter(c => c.incident_id === inc.id)
          const relations = incidentRelations.filter(r => r.parent_incident_id === inc.id || r.child_incident_id === inc.id)
          const esc = escalationAssignments.find(e => e.resource_type === 'incident' && e.resource_id === inc.id)

          return (
            <div
              key={inc.id}
              className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 cursor-pointer hover:bg-slate-700/30 hover:border-slate-600 transition-all group"
              onClick={() => navigate(`/incidents/${inc.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-bold text-white font-mono">INC-{String(inc.id).padStart(4, '0')}</span>
                    <StatusBadge status={inc.status} />
                    <PriorityBadge priority={inc.priority} />
                    {ticket && (
                      <span
                        className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                        onClick={e => { e.stopPropagation(); navigate(`/tickets/${ticket.id}`) }}
                      >
                        TKT-{String(ticket.id).padStart(4, '0')}
                      </span>
                    )}
                    {esc && (
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer ${
                          esc.status === 'escalating' ? 'bg-red-900/30 border-red-700/40 text-red-400' :
                          esc.status === 'pending' ? 'bg-amber-900/30 border-amber-700/40 text-amber-400' :
                          'bg-emerald-900/30 border-emerald-700/40 text-emerald-400'
                        }`}
                        onClick={e => { e.stopPropagation(); navigate('/escalations') }}
                        title={esc.policy_name}
                      >
                        <Shield size={10} /> {esc.assignee}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {alert && (
                      <span className="font-medium text-indigo-400">
                        {alert.metadata_name}
                      </span>
                    )}
                    {alert && <span className="text-slate-400">{alert.alert_types}</span>}
                    {alert && <span className="text-slate-500">·</span>}
                    {alert && <span className="text-slate-500 text-xs">{alert.cluster_name}</span>}
                  </div>
                  {alert?.message_firing && (
                    <p className="text-xs text-slate-500 mt-2 truncate max-w-2xl">{alert.message_firing}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    <User size={12} /><span>{inc.owner || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={12} /><span>{fmtDuration(inc.created_at, inc.resolved_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><MessageSquare size={12} />{comments.length}</span>
                    {relations.length > 0 && <span className="flex items-center gap-1"><GitBranch size={12} />{relations.length}</span>}
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors mt-1 flex-shrink-0" />
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-12 text-center text-slate-500">
            No incidents match your filters
          </div>
        )}
      </div>
    </div>
  )
}