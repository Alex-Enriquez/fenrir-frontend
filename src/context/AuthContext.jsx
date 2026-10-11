import { createContext, useContext, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login/`, { username, password })
    const nuevoToken = response.data.token
    localStorage.setItem('token', nuevoToken)
    setToken(nuevoToken)
    axios.defaults.headers.common['Authorization'] = `Token ${nuevoToken}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
  }

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
