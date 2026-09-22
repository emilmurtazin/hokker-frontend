import { useState } from 'react'
import { X, Plus, Pencil, Trash2, Check, ChevronLeft, Users } from 'lucide-react'
import { apiRequest } from '../api/client'
import ClientPicker from './ClientPicker'
import ConfirmModal from './ConfirmModal'

function pluralStudents(n) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} ученик`
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} ученика`
  return `${n} учеников`
}

// Управление группами клиентов: создать, переименовать, изменить состав, удалить.
export default function GroupsModal({ groups, players, onChanged, onClose }) {
  const [newName, setNewName] = useState('')
  const [renaming, setRenaming] = useState(null) // { id, name }
  const [membersOf, setMembersOf] = useState(null) // группа, состав которой правим
  const [selected, setSelected] = useState(new Set())
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function run(action, fallback) {
    setBusy(true)
    setError(null)
    try {
      await action()
      await onChanged()
      return true
    } catch (err) {
      setError(err.detail || fallback)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function create(e) {
    e.preventDefault()
    const ok = await run(
      () => apiRequest('/coaches/me/groups', { method: 'POST', body: { name: newName } }),
      'Не получилось создать группу'
    )
    if (ok) setNewName('')
  }

  async function saveRename(e) {
    e.preventDefault()
    const ok = await run(
      () => apiRequest(`/coaches/me/groups/${renaming.id}`, { method: 'PATCH', body: { name: renaming.name } }),
      'Не получилось переименовать'
    )
    if (ok) setRenaming(null)
  }

  async function confirmDelete() {
    const ok = await run(
      () => apiRequest(`/coaches/me/groups/${deleting.id}`, { method: 'DELETE' }),
      'Не получилось удалить группу'
    )
    // Ошибку (например, «группа выбрана в предстоящих тренировках») показываем в окне групп.
    setDeleting(null)
    return ok
  }

  function openMembers(group) {
    setMembersOf(group)
    setSelected(new Set(group.member_ids))
    setError(null)
  }

  function toggleMember(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function saveMembers() {
    const ok = await run(
      () =>
        apiRequest(`/coaches/me/groups/${membersOf.id}/members`, {
          method: 'PUT',
          body: { coach_player_ids: [...selected] },
        }),
      'Не получилось сохранить состав'
    )
    if (ok) setMembersOf(null)
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          {membersOf ? (
            <button onClick={() => setMembersOf(null)} className="flex items-center gap-1 font-semibold text-lg">
              <ChevronLeft className="w-5 h-5 -ml-1" /> {membersOf.name}
            </button>
          ) : (
            <h2 className="font-semibold text-lg">Группы учеников</h2>
          )}
          <button onClick={onClose} aria-label="Закрыть" className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-action text-sm mb-3">{error}</p>}

        {membersOf ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">Отметьте учеников, которые входят в группу.</p>
            <ClientPicker clients={players} groups={groups} selectedIds={selected} onToggle={toggleMember} />
            <button onClick={saveMembers} disabled={busy} className="btn-primary w-full">
              {busy ? 'Сохраняем…' : `Сохранить (${selected.size})`}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Разделите учеников на группы, чтобы открывать закрытые тренировки только нужным
              группам и записывать на тренировку сразу всю группу.
            </p>

            <form onSubmit={create} className="flex gap-2">
              <input
                type="text"
                value={newName}
                maxLength={60}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название новой группы"
                className="input-field min-w-0 flex-1 py-2"
              />
              <button
                type="submit"
                disabled={busy || !newName.trim()}
                aria-label="Создать группу"
                className="btn-primary px-3 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {groups.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-3">Групп пока нет.</p>
            )}

            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="p-3 rounded-card border border-ice-300">
                  {renaming?.id === g.id ? (
                    <form onSubmit={saveRename} className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={renaming.name}
                        maxLength={60}
                        onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
                        aria-label="Новое название группы"
                        className="input-field min-w-0 flex-1 py-1.5"
                      />
                      <button type="submit" disabled={busy || !renaming.name.trim()} aria-label="Сохранить название" className="btn-primary px-3">
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => openMembers(g)} className="min-w-0 flex-1 text-left">
                        <span className="block font-medium text-sm truncate">{g.name}</span>
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Users className="w-3 h-3" /> {pluralStudents(g.members_count)} · изменить состав
                        </span>
                      </button>
                      <button
                        onClick={() => setRenaming({ id: g.id, name: g.name })}
                        aria-label={`Переименовать «${g.name}»`}
                        className="p-2 text-neutral-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(g)}
                        aria-label={`Удалить «${g.name}»`}
                        className="p-2 text-neutral-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmModal
          title="Удалить группу?"
          message={`Группа «${deleting.name}» будет удалена. Ученики останутся в вашей базе.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  )
}
