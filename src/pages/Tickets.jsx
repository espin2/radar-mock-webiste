import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ChevronDown, ChevronUp, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  tickets, alerts, incidents, escalationAssignments, PRIORITIES,
  getPriorityBreakdown,
} from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import StatCard from '../components/StatCard'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fmtDuration = (start, end) => {
  if (!end) return '—'
  const diff = Math.floor((new Date(end) - new Date(start)) / 60000)
  if (diff < 60) return `${diff}m`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

const STATUS_COLORS = { open: '#3b82f6', in_progress: '#6366f1', escalated: '#ef4444', closed: '#64748b' }

export default function Tickets() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [highlightId, setHighlightId] = useState(null)

  // Highlight ticket from URL query ?ticket=X
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tktId = params.get('ticket')
    if (tktId) {
      setHighlightId(parseInt(tktId))
      setTimeout(() => {
        document.getElementById(`tkt-${tktId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
    }
  }, [location.search])

  const filtered = tickets
    .filter(t => {
      const alert = alerts.find(a => a.id === t.alert_id)
      if (search && !alert?.metadata_name.toLowerCase().includes(search.toLowerCase()) &&
          !t.deduplication_id.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== 'all' && t.status !== filterStatus) return false
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false
      return true
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'created_at') return dir * (new Date(a.created_at) - new Date(b.created_at))
      if (sortBy === 'priority') return dir * (a.priority.localeCompare(b.priority))
      if (sortBy === 'status') return dir * (a.status.localeCompare(b.status))
      return 0
    })

  const statusBreakdown = ['open', 'in_progress', 'escalated', 'closed'].map(s => ({
    status: s.replace('_', ' '),
    count: tickets.filter(t => t.status === s).length,
  }))
  const priorityBreakdown = getPriorityBreakdown(tickets)
  const escalatedCount = tickets.filter(t => t.escalated_at).length
  const closedCount = tickets.filter(t => t.status === 'closed').length
  const openCount = tickets.filter(t => ['open', 'in_progress', 'escalated'].includes(t.status)).length

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown size={13} className="text-slate-600" />
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-indigo-400" /> : <ChevronDown size={13} className="text-indigo-400" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tickets</h1>
        <p className="text-sm text-slate-400 mt-1">{openCount} open · {closedCount} closed · {tickets.length} total</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets" value={openCount} icon={AlertCircle} color="amber" />
        <StatCard title="Escalated" value={escalatedCount}
          subtitle={`${Math.round(escalatedCount / tickets.length * 100)}% escalation rate`}
          icon={ChevronUp} color="red" />
        <StatCard title="Closed" value={closedCount} icon={ChevronDown} color="emerald" />
        <StatCard title="Avg Resolution" value={fmtDuration(
          tickets.filter(t => t.status === 'closed')[0]?.created_at,
          tickets.filter(t => t.status === 'closed')[0]?.closure_at
        )} subtitle="Time to close" icon={Clock} color="sky" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Tickets by Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={statusBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {statusBreakdown.map((e, i) => (
                  <Cell key={i} fill={STATUS_COLORS[e.status.replace(' ', '_')] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Tickets by Priority</h2>
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
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search by service or deduplication ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} results</span>
        </div>
      </div>

      {/* Table — click row to open ticket detail page */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-xs">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">
                <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-slate-200">
                  Status <SortIcon col="status" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Service</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">
                <button onClick={() => toggleSort('priority')} className="flex items-center gap-1 hover:text-slate-200">
                  Priority <SortIcon col="priority" />
                </button>
              </th>
          <th className="text-left px-4 py-3 text-slate-400 font-medium">Alert Type</th>
          <th className="text-left px-4 py-3 text-slate-400 font-medium">Escalation</th>
          <th className="text-left px-4 py-3 text-slate-400 font-medium">Incident</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">
                <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-slate-200">
                  Created <SortIcon col="created_at" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">TTR</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const alert = alerts.find(a => a.id === t.alert_id)
              const incident = incidents.find(i => i.ticket_id === t.id)
              const ttr = fmtDuration(t.created_at, t.closure_at)
              const isHighlighted = highlightId === t.id
              const esc = escalationAssignments.find(e => e.resource_type === 'ticket' && e.resource_id === t.id)

              return (
                <tr
                  id={`tkt-${t.id}`}
                  key={t.id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors group ${
                    isHighlighted ? 'ring-1 ring-indigo-500/60 bg-indigo-900/10' : ''
                  }`}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">TKT-{String(t.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">
                    {alert ? (
                      <span className="text-indigo-400 font-medium">{alert.metadata_name}</span>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3">
                    {alert && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {alert.alert_types}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {esc ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium w-fit ${
                          esc.status === 'escalating' ? 'bg-red-900/30 border-red-700/40 text-red-400' :
                          esc.status === 'pending' ? 'bg-amber-900/30 border-amber-700/40 text-amber-400' :
                          esc.status === 'acknowledged' ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-400' :
                          'bg-slate-700/30 border-slate-600/40 text-slate-400'
                        }`}>{esc.status}</span>
                        <span className="text-xs text-slate-500 truncate max-w-28">{esc.assignee}</span>
                      </div>
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {incident ? (
                      <span
                        className="text-xs text-violet-400 hover:text-violet-300 font-mono cursor-pointer"
                        onClick={e => { e.stopPropagation(); navigate(`/incidents/${incident.id}`) }}
                      >
                        INC-{String(incident.id).padStart(4, '0')}
                      </span>
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">{fmtDt(t.created_at)}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{ttr}</td>
                  <td className="px-4 py-3">
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-500">No tickets match your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}