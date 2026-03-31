
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, User, Calendar, ChevronDown, ChevronRight, Plus, Search,
  Bell, Ticket, AlertTriangle, Clock, CheckCircle, XCircle, Edit2,
  Shield, Phone, Mail, Zap, MoreHorizontal,
} from 'lucide-react'
import { escalationPolicies, escalationAssignments, oncallSchedules, escalationGroups } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const fmtDt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TABS = [
  { id: 'policies', label: 'Escalation Policies', icon: Shield },
  { id: 'assignments', label: 'Active Assignments', icon: Zap },
  { id: 'schedules', label: 'On-Call Schedules', icon: Calendar },
  { id: 'groups', label: 'Groups', icon: Users },
]

const ASSIGN_TYPE_COLORS = {
  user: { bg: 'bg-sky-900/30', border: 'border-sky-700/40', text: 'text-sky-400', icon: User },
  group: { bg: 'bg-violet-900/30', border: 'border-violet-700/40', text: 'text-violet-400', icon: Users },
  schedule: { bg: 'bg-amber-900/30', border: 'border-amber-700/40', text: 'text-amber-400', icon: Calendar },
}

const PRIORITY_COLORS = {
  P1: 'text-red-400 bg-red-900/30 border-red-700/40',
  P2: 'text-orange-400 bg-orange-900/30 border-orange-700/40',
  P3: 'text-amber-400 bg-amber-900/30 border-amber-700/40',
  P4: 'text-slate-400 bg-slate-700/30 border-slate-600/40',
}

function AssignTypeBadge({ type }) {
  const cfg = ASSIGN_TYPE_COLORS[type] || ASSIGN_TYPE_COLORS.user
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <Icon size={10} /> {type}
    </span>
  )
}

