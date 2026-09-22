import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MessageCircle, Trash2, ChevronRight, Users } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { POSITION_LABELS } from '../../utils/labels'
import AddClientModal from '../../components/AddClientModal'
import MessageParentModal from '../../components/MessageParentModal'
import ConfirmModal from '../../components/ConfirmModal'
import GroupsModal from '../../components/GroupsModal'
import PlayerGroupsModal from '../../components/PlayerGroupsModal'

export default function Players() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState(null)
  const [groups, setGroups] = useState([])
  const [groupFilter, setGroupFilter] = useState('all') // 'all' | 'none' | id группы
  const [showGroups, setShowGroups] = useState(false)
  const [editingGroupsOf, setEditingGroupsOf] = useState(null)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [messageTarget, setMessageTarget] = useState(null) // { id, parent_name }
  const [removingPlayer, setRemovingPlayer] = useState(null)
  const [removeBusy, setRemoveBusy] = useState(false)

  // Возвращаем промис, чтобы окна групп могли дождаться обновления данных.
  function load() {
    return Promise.all([apiRequest('/coaches/me/players'), apiRequest('/coaches/me/groups')])
      .then(([p, g]) => {
        setPlayers(p)
        setGroups(g)
      })
      .catch((err) => setError(err.detail || 'Не получилось загрузить учеников'))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAddChild(childId) {
    await apiRequest('/coaches/me/players', { method: 'POST', body: { child_id: childId } })
    load()
  }

  async function handleConfirmRemove() {
    setRemoveBusy(true)
    try {
      await apiRequest(`/coaches/me/players/${removingPlayer.id}`, { method: 'DELETE' })
      setRemovingPlayer(null)
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось удалить')
    } finally {
      setRemoveBusy(false)
    }
  }

  if (players === null) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  const groupName = new Map(groups.map((g) => [g.id, g.name]))
  // Выбранную группу могли удалить — тогда показываем всех, а не пустой список.
  const filter =
    groupFilter === 'all' || groupFilter === 'none' || groups.some((g) => g.id === groupFilter)
      ? groupFilter
      : 'all'
  const visiblePlayers = players.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'none') return p.group_ids.length === 0
    return p.group_ids.includes(filter)
  })

  return (
    <div className="px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ученики</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGroups(true)}
            className="flex items-center gap-1.5 btn-secondary py-2 px-3.5 text-sm"
          >
            <Users className="w-4 h-4" /> Группы
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 btn-primary py-2 px-3.5 text-sm"
          >
            <Plus className="w-4 h-4" /> Добавить
          </button>
        </div>
      </div>

      {groups.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            ['all', `Все (${players.length})`],
            ...groups.map((g) => [g.id, `${g.name} (${g.members_count})`]),
            ['none', `Без группы (${players.filter((p) => p.group_ids.length === 0).length})`],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setGroupFilter(value)}
              aria-pressed={filter === value}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === value ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-action text-sm">{error}</p>}

      {players.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Пока нет учеников. Они появятся сами после первой записи на тренировку,
          либо добавьте вручную по номеру телефона.
        </p>
      )}

      {players.length > 0 && visiblePlayers.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-6">В этой группе пока никого нет.</p>
      )}

      <div className="space-y-3">
        {visiblePlayers.map((p) => (
          <div key={p.id} className="card">
            <button
              onClick={() => navigate(`/players/${p.id}/attendance`)}
              className="flex items-start justify-between w-full text-left"
            >
              <div>
                <p className="font-semibold">{p.player_name}</p>
                <p className="text-sm text-neutral-500">
                  {p.age} лет · {POSITION_LABELS[p.position]}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {p.parent_name} · {p.parent_phone}
                </p>
                {p.group_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.group_ids.map((id) => (
                      <span key={id} className="text-[11px] px-2 py-0.5 rounded-full bg-ice-100 text-neutral-500">
                        {groupName.get(id)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="jersey-stat w-10 h-10 text-sm">{p.sessions_count}</div>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </div>
            </button>

            <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
              <span>✅ {p.attendance.present}</span>
              <span>❌ {p.attendance.absent}</span>
              <span>🤒 {p.attendance.sick}</span>
              <span>❓ {p.attendance.no_reason}</span>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-ice-100">
              <button
                onClick={() => setMessageTarget({ id: p.id, parent_name: p.parent_name })}
                className="flex items-center gap-1.5 btn-secondary py-2 px-3 text-sm flex-1 justify-center"
              >
                <MessageCircle className="w-4 h-4" /> Написать
              </button>
              <button
                onClick={() => setEditingGroupsOf(p)}
                aria-label={`Группы: ${p.player_name}`}
                className="p-2.5 text-neutral-400 border border-ice-300 rounded-card"
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRemovingPlayer(p)}
                className="p-2.5 text-neutral-400 border border-ice-300 rounded-card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onAdded={handleAddChild} />}
      {showGroups && (
        <GroupsModal groups={groups} players={players} onChanged={load} onClose={() => setShowGroups(false)} />
      )}
      {editingGroupsOf && (
        <PlayerGroupsModal
          player={editingGroupsOf}
          groups={groups}
          onSaved={load}
          onClose={() => setEditingGroupsOf(null)}
        />
      )}
      {messageTarget && (
        <MessageParentModal
          coachPlayerId={messageTarget.id}
          parentName={messageTarget.parent_name}
          onClose={() => setMessageTarget(null)}
        />
      )}
      {removingPlayer && (
        <ConfirmModal
          title="Убрать ученика из базы?"
          message={`«${removingPlayer.player_name}» пропадёт из вашей базы учеников.`}
          onConfirm={handleConfirmRemove}
          onCancel={() => setRemovingPlayer(null)}
          busy={removeBusy}
        />
      )}
    </div>
  )
}
