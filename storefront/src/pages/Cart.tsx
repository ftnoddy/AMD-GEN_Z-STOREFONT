import { Link, useParams } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { useCart } from '@/contexts/CartContext';
import { Trash2 } from 'lucide-react';

function formatPrice(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Cart() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { store } = useStore();
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();

  if (!store) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
        <p className="text-white font-medium text-lg">Your cart is empty.</p>
        <Link
          to={`/store/${storeSlug}`}
          className="mt-4 inline-block rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-white font-bold hover:opacity-90 uppercase tracking-wide shadow-lg shadow-cyan-500/30"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-white sm:text-3xl uppercase tracking-wider">Cart</h1>
        <p className="mt-1 text-white font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.skuId}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{item.productName}</p>
              {item.variantInfo && (
                <p className="text-sm text-cyan-400">{item.variantInfo}</p>
              )}
              <p className="text-sm text-slate-400">{item.sku}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.skuId, Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-16 rounded border border-slate-600 bg-slate-700 text-white px-2 py-1.5 text-center text-sm focus:border-cyan-400 focus:outline-none"
              />
              <span className="font-display w-24 text-right font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {formatPrice(item.price * item.quantity, store.currency)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.skuId)}
                className="rounded p-1.5 text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition"
                aria-label="Remove"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white font-medium">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, store.currency)}</span>
          </div>
          <div className="flex justify-between text-white font-medium">
            <span>Tax (10%)</span>
            <span>{formatPrice(tax, store.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-2 text-base font-bold text-white">
            <span>Total</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{formatPrice(total, store.currency)}</span>
          </div>
        </div>
        <Link
          to={`/store/${storeSlug}/checkout`}
          className="mt-6 block w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 py-3 text-center font-bold text-white hover:opacity-90 uppercase tracking-wide shadow-lg shadow-cyan-500/30"
        >
          Proceed to checkout
        </Link>
      </div>
    </>
  );
}
