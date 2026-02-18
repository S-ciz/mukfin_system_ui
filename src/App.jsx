import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import Clocking from './pages/Clocking'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'
import LeaveRequest from './pages/LeaveRequest'
import LeaveApproval from './pages/LeaveApproval'

function App() {
  const location = useLocation()
  const { user, logout } = useAuth()

  // Hide the navbar on auth pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  // Helper: returns active-link classes
  const linkClass = (path) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ─── Navigation (shown only when logged in) ─── */}
      {user && !isAuthPage && (
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Employee Clocking System
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* All roles can clock in/out */}
                <Link to="/" className={linkClass('/')}>
                  Clocking
                </Link>

                {/* All roles can see analytics (scoped by role in the page) */}
                <Link to="/analytics" className={linkClass('/analytics')}>
                  Analytics
                </Link>

                {/* All roles can submit leave requests */}
                <Link to="/leave" className={linkClass('/leave')}>
                  Leave
                </Link>

                {/* Only managers and HR see the approval link */}
                {(user.userType === 'manager' || user.userType === 'hr') && (
                  <Link to="/leave/approve" className={linkClass('/leave/approve')}>
                    Approvals
                  </Link>
                )}

                {/* User info + logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    {user.name} {user.surname}{' '}
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                      {user.userType}
                    </span>
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* ─── Routes ─── */}
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        </Routes>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Protected routes – require authentication */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Clocking />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <PrivateRoute>
                  <LeaveRequest />
                </PrivateRoute>
              }
            />

            {/* Role-restricted route – only manager and HR */}
            <Route
              path="/leave/approve"
              element={
                <RoleRoute roles={['manager', 'hr']}>
                  <LeaveApproval />
                </RoleRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </main>
      )}
    </div>
  )
}

export default App
