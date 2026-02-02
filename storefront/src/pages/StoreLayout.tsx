import { useEffect, useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { CustomerAuthProvider, useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { ShoppingBag, ShoppingCart, User, Search, ChevronDown } from 'lucide-react';
import amdLogo from '@/assets/brand-logo/Gemini_Generated_Image_ey9rxsey9rxsey9r.png';
import WelcomePopup from '@/components/WelcomePopup';

// Dummy categories for UI (will connect to backend later)
const CATEGORIES = [
  { name: 'Collections', slug: 'collections', emoji: '✨', isSpecial: true },
  { name: 'All Products', slug: 'all' },
  { name: 'Mind Unlocked', slug: 'mind-unlocked', emoji: '🧠' },
  { name: 'Urban Decode', slug: 'urban-decode', emoji: '🏙️' },
  { name: 'Hypebeast', slug: 'hypebeast', emoji: '🔥' },
  { name: 'Gamer Zone', slug: 'gamer', emoji: '🎮' },
  { name: 'Beat Maker', slug: 'beat-maker', emoji: '🎵' },
  { name: 'Limited Drops', slug: 'limited', emoji: '⚡' },
];

export default function StoreLayout() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { store, loading, error, setStoreSlug } = useStore();

  useEffect(() => {
    if (storeSlug) setStoreSlug(storeSlug);
  }, [storeSlug, setStoreSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-store-accent border-t-transparent" />
          <p className="mt-3 text-store-muted">Loading store…</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-store-primary">Store not found</h1>
          <p className="mt-2 text-store-muted">{error || 'This store does not exist.'}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-store-primary px-4 py-2 text-white hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CustomerAuthProvider storeSlug={storeSlug ?? null}>
      <CartProvider storeSlug={storeSlug ?? null}>
        <StoreLayoutInner store={store} storeSlug={storeSlug ?? ''} />
      </CartProvider>
    </CustomerAuthProvider>
  );
}

function StoreLayoutInner({
  store,
  storeSlug,
}: {
  store: { subdomain: string; name: string; logo?: string };
  storeSlug: string;
}) {
  const { getCount } = useCart();
  const { isAuthenticated } = useCustomerAuth();
  const count = getCount();
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Welcome Popup */}
      <WelcomePopup />
      
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur">
        {/* Top Header */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to={`/store/${store.subdomain}`} className="flex items-center gap-3 flex-shrink-0">
            <img src={amdLogo} alt="AMD Gen Z Inventory" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            <span className="font-display font-bold text-cyan-400 text-lg sm:text-xl tracking-wider hidden sm:inline">AMD° GEN Z</span>
          </Link>
          
          <nav className="flex items-center gap-3 sm:gap-4">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-white hover:text-cyan-400 transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-1 text-sm font-semibold text-white hover:text-cyan-400 transition uppercase tracking-wide"
              >
                <span className="hidden sm:inline">Categories</span>
                <span className="sm:hidden">Menu</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategories && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCategories(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-700 bg-slate-800 shadow-2xl shadow-cyan-500/20 z-50">
                    <div className="p-2">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={cat.isSpecial ? `/store/${storeSlug}/collections` : `/store/${storeSlug}?category=${cat.slug}`}
                          onClick={() => setShowCategories(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-700 hover:text-cyan-400 transition ${
                            cat.isSpecial ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 font-bold' : ''
                          }`}
                        >
                          {cat.emoji && <span className="text-lg">{cat.emoji}</span>}
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              to={`/store/${storeSlug}/cart`}
              className="relative flex items-center gap-1.5 text-sm font-semibold text-white hover:text-cyan-400 transition uppercase tracking-wide"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-cyan-500/50">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <Link
                to={`/store/${storeSlug}/account`}
                className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-cyan-400 transition uppercase tracking-wide"
              >
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Account</span>
              </Link>
            ) : (
              <Link
                to={`/store/${storeSlug}/login`}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white hover:opacity-90 transition uppercase tracking-wide shadow-lg shadow-cyan-500/30"
              >
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* Search Bar (expandable) */}
        {showSearch && (
          <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  autoFocus
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/50 mb-4">
              <div className="h-full w-full rounded-full bg-slate-900 p-1">
                <img src={amdLogo} alt="AMD Gen Z" className="h-full w-full object-contain rounded-full" />
              </div>
            </div>
            <p className="font-display text-base text-white font-bold tracking-wide uppercase">
              AMD° GEN Z INVENTORY
            </p>
            <p className="mt-1 text-sm text-cyan-400">
              Exclusive drops for the real ones.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              © 2026 AMD Gen Z. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
