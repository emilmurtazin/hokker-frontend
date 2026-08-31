import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Search, Users, CalendarDays, Snowflake, PlayCircle, User } from 'lucide-react'
import { apiRequest } from '../api/client'

const TABS_BY_ROLE = {
  parent: [
    { to: '/', icon: Search, label: 'Тренеры' },
    { to: '/schedule', icon: CalendarDays, label: 'Расписание' },
    { to: '/exercises', icon: PlayCircle, label: 'Видео' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ],
  coach: [
    { to: '/', icon: CalendarDays, label: 'Тренировки', badgeKey: 'pending' },
    { to: '/players', icon: Users, label: 'Клиенты' },
    { to: '/ice', icon: Snowflake, label: 'Лёд' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ],
  arena_admin: [
    { to: '/', icon: Snowflake, label: 'Слоты' },
    { to: '/requests', icon: Users, label: 'Заявки' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ],
}

export default function BottomNav({ role }) {
  const tabs = TABS_BY_ROLE[role] || TABS_BY_ROLE.parent
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (role !== 'coach') return
    apiRequest('/coaches/me/bookings?status=pending')
      .then((rows) => setPendingCount(rows.length))
      .catch(() => setPendingCount(0))
    // Перезапрашиваем при каждой смене экрана — самый простой способ
    // держать бейдж актуальным без отдельного глобального стора.
  }, [role, location.pathname])

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-ice-200 pb-[env(safe-area-inset-bottom)] z-20">
      <div className="max-w-sm mx-auto grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(({ to, icon: Icon, label, badgeKey }) => {
          const showBadge = badgeKey === 'pending' && pendingCount > 0
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-action' : 'text-neutral-400'
                }`
              }
            >
              <span className="relative">
                <Icon className="w-5 h-5" strokeWidth={2} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 bg-goal text-rink-900 text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none">
                    {pendingCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
