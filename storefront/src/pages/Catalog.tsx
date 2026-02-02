import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { getStoreProducts } from '@/services/api';
import type { Product } from '@/services/api';
import HeroBanner from '@/components/HeroBanner';
import CountdownTimer from '@/components/CountdownTimer';
import { SlidersHorizontal, Sparkles, Flame, Zap, Heart, X } from 'lucide-react';

// Dummy badge logic (will be from backend later)
const getProductBadge = (productName: string) => {
  if (productName.includes('Watch') || productName.includes('Headphones')) {
    return { text: 'NEW', color: 'from-cyan-500 to-blue-500', icon: Sparkles };
  }
  if (productName.includes('T-Shirt') || productName.includes('Shoes')) {
    return { text: 'HOT', color: 'from-orange-500 to-red-500', icon: Flame };
  }
  if (productName.includes('Backpack')) {
    return { text: 'LIMITED', color: 'from-purple-500 to-pink-500', icon: Zap };
  }
  return null;
};

function formatPrice(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_MAP: Record<string, string> = {
  'all': 'All Products',
  'mind-unlocked': 'Mind Unlocked',
  'urban-decode': 'Urban Decode',
  'hypebeast': 'Hypebeast',
  'gamer': 'Gamer Zone',
  'beat-maker': 'Beat Maker',
  'limited': 'Limited Drops',
};

export default function Catalog() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<{ page: number; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  
  const categoryParam = searchParams.get('category');
  const collectionParam = searchParams.get('collection');

  // Dummy: Drop ends 3 days from now
  const dropEndDate = new Date();
  dropEndDate.setDate(dropEndDate.getDate() + 3);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!storeSlug) return;
    setLoading(true);
    setError(null);
    getStoreProducts(storeSlug, { page: 1, limit: 24 })
      .then((res) => {
        setProducts(res.products);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e?.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [storeSlug]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply category/collection filter
    if (categoryParam && categoryParam !== 'all') {
      // For now, we'll filter by product category field
      // In production, you'd map categories to proper fields
      result = result.filter(p => 
        p.category?.toLowerCase().includes(categoryParam.toLowerCase()) ||
        p.name?.toLowerCase().includes(categoryParam.toLowerCase())
      );
    }

    if (collectionParam) {
      // Filter by collection (identity-based)
      // This is a placeholder - you'd implement proper collection logic
      result = result;
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'popular':
        // Placeholder for popularity sorting
        break;
      case 'newest':
      default:
        // Keep original order (newest first from backend)
        break;
    }

    setFilteredProducts(result);
  }, [products, categoryParam, collectionParam, sortBy]);

  const clearFilters = () => {
    setSearchParams({});
  };

  if (!store) return null;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="aspect-square animate-pulse rounded-lg bg-slate-700" />
            <div className="mt-3 h-4 w-3/4 rounded bg-slate-700" />
            <div className="mt-2 h-4 w-1/4 rounded bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-4 text-red-300 font-medium">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
        <p className="text-white font-medium text-lg">No products yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <div className="mb-6">
        <HeroBanner />
      </div>

      {/* Limited Drop Timer */}
      <div className="mb-6 flex justify-center">
        <CountdownTimer targetDate={dropEndDate} label="Limited drop ends in" />
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black text-white sm:text-4xl uppercase tracking-wider">
              {categoryParam && categoryParam !== 'all' ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    {CATEGORY_MAP[categoryParam] || categoryParam}
                  </span>{' '}
                  Collection
                </>
              ) : collectionParam ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    {collectionParam}
                  </span>{' '}
                  Collection
                </>
              ) : (
                <>
                  Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Drops</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-white font-medium tracking-wide">
              {filteredProducts.length} exclusive item{filteredProducts.length !== 1 ? 's' : ''} <span className="text-cyan-400">·</span> Limited edition
            </p>
            
            {/* Active Filter Badge */}
            {(categoryParam || collectionParam) && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/30 transition"
              >
                <span>Clear filters</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-white hover:border-cyan-500 hover:text-cyan-400 transition"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Filters Panel (expandable) */}
        {showFilters && (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Stock</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500" />
                    In Stock Only
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500" />
                    Low Stock
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 transition">
                    NEW
                  </button>
                  <button className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 transition">
                    LIMITED
                  </button>
                  <button className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 transition">
                    HOT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {filteredProducts.length === 0 && !loading ? (
        <div className="col-span-full rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-white font-medium text-lg">No products found for this filter.</p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-block rounded-lg bg-cyan-500 px-6 py-2.5 font-semibold text-white hover:bg-cyan-600 transition"
          >
            View All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
          const id = product.id || (product as any)._id;
          const badge = getProductBadge(product.name);
          const BadgeIcon = badge?.icon;
          
          return (
            <Link
              key={id}
              to={`/store/${storeSlug}/products/${id}`}
              className="group relative rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1"
            >
              {/* Badge */}
              {badge && (
                <div className={`absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r ${badge.color} px-3 py-1.5 shadow-lg shadow-black/50`}>
                  {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 text-white" />}
                  <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow">
                    {badge.text}
                  </span>
                </div>
              )}

              {/* Wishlist Heart */}
              <button
                onClick={(e) => toggleWishlist(id, e)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2.5 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/90"
              >
                <Heart 
                  className={`h-5 w-5 transition-all duration-200 ${
                    wishlist.has(id) 
                      ? 'fill-red-500 text-red-500 scale-110' 
                      : 'text-white hover:text-red-400'
                  }`} 
                />
              </button>
              
              {/* Image Container with Gradient Overlay */}
              <div className="aspect-square overflow-hidden bg-slate-900 relative">
                {product.image ? (
                  <>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500 bg-slate-800">
                    <span className="text-sm font-medium">No image</span>
                  </div>
                )}
              </div>
              
              {/* Product Info with Better Contrast */}
              <div className="p-4 bg-gradient-to-b from-slate-900 to-black">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30">
                    <p className="font-display text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      {product.category}
                    </p>
                  </span>
                </div>
                
                <h2 className="font-semibold text-white text-base line-clamp-2 group-hover:text-cyan-300 transition-colors leading-tight min-h-[2.5rem]">
                  {product.name}
                </h2>
                
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-2xl font-black text-white drop-shadow-lg">
                      {formatPrice(product.basePrice, store.currency)}
                    </p>
                    {product.hasVariants && (
                      <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wide">
                        Starting from
                      </p>
                    )}
                  </div>
                  
                  {/* Quick View Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                      <span>VIEW</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <p className="mt-8 text-center text-sm text-white font-medium">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      )}
    </>
  );
}
