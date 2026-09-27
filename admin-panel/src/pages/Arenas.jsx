import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Badge from '../components/Badge'

export default function Arenas() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = query ? `?search=${encodeURIComponent(query)}` : ''
    apiRequest(`/admin/arenas${q}`)
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить арены'))
      .finally(() => setLoading(false))
  }, [query])

  const columns = [
    { key: 'name', header: 'Название' },
    { key: 'city', header: 'Город', render: (r) => r.city || '—' },
    { key: 'address', header: 'Адрес', render: (r) => r.address || '—' },
    { key: 'admin_name', header: 'Администратор' },
    { key: 'admin_phone', header: 'Телефон' },
    {
      key: 'slots',
      header: 'Слоты льда',
      render: (r) => `${r.slots_available} свободно / ${r.slots_total} всего`,
    },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => (r.is_blocked ? <Badge color="red">Заблокирована</Badge> : <Badge color="green">Активна</Badge>),
    },
  ]

  return (
    <div>
      <PageHeader title="Арены" subtitle="Хоккейные арены, зарегистрированные на платформе">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(search) }} className="flex gap-2">
          <input
            className="input-field w-56"
            placeholder="Поиск по названию или городу"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-secondary">Найти</button>
        </form>
      </PageHeader>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card">
        <Table columns={columns} rows={items} onRowClick={(r) => navigate(`/arenas/${r.id}`)} empty={loading ? 'Загрузка…' : 'Арены не найдены'} />
      </div>
    </div>
  )
}
