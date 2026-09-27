import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge, { ROLE_LABELS, ROLE_COLORS } from '../components/Badge'

const PAGE_SIZE = 20

export default function Users() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const role = params.get('role') || ''
  const blocked = params.get('blocked') || ''
  const [search, setSearch] = useState(params.get('search') || '')
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

  function goToPage(p) {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  useEffect(() => {
    const q = new URLSearchParams()
    if (role) q.set('role', role)
    if (blocked) q.set('is_blocked', blocked)
    if (params.get('search')) q.set('search', params.get('search'))
    q.set('page', String(page))
    q.set('page_size', String(PAGE_SIZE))

    setLoading(true)
    apiRequest(`/admin/users?${q.toString()}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить список'))
      .finally(() => setLoading(false))
  }, [role, blocked, params, page])

  function handleSearchSubmit(e) {
    e.preventDefault()
    updateParam('search', search)
  }

  const columns = [
    { key: 'name', header: 'Имя' },
    { key: 'phone', header: 'Телефон' },
    {
      key: 'role',
      header: 'Роль',
      render: (r) => <Badge color={ROLE_COLORS[r.role]}>{ROLE_LABELS[r.role] || r.role}</Badge>,
    },
    { key: 'city', header: 'Город', render: (r) => r.city || '—' },
    {
      key: 'extra',
      header: 'Доп. инфо',
      render: (r) => {
        if (r.role === 'parent') return `Детей: ${r.children_count ?? 0}`
        if (r.role === 'coach') {
          const ages = r.age_groups?.length ? r.age_groups.join(', ') : '—'
          return `Учеников: ${r.active_students_count ?? 0} · Возраст: ${ages}`
        }
        if (r.role === 'arena_admin') return r.arena_name || '—'
        return '—'
      },
    },
    {
      key: 'telegram',
      header: 'Telegram',
      render: (r) => (r.telegram_linked ? <Badge color="blue">Привязан</Badge> : <Badge color="gray">Не привязан</Badge>),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => (r.is_blocked ? <Badge color="red">Заблокирован</Badge> : <Badge color="green">Активен</Badge>),
    },
    {
      key: 'created_at',
      header: 'Регистрация',
      render: (r) => new Date(r.created_at).toLocaleDateString('ru-RU'),
    },
  ]

  return (
    <div>
      <PageHeader title="Пользователи" subtitle="Родители, тренеры и администраторы арен">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            className="input-field w-56"
            placeholder="Поиск по имени или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-secondary">Найти</button>
        </form>
      </PageHeader>

      <div className="flex gap-2 mb-4">
        {[
          { value: '', label: 'Все роли' },
          { value: 'parent', label: 'Родители' },
          { value: 'coach', label: 'Тренеры' },
          { value: 'arena_admin', label: 'Арены' },
          { value: 'admin', label: 'Админы' },
        ].map((opt) => (
          <button
            key={opt.value}
            className={role === opt.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => updateParam('role', opt.value)}
          >
            {opt.label}
          </button>
        ))}
        <div className="w-px bg-ice-300 mx-1" />
        {[
          { value: '', label: 'Все' },
          { value: 'false', label: 'Активные' },
          { value: 'true', label: 'Заблокированные' },
        ].map((opt) => (
          <button
            key={opt.value}
            className={blocked === opt.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => updateParam('blocked', opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card">
        <Table
          columns={columns}
          rows={data?.items || []}
          onRowClick={(r) => navigate(`/users/${r.id}`)}
          empty={loading ? 'Загрузка…' : 'Пользователи не найдены'}
        />
        {data && (
          <Pagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            onChange={goToPage}
          />
        )}
      </div>
    </div>
  )
}
