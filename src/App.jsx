import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import AuthFlow from './pages/AuthFlow'
import Profile from './pages/Profile'
import ComingSoon from './pages/ComingSoon'
import CoachCatalog from './pages/parent/CoachCatalog'
import CoachProfile from './pages/parent/CoachProfile'
import Schedule from './pages/parent/Schedule'
import ChildProgress from './pages/parent/ChildProgress'
import CoachHome from './pages/coach/CoachHome'
import SessionDetail from './pages/coach/SessionDetail'
import Players from './pages/coach/Players'
import IceRental from './pages/coach/IceRental'
import ArenaHome from './pages/arena/ArenaHome'
import ArenaRequests from './pages/arena/ArenaRequests'

function ParentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CoachCatalog />} />
      <Route path="/coaches/:coachId" element={<CoachProfile />} />
      <Route path="/children/:childId/progress" element={<ChildProgress />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/exercises" element={<ComingSoon title="Видеоупражнения" />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function CoachRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CoachHome />} />
      <Route path="/sessions/:sessionId" element={<SessionDetail />} />
      <Route path="/players" element={<Players />} />
      <Route path="/ice" element={<IceRental />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ArenaRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ArenaHome />} />
      <Route path="/requests" element={<ArenaRequests />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const ROUTES_BY_ROLE = {
  parent: ParentRoutes,
  coach: CoachRoutes,
  arena_admin: ArenaRoutes,
}

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

  const RoleRoutes = ROUTES_BY_ROLE[user.role] || ParentRoutes

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-ice-100/90 backdrop-blur-sm z-10 px-5 py-4 border-b border-ice-200">
        <h1 className="font-display text-xl tracking-wide">ХОККЕР</h1>
      </header>

      <main className="max-w-sm mx-auto">
        <RoleRoutes />
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
