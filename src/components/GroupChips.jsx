// Выбор групп клиентов «чипами». Пустой выбор = «Все мои ученики» (без ограничения по группам).
const chip = (active) =>
  `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
    active ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300 text-neutral-700'
  }`

export default function GroupChips({ groups, selectedIds, onChange, allLabel = 'Все мои ученики' }) {
  const selected = new Set(selectedIds)

  function toggle(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange([])}
        aria-pressed={selected.size === 0}
        className={chip(selected.size === 0)}
      >
        {allLabel}
      </button>
      {groups.map((g) => (
        <button
          type="button"
          key={g.id}
          onClick={() => toggle(g.id)}
          aria-pressed={selected.has(g.id)}
          className={chip(selected.has(g.id))}
        >
          {g.name}
        </button>
      ))}
    </div>
  )
}
