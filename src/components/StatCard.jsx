export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: 'from-indigo-600/20 to-indigo-800/10 border-indigo-700/50 text-indigo-400',
    red: 'from-red-600/20 to-red-800/10 border-red-700/50 text-red-400',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-700/50 text-amber-400',
    emerald: 'from-emerald-600/20 to-emerald-800/10 border-emerald-700/50 text-emerald-400',
    sky: 'from-sky-600/20 to-sky-800/10 border-sky-700/50 text-sky-400',
    violet: 'from-violet-600/20 to-violet-800/10 border-violet-700/50 text-violet-400',
  }
  const cls = colorMap[color] || colorMap.indigo

  return (
    <div className={`relative bg-gradient-to-br ${cls} border rounded-xl p-5 overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg bg-white/5`}>
            <Icon size={22} className={cls.split(' ').find(c => c.startsWith('text-'))} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={trend >= 0 ? 'text-red-400' : 'text-emerald-400'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500">vs last 7d</span>
        </div>
      )}
    </div>
  )
}