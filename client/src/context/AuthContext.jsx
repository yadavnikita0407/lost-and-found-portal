import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import { login as apiLogin, register as apiRegister, getMe } from '../api/authApi'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: null }
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'LOGOUT':
      return { user: null, token: null, isLoading: false, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      dispatch({ type: 'SET_USER', payload: null })
      return
    }
    dispatch({ type: 'LOADING' })
    getMe()
      .then((res) => dispatch({ type: 'SET_USER', payload: res.data }))
      .catch(() => {
        localStorage.removeItem('token')
        dispatch({ type: 'LOGOUT' })
      })
  }, [])

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOADING' })
    try {
      const res = await apiLogin(credentials)
      localStorage.setItem('token', res.data.token)
      dispatch({ type: 'SET_TOKEN', payload: res.data.token })
      dispatch({ type: 'SET_USER', payload: res.data.user })
      return res.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (!err.response
          ? 'Unable to connect to the backend server (http://localhost:5000). Please ensure the backend is running.'
          : err.message || 'Login failed')
      dispatch({ type: 'SET_ERROR', payload: message })
      throw new Error(message)
    }
  }, [])

  const register = useCallback(async (payload) => {
    dispatch({ type: 'LOADING' })
    try {
      const res = await apiRegister(payload)
      localStorage.setItem('token', res.data.token)
      dispatch({ type: 'SET_TOKEN', payload: res.data.token })
      dispatch({ type: 'SET_USER', payload: res.data.user })
      return res.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (!err.response
          ? 'Unable to connect to the backend server (http://localhost:5000). Please ensure the backend is running.'
          : err.message || 'Registration failed')
      dispatch({ type: 'SET_ERROR', payload: message })
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe()
      dispatch({ type: 'SET_USER', payload: res.data })
    } catch {
      logout()
    }
  }, [logout])

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
