import { useState } from 'react'
import { Check, Search } from 'lucide-react'

// Список учеников тренера с поиском и галочками.
//   clients     — ответ GET /coaches/me/players
//   groups      — группы тренера (для подписей у учеников)
//   selectedIds — Set id связей ученика с тренером (coach_players.id)
//   disabledIds — Map id -> причина, почему выбрать нельзя («Уже записан»)
export default function ClientPicker({ clients, groups = [], selectedIds, onToggle, disabledIds = new Map() }) {
  const [query, setQuery] = useState('')
  const groupName = new Map(groups.map((g) => [g.id, g.name]))
  const q = query.trim().toLowerCase()
  const visible = q
    ? clients.filter((c) => c.player_name.toLowerCase().includes(q) || c.parent_name.toLowerCase().includes(q))
    : clients

  return (
    <div className="space-y-2">
      {clients.length > 6 && (
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени"
            className="input-field pl-9 py-2"
          />
        </div>
      )}
      {visible.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-3">
          {clients.length === 0 ? 'В базе пока нет учеников.' : 'Никого не нашли.'}
        </p>
      )}
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {visible.map((c) => {
          const disabledReason = disabledIds.get(c.id)
          const checked = selectedIds.has(c.id)
          return (
            <button
              type="button"
              key={c.id}
              role="checkbox"
              aria-checked={checked}
              disabled={Boolean(disabledReason)}
              onClick={() => onToggle(c.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-card border text-left transition-colors ${
                checked ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
              } ${disabledReason ? 'opacity-50' : ''}`}
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  checked ? 'bg-rink-900 border-rink-900 text-white' : 'border-ice-300'
                }`}
              >
                {checked && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium truncate">{c.player_name}</span>
                <span className="block text-xs text-neutral-400 truncate">
                  {disabledReason ||
                    (c.group_ids.length
                      ? c.group_ids.map((id) => groupName.get(id)).filter(Boolean).join(', ')
                      : 'без группы')}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
