import { Link } from 'react-router-dom';

const defaultStore = import.meta.env.VITE_DEFAULT_STORE || 'techstore';

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-store-primary">Page not found</h1>
        <p className="mt-2 text-store-muted">The page you're looking for doesn't exist.</p>
        <Link
          to={`/store/${defaultStore}`}
          className="mt-6 inline-block rounded-lg bg-store-primary px-4 py-2 text-white hover:opacity-90"
        >
          Go to store
        </Link>
      </div>
    </div>
  );
}
