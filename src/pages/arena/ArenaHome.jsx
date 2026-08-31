import { useEffect, useState } from 'react'
import { Plus, Trash2, Settings } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { ICE_TYPE_LABELS, SLOT_STATUS_LABELS } from '../../utils/labels'
import { formatSlotDate, formatSlotTime } from '../../utils/date'
import ArenaProfileForm from './ArenaProfileForm'
import CreateSlotModal from '../../components/CreateSlotModal'
import ConfirmModal from '../../components/ConfirmModal'

const SLOT_STATUS_COLORS = {
  available: 'text-green-700 bg-green-50',
  pending: 'text-goal bg-goal-light',
  booked: 'text-rink-900 bg-ice-200',
  cancelled: 'text-neutral-400 bg-ice-100',
}

function isSlotPast(slot) {
  return new Date(`${slot.date}T${slot.time_start}`) < new Date()
}

export default function ArenaHome() {
  const [profile, setProfile] = useState(undefined) // undefined = загрузка, null = нет профиля
  const [slots, setSlots] = useState(null)
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [cancellingSlot, setCancellingSlot] = useState(null)
  const [cancelBusy, setCancelBusy] = useState(false)

  function loadProfile() {
    apiRequest('/arenas/me/profile')
      .then(setProfile)
      .catch(() => setProfile(null))
  }

  function loadSlots() {
    apiRequest('/arenas/me/slots')
      .then(setSlots)
      .catch((err) => setError(err.detail || 'Не получилось загрузить слоты'))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (profile) loadSlots()
  }, [profile])

  async function handleConfirmCancel() {
    setCancelBusy(true)
    try {
      await apiRequest(`/arenas/me/slots/${cancellingSlot.id}`, { method: 'DELETE' })
      setCancellingSlot(null)
      loadSlots()
    } catch (err) {
      setError(err.detail || 'Не получилось отменить слот (возможно, на него уже есть заявка)')
    } finally {
      setCancelBusy(false)
    }
  }

  if (profile === undefined) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  if (profile === null) {
    return <ArenaProfileForm onSaved={setProfile} />
  }

  if (editingProfile) {
    return (
      <ArenaProfileForm
        initial={profile}
        onSaved={(p) => {
          setProfile(p)
          setEditingProfile(false)
        }}
        onCancel={() => setEditingProfile(false)}
      />
    )
  }

  const upcomingSlots = slots?.filter((s) => !isSlotPast(s))

  return (
    <div className="px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingProfile(true)}
            className="p-2 text-neutral-500 border border-ice-300 rounded-card"
            title="Редактировать профиль"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 btn-primary py-2 px-3.5 text-sm"
          >
            <Plus className="w-4 h-4" /> Слот
          </button>
        </div>
      </div>

      {error && <p className="text-action text-sm">{error}</p>}
      {slots === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {upcomingSlots?.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Пока нет опубликованных слотов льда.
        </p>
      )}

      <div className="space-y-3">
        {upcomingSlots?.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium capitalize">{formatSlotDate(s.date)}</p>
                <p className="text-sm text-neutral-500">
                  {formatSlotTime(s.time_start)}–{formatSlotTime(s.time_end)} ·{' '}
                  {ICE_TYPE_LABELS[s.ice_type]}
                </p>
                {s.price != null && (
                  <p className="text-xs text-neutral-400 mt-0.5">{s.price.toLocaleString('ru-RU')} ₽</p>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${SLOT_STATUS_COLORS[s.status]}`}
              >
                {SLOT_STATUS_LABELS[s.status]}
              </span>
            </div>
            {s.status === 'available' && (
              <button
                onClick={() => setCancellingSlot(s)}
                className="flex items-center gap-1.5 text-sm text-action font-medium mt-3"
              >
                <Trash2 className="w-3.5 h-3.5" /> Отменить слот
              </button>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateSlotModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            loadSlots()
          }}
        />
      )}
      {cancellingSlot && (
        <ConfirmModal
          title="Отменить слот?"
          message="Слот пропадёт из каталога для тренеров."
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancellingSlot(null)}
          busy={cancelBusy}
        />
      )}
    </div>
  )
}
