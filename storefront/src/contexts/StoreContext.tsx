import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStore } from '@/services/api';
import type { Store } from '@/services/api';

interface StoreContextValue {
  storeSlug: string | null;
  store: Store | null;
  loading: boolean;
  error: string | null;
  setStoreSlug: (slug: string | null) => void;
  refetch: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children,
  initialSlug,
}: {
  children: React.ReactNode;
  initialSlug: string | null;
}) {
  const [storeSlug, setStoreSlugState] = useState<string | null>(initialSlug);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    if (!storeSlug) {
      setStore(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getStore(storeSlug);
      setStore(data);
    } catch (e: any) {
      setStore(null);
      setError(e?.response?.status === 404 ? 'Store not found' : e?.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  }, [storeSlug]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const setStoreSlug = useCallback((slug: string | null) => {
    setStoreSlugState(slug);
  }, []);

  const value: StoreContextValue = {
    storeSlug,
    store,
    loading,
    error,
    setStoreSlug,
    refetch: fetchStore,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
