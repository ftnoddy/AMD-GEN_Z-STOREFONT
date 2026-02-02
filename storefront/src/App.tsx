import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { StoreProvider } from '@/contexts/StoreContext';
import StoreLayout from '@/pages/StoreLayout';
import Catalog from '@/pages/Catalog';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Account from '@/pages/Account';
import OrderDetail from '@/pages/OrderDetail';
import StoreNotFound from '@/pages/StoreNotFound';
import Collections from '@/pages/Collections';

const defaultStore = import.meta.env.VITE_DEFAULT_STORE || 'techstore';

function StoreRouteWrapper() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  return (
    <StoreProvider initialSlug={storeSlug ?? null}>
      <StoreLayout />
    </StoreProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/store/${defaultStore}`} replace />} />
        <Route path="/store/:storeSlug" element={<StoreRouteWrapper />}>
          <Route index element={<Catalog />} />
          <Route path="collections" element={<Collections />} />
          <Route path="products" element={<Catalog />} />
          <Route path="products/:productId" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success" element={<OrderSuccess />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="account" element={<Account />} />
          <Route path="account/orders/:orderId" element={<OrderDetail />} />
        </Route>
        <Route path="*" element={<StoreNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
