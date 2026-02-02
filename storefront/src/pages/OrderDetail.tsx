import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getMyOrderById } from '@/services/api';
import type { Order } from '@/services/api';

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetail() {
  const { storeSlug, orderId } = useParams<{ storeSlug: string; orderId: string }>();
  const navigate = useNavigate();
  const { store } = useStore();
  const { token, isAuthenticated } = useCustomerAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token || !storeSlug || !orderId) {
      navigate(`/store/${storeSlug}/login`, {
        state: { from: `/store/${storeSlug}/account/orders/${orderId}` },
      });
      return;
    }
    setLoading(true);
    setError(null);
    getMyOrderById(storeSlug, orderId, token)
      .then(setOrder)
      .catch((e) => setError(e?.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [storeSlug, orderId, token, isAuthenticated, navigate]);

  if (!store) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Order not found'}
        </div>
        <Link
          to={`/store/${storeSlug}/account`}
          className="mt-4 inline-block text-sm text-store-muted hover:text-store-primary"
        >
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-store-primary">Order {order.orderNumber}</h1>
        <p className="mt-1 text-sm text-store-muted">
          Placed {formatDate(order.createdAt)} · {order.status}
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-medium text-store-primary">Items</h2>
          <div className="mt-3 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-store-primary">{item.productName}</p>
                  {item.variantInfo && <p className="text-store-muted">{item.variantInfo}</p>}
                  <p className="text-store-muted">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-store-muted">Qty: {item.quantity}</p>
                  <p className="font-medium text-store-primary">
                    {formatPrice(item.lineTotal, store.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-medium text-store-primary">Summary</h2>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-store-muted">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, store.currency)}</span>
            </div>
            {order.tax != null && (
              <div className="flex justify-between text-store-muted">
                <span>Tax</span>
                <span>{formatPrice(order.tax, store.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-store-primary">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount, store.currency)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-medium text-store-primary">Order notes</h2>
            <p className="mt-2 text-sm text-store-muted">{order.notes}</p>
          </div>
        )}
      </div>

      <Link
        to={`/store/${storeSlug}/account`}
        className="mt-6 inline-block text-sm text-store-muted hover:text-store-primary"
      >
        ← Back to My Orders
      </Link>
    </div>
  );
}
