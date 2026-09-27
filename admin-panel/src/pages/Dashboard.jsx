import { useEffect, useState } from 'react'
import { Users, UserX, Building2, CalendarClock, Snowflake, Dumbbell, ClipboardList } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiRequest('/admin/stats')
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить статистику'))
  }, [])

  if (error) return <p className="text-action">{error}</p>
  if (!stats) return <p className="text-neutral-500">Загрузка…</p>

  const chartData = stats.registrations_last_30_days.map((p) => ({
    date: new Date(p.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    count: p.count,
  }))

  return (
    <div>
      <PageHeader title="Дашборд" subtitle="Общая статистика платформы 24hokker.ru" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Пользователей всего" value={stats.users_total} accent="rink" />
        <StatCard
          icon={UserX}
          label="Заблокировано"
          value={stats.users_blocked}
          accent="action"
        />
        <StatCard icon={Building2} label="Арен" value={stats.arenas_total} accent="rink" />
        <StatCard icon={Dumbbell} label="Упражнений" value={stats.exercises_total} sub={`${stats.exercises_draft} черновиков`} accent="goal" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Родителей" value={stats.users_by_role.parent} accent="rink" />
        <StatCard label="Тренеров" value={stats.users_by_role.coach} sub={`видимы: ${stats.coaches_visible}, скрыты: ${stats.coaches_hidden}`} accent="rink" />
        <StatCard label="Администраторов арен" value={stats.users_by_role.arena_admin} accent="rink" />
        <StatCard label="Администраторов платформы" value={stats.users_by_role.admin} accent="rink" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CalendarClock}
          label="Тренировок всего"
          value={stats.sessions_total}
          sub={`ближайших: ${stats.sessions_upcoming}`}
          accent="rink"
        />
        <StatCard
          icon={ClipboardList}
          label="Записей всего"
          value={stats.bookings_total}
          sub={`подтв.: ${stats.bookings_confirmed}, в очереди: ${stats.bookings_waiting}`}
          accent="rink"
        />
        <StatCard
          icon={Snowflake}
          label="Слотов льда"
          value={stats.ice_slots_total}
          sub={`свободно: ${stats.ice_slots_available}, занято: ${stats.ice_slots_booked}`}
          accent="rink"
        />
        <StatCard label="Заявок на лёд" value={stats.slot_requests_pending} sub="ожидают решения" accent="action" />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Регистрации за 30 дней</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-neutral-400">Пока нет данных за этот период</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E9F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#8B98A5" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#8B98A5" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#C8102E" strokeWidth={2} dot={false} name="Регистрации" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
