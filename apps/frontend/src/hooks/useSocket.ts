import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export function useSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    // Connection event handlers
    const onConnect = () => {
      setStatus('connected');
    };

    const onDisconnect = () => {
      setStatus('disconnected');
    };

    const onReconnectAttempt = () => {
      setStatus('reconnecting');
    };

    const onReconnect = () => {
      setStatus('connected');
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect', onReconnect);

    // Check initial connection status
    if (socket.connected) {
      setStatus('connected');
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect', onReconnect);
    };
  }, []);

  return { socket, status };
}
