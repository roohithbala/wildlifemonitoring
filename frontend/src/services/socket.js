import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

// Socket configuration
const serverUrl = 'http://localhost:5001';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// React hook for socket
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socketInstance = initializeSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    // Cleanup
    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
    };
  }, []);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    socket: getSocket(),
    isConnected,
    notifications,
    clearNotification,
    clearAllNotifications
  };
};