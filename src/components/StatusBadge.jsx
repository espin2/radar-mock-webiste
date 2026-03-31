export default function StatusBadge({ status }) {
  const map = {
    // alert statuses
    firing: 'bg-red-900/60 text-red-300 border-red-700/60',
    pending: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
    resolved: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
    // ticket statuses
    open: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
    in_progress: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/60',
    escalated: 'bg-red-900/60 text-red-300 border-red-700/60',
    closed: 'bg-slate-700/60 text-slate-300 border-slate-600/60',
    // incident statuses
    acknowledged: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
  }
  const label = status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[status] || 'bg-slate-700/60 text-slate-300 border-slate-600/60'}`}>
      {status === 'firing' && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse mr-1.5" />}
      {label}
    </span>
  )
}