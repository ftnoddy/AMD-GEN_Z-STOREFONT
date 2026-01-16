import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import socketService, { SocketEvents } from '../services/socket.service';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface SocketContextType {
  isConnected: boolean;
  socket: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const user: User | null = authService.getUser();
    
    if (user && user.tenantId) {
      // Connect to Socket.io
      const socketInstance = socketService.connect(user.tenantId);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Cleanup on unmount or logout
      return () => {
        socketService.disconnect();
        setIsConnected(false);
        setSocket(null);
      };
    }
  }, []);

  // Reconnect if user changes
  useEffect(() => {
    const user: User | null = authService.getUser();
    if (user && user.tenantId && !isConnected) {
      const socketInstance = socketService.connect(user.tenantId);
      setSocket(socketInstance);
    }
  }, [isConnected]);

  return (
    <SocketContext.Provider value={{ isConnected, socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Export SocketEvents for convenience
export { SocketEvents };

