import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Search, Users, CalendarDays, Snowflake, PlayCircle, User } from 'lucide-react'
import { apiRequest } from '../api/client'

const TABS_BY_ROLE = {
  parent: [
    { to: '/', icon: Search, label: 'Тренировки' },
    { to: '/schedule', icon: CalendarDays, label: 'Расписание', badgeKey: 'invited' },
    { to: '/exercises', icon: PlayCircle, label: 'Упражнения' },
    { to: '/profile', icon: User, label: 'Профиль', badgeKey: 'invites' },
  ],
  coach: [
    { to: '/', icon: CalendarDays, label: 'Тренировки', badgeKey: 'pending' },
    { to: '/players', icon: Users, label: 'Ученики' },
    { to: '/ice', icon: Snowflake, label: 'Лёд' },
    { to: '/exercises', icon: PlayCircle, label: 'Упражнения' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ],
  arena_admin: [
    { to: '/', icon: Snowflake, label: 'Слоты' },
    { to: '/requests', icon: Users, label: 'Заявки', badgeKey: 'pending' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ],
}

async function fetchBadgeCounts(role) {
  if (role === 'coach') {
    try {
      const rows = await apiRequest('/coaches/me/bookings?status=pending')
      return { pending: rows.length }
    } catch {
      return {}
    }
  }

  if (role === 'arena_admin') {
    try {
      const rows = await apiRequest('/arenas/me/requests?status=pending')
      return { pending: rows.length }
    } catch {
      return {}
    }
  }

  if (role === 'parent') {
    const counts = {}
    try {
      const invites = await apiRequest('/parents/me/invites')
      counts.invites = invites.length
    } catch {
      counts.invites = 0
    }
    try {
      const children = await apiRequest('/parents/me/children')
      const bookingLists = await Promise.all(
        children.map((c) => apiRequest(`/children/${c.id}/bookings`).catch(() => []))
      )
      counts.invited = bookingLists.flat().filter((b) => b.status === 'invited').length
    } catch {
      counts.invited = 0
    }
    return counts
  }

  return {}
}

export default function BottomNav({ role }) {
  const tabs = TABS_BY_ROLE[role] || TABS_BY_ROLE.parent
  const location = useLocation()
  const [counts, setCounts] = useState({})

  useEffect(() => {
    fetchBadgeCounts(role).then(setCounts)
    // Перезапрашиваем при каждой смене экрана — самый простой способ
    // держать бейджи актуальными без отдельного глобального стора.
  }, [role, location.pathname])

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-ice-200 pb-[env(safe-area-inset-bottom)] z-20">
      <div className="max-w-sm mx-auto grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(({ to, icon: Icon, label, badgeKey }) => {
          const count = badgeKey ? counts[badgeKey] || 0 : 0
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
                {count > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-goal text-rink-900 text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none">
                    {count}
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
