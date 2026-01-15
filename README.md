# Multi-Tenant Inventory Management System

A comprehensive SaaS platform for managing inventory, suppliers, and orders with complete multi-tenant data isolation. Built with React, Node.js, Express, MongoDB, and TypeScript.

## 🚀 Features

### Core Features Implemented

#### 1. Multi-Tenant Architecture
- ✅ Row-level data isolation with `tenantId` filtering
- ✅ Automatic tenant identification from JWT tokens
- ✅ Complete data separation between tenants
- ✅ Role-based access control (Owner, Manager, Staff)

#### 2. Product Management
- ✅ Create, read, update, delete products
- ✅ Support for products with and without variants
- ✅ Dynamic variant builder (e.g., Size × Color combinations)
- ✅ Automatic SKU generation for variants
- ✅ Product images and descriptions
- ✅ Category and supplier associations

#### 3. SKU & Stock Management
- ✅ Individual stock tracking per SKU
- ✅ Stock adjustment with audit trail
- ✅ Low stock alerts (considers pending Purchase Orders)
- ✅ Stock movement history
- ✅ Concurrent stock updates with optimistic locking

#### 4. Supplier Management
- ✅ Create, read, update, delete suppliers
- ✅ Supplier contact information and addresses
- ✅ Supplier ratings and status tracking
- ✅ Supplier-product associations

#### 5. Purchase Orders
- ✅ Create and manage Purchase Orders
- ✅ Track PO status (Draft → Sent → Confirmed → Received)
- ✅ Multiple items per PO
- ✅ Partial delivery support
- ✅ Auto-update stock on receipt

#### 6. Customer Orders
- ✅ Create orders with multiple items
- ✅ Concurrent order processing with stock checks
- ✅ Order status tracking (Pending, Fulfilled, Cancelled, Partial)
- ✅ Automatic stock deduction on order creation
- ✅ Stock restoration on order cancellation

#### 7. Dashboard & Analytics
- ✅ Inventory value calculation
- ✅ Total products and SKUs count
- ✅ Low stock alerts (smart - considers pending POs)
- ✅ Top 5 sellers (last 30 days)
- ✅ Stock movement chart (last 7 days)
- ✅ Category distribution
- ✅ Performance optimized for 10,000+ products

#### 8. Stock Movements
- ✅ Complete audit trail of all stock changes
- ✅ Filter by type (purchase, sale, return, adjustment)
- ✅ Filter by SKU, product, date range
- ✅ Reference tracking (Order ID, PO ID, etc.)

#### 9. Authentication & Authorization
- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Secure password hashing (bcrypt)

#### 10. User Interface
- ✅ Modern, responsive React UI
- ✅ Real-time data updates
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Form validation
- ✅ Dynamic variant matrix visualization

---

## 📋 Prerequisites

- **Node.js**: v16+ 
- **MongoDB**: MongoDB Atlas account (or local MongoDB instance)
- **npm** or **yarn**

---

## 🛠️ Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.template .env.development.local
   ```

4. **Configure environment variables:**
   Edit `.env.development.local` and add:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=24h
   ORIGIN=http://localhost:5173
   CREDENTIALS=true
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```
   This will create:
   - 1 tenant (TechStore Inc)
   - 3 users (Owner, Manager, Staff)
   - 5 suppliers
   - 8 products with variants
   - Multiple SKUs
   - Sample orders and purchase orders
   - Stock movements

6. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   Create `.env.local` if you need to override API URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

---

## 🔐 Test Credentials

### Tenant 1: TechStore Inc

#### Owner Account
- **Email**: `owner@techstore.com`
- **Password**: `password123`
- **Role**: Owner
- **Access**: Full access to all features

#### Manager Account
- **Email**: `manager@techstore.com`
- **Password**: `password123`
- **Role**: Manager
- **Access**: Can manage inventory, orders, POs (no user management)

#### Staff Account
- **Email**: `staff@techstore.com`
- **Password**: `password123`
- **Role**: Staff
- **Access**: Can view and process orders (read-only for most features)

### Note
All users share the same password for testing convenience. In production, users should set their own passwords.

---

## 📁 Project Structure

```
tech-exactly/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # Request handlers (thin layer)
│   │   ├── services/         # Business logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Auth, tenant, RBAC middleware
│   │   ├── scripts/          # Seed scripts
│   │   └── server.ts         # Server entry point
│   ├── ARCHITECTURE.md       # Architecture documentation
│   ├── ENV_SETUP.md          # Environment setup guide
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── services/         # API service layer
    │   ├── types/            # TypeScript type definitions
    │   └── App.tsx           # Main app component
    ├── API_INTEGRATION_GUIDE.md
    └── package.json
```

---

## 🧪 Testing the Application

### 1. Login
- Navigate to `http://localhost:5173`
- Login with `owner@techstore.com` / `password123`

### 2. Dashboard
- View inventory statistics
- Check low stock alerts
- See top sellers and stock movement trends

### 3. Products
- View all products
- Click "View" to see product details with variant matrix
- Click "Edit" to modify product information
- Click "Add Product" to create new products with variants
- Test stock adjustment from product detail page

### 4. Suppliers
- View all suppliers
- Add new suppliers
- Edit supplier information
- Delete suppliers

