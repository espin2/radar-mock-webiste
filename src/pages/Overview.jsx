import { Link } from 'react-router-dom'
import {
  Bell, Ticket, AlertTriangle, CheckCircle2,
  Clock, Activity, TrendingUp, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  alerts, tickets, incidents, eventLogs,
  computeMTTA, computeMTTR,
  getAlertVolumeByDay, getMTTAByDay, getMTTRByDay, getPriorityBreakdown,
} from '../data/mockData'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#64748b']

const fmtTime = (min) => {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

const fmtDt = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Overview() {
  const firingAlerts = alerts.filter(a => a.status === 'firing')
  const openTickets = tickets.filter(t => ['open', 'in_progress', 'escalated'].includes(t.status))
  const activeIncidents = incidents.filter(i => i.status !== 'resolved')
  const resolvedToday = incidents.filter(i => {
    if (!i.resolved_at) return false
    return new Date(i.resolved_at).toDateString() === new Date().toDateString()
  })

  const mtta = computeMTTA(incidents)
  const mttr = computeMTTR(incidents)
  const alertVolume = getAlertVolumeByDay(alerts, 14)
  const mttaByDay = getMTTAByDay(incidents, 14)
  const mttrByDay = getMTTRByDay(incidents, 14)
  const alertPriority = getPriorityBreakdown(alerts)
  const incidentPriority = getPriorityBreakdown(incidents)

  const recentLogs = [...eventLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8)

  const escalationRate = Math.round(tickets.filter(t => t.escalated_at).length / tickets.length * 100)
  const resolutionRate = Math.round(incidents.filter(i => i.status === 'resolved').length / incidents.length * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Operations Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time monitoring across all services and clusters</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Firing Alerts" value={firingAlerts.length} subtitle="Require attention" icon={Bell} color="red" trend={12} />
        <StatCard title="Open Tickets" value={openTickets.length} subtitle={`${tickets.filter(t => t.status === 'escalated').length} escalated`} icon={Ticket} color="amber" trend={-5} />
        <StatCard title="Active Incidents" value={activeIncidents.length} subtitle={`${incidents.filter(i => i.status === 'acknowledged').length} acknowledged`} icon={AlertTriangle} color="violet" trend={8} />
        <StatCard title="Resolved Today" value={resolvedToday.length} subtitle="Incidents closed" icon={CheckCircle2} color="emerald" trend={-20} />
      </div>

      {/* MTTA / MTTR / Rates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="MTTA" value={fmtTime(mtta)} subtitle="Mean Time to Acknowledge" icon={Clock} color="sky" />
        <StatCard title="MTTR" value={fmtTime(mttr)} subtitle="Mean Time to Resolve" icon={TrendingUp} color="indigo" />
        <StatCard title="Escalation Rate" value={`${escalationRate}%`} subtitle="Tickets escalated" icon={Zap} color="amber" />
        <StatCard title="Resolution Rate" value={`${resolutionRate}%`} subtitle="Incidents resolved" icon={Activity} color="emerald" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alert Volume */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Alert Volume — Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={alertVolume} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} itemStyle={{ color: '#818cf8' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#alertGrad)" strokeWidth={2} name="Alerts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Alerts by Priority</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={alertPriority} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="priority" paddingAngle={3}>
                {alertPriority.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MTTA Trend */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">MTTA Trend (minutes)</h2>
          <p className="text-xs text-slate-500 mb-4">Mean Time to Acknowledge over 14 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mttaByDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} itemStyle={{ color: '#38bdf8' }} />
              <Line type="monotone" dataKey="mtta" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 3 }} name="MTTA (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MTTR Trend */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">MTTR Trend (minutes)</h2>
          <p className="text-xs text-slate-500 mb-4">Mean Time to Resolve over 14 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mttrByDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} itemStyle={{ color: '#a78bfa' }} />
              <Bar dataKey="mttr" fill="#7c3aed" radius={[3, 3, 0, 0]} name="MTTR (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Firing Alerts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Firing Alerts</h2>
            <Link to="/alerts" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {firingAlerts.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200 truncate">{a.metadata_name}</span>
                    <PriorityBadge priority={a.priority} />
                  </div>
                  <div className="text-slate-500 mt-0.5 truncate">{a.alert_types} · {a.cluster_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Active Incidents</h2>
            <Link to="/incidents" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {activeIncidents.slice(0, 4).map(inc => {
              const a = alerts.find(al => al.id === inc.alert_id)
              return (
                <div key={inc.id} className="flex items-start gap-3 text-xs">
                  <StatusBadge status={inc.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 truncate">INC-{String(inc.id).padStart(4, '0')}</span>
                      <PriorityBadge priority={inc.priority} />
                    </div>
                    <div className="text-slate-500 mt-0.5 truncate">{a?.metadata_name} · {inc.owner || 'Unassigned'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Events</h2>
          </div>
          <div className="space-y-2.5">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-300 capitalize">{log.event_type.replace(/_/g, ' ')}</span>
                  <span className="text-slate-500 ml-1">· {log.resource} #{log.resource_id}</span>
                  <div className="text-slate-600 mt-0.5">{fmtDt(log.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}