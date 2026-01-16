# Socket.io Real-Time Updates Implementation

## Overview

Real-time updates have been implemented using Socket.io for the Multi-Tenant Inventory Management System. This enables instant updates across all connected clients when inventory changes occur.

## Backend Implementation

### 1. Socket.io Server Setup (`backend/src/utils/socket.ts`)

- **Initialization**: Socket.io server initialized with HTTP server
- **Multi-Tenant Isolation**: Clients join tenant-specific rooms (`tenant:${tenantId}`)
- **Event Emitters**: Helper functions to emit events to specific tenants
- **Event Names**: Centralized event name constants

### 2. App Integration (`backend/src/app.ts`)

- Modified to use HTTP server instead of Express app directly
- Socket.io initialized during app startup
- Server listens on configured port

### 3. Service Integration

#### Stock Movements Service
- Emits `STOCK_MOVEMENT_CREATED` when new movements are created
- Emits `STOCK_ADJUSTED` when stock is adjusted via SKU service

#### Orders Service
- Emits `ORDER_CREATED` when new orders are created
- Emits `ORDER_UPDATED` when orders are modified
- Emits `ORDER_STATUS_CHANGED` when order status changes (fulfilled, cancelled)

#### Purchase Orders Service
- Emits `PURCHASE_ORDER_CREATED` when new POs are created
- Emits `PURCHASE_ORDER_UPDATED` when POs are modified
- Emits `PURCHASE_ORDER_STATUS_CHANGED` when PO status changes
- Emits `PURCHASE_ORDER_RECEIVED` when POs are received (stock updated)

#### SKU Service
- Emits `STOCK_ADJUSTED` when stock is manually adjusted
- Emits `STOCK_MOVEMENT_CREATED` for adjustment movements

#### Dashboard Service
- Emits `DASHBOARD_STATS_UPDATED` to trigger dashboard refresh

## Frontend Implementation

### 1. Socket Service (`frontend/src/services/socket.service.ts`)

- Singleton service for Socket.io client
- Handles connection, disconnection, and reconnection
- Automatically joins tenant room on connection
- Provides methods for subscribing/unsubscribing to events

### 2. Socket Context (`frontend/src/contexts/SocketContext.tsx`)

- React context provider for Socket.io
- Automatically connects when user is authenticated
- Provides `useSocket()` hook for components
- Manages connection state

### 3. App Integration (`frontend/src/App.tsx`)

- Wrapped app with `SocketProvider`
- Socket connects automatically after login

### 4. Page Updates

#### Dashboard (`frontend/src/pages/Dashboard.tsx`)
- Listens for `DASHBOARD_STATS_UPDATED` to refresh stats
- Listens for `ORDER_CREATED` to show notifications
- Listens for `PURCHASE_ORDER_RECEIVED` to show notifications
- Listens for `STOCK_ADJUSTED` to silently refresh

#### Orders Page (`frontend/src/pages/Orders.tsx`)
- Listens for `ORDER_CREATED` to add new orders
- Listens for `ORDER_UPDATED` to update existing orders
- Listens for `ORDER_STATUS_CHANGED` to show status change notifications

#### Stock Movements Page (`frontend/src/pages/StockMovements.tsx`)
- Listens for `STOCK_MOVEMENT_CREATED` to add new movements
- Listens for `STOCK_ADJUSTED` to show notifications

## Socket Events

### Backend → Frontend Events

| Event Name | Description | Data |
|------------|-------------|------|
| `stock-movement:created` | New stock movement created | Movement data |
| `stock:adjusted` | Stock quantity adjusted | SKU and adjustment data |
| `order:created` | New order created | Order data |
| `order:updated` | Order updated | Updated order data |
| `order:status-changed` | Order status changed | Order ID, status, previous status |
| `purchase-order:created` | New PO created | PO data |
| `purchase-order:updated` | PO updated | Updated PO data |
| `purchase-order:status-changed` | PO status changed | PO ID, status, previous status |
| `purchase-order:received` | PO received (stock updated) | PO data |
| `dashboard:stats-updated` | Dashboard stats need refresh | Trigger message |
| `alert:low-stock` | Low stock alert | Alert data |

### Frontend → Backend Events

| Event Name | Description | Data |
|------------|-------------|------|
| `join-tenant` | Join tenant room | `tenantId` |
| `leave-tenant` | Leave tenant room | `tenantId` |

## Multi-Tenant Isolation

- Each client joins a tenant-specific room: `tenant:${tenantId}`
- Events are only emitted to clients in the same tenant room
- Ensures complete data isolation between tenants

## Connection Flow

1. User logs in → `tenantId` stored in localStorage
2. `SocketProvider` detects authenticated user
3. Socket connects to backend with JWT token
4. Client emits `join-tenant` with `tenantId`
5. Backend adds client to tenant room
6. Client receives real-time updates for their tenant only

## Testing Real-Time Updates

### Test Scenarios

1. **Stock Adjustment**
   - Adjust stock on Product Detail page
   - Open Stock Movements page in another tab
   - See new movement appear automatically

2. **Order Creation**
   - Create an order
   - Open Orders page in another tab
   - See new order appear automatically
   - Dashboard shows notification

3. **Purchase Order Receipt**
   - Receive a purchase order
   - Dashboard updates inventory value
   - Stock Movements page shows new purchase movements

4. **Order Status Change**
   - Fulfill or cancel an order
   - Orders page updates automatically
   - Notification shown to user

## Configuration

### Backend Environment Variables

```env
FRONTEND_URL=https://your-frontend.vercel.app  # For CORS
ORIGIN=https://your-frontend.vercel.app         # For CORS
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend.onrender.com
```

## Troubleshooting

### Socket Not Connecting

1. Check backend is running and accessible
2. Verify `VITE_API_URL` is correct
3. Check browser console for connection errors
4. Verify user has `tenantId` after login

### Events Not Received

1. Verify client joined tenant room (check backend logs)
2. Check event names match between backend and frontend
3. Verify tenant isolation (events only for same tenant)

### CORS Issues

1. Update `FRONTEND_URL` and `ORIGIN` in backend env
2. Restart backend server
3. Clear browser cache

## Future Enhancements

- [ ] Low stock alerts via Socket.io
- [ ] Real-time notifications for all users
- [ ] Typing indicators for collaborative editing
- [ ] Presence indicators (who's online)
- [ ] Real-time chat for order discussions

