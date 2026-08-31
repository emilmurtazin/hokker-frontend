import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, X as XIcon, Trash2, Star } from 'lucide-react'
import { apiRequest } from '../../api/client'
import ConfirmModal from '../../components/ConfirmModal'
import { SESSION_TYPE_LABELS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, SKILL_LABELS, POSITION_LABELS } from '../../utils/labels'
import { formatDateTime, formatDurationMinutes } from '../../utils/date'

const ATTENDANCE_OPTIONS = [
  { value: 'present', icon: '✅', label: 'Был' },
  { value: 'absent', icon: '❌', label: 'Не был' },
  { value: 'sick', icon: '🤒', label: 'Болел' },
  { value: 'no_reason', icon: '❓', label: 'Без причины' },
]

function AttendanceSection({ sessionId }) {
  const [rows, setRows] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    apiRequest(`/sessions/${sessionId}/attendance`)
      .then(setRows)
      .catch((err) => setError(err.detail || 'Не получилось загрузить посещаемость'))
  }

  useEffect(load, [sessionId])

  async function setStatus(playerId, status) {
    setSavingId(playerId)
    try {
      await apiRequest(`/sessions/${sessionId}/attendance`, {
        method: 'POST',
        body: { marks: [{ player_id: playerId, status }] },
      })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить отметку')
    } finally {
      setSavingId(null)
    }
  }

  if (rows === null) return null
  if (rows.length === 0) return null // нечего отмечать, пока никто не confirmed

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-500 mb-2">Посещаемость</h2>
      {error && <p className="text-action text-sm mb-2">{error}</p>}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.player_id} className="card">
            <p className="font-medium text-sm mb-2">{r.player_name}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {ATTENDANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(r.player_id, opt.value)}
                  disabled={savingId === r.player_id}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-card text-xs font-medium transition-colors ${
                    r.status === opt.value
                      ? 'bg-rink-900 text-white'
                      : 'bg-ice-100 text-neutral-500'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreButtons({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          disabled={disabled}
          className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
            value === n ? 'bg-rink-900 text-white' : 'bg-ice-100 text-neutral-500'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function RatingsSection({ sessionId, confirmedPlayers }) {
  const [ratings, setRatings] = useState(null)
  const [error, setError] = useState(null)
  const [groupSkill, setGroupSkill] = useState('discipline')
  const [groupScore, setGroupScore] = useState(null)
  const [groupBusy, setGroupBusy] = useState(false)
  const [savingKey, setSavingKey] = useState(null)

  function load() {
    apiRequest(`/sessions/${sessionId}/ratings`)
      .then(setRatings)
      .catch((err) => setError(err.detail || 'Не получилось загрузить оценки'))
  }

  useEffect(load, [sessionId])

  if (confirmedPlayers.length === 0) return null

  const scoreFor = (playerId, skill) =>
    ratings?.find((r) => r.player_id === playerId && r.skill === skill)?.score ?? null

  async function applyToGroup() {
    if (!groupScore) return
    setGroupBusy(true)
    setError(null)
    try {
      await apiRequest(`/sessions/${sessionId}/ratings/group`, {
        method: 'POST',
        body: { skill: groupSkill, score: groupScore },
      })
      setGroupScore(null)
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось поставить оценку группе')
    } finally {
      setGroupBusy(false)
    }
  }

  async function setIndividual(playerId, skill, score) {
    const key = `${playerId}-${skill}`
    setSavingKey(key)
    try {
      await apiRequest(`/sessions/${sessionId}/ratings`, {
        method: 'POST',
        body: { entries: [{ player_id: playerId, skill, score }] },
      })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить оценку')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-500 mb-2">Оценки</h2>
      {error && <p className="text-action text-sm mb-2">{error}</p>}

      <div className="card mb-3">
        <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-goal" /> Оценить всех сразу
        </p>
        <select
          value={groupSkill}
          onChange={(e) => setGroupSkill(e.target.value)}
          className="input-field mb-2 text-sm py-2"
        >
          {Object.entries(SKILL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-between">
          <ScoreButtons value={groupScore} onChange={setGroupScore} disabled={groupBusy} />
          <button
            onClick={applyToGroup}
            disabled={!groupScore || groupBusy}
            className="btn-primary py-1.5 px-3 text-sm"
          >
            Применить
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {confirmedPlayers.map((p) => (
          <div key={p.player_id} className="card">
            <p className="font-medium text-sm mb-2">{p.player_name}</p>
            <div className="space-y-1.5">
              {Object.entries(SKILL_LABELS).map(([skill, label]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 w-28 shrink-0">{label}</span>
                  <ScoreButtons
                    value={scoreFor(p.player_id, skill)}
                    onChange={(n) => setIndividual(p.player_id, skill, n)}
                    disabled={savingKey === `${p.player_id}-${skill}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    apiRequest(`/sessions/${sessionId}`).then(setSession).catch(() => {})
    apiRequest(`/sessions/${sessionId}/bookings`)
      .then(setBookings)
      .catch((err) => setError(err.detail || 'Не получилось загрузить записи'))
  }

  useEffect(load, [sessionId])

  async function handleApprove(id) {
    setBusyId(id)
    try {
      await apiRequest(`/bookings/${id}/approve`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось подтвердить')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id) {
    setBusyId(id)
    try {
      await apiRequest(`/bookings/${id}/reject`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось отклонить')
    } finally {
      setBusyId(null)
    }
  }

  const [cancellingSession, setCancellingSession] = useState(false)
  const [cancelBusy, setCancelBusy] = useState(false)

  async function handleConfirmCancelSession() {
    setCancelBusy(true)
    try {
      await apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.detail || 'Не получилось отменить тренировку')
      setCancelBusy(false)
      setCancellingSession(false)
    }
  }

  if (!session || !bookings) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  const pending = bookings.filter((b) => b.status === 'pending')
  const others = bookings.filter((b) => b.status !== 'pending')

  return (
    <div>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-ice-200">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-neutral-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-semibold">{SESSION_TYPE_LABELS[session.type] || session.type}</h1>
          <p className="text-sm text-neutral-500">
            {formatDateTime(session.datetime)} · {formatDurationMinutes(session.duration_minutes)}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {error && <p className="text-action text-sm">{error}</p>}

        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-goal mb-2">
              Ждут подтверждения ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((b) => (
                <div key={b.id} className="card border-goal border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{b.player_name}</p>
                      <p className="text-xs text-neutral-500">
                        {b.player_age} лет · {POSITION_LABELS[b.player_position] || b.player_position}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {b.parent_name} · {b.parent_phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(b.id)}
                      disabled={busyId === b.id}
                      className="flex items-center gap-1.5 justify-center flex-1 py-2 bg-green-50 text-green-700 rounded-card text-sm font-medium"
                    >
                      <Check className="w-4 h-4" /> Подтвердить
                    </button>
                    <button
                      onClick={() => handleReject(b.id)}
                      disabled={busyId === b.id}
                      className="flex items-center gap-1.5 justify-center flex-1 py-2 bg-action-light text-action rounded-card text-sm font-medium"
                    >
                      <XIcon className="w-4 h-4" /> Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-neutral-500 mb-2">
            Все записи ({bookings.length})
          </h2>
          {others.length === 0 && pending.length === 0 && (
            <p className="text-sm text-neutral-400">Пока никто не записался.</p>
          )}
          <div className="space-y-2">
            {others.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-ice-100 last:border-0">
                <span className="text-sm">{b.player_name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUS_COLORS[b.status]}`}
                >
                  {BOOKING_STATUS_LABELS[b.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AttendanceSection sessionId={sessionId} />

        <RatingsSection
          sessionId={sessionId}
          confirmedPlayers={bookings
            .filter((b) => b.status === 'confirmed')
            .map((b) => ({ player_id: b.player_id, player_name: b.player_name }))}
        />

        <button
          onClick={() => setCancellingSession(true)}
          className="flex items-center gap-2 text-sm text-action font-medium pt-4"
        >
          <Trash2 className="w-4 h-4" /> Отменить тренировку
        </button>
      </div>

      {cancellingSession && (
        <ConfirmModal
          title="Отменить тренировку?"
          message="Все записанные родители получат уведомление об отмене."
          onConfirm={handleConfirmCancelSession}
          onCancel={() => setCancellingSession(false)}
          busy={cancelBusy}
        />
      )}
    </div>
  )
}
