// lib/socket.ts
import { io } from 'socket.io-client';

const getSignalUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SIGNAL_URL || `http://${window.location.hostname}:3001`;
  }
  return process.env.NEXT_PUBLIC_SIGNAL_URL || `http://localhost:3001`;
};

export const socket = io(getSignalUrl(), {
  autoConnect: false,
});
