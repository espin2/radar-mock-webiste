export default function PriorityBadge({ priority }) {
  const map = {
    P1: 'bg-red-900/60 text-red-300 border-red-700/60',
    P2: 'bg-orange-900/60 text-orange-300 border-orange-700/60',
    P3: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
    P4: 'bg-slate-700/60 text-slate-300 border-slate-600/60',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${map[priority] || map.P4}`}>
      {priority}
    </span>
  )
}