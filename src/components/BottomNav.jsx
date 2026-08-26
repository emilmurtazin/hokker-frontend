import { NavLink } from 'react-router-dom'
import { Home, Search, Users, CalendarDays, Snowflake, PlayCircle, User } from 'lucide-react'

const TABS_BY_ROLE = {
  parent: [
    { to: '/', icon: Search, label: 'Тренеры' },
    { to: '/schedule', icon: CalendarDays, label: 'Расписание' },
    { to: '/exercises', icon: PlayCircle, label: 'Видео' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ],
  coach: [
    { to: '/', icon: CalendarDays, label: 'Тренировки' },
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

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-ice-200 pb-[env(safe-area-inset-bottom)] z-20">
      <div className="max-w-sm mx-auto grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-action' : 'text-neutral-400'
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
