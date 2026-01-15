# API Integration Guide

This guide explains how the frontend is integrated with the backend API.

## Setup

### 1. Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:3000
```

### 2. API Client

The API client (`frontend/src/services/api.ts`) handles:
- Automatic JWT token injection
- Error handling and toast notifications
- Request/response interceptors
- Base URL configuration

## Services Created

All API services are in `frontend/src/services/`:

- ✅ `api.ts` - Base API client with axios
- ✅ `auth.service.ts` - Authentication (login, register, logout)
- ✅ `products.service.ts` - Product CRUD operations
- ✅ `suppliers.service.ts` - Supplier management
- ✅ `orders.service.ts` - Order management
- ✅ `purchaseOrders.service.ts` - Purchase order management
- ✅ `stockMovements.service.ts` - Stock movement tracking
- ✅ `dashboard.service.ts` - Dashboard analytics
- ✅ `skus.service.ts` - SKU management

## Authentication Flow

1. User logs in via `authService.login()`
2. JWT token is stored in `localStorage`
3. Token is automatically added to all API requests via interceptor
4. On 401 errors, user is redirected to login

## Pages Updated

### ✅ Dashboard
- Now uses `dashboardService.getDashboardStats()`
- Shows loading and error states
- Displays real data from backend

### ⏳ Remaining Pages to Update
- Products page
- Product Detail page
- Add/Edit Product pages
- Orders page
- Purchase Orders page
- Suppliers page
- Stock Movements page
- Alerts page

## Next Steps

1. **Create Login Page** - Add authentication UI
2. **Add Route Protection** - Protect routes that require auth
3. **Update Remaining Pages** - Replace dummy data with API calls
4. **Error Handling** - Add proper error boundaries
5. **Loading States** - Add loading indicators to all pages

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Seed database: `cd backend && npm run seed`
4. Login with: `owner@techstore.com` / `password123`

## API Endpoints

All endpoints are prefixed with `/api/inventory/`:

- `GET /api/inventory/dashboard` - Dashboard stats
- `GET /api/inventory/products` - List products
- `POST /api/inventory/products` - Create product
- `GET /api/inventory/products/:id` - Get product
- `PUT /api/inventory/products/:id` - Update product
- `DELETE /api/inventory/products/:id` - Delete product
- ... (see backend routes for full list)

## Notes

- All API calls require authentication (JWT token)
- Token is stored in `localStorage` as `authToken`
- User info is stored as `user` in `localStorage`
- API client automatically handles token refresh on 401 errors

