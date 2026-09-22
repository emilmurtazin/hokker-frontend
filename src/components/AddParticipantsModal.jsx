import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'
import ClientPicker from './ClientPicker'

const TABS = [
  ['clients', 'Ученики'],
  ['groups', 'Группы'],
  ['manual', 'Без аккаунта'],
]

// Запись участников на тренировку тренером:
//   «Ученики»      — выбранные из своей базы;
//   «Группы»       — все ученики выбранных групп;
//   «Без аккаунта» — по имени, если ученика ещё нет в приложении.
// Ученики и группы можно комбинировать: запишутся все выбранные (без повторов).
export default function AddParticipantsModal({ sessionId, freeSpots, bookedPlayerIds, onClose, onDone }) {
  const [tab, setTab] = useState('clients')
  const [players, setPlayers] = useState(null)
  const [groups, setGroups] = useState(null)
  const [selClients, setSelClients] = useState(new Set())
  const [selGroups, setSelGroups] = useState(new Set())
  const [manualName, setManualName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [manualNote, setManualNote] = useState(null)
  const [result, setResult] = useState(null) // { added, skipped }

  useEffect(() => {
    Promise.all([apiRequest('/coaches/me/players'), apiRequest('/coaches/me/groups')])
      .then(([p, g]) => {
        setPlayers(p)
        setGroups(g)
      })
      .catch((err) => setError(err.detail || 'Не получилось загрузить учеников'))
  }, [])

  const booked = useMemo(() => new Set(bookedPlayerIds), [bookedPlayerIds])
  const disabledIds = useMemo(
    () => new Map((players || []).filter((p) => booked.has(p.player_id)).map((p) => [p.id, 'Уже записан'])),
    [players, booked]
  )

  // Кто реально будет добавлен: выбранные вручную + участники выбранных групп, минус уже записанные.
  const targetIds = useMemo(() => {
    const ids = new Set(selClients)
    for (const g of groups || []) if (selGroups.has(g.id)) g.member_ids.forEach((id) => ids.add(id))
    for (const id of disabledIds.keys()) ids.delete(id)
    return ids
  }, [selClients, selGroups, groups, disabledIds])

  function toggle(setter, current, id) {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const data = await apiRequest(`/sessions/${sessionId}/participants`, {
        method: 'POST',
        body: { coach_player_ids: [...selClients], group_ids: [...selGroups] },
      })
      setResult(data)
      await onDone()
    } catch (err) {
      setError(err.detail || 'Не получилось добавить участников')
    } finally {
      setBusy(false)
    }
  }

  async function addManual(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setManualNote(null)
    try {
      await apiRequest(`/sessions/${sessionId}/manual-bookings`, {
        method: 'POST',
        body: { player_name: manualName },
      })
      setManualNote(`«${manualName.trim()}» добавлен`)
      setManualName('')
      await onDone()
    } catch (err) {
      setError(err.detail || 'Не получилось добавить ученика')
    } finally {
      setBusy(false)
    }
  }

  const willAdd = targetIds.size
  const notEnough = freeSpots != null && willAdd > freeSpots

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Добавить участников</h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {result.added.length > 0
                ? `Записано: ${result.added.length}. Родители получат уведомление.`
                : 'Никого не удалось записать.'}
            </p>
            {result.skipped.length > 0 && (
              <div>
                <p className="text-sm font-medium text-goal mb-1">Не записаны ({result.skipped.length}):</p>
                <ul className="text-sm text-neutral-600 space-y-1">
                  {result.skipped.map((s) => (
                    <li key={s.player_name}>
                      {s.player_name} — <span className="text-neutral-400">{s.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={onClose} className="btn-primary w-full">
              Готово
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1 p-1 bg-ice-100 rounded-card mb-4">
              {TABS.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setTab(value)
                    setError(null)
                  }}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === value ? 'bg-white shadow-sm text-rink-900' : 'text-neutral-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && <p className="text-action text-sm mb-3">{error}</p>}

            {tab === 'manual' ? (
              <form onSubmit={addManual} className="space-y-3">
                <p className="text-sm text-neutral-500">
                  Для ученика, которого ещё нет в приложении, достаточно указать имя.
                </p>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Имя ученика"
                  className="input-field"
                />
                {manualNote && <p className="text-sm text-green-700">{manualNote}</p>}
                <button type="submit" disabled={busy || !manualName.trim()} className="btn-primary w-full">
                  Добавить
                </button>
              </form>
            ) : players === null || groups === null ? (
              <p className="text-sm text-neutral-400 py-4 text-center">Загрузка…</p>
            ) : (
              <div className="space-y-4">
                {tab === 'clients' ? (
                  <ClientPicker
                    clients={players}
                    groups={groups}
                    selectedIds={selClients}
                    disabledIds={disabledIds}
                    onToggle={(id) => toggle(setSelClients, selClients, id)}
                  />
                ) : groups.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    Групп пока нет. Создайте их на экране «Ученики» (кнопка «Группы»).
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {groups.map((g) => (
                      <label
                        key={g.id}
                        className={`flex items-center gap-3 p-3 rounded-card border ${
                          selGroups.has(g.id) ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selGroups.has(g.id)}
                          onChange={() => toggle(setSelGroups, selGroups, g.id)}
                          className="w-4 h-4"
                        />
                        <span className="flex-1 text-sm font-medium">{g.name}</span>
                        <span className="text-xs text-neutral-400">{g.members_count} уч.</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="text-xs text-neutral-500 space-y-1">
                  {freeSpots != null && <p>Свободных мест: {freeSpots}</p>}
                  {notEnough && (
                    <p className="text-goal">
                      Мест не хватит: {willAdd - freeSpots} из выбранных останутся без записи.
                    </p>
                  )}
                </div>

                <button
                  onClick={submit}
                  disabled={busy || (selClients.size === 0 && selGroups.size === 0)}
                  className="btn-primary w-full"
                >
                  {busy ? 'Добавляем…' : willAdd > 0 ? `Записать (${willAdd})` : 'Записать'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
