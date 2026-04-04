import { create } from 'zustand'
import api from '../api/axios'

const stored = () => {
  try {
    const u = localStorage.getItem('pos_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

export const useAuthStore = create((set) => ({
  user: stored(),
  token: localStorage.getItem('pos_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('pos_token', data.token)
      localStorage.setItem('pos_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data.user
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    set({ user: null, token: null })
  },
}))
