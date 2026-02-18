import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser } from '../services/api'

// AuthContext provides the logged-in user and auth actions to the entire app.
const AuthContext = createContext(null)

// Custom hook for easy access to auth state and methods.
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  // Initialise from localStorage so the session persists across refreshes.
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      // Corrupted data in localStorage – clear it and start fresh
      sessionStorage.removeItem('user')
      return null
    }
  })

  // Sign in: validate credentials via json-server, then store the user.
  const login = async (email, password) => {
    const userData = await loginUser(email, password)
    // Don't store password in localStorage
    const { password: _, ...safeUser } = userData
    sessionStorage.setItem('user', JSON.stringify(safeUser))
    setUser(safeUser)
    return safeUser
  }

  // Sign up: create user in db, then auto-login.
  const register = async (userData) => {
    //add new field to capture data that exists
    const created = (await registerUser(userData)).data.data;
    const { password: _, ...safeUser } = created;
    if (safeUser) {
      sessionStorage.setItem("user", JSON.stringify(safeUser));
      setUser(safeUser);
    }

    return safeUser;
  };

  // Log out: clear localStorage and reset state.
  const logout = () => {
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
