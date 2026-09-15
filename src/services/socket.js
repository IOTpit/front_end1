// src/services/socket.js - Socket.IO Client
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    let serverUrl;
    if (import.meta.env.VITE_SOCKET_URL) {
      serverUrl = import.meta.env.VITE_SOCKET_URL;
    } else {
      const targetHost = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
      serverUrl = `http://${targetHost}:3000`;
    }

    socket = io(serverUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Đã kết nối server realtime thành công!', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.IO] Mất kết nối server:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Socket.IO] Lỗi kết nối Socket.IO:', err.message);
    });
  }
  return socket;
};
