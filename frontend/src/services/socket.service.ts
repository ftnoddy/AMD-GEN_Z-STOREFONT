import { io, Socket } from 'socket.io-client';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private tenantId: string | null = null;

  /**
   * Connect to Socket.io server
   */
  connect(tenantId: string) {
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.tenantId = tenantId;
    const token = authService.getToken();

    this.socket = io(API_BASE_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected:', this.socket?.id);
      // Join tenant room for multi-tenant isolation
      if (tenantId) {
        this.socket?.emit('join-tenant', tenantId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      if (this.tenantId) {
        this.socket.emit('leave-tenant', this.tenantId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.tenantId = null;
    }
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

// Socket event names (matching backend)
export const SocketEvents = {
  // Stock Movements
  STOCK_MOVEMENT_CREATED: 'stock-movement:created',
  STOCK_ADJUSTED: 'stock:adjusted',
  
  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  
  // Purchase Orders
  PURCHASE_ORDER_CREATED: 'purchase-order:created',
  PURCHASE_ORDER_UPDATED: 'purchase-order:updated',
  PURCHASE_ORDER_STATUS_CHANGED: 'purchase-order:status-changed',
  PURCHASE_ORDER_RECEIVED: 'purchase-order:received',
  
  // Dashboard
  DASHBOARD_STATS_UPDATED: 'dashboard:stats-updated',
  
  // Low Stock Alerts
  LOW_STOCK_ALERT: 'alert:low-stock',
} as const;

