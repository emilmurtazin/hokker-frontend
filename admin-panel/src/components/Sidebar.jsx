import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarClock,
  ClipboardList,
  Snowflake,
  Dumbbell,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ITEMS = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Пользователи', icon: Users },
  { to: '/arenas', label: 'Арены', icon: Building2 },
  { to: '/sessions', label: 'Тренировки', icon: CalendarClock },
  { to: '/bookings', label: 'Записи', icon: ClipboardList },
  { to: '/ice', label: 'Лёд', icon: Snowflake },
  { to: '/exercises', label: 'Упражнения', icon: Dumbbell },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-60 shrink-0 bg-rink-900 text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="font-display font-bold text-lg leading-none">24HOKKER</div>
        <div className="text-xs text-white/50 mt-1">Панель администратора</div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-sm font-medium truncate">{user?.name}</div>
        <div className="text-xs text-white/50 truncate mb-3">{user?.phone}</div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </aside>
  )
}
