import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { useCart } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { placeOrder } from '@/services/api';
import { ShieldCheck, Lock, CreditCard, Package } from 'lucide-react';

export default function Checkout() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store } = useStore();
  const { items, getSubtotal, clearCart } = useCart();
  const { customer, token, isAuthenticated } = useCustomerAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || '');
      setCustomerEmail(customer.email || '');
      setCustomerPhone(customer.phone || '');
    }
  }, [customer]);

  if (!store) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
        <Package className="mx-auto h-16 w-16 text-slate-600" />
        <p className="mt-4 text-white font-medium text-lg">Your cart is empty.</p>
        <Link
          to={`/store/${storeSlug}`}
          className="mt-6 inline-block rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 font-bold text-white hover:opacity-90 uppercase tracking-wide shadow-lg shadow-cyan-500/30"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) return;
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const order = await placeOrder(
        storeSlug,
        {
          items: items.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        token
      );
      clearCart();
      navigate(`/store/${storeSlug}/checkout/success`, {
        state: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Form */}
        <div>
          <div className="mb-6">
            <h1 className="font-display text-3xl font-black text-white uppercase tracking-wider sm:text-4xl">
              Secure Checkout
            </h1>
            <p className="mt-2 text-white font-medium">Enter your details to complete the order.</p>
            {!isAuthenticated && (
              <p className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-4 py-2.5 text-sm text-cyan-300">
                Already have an account?{' '}
                <Link
                  to={`/store/${storeSlug}/login`}
                  state={{ from: `/store/${storeSlug}/checkout` }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Log in
                </Link>{' '}
                to prefill your info.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-4 text-sm text-red-300 font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
                Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Optional"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
                Order notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Any special instructions?"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 py-4 font-bold text-white hover:opacity-90 disabled:opacity-50 uppercase tracking-wide shadow-lg shadow-cyan-500/30 transition text-lg"
            >
              {loading ? 'Processing…' : `Place Order · ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: store.currency,
                minimumFractionDigits: 0,
              }).format(total)}`}
            </button>
            
            <Link
              to={`/store/${storeSlug}/cart`}
              className="block text-center text-sm text-slate-400 hover:text-cyan-400 transition"
            >
              ← Back to cart
            </Link>
          </form>
        </div>

        {/* Right: Order Summary + Security Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.skuId} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{item.productName}</p>
                    {item.variantInfo && (
                      <p className="text-cyan-400 text-xs">{item.variantInfo}</p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-medium text-white">×{item.quantity}</p>
                    <p className="text-slate-400 text-xs">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: store.currency,
                        minimumFractionDigits: 0,
                      }).format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-white font-medium">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: store.currency,
                  minimumFractionDigits: 0,
                }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white font-medium">
                <span>Tax (10%)</span>
                <span>{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: store.currency,
                  minimumFractionDigits: 0,
                }).format(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 font-display text-lg font-black">
                <span className="text-white">Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: store.currency,
                    minimumFractionDigits: 0,
                  }).format(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">
              Secure Checkout
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <Lock className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">SSL Encrypted</p>
                  <p className="text-xs text-slate-400">Your data is protected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Buyer Protection</p>
                  <p className="text-xs text-slate-400">100% secure payments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <CreditCard className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Secure Payment</p>
                  <p className="text-xs text-slate-400">Multiple payment options</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="hidden lg:block rounded-xl border border-slate-700 bg-gradient-to-br from-cyan-950/30 to-purple-950/30 p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-1 shadow-lg shadow-cyan-500/50">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900">
                  <Package className="h-16 w-16 text-cyan-400" />
                </div>
              </div>
            </div>
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
              Fast Delivery
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Your order will be processed within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
