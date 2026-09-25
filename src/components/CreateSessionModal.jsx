import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import { SESSION_TYPE_LABELS } from '../utils/labels'
import GroupChips from './GroupChips'
import ModalShell from './ModalShell'
import Select from './Select'
import DateField from './DateField'
import TimeField from './TimeField'

const TYPE_OPTIONS = Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const DURATION_OPTIONS = [
  { value: '30', label: '30 минут' },
  { value: '45', label: '45 минут' },
  { value: '60', label: '1 час' },
  { value: '90', label: '1,5 часа' },
  { value: '120', label: '2 часа' },
]
const STANDARD_DURATIONS = DURATION_OPTIONS.map((o) => Number(o.value))

export default function CreateSessionModal({ onClose, onCreated }) {
  const [type, setType] = useState('ice')
  const [visibility, setVisibility] = useState('open')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [arenaName, setArenaName] = useState('')
  const [arenaId, setArenaId] = useState(null)
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [groups, setGroups] = useState([])
  const [groupIds, setGroupIds] = useState([]) // пусто = всем ученикам

  useEffect(() => {
    // Заявки на лёд, которые арена уже подтвердила — тренер может выбрать
    // один из таких слотов, чтобы не вбивать каток/время вручную.
    apiRequest('/coaches/me/ice-requests')
      .then((rows) => {
        const now = new Date()
        const approved = rows.filter((r) => {
          if (r.status !== 'approved') return false
          const slotStart = new Date(`${r.slot.date}T${r.slot.time_start}`)
          return slotStart >= now
        })
        setBookedSlots(approved)
      })
      .catch(() => setBookedSlots([]))

    // Группы клиентов — для закрытых тренировок («для кого доступна»).
    apiRequest('/coaches/me/groups')
      .then(setGroups)
      .catch(() => setGroups([]))
  }, [])

  function handlePickSlot(requestId) {
    setSelectedSlotId(requestId)
    if (!requestId) return
    const req = bookedSlots.find((r) => String(r.id) === requestId)
    if (!req) return

    setArenaName(req.slot.arena_name)
    setArenaId(req.slot.arena_id)
    setDate(req.slot.date)
    setTime(req.slot.time_start.slice(0, 5))

    const [sh, sm] = req.slot.time_start.split(':').map(Number)
    const [eh, em] = req.slot.time_end.split(':').map(Number)
    const computedDuration = eh * 60 + em - (sh * 60 + sm)
    if (STANDARD_DURATIONS.includes(computedDuration)) {
      setDurationMinutes(String(computedDuration))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // date/time — локальные значения без часового пояса, как раньше был
    // datetime-local; new Date(...) трактует их как локальное время браузера.
    const local = new Date(`${date}T${time}`)
    if (local <= new Date()) {
      setError('Время начала должно быть в будущем')
      return
    }

    setBusy(true)
    try {
      const session = await apiRequest('/sessions', {
        method: 'POST',
        body: {
          type,
          visibility,
          datetime: local.toISOString(),
          duration_minutes: Number(durationMinutes),
          arena_name: arenaName || null,
          arena_id: arenaId,
          max_players: Number(maxPlayers),
          price: price === '' ? null : Number(price),
          // Группы действуют только у закрытой тренировки; пусто — всем ученикам тренера.
          group_ids: visibility === 'closed' ? groupIds : [],
        },
      })
      onCreated(session)
    } catch (err) {
      setError(err.detail || 'Не получилось создать тренировку')
    } finally {
      setBusy(false)
    }
  }

  const slotOptions = [
    { value: '', label: 'Не выбрано — заполнить вручную' },
    ...bookedSlots.map((r) => ({
      value: String(r.id),
      label: r.slot.arena_name,
      hint: `${r.slot.date}, ${r.slot.time_start.slice(0, 5)}–${r.slot.time_end.slice(0, 5)}`,
    })),
  ]

  return (
    <ModalShell
      title="Новая тренировка"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          {error && <p className="text-action text-sm mb-3">{error}</p>}
          <button type="submit" disabled={busy || !date || !time} className="btn-primary w-full">
            {busy ? 'Создаём…' : 'Создать'}
          </button>
        </>
      }
    >
      <Select label="Тип" value={type} onChange={setType} options={TYPE_OPTIONS} />

      <div>
        <span className="block text-sm font-medium mb-1.5">Видимость</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setVisibility('open')}
            className={`py-2.5 rounded-card text-sm font-medium border ${
              visibility === 'open' ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
            }`}
          >
            Открытая
          </button>
          <button
            type="button"
            onClick={() => setVisibility('closed')}
            className={`py-2.5 rounded-card text-sm font-medium border ${
              visibility === 'closed' ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
            }`}
          >
            Закрытая
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          {visibility === 'open'
            ? 'Видна всем родителям в каталоге города'
            : 'Видна только вашим ученикам — в каталоге тренировок и в вашем профиле'}
        </p>
      </div>

      {visibility === 'closed' && (
        <div>
          <span className="block text-sm font-medium mb-1.5">Для кого</span>
          {groups.length > 0 ? (
            <>
              <GroupChips groups={groups} selectedIds={groupIds} onChange={setGroupIds} />
              <p className="text-xs text-neutral-400 mt-1">
                {groupIds.length === 0
                  ? 'Доступна всем вашим ученикам. Или выберите группы — тогда только им.'
                  : 'Увидят и смогут записаться только ученики выбранных групп.'}
              </p>
            </>
          ) : (
            <p className="text-xs text-neutral-400">
              Доступна всем вашим ученикам. Чтобы ограничить доступ, создайте группы на экране
              «Ученики».
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <DateField value={date} onChange={setDate} minDate={new Date()} />
        <TimeField value={time} onChange={setTime} />
      </div>

      <Select label="Продолжительность" value={durationMinutes} onChange={setDurationMinutes} options={DURATION_OPTIONS} />

      {bookedSlots.length > 0 && (
        <Select
          label="Выбрать из забронированного льда"
          value={selectedSlotId}
          onChange={handlePickSlot}
          options={slotOptions}
        />
      )}

      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Каток (необязательно)</span>
        <input
          type="text"
          value={arenaName}
          onChange={(e) => {
            setArenaName(e.target.value)
            setArenaId(null)
          }}
          className="input-field"
          placeholder="Название арены"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Максимум игроков</span>
        <input
          type="number"
          min="1"
          max="100"
          required
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          className="input-field"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Цена с человека, ₽ (необязательно)</span>
        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input-field"
          placeholder="1500"
        />
      </label>
    </ModalShell>
  )
}
