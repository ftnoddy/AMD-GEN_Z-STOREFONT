import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { customerRegister } from '@/services/api';

export default function Register() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, customer } = await customerRegister(storeSlug, {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
      });
      login(token, customer);
      navigate(`/store/${storeSlug}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-store-primary">Create account</h1>
      <p className="mt-1 text-sm text-store-muted">Sign up to track your orders.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-store-primary">
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-store-accent focus:outline-none focus:ring-1 focus:ring-store-accent"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-store-primary">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-store-accent focus:outline-none focus:ring-1 focus:ring-store-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-store-primary">
            Password *
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-store-accent focus:outline-none focus:ring-1 focus:ring-store-accent"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-store-primary">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-store-accent focus:outline-none focus:ring-1 focus:ring-store-accent"
            placeholder="Optional"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-store-accent py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-store-muted">
        Already have an account?{' '}
        <Link to={`/store/${storeSlug}/login`} className="text-store-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
