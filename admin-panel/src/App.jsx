import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAdmin from './components/RequireAdmin'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Arenas from './pages/Arenas'
import ArenaDetail from './pages/ArenaDetail'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Bookings from './pages/Bookings'
import Ice from './pages/Ice'
import Exercises from './pages/Exercises'

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAdmin>
                <Layout />
              </RequireAdmin>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/arenas" element={<Arenas />} />
            <Route path="/arenas/:id" element={<ArenaDetail />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/ice" element={<Ice />} />
            <Route path="/exercises" element={<Exercises />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