### 5. Orders
- View all customer orders
- Create new orders (will check stock availability)
- Test concurrent orders (open multiple tabs)

### 6. Purchase Orders
- View all purchase orders
- See PO status and details

### 7. Stock Movements
- View complete audit trail
- Filter by type, SKU, product, date range

---

## 🎯 Assumptions Made

1. **Single Currency**: All prices in USD (can be extended to multi-currency)
2. **Single Timezone**: Uses server timezone (can be extended per tenant)
3. **Image Storage**: Currently supports image URLs (can be extended to file uploads)
4. **Email Notifications**: Not implemented (can be added)
5. **Real-Time Updates**: Not implemented (Socket.io can be added)
6. **Bulk Operations**: Import/export not implemented (can be added)
7. **Advanced Reporting**: Basic analytics only (can be extended)
8. **Mobile App**: Web-only (responsive design works on mobile browsers)
9. **Payment Integration**: Not implemented (can be added for order payments)
10. **Inventory Valuation Methods**: Uses simple average (can be extended to FIFO/LIFO)

---

## ⚠️ Known Limitations

1. **Token Revocation**: JWT tokens cannot be revoked until expiration (would need token blacklist)
2. **Image Uploads**: Currently only supports image URLs (file upload not implemented)
3. **Pagination**: Not fully implemented on all list pages (can be added)
4. **Search**: Basic text search only (no advanced filtering)
5. **Export**: No CSV/Excel export functionality
6. **Real-Time**: No WebSocket/Socket.io integration for real-time updates
7. **Caching**: No Redis caching (can be added for performance)
8. **Rate Limiting**: No API rate limiting (can be added)
9. **File Storage**: No cloud storage integration (S3, Cloudinary)
10. **Email**: No email notifications for low stock, orders, etc.

---

## ⏱️ Time Breakdown

### Phase 1: Planning & Architecture (2-3 hours)
- Requirements analysis
- Architecture design
- Database schema design
- API endpoint planning

### Phase 2: Backend Development (8-10 hours)
- Project setup and configuration
- Database models (Products, SKUs, Orders, Suppliers, etc.)
- Authentication and authorization
- Multi-tenant middleware
- Service layer implementation
- Controller and route setup
- Concurrency handling (transactions, optimistic locking)
- Dashboard service with aggregations
- Seed script for dummy data

### Phase 3: Frontend Development (10-12 hours)
- Project setup (React + TypeScript + Vite)
- UI component library setup (Shadcn UI)
- Layout components (Sidebar, Navbar, MainLayout)
- Dashboard page with charts
- Products page (list, detail, add, edit)
- Suppliers page (list, add, edit, delete)
- Orders, Purchase Orders, Stock Movements pages
- Login and Signup pages
- Protected routes implementation
- API service layer
- Form validation and error handling

### Phase 4: Integration & Testing (3-4 hours)
- API integration
- ID transformation (_id to id)
- Error handling
- Loading states
- Testing all CRUD operations
- Testing concurrent scenarios

### Phase 5: Documentation (2-3 hours)
- ARCHITECTURE.md
- README.md
- Code comments
- Setup guides

**Total Estimated Time: 25-32 hours**

---

## 🔧 Environment Variables

### Backend (.env.development.local)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h
ORIGIN=http://localhost:5173
CREDENTIALS=true
```

### Frontend (.env.local) - Optional

```env
VITE_API_URL=http://localhost:3000
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/inventory
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `GET /products/:id/skus` - Get product with SKUs
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### SKUs
- `GET /skus` - List all SKUs
- `POST /skus` - Create SKU
- `POST /skus/bulk` - Bulk create SKUs
- `PUT /skus/:id` - Update SKU
- `POST /skus/:id/adjust-stock` - Adjust stock

#### Suppliers
- `GET /suppliers` - List all suppliers
- `GET /suppliers/:id` - Get supplier details
- `POST /suppliers` - Create supplier
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

#### Orders
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `POST /orders/:id/fulfill` - Fulfill order
- `POST /orders/:id/cancel` - Cancel order

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

See `backend/ARCHITECTURE.md` for complete API documentation.

---

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. **Set environment variables** in deployment platform
2. **Build command**: `npm run build`
3. **Start command**: `npm start`
4. **Database**: Use MongoDB Atlas connection string

### Frontend Deployment (Vercel)

1. **Build command**: `npm run build`
2. **Output directory**: `dist`
3. **Environment variables**: Set `VITE_API_URL` to backend URL

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check `MONGO_URI` in `.env.development.local`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify network connectivity

**Port Already in Use:**
- Change `PORT` in `.env.development.local`
- Or kill process using port 3000: `lsof -ti:3000 | xargs kill`

### Frontend Issues

**API Connection Error:**
- Check `VITE_API_URL` in `.env.local`
- Ensure backend is running on correct port
- Check CORS configuration in backend

**Login Not Working:**
- Check browser console for errors
- Verify JWT token is being stored in localStorage
- Check backend logs for authentication errors

---

## 📝 License

This project is created for a company selection interview/assignment.

---

## 👥 Author

Built for Multi-Tenant Inventory Management System assignment.

---

## 🙏 Acknowledgments

- React + TypeScript for frontend
- Node.js + Express for backend
- MongoDB for database
- Shadcn UI for component library

