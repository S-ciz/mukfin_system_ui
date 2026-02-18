import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// RoleRoute – allows access only if the user's role is in the allowed list.
// Usage: <RoleRoute roles={['manager', 'hr']}><Component /></RoleRoute>
function RoleRoute({ children, roles }) {
  const { user } = useAuth()

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but role not permitted → redirect to home
  if (!roles.includes(user.userType)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleRoute
