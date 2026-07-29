import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">Ye page exist nahi karta.</p>
      <Link to="/" className="bg-brand-700 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">
        Home Jao
      </Link>
    </div>
  );
}
