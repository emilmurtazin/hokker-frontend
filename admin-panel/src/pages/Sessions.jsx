import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge from '../components/Badge'
import { SESSION_TYPE_LABELS } from '../components/Badge'

const PAGE_SIZE = 20

export default function Sessions() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const dateFrom = params.get('date_from') || ''
  const dateTo = params.get('date_to') || ''
  const page = Number(params.get('page') || 1)

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setParams(next)
  }

  useEffect(() => {
    const q = new URLSearchParams()
    if (dateFrom) q.set('date_from', dateFrom)
    if (dateTo) q.set('date_to', dateTo)
    q.set('page', String(page))
    q.set('page_size', String(PAGE_SIZE))

    setLoading(true)
    apiRequest(`/admin/sessions?${q.toString()}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить тренировки'))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, page])

  const columns = [
    {
      key: 'datetime',
      header: 'Дата и время',
      render: (r) => new Date(r.datetime).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
    { key: 'type', header: 'Тип', render: (r) => SESSION_TYPE_LABELS[r.type] || r.type },
    { key: 'coach_name', header: 'Тренер' },
    { key: 'arena_name', header: 'Арена', render: (r) => r.arena_name || '—' },
    {
      key: 'players',
      header: 'Записано',
      render: (r) => `${r.booked_count} / ${r.max_players}`,
    },
    {
      key: 'visibility',
      header: 'Доступ',
      render: (r) => <Badge color={r.visibility === 'open' ? 'green' : 'gray'}>{r.visibility === 'open' ? 'Открытая' : 'Закрытая'}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader title="Тренировки" subtitle="Все тренировки на платформе">
        <div className="flex items-center gap-2 text-sm">
          <input type="date" className="input-field" value={dateFrom} onChange={(e) => updateParam('date_from', e.target.value)} />
          <span className="text-neutral-400">—</span>
          <input type="date" className="input-field" value={dateTo} onChange={(e) => updateParam('date_to', e.target.value)} />
        </div>
      </PageHeader>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card">
        <Table
          columns={columns}
          rows={data?.items || []}
          onRowClick={(r) => navigate(`/sessions/${r.id}`)}
          empty={loading ? 'Загрузка…' : 'Тренировки не найдены'}
        />
        {data && (
          <Pagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            onChange={(p) => {
              const next = new URLSearchParams(params)
              next.set('page', String(p))
              setParams(next)
            }}
          />
        )}
      </div>
    </div>
  )
}
