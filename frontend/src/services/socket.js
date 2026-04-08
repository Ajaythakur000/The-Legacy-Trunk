import { io } from 'socket.io-client';

let socket = null;
let connecting = false;

// 🔴 IMPORTANT: normalize URL to avoid trailing slash mismatch
const normalizeUrl = (url) => (url || '').trim().replace(/\/+$/, '');

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return normalizeUrl(import.meta.env.VITE_SOCKET_URL);
  if (import.meta.env.VITE_API_URL) {
    // remove trailing /api if present
    return normalizeUrl(import.meta.env.VITE_API_URL).replace(/\/api$/, '');
  }
  return 'http://localhost:8000';
};

const SOCKET_URL = getSocketUrl();

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  if (socket && connecting) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  connecting = true;

  socket = io(SOCKET_URL, {
    path: '/socket.io', // 🔴 IMPORTANT FIX: backend socket path sync
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