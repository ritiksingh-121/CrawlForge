import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.on('connect', () => console.log('[Socket] Connected'));
    socket.on('disconnect', () => console.log('[Socket] Disconnected'));
    socket.on('connect_error', (err) => console.warn('[Socket] Connection error:', err.message));
  }
  return socket;
}

export function joinJob(jobId) {
  const s = getSocket();
  s.emit('join:job', jobId);
  return () => s.emit('leave:job', jobId);
}

export function onScrapingProgress(jobId, callback) {
  const s = getSocket();
  const handler = (data) => callback(data);
  s.on('scraping:progress', handler);
  s.on('scraping:status', handler);
  s.on('scraping:complete', handler);
  s.on('scraping:error', handler);
  s.on('scraping:log', handler);
  return () => {
    s.off('scraping:progress', handler);
    s.off('scraping:status', handler);
    s.off('scraping:complete', handler);
    s.off('scraping:error', handler);
    s.off('scraping:log', handler);
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
