import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { useCart } from '@/contexts/CartContext';
import { getStoreProduct } from '@/services/api';
import type { Product, StoreSKU } from '@/services/api';
import { ShoppingCart, Heart } from 'lucide-react';

function formatPrice(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetail() {
  const { storeSlug, productId } = useParams<{ storeSlug: string; productId: string }>();
  const { store } = useStore();
  const { addItem } = useCart();
  const [data, setData] = useState<{ product: Product; skus: StoreSKU[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<StoreSKU | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!storeSlug || !productId) return;
    setLoading(true);
    setError(null);
    getStoreProduct(storeSlug, productId)
      .then(setData)
      .catch((e) => setError(e?.message || 'Product not found'))
      .finally(() => setLoading(false));
  }, [storeSlug, productId]);

  useEffect(() => {
    if (!data) return;
    if (data.skus.length === 1) setSelectedSku(data.skus[0]);
    else setSelectedSku(null);
  }, [data]);

  if (!store) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl border border-slate-700 bg-slate-800/50" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-700" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-700" />
            <div className="h-20 animate-pulse rounded bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-4 text-red-300 font-medium">
          {error || 'Product not found'}
          <Link to={`/store/${storeSlug}`} className="ml-2 text-cyan-400 underline hover:text-cyan-300">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const { product, skus } = data;
  const productName = product.name;
  const productIdVal = product.id || (product as any)._id;

  const handleAddToCart = () => {
    if (!selectedSku || !storeSlug) return;
    if (!selectedSku.inStock) return;
    addItem({
      skuId: selectedSku.id,
      productId: productIdVal,
      productName,
      sku: selectedSku.sku,
      variantInfo: selectedSku.variantCombination
        ? Object.values(selectedSku.variantCombination).join(' / ')
        : undefined,
      quantity,
      price: selectedSku.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2.5 backdrop-blur transition hover:scale-110"
          >
            <Heart 
              className={`h-6 w-6 transition ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-white hover:text-red-400'
              }`} 
            />
          </button>

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-slate-700/50 text-slate-400">
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-cyan-400">
              {product.category}
              {product.brand && (
                <>
                  {' · '}
                  {product.brand}
                </>
              )}
            </p>
            <h1 className="font-display mt-2 text-3xl font-black text-white uppercase tracking-wide sm:text-4xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-3 text-white font-medium leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Variant Selector */}
          {skus.length > 1 && (
            <div>
              <label className="mb-3 block text-sm font-bold text-white uppercase tracking-wide">Variant</label>
              <div className="grid grid-cols-2 gap-3">
                {skus.map((s) => {
                  const label =
                    s.variantCombination && Object.values(s.variantCombination).join(' / ');
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSku(s)}
                      disabled={!s.inStock}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        selectedSku?.id === s.id
                          ? 'border-cyan-400 bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                          : s.inStock
                          ? 'border-slate-600 bg-slate-800 text-white hover:border-cyan-400 hover:text-cyan-400'
                          : 'cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-600 line-through'
                      }`}
                    >
                      {label || s.sku}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Stock */}
          {selectedSku && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <p className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {formatPrice(selectedSku.price, store.currency)}
              </p>
              {!selectedSku.inStock && (
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400"></span>
                  Out of stock
                </p>
              )}
              {selectedSku.inStock && selectedSku.lowStock && (
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-orange-400">
                  <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></span>
                  Only {selectedSku.stock} left!
                </p>
              )}
              {selectedSku.inStock && !selectedSku.lowStock && (
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  In stock
                </p>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {selectedSku && selectedSku.inStock && (
            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
                  Qty
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={selectedSku.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-center text-white font-semibold focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 py-3.5 font-bold text-white hover:opacity-90 uppercase tracking-wide shadow-lg shadow-cyan-500/30 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {added ? 'Added to cart!' : 'Add to cart'}
              </button>
            </div>
          )}

          <Link
            to={`/store/${storeSlug}`}
            className="inline-block text-sm text-slate-400 hover:text-cyan-400 transition"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
