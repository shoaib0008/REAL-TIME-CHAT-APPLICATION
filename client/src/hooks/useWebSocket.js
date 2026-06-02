import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = 'ws://localhost:8080';

export function useWebSocket({ username, avatar, room, onMessage }) {
  const ws = useRef(null);
  const [status, setStatus] = useState('disconnected'); // connecting | connected | disconnected
  const reconnectTimer = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!username) return;

    setStatus('connecting');
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      setStatus('connected');
      socket.send(JSON.stringify({ type: 'join', username, avatar, room }));
    };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch { /* ignore */ }
    };

    socket.onclose = () => {
      // Only reconnect if this is still the active socket
      if (ws.current === socket) {
        setStatus('disconnected');
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [username, avatar, room, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (ws.current) {
        const socketToClose = ws.current;
        ws.current = null; // Unset it so onclose knows it's obsolete
        socketToClose.close();
      }
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { status, send };
}
