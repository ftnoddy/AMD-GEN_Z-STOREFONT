import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CartItem {
  skuId: string;
  productId: string;
  productName: string;
  sku: string;
  variantInfo?: string;
  quantity: number;
  price: number;
}

const CART_KEY_PREFIX = 'storefront_cart_';

function loadCart(storeSlug: string): CartItem[] {
  if (!storeSlug) return [];
  try {
    const raw = localStorage.getItem(CART_KEY_PREFIX + storeSlug);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(storeSlug: string, items: CartItem[]) {
  if (!storeSlug) return;
  try {
    localStorage.setItem(CART_KEY_PREFIX + storeSlug, JSON.stringify(items));
  } catch (_) {}
}

interface CartContextValue {
  storeSlug: string | null;
  items: CartItem[];
  setStoreSlug: (slug: string | null) => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  removeItem: (skuId: string) => void;
  clearCart: () => void;
  getCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  storeSlug,
}: {
  children: React.ReactNode;
  storeSlug: string | null;
}) {
  const [slug, setSlug] = useState<string | null>(storeSlug);
  const [items, setItems] = useState<CartItem[]>(() => loadCart(storeSlug || ''));

  useEffect(() => {
    setSlug(storeSlug);
    setItems(loadCart(storeSlug || ''));
  }, [storeSlug]);

  useEffect(() => {
    if (slug) saveCart(slug, items);
  }, [slug, items]);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      const qty = Math.max(1, item.quantity ?? 1);
      setItems((prev) => {
        const existing = prev.find((i) => i.skuId === item.skuId);
        if (existing) {
          return prev.map((i) =>
            i.skuId === item.skuId ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const updateQuantity = useCallback((skuId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) return prev.filter((i) => i.skuId !== skuId);
      return prev.map((i) => (i.skuId === skuId ? { ...i, quantity } : i));
    });
  }, []);

  const removeItem = useCallback((skuId: string) => {
    setItems((prev) => prev.filter((i) => i.skuId !== skuId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getCount = useCallback(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const getSubtotal = useCallback(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    storeSlug: slug,
    items,
    setStoreSlug: setSlug,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCount,
    getSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
