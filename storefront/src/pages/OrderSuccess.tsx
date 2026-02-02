import { Link, useParams, useLocation } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const location = useLocation();
  const { store } = useStore();
  const orderNumber = (location.state as { orderNumber?: string })?.orderNumber;
  const totalAmount = (location.state as { totalAmount?: number })?.totalAmount;

  if (!store) return null;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-4 text-2xl font-semibold text-store-primary">Thank you!</h1>
      <p className="mt-2 text-store-muted">Your order has been placed successfully.</p>
      {orderNumber && (
        <p className="mt-3 font-mono text-sm font-medium text-store-primary">
          Order #{orderNumber}
        </p>
      )}
      {totalAmount != null && (
        <p className="mt-1 text-store-muted">
          Total:{' '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: store.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(totalAmount)}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to={`/store/${storeSlug}`}
          className="rounded-lg bg-store-primary px-4 py-2 font-medium text-white hover:opacity-90"
        >
          Continue shopping
        </Link>
        {isAuthenticated && (
          <Link
            to={`/store/${storeSlug}/account`}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-store-primary hover:border-store-accent hover:text-store-accent"
          >
            View My Orders
          </Link>
        )}
      </div>
    </div>
  );
}
