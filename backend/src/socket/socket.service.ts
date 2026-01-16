import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@config';
import { InventoryUserModel } from '@models/inventory-user.model';
import { logger } from '@utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
  user?: any;
}

interface SocketUser {
  userId: string;
  tenantId: string;
  socketId: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map(); // socketId -> user info
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? (process.env.ORIGIN || process.env.FRONTEND_URL || '*')
          : '*',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, JWT_SECRET || 'your-secret-key') as any;
        const user = await InventoryUserModel.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.tenantId = user.tenantId.toString();
        socket.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId.toString(),
        };

        next();
      } catch (error: any) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.io server initialized');
  }

  private handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    const tenantId = socket.tenantId!;
    const socketId = socket.id;

    // Store user connection
    this.connectedUsers.set(socketId, { userId, tenantId, socketId });
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);

    // Join tenant room for multi-tenant isolation
    socket.join(`tenant:${tenantId}`);
    
    logger.info(`User ${userId} (tenant: ${tenantId}) connected via socket ${socketId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socketId, userId);
    });

    // Handle join room (for specific product/order updates)
    socket.on('join:room', (room: string) => {
      socket.join(room);
      logger.info(`Socket ${socketId} joined room: ${room}`);
    });

    // Handle leave room
    socket.on('leave:room', (room: string) => {
      socket.leave(room);
      logger.info(`Socket ${socketId} left room: ${room}`);
    });
  }

  private handleDisconnection(socketId: string, userId: string) {
    this.connectedUsers.delete(socketId);
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    logger.info(`User ${userId} disconnected (socket: ${socketId})`);
  }

  // Emit to all users in a tenant
  emitToTenant(tenantId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`tenant:${tenantId}`).emit(event, data);
    logger.debug(`Emitted ${event} to tenant ${tenantId}`);
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.io!.to(socketId).emit(event, data);
      });
      logger.debug(`Emitted ${event} to user ${userId}`);
    }
  }

  // Emit to specific room
  emitToRoom(room: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
    logger.debug(`Emitted ${event} to room ${room}`);
  }

  // Emit to all connected users
  emitToAll(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
    logger.debug(`Emitted ${event} to all users`);
  }

  // Get connected users count for a tenant
  getTenantUserCount(tenantId: string): number {
    if (!this.io) return 0;
    const room = this.io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
    return room ? room.size : 0;
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();