function StatusDot({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Policy Card ──────────────────────────────────────────────────────────────
function PolicyCard({ policy }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-700/20 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
          policy.active ? 'bg-indigo-900/30 border-indigo-700/40' : 'bg-slate-700/30 border-slate-600/40'
        }`}>
          <Shield size={16} className={policy.active ? 'text-indigo-400' : 'text-slate-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-200">{policy.name}</span>
            <StatusDot active={policy.active} />
            {policy.priorities.map(p => (
              <span key={p} className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${PRIORITY_COLORS[p]}`}>{p}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{policy.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500">{policy.steps.length} steps</span>
          <ChevronDown size={15} className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700/50 px-5 py-4 space-y-4">
          <p className="text-xs text-slate-400">{policy.description}</p>

          {/* Steps */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Escalation Steps</p>
            <div className="space-y-2">
              {policy.steps.map((step, i) => {
                const cfg = ASSIGN_TYPE_COLORS[step.assign_type] || ASSIGN_TYPE_COLORS.user
                const Icon = cfg.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className={`flex-1 flex items-center gap-3 rounded-lg px-3 py-2 border ${cfg.bg} ${cfg.border}`}>
                      <Icon size={14} className={cfg.text} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${cfg.text}`}>{step.assignee}</span>
                        <span className="text-xs text-slate-500 ml-2">via {step.channel}</span>
                      </div>
                      <AssignTypeBadge type={step.assign_type} />
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        <Clock size={10} className="inline mr-1" />
                        {step.timeout_min}m timeout
                      </span>
                    </div>
                    {i < policy.steps.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-500 mb-1">Repeat</p>
              <p className="text-slate-200">{policy.repeat_times}× every {policy.repeat_interval_min}m</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-500 mb-1">Auto-resolve</p>
              <p className={policy.auto_resolve ? 'text-emerald-400' : 'text-slate-500'}>{policy.auto_resolve ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-500 mb-1">Created</p>
              <p className="text-slate-200">{fmtDt(policy.created_at)}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-500 mb-1">Updated</p>
              <p className="text-slate-200">{fmtDt(policy.updated_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Assignment Row ───────────────────────────────────────────────────────────
function AssignmentRow({ asgn }) {
  const cfg = ASSIGN_TYPE_COLORS[asgn.assign_type] || ASSIGN_TYPE_COLORS.user
  const Icon = cfg.icon
  const isTicket = asgn.resource_type === 'ticket'
  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 hover:bg-slate-700/20 transition-colors">
      {/* Resource link */}
      <Link
        to={isTicket ? `/tickets/${asgn.resource_id}` : `/incidents/${asgn.resource_id}`}
        className={`flex items-center gap-2 font-mono text-sm font-semibold hover:underline ${isTicket ? 'text-sky-400' : 'text-violet-400'}`}
      >
        {isTicket ? <Ticket size={14} /> : <AlertTriangle size={14} />}
        {isTicket ? `TKT-${String(asgn.resource_id).padStart(4, '0')}` : `INC-${String(asgn.resource_id).padStart(4, '0')}`}
      </Link>

      <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${PRIORITY_COLORS[asgn.priority]}`}>{asgn.priority}</span>

      {/* Assignee */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
        <Icon size={13} className={cfg.text} />
        <span className={`text-sm font-medium ${cfg.text}`}>{asgn.assignee}</span>
        <AssignTypeBadge type={asgn.assign_type} />
      </div>

      {/* Step */}
      <span className="text-xs text-slate-500">Step {asgn.current_step}</span>

      {/* Status */}
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
        asgn.status === 'acknowledged' ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-400' :
        asgn.status === 'escalating' ? 'bg-red-900/30 border-red-700/40 text-red-400' :
        asgn.status === 'pending' ? 'bg-amber-900/30 border-amber-700/40 text-amber-400' :
        'bg-slate-700/30 border-slate-600/40 text-slate-400'
      }`}>
        {asgn.status}
      </span>

      {/* Channel */}
      <span className="text-xs text-slate-500 flex items-center gap-1">
        {asgn.channel === 'pagerduty' ? <Phone size={11} /> : asgn.channel === 'slack' ? <Bell size={11} /> : <Mail size={11} />}
        {asgn.channel}
      </span>

      <div className="ml-auto text-xs text-slate-500 flex items-center gap-1">
        <Clock size={11} />
        {fmtDt(asgn.assigned_at)}
      </div>
    </div>
  )
}

// ─── Schedule Card ────────────────────────────────────────────────────────────
function ScheduleCard({ schedule }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={15} className="text-amber-400" />
            <h3 className="font-semibold text-sm text-slate-200">{schedule.name}</h3>
            <StatusDot active={schedule.active} />
          </div>
          <p className="text-xs text-slate-500">{schedule.description}</p>
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">TZ: {schedule.timezone}</span>
      </div>

      {/* Current on-call */}
      <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg px-4 py-3 mb-4">
        <p className="text-xs text-amber-500 font-medium mb-1">Currently On-Call</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-white">
            {schedule.current_oncall.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-amber-300">{schedule.current_oncall}</span>
          <span className="text-xs text-slate-500 ml-auto">until {schedule.current_shift_end}</span>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rotation ({schedule.rotation_type})</p>
        <div className="space-y-1.5">
          {schedule.rotation.map((member, i) => {
            const isCurrent = member.user === schedule.current_oncall
            return (
              <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isCurrent ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-slate-700/20'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-amber-600 text-white' : 'bg-slate-600 text-slate-300'}`}>
                  {member.user.charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm flex-1 ${isCurrent ? 'text-amber-300 font-medium' : 'text-slate-400'}`}>{member.user}</span>
                <span className="text-xs text-slate-500">{member.shift}</span>
                {isCurrent && <span className="text-xs text-amber-400 font-medium">● Now</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} className="text-violet-400" />
            <h3 className="font-semibold text-sm text-slate-200">{group.name}</h3>
          </div>
          <p className="text-xs text-slate-500">{group.description}</p>
        </div>
        <span className="text-xs text-slate-500">{group.members.length} members</span>
      </div>

      <div className="space-y-2">
        {group.members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-700/20 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-violet-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium">{m.name}</p>
              <p className="text-xs text-slate-500">{m.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                m.role === 'lead' ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-700 text-slate-400'
              }`}>{m.role}</span>
              <div className="flex items-center gap-1.5">
                {m.channels.map(ch => (
                  <span key={ch} className="text-xs text-slate-500 flex items-center gap-0.5">
                    {ch === 'pagerduty' ? <Phone size={10} /> : ch === 'slack' ? <Bell size={10} /> : <Mail size={10} />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Escalations() {
  const [activeTab, setActiveTab] = useState('policies')
  const [search, setSearch] = useState('')

  const activeAssignments = escalationAssignments.filter(a => a.status !== 'resolved')
  const filteredPolicies = escalationPolicies.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-indigo-400" /> Escalation Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage escalation policies, on-call schedules, and active assignments</p>
        </div>
        <button className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> New Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [escalationPolicies.filter(p => p.active).length, 'Active Policies', 'text-indigo-400'],
          [activeAssignments.length, 'Active Assignments', 'text-red-400'],
          [escalationAssignments.filter(a => a.status === 'acknowledged').length, 'Acknowledged', 'text-emerald-400'],
          [oncallSchedules.filter(s => s.active).length, 'Active Schedules', 'text-amber-400'],
        ].map(([val, label, cls]) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-700">
          {TABS.map(({ id, label, icon: Icon }) => {
            const count = id === 'assignments' ? activeAssignments.length :
              id === 'policies' ? escalationPolicies.length :
              id === 'schedules' ? oncallSchedules.length :
              escalationGroups.length
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id ? 'border-indigo-500 text-indigo-400 bg-slate-700/20' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                <Icon size={14} />
                {label}
                <span className={`text-xs px-1.5 rounded-full ${activeTab === id ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className="p-5">
          {/* ── Policies ── */}
          {activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search policies…"
                  className="w-full bg-slate-700/40 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {filteredPolicies.map(p => <PolicyCard key={p.id} policy={p} />)}
            </div>
          )}

          {/* ── Active Assignments ── */}
          {activeTab === 'assignments' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500">{escalationAssignments.length} total assignments</span>
                <span className="text-xs text-red-400 ml-2">{activeAssignments.length} active</span>
              </div>
              {escalationAssignments.map(a => <AssignmentRow key={a.id} asgn={a} />)}
            </div>
          )}

          {/* ── Schedules ── */}
          {activeTab === 'schedules' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {oncallSchedules.map(s => <ScheduleCard key={s.id} schedule={s} />)}
            </div>
          )}

          {/* ── Groups ── */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {escalationGroups.map(g => <GroupCard key={g.id} group={g} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
