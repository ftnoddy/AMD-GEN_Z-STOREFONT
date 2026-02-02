import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getMyOrders } from '@/services/api';
import type { Order } from '@/services/api';
import { LogOut } from 'lucide-react';

function formatPrice(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Account() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store } = useStore();
  const { customer, token, isAuthenticated, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token || !storeSlug) {
      navigate(`/store/${storeSlug}/login`, { state: { from: `/store/${storeSlug}/account` } });
      return;
    }
    setLoading(true);
    setError(null);
    getMyOrders(storeSlug, token)
      .then(setOrders)
      .catch((e) => setError(e?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [storeSlug, token, isAuthenticated, navigate]);

  if (!store || !customer) return null;

  const handleLogout = () => {
    logout();
    navigate(`/store/${storeSlug}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-store-primary sm:text-3xl">My Account</h1>
          <p className="mt-1 text-store-muted">
            {customer.name} · {customer.email}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-store-muted hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-store-primary">My Orders</h2>
          {loading && (
            <div className="mt-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {!loading && !error && orders.length === 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-store-muted">No orders yet.</p>
              <Link
                to={`/store/${storeSlug}`}
                className="mt-3 inline-block rounded-lg bg-store-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Start shopping
              </Link>
            </div>
          )}
          {!loading && !error && orders.length > 0 && (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/store/${storeSlug}/account/orders/${order._id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-store-accent/50 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-store-primary">{order.orderNumber}</p>
                      <p className="text-sm text-store-muted">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-store-primary">
                        {formatPrice(order.totalAmount, store.currency)}
                      </p>
                      <p className="text-sm text-store-muted">{order.status}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-store-muted">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
