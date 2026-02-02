import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { customerLogin } from '@/services/api';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) return;
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, customer } = await customerLogin(storeSlug, {
        email: email.trim(),
        password: password.trim(),
      });
      login(token, customer);
      const from = (location.state as { from?: string })?.from || `/store/${storeSlug}`;
      navigate(from);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/50 mb-4">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900">
            <LogIn className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-white uppercase tracking-wider">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-400">Access your account and orders</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-3 text-sm text-red-300 font-medium">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-white uppercase tracking-wide">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 py-3.5 font-bold text-white hover:opacity-90 disabled:opacity-50 uppercase tracking-wide shadow-lg shadow-cyan-500/30"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to={`/store/${storeSlug}/register`} className="text-cyan-400 hover:text-cyan-300 font-semibold">
          Sign up
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-2">Test Account</p>
        <div className="space-y-1 text-xs text-white">
          <p>Email: <code className="rounded bg-slate-700 px-2 py-0.5 text-cyan-400">customer@example.com</code></p>
          <p>Password: <code className="rounded bg-slate-700 px-2 py-0.5 text-cyan-400">password123</code></p>
        </div>
      </div>
    </div>
  );
}
