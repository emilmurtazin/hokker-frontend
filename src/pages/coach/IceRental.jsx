import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { apiRequest } from '../../api/client'
import {
  ICE_TYPE_LABELS,
  SLOT_REQUEST_STATUS_LABELS,
  SLOT_REQUEST_STATUS_COLORS,
} from '../../utils/labels'
import { formatSlotDate, formatSlotTime } from '../../utils/date'
import { useAuth } from '../../context/AuthContext'

function Catalog() {
  const { user } = useAuth()
  const [city, setCity] = useState(user?.city || '')
  const [slots, setSlots] = useState(null)
  const [error, setError] = useState(null)
  const [requestingId, setRequestingId] = useState(null)
  const [message, setMessage] = useState(null)

  function load() {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    apiRequest(`/ice-slots?${params.toString()}`)
      .then((data) => setSlots(data.items))
      .catch((err) => setError(err.detail || 'Не получилось загрузить каталог'))
  }

  useEffect(load, [city])

  async function handleRequest(slotId) {
    setRequestingId(slotId)
    setMessage(null)
    try {
      await apiRequest(`/ice-slots/${slotId}/request`, { method: 'POST' })
      setMessage({ type: 'ok', text: 'Заявка отправлена администратору арены' })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.detail || 'Не получилось отправить заявку' })
    } finally {
      setRequestingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Город"
          className="input-field pl-11"
        />
      </label>

      {message && (
        <p className={`text-sm ${message.type === 'ok' ? 'text-green-700' : 'text-action'}`}>
          {message.text}
        </p>
      )}
      {error && <p className="text-action text-sm">{error}</p>}
      {slots === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {slots?.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">Свободных слотов не найдено.</p>
      )}

      <div className="space-y-3">
        {slots?.map((s) => (
          <div key={s.id} className="card">
            <p className="font-medium">{s.arena_name}</p>
            <p className="text-xs text-neutral-400">{s.arena_address}</p>
            <p className="text-sm text-neutral-600 mt-1 capitalize">
              {formatSlotDate(s.date)}, {formatSlotTime(s.time_start)}–{formatSlotTime(s.time_end)}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-500">
                {ICE_TYPE_LABELS[s.ice_type]}
                {s.price != null && ` · ${s.price.toLocaleString('ru-RU')} ₽`}
              </span>
              <button
                onClick={() => handleRequest(s.id)}
                disabled={requestingId === s.id}
                className="btn-primary py-2 px-4 text-sm"
              >
                {requestingId === s.id ? 'Отправляем…' : 'Подать заявку'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyRequests() {
  const [requests, setRequests] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    apiRequest('/coaches/me/ice-requests')
      .then(setRequests)
      .catch((err) => setError(err.detail || 'Не получилось загрузить заявки'))
  }

  useEffect(load, [])

  async function handleCancel(id) {
    setBusyId(id)
    try {
      await apiRequest(`/coaches/me/ice-requests/${id}/cancel`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось отменить заявку')
    } finally {
      setBusyId(null)
    }
  }

  if (requests === null) return <p className="text-sm text-neutral-400">Загрузка…</p>

  return (
    <div className="space-y-3">
      {error && <p className="text-action text-sm">{error}</p>}
      {requests.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">У вас пока нет заявок на лёд.</p>
      )}
      {requests.map((r) => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{r.slot.arena_name}</p>
              <p className="text-sm text-neutral-500 capitalize">
                {formatSlotDate(r.slot.date)}, {formatSlotTime(r.slot.time_start)}–
                {formatSlotTime(r.slot.time_end)}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${SLOT_REQUEST_STATUS_COLORS[r.status]}`}
            >
              {SLOT_REQUEST_STATUS_LABELS[r.status]}
            </span>
          </div>
          {(r.status === 'pending' || r.status === 'approved') && (
            <button
              onClick={() => handleCancel(r.id)}
              disabled={busyId === r.id}
              className="btn-secondary py-2 px-3 text-sm mt-3"
            >
              Отменить заявку
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default function IceRental() {
  const [tab, setTab] = useState('requests')

  return (
    <div className="px-5 py-5">
      <h1 className="text-xl font-semibold mb-4">Аренда льда</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('requests')}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
            tab === 'requests' ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
          }`}
        >
          Мои заявки
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
            tab === 'catalog' ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
          }`}
        >
          Каталог
        </button>
      </div>

      {tab === 'catalog' ? <Catalog /> : <MyRequests />}
    </div>
  )
}
