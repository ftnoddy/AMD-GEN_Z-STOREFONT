import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Customer } from '@/services/api';

const CUSTOMER_TOKEN_KEY = 'storefront_customer_token_';
const CUSTOMER_DATA_KEY = 'storefront_customer_data_';

function loadToken(storeSlug: string): string | null {
  if (!storeSlug) return null;
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY + storeSlug);
  } catch {
    return null;
  }
}

function loadCustomer(storeSlug: string): Customer | null {
  if (!storeSlug) return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_DATA_KEY + storeSlug);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveAuth(storeSlug: string, token: string, customer: Customer) {
  if (!storeSlug) return;
  try {
    localStorage.setItem(CUSTOMER_TOKEN_KEY + storeSlug, token);
    localStorage.setItem(CUSTOMER_DATA_KEY + storeSlug, JSON.stringify(customer));
  } catch (_) {}
}

function clearAuth(storeSlug: string) {
  if (!storeSlug) return;
  try {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY + storeSlug);
    localStorage.removeItem(CUSTOMER_DATA_KEY + storeSlug);
  } catch (_) {}
}

interface CustomerAuthContextValue {
  storeSlug: string | null;
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  setStoreSlug: (slug: string | null) => void;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({
  children,
  storeSlug,
}: {
  children: React.ReactNode;
  storeSlug: string | null;
}) {
  const [slug, setSlug] = useState<string | null>(storeSlug);
  const [token, setToken] = useState<string | null>(() => loadToken(storeSlug || ''));
  const [customer, setCustomer] = useState<Customer | null>(() => loadCustomer(storeSlug || ''));

  useEffect(() => {
    setSlug(storeSlug);
    setToken(loadToken(storeSlug || ''));
    setCustomer(loadCustomer(storeSlug || ''));
  }, [storeSlug]);

  const login = useCallback(
    (newToken: string, newCustomer: Customer) => {
      setToken(newToken);
      setCustomer(newCustomer);
      if (slug) saveAuth(slug, newToken, newCustomer);
    },
    [slug]
  );

  const logout = useCallback(() => {
    setToken(null);
    setCustomer(null);
    if (slug) clearAuth(slug);
  }, [slug]);

  const value: CustomerAuthContextValue = {
    storeSlug: slug,
    customer,
    token,
    isAuthenticated: !!token && !!customer,
    setStoreSlug: setSlug,
    login,
    logout,
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
