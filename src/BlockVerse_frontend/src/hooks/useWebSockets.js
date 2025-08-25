import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('message', (data) => {
      setLastMessage(data);
    });

    socketRef.current.on('new_post', (post) => {
      setLastMessage({ type: 'new_post', data: post });
    });

    socketRef.current.on('post_updated', (post) => {
      setLastMessage({ type: 'post_updated', data: post });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', message);
    }
  };

  const joinRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_room', roomId);
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
};