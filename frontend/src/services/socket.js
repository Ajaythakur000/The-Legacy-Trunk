import { io } from 'socket.io-client';

let socket = null;
let connecting = false;

const SOCKET_URL = 'http://localhost:8000';

export const connectSocket = (token) => {
  // already connected
  if (socket?.connected) return socket;

  // if existing socket is trying to connect, reuse it
  if (socket && connecting) return socket;

  // cleanup stale instance
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  connecting = true;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
    auth: {
      token: token ? `Bearer ${token}` : undefined,
    },
  });

  socket.on('connect', () => {
    connecting = false;
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    connecting = false;
    console.warn('⚠️ Socket connect_error:', err?.message || err);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  connecting = false;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log('🧹 Socket cleaned up');
  }
};