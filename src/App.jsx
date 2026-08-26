import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import AuthFlow from './pages/AuthFlow'
import Profile from './pages/Profile'
import ComingSoon from './pages/ComingSoon'

function AppShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="jersey-stat w-12 h-12 text-lg animate-pulse">Х</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthFlow />} />
      </Routes>
    )
  }

  // Экраны-заглушки для функционала следующих шагов разработки,
  // сгруппированы по роли — набор вкладок задаёт BottomNav.
  const homeTitleByRole = {
    parent: 'Каталог тренеров',
    coach: 'Мои тренировки',
    arena_admin: 'Мои слоты льда',
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-ice-100/90 backdrop-blur-sm z-10 px-5 py-4 border-b border-ice-200">
        <h1 className="font-display text-xl tracking-wide">ХОККЕР</h1>
      </header>

      <main className="max-w-sm mx-auto">
        <Routes>
          <Route path="/" element={<ComingSoon title={homeTitleByRole[user.role] || 'Главная'} />} />
          <Route path="/schedule" element={<ComingSoon title="Расписание" />} />
          <Route path="/exercises" element={<ComingSoon title="Видеоупражнения" />} />
          <Route path="/players" element={<ComingSoon title="Клиентская база" />} />
          <Route path="/ice" element={<ComingSoon title="Аренда льда" />} />
          <Route path="/requests" element={<ComingSoon title="Заявки" />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav role={user.role} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
