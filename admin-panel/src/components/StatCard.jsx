export default function StatCard({ icon: Icon, label, value, sub, accent = 'rink' }) {
  const accents = {
    rink: 'bg-rink-900 text-white',
    action: 'bg-action text-white',
    goal: 'bg-goal text-rink-900',
  }
  return (
    <div className="card p-4 flex items-start gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accents[accent]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-display font-semibold leading-tight">{value}</div>
        <div className="text-sm text-neutral-500">{label}</div>
        {sub && <div className="text-xs text-neutral-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}
