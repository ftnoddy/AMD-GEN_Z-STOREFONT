import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import PurchaseOrders from './pages/PurchaseOrders';
import Suppliers from './pages/Suppliers';
import AddSupplier from './pages/AddSupplier';
import EditSupplier from './pages/EditSupplier';
import StockMovements from './pages/StockMovements';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { authService } from './services/auth.service';
import { SocketProvider } from './contexts/SocketContext';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes - All require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Products />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddProduct />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditProduct />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Orders />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PurchaseOrders />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suppliers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-movements"
          element={
            <ProtectedRoute>
              <MainLayout>
                <StockMovements />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Placeholder routes for future implementation */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="Analytics" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="Team Management" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="Settings" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Detail/Form routes - to be implemented */}
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="Order Details" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="New Order" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="Purchase Order Details" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="New Purchase Order" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComingSoon page="Supplier Details" />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddSupplier />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditSupplier />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to login if not authenticated, or dashboard if authenticated */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Navigate to="/" replace />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </SocketProvider>
  );
}

// Temporary Coming Soon component for unimplemented pages
function ComingSoon({ page }: { page: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-6xl">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900">{page}</h1>
        <p className="mt-2 text-gray-600">This page is under construction</p>
        <p className="mt-4 text-sm text-gray-500">
          Navigate back using the sidebar or wait for this feature to be implemented
        </p>
      </div>
    </div>
  );
}

export default App;
