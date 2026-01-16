import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 */
export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || process.env.ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join tenant room for multi-tenant isolation
    socket.on('join-tenant', (tenantId: string) => {
      socket.join(`tenant:${tenantId}`);
      console.log(`Client ${socket.id} joined tenant: ${tenantId}`);
    });

    // Leave tenant room
    socket.on('leave-tenant', (tenantId: string) => {
      socket.leave(`tenant:${tenantId}`);
      console.log(`Client ${socket.id} left tenant: ${tenantId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get Socket.io instance
 */
export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
}

/**
 * Emit event to a specific tenant
 */
export function emitToTenant(tenantId: string, event: string, data: any) {
  if (io) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }
}

/**
 * Emit event to all connected clients
 */
export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Socket.io event names
 */
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

