import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect()
}
