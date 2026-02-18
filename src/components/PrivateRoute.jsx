import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// PrivateRoute – redirects unauthenticated users to /login.
// Wrap any route element that requires a logged-in user.
function PrivateRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
