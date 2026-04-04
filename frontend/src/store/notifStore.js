import { create } from 'zustand'

export const useNotifStore = create((set, get) => ({
  notifications: [],

  add: (notif) => {
    const id = Date.now() + Math.random()
    set((s) => ({ notifications: [...s.notifications, { ...notif, id }] }))
    return id
  },

  remove: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
  },

  clearByOrderId: (orderId) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.orderId !== orderId),
    }))
  },

  clearBySessionId: (sessionId) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.sessionId !== sessionId),
    }))
  },
}))
