
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Bell,
  Ticket,
  AlertTriangle,
  Shield,
  Activity,
  ChevronRight,
  Radar,
} from 'lucide-react'
import { alerts, tickets, incidents, escalationAssignments } from '../data/mockData'

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/tickets', label: 'Tickets', icon: Ticket },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/escalations', label: 'Escalations', icon: Shield },
]

const firingAlerts = alerts.filter(a => a.status === 'firing').length
const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'escalated').length
const activeIncidents = incidents.filter(i => i.status !== 'resolved').length
const activeEscalations = escalationAssignments.filter(e => e.status === 'escalating' || e.status === 'pending').length

export default function Layout({ children }) {
  const location = useLocation()

  const getBadge = (path) => {
    if (path === '/alerts') return firingAlerts > 0 ? firingAlerts : null
    if (path === '/tickets') return openTickets > 0 ? openTickets : null
    if (path === '/incidents') return activeIncidents > 0 ? activeIncidents : null
    if (path === '/escalations') return activeEscalations > 0 ? activeEscalations : null
    return null
  }

  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (!parts.length) return [{ label: 'Overview', path: '/' }]
    return [
      { label: 'Overview', path: '/' },
      ...parts.map((p, i) => ({
        label: p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        path: '/' + parts.slice(0, i + 1).join('/'),
      })),
    ]
  }

  const breadcrumb = getBreadcrumb()

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Radar size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-tight">Radar</div>
            <div className="text-xs text-slate-400">Ops Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const badge = getBadge(path)
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Status Footer */}
        <div className="px-4 py-4 border-t border-slate-700 space-y-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-400">System Status</span>
            <span className="ml-auto text-xs text-emerald-400 font-medium">Operational</span>
          </div>
          <div className="text-xs text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-800/50 border-b border-slate-700 flex items-center px-6 flex-shrink-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} className="text-slate-600" />}
                <span className={i === breadcrumb.length - 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Alert indicator */}
            {firingAlerts > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/30 border border-red-800/50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                {firingAlerts} firing
              </div>
            )}
            {activeEscalations > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-900/30 border border-amber-800/50 px-2.5 py-1 rounded-full">
                <Shield size={11} />
                {activeEscalations} escalating
              </div>
            )}
            <div className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
