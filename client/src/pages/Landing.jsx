import { Link } from 'react-router-dom';

const FEATURES = [
  ['📄', 'Bilty (LR) generation', 'Digital bilty seconds mein banao — number auto-generate, print-ready format.'],
  ['💰', 'Party ledger tracking', 'Har party ka balance khud-ba-khud update — kiska kitna baaki hai turant pata chale.'],
  ['🚚', 'Truck-wise P&L', 'Har gaadi ka kharcha aur kamai alag track karo — asli profit samajh mein aayega.'],
  ['🛣️', 'Trip status tracking', 'Loading se delivery tak trip ka status update karo, ek click mein.'],
  ['👥', 'Staff & role access', 'Team ko limited access do — owner ke paas full control rahta hai.'],
  ['📊', 'Reports on demand', 'Outstanding, expense aur trip reports turant dashboard par dekho.'],
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-900 text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">Z</span>
            Zipkart <span className="text-accent-500">Logistics</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm px-3 py-2 rounded-md hover:bg-white/10">Login</Link>
            <Link to="/register" className="text-sm px-4 py-2 rounded-md bg-accent-500 hover:bg-accent-600 font-semibold">Start Free</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-900 to-brand-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
            <span className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-5">
              Built for Indian transport &amp; fleet businesses
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              Ek jagah se sambhalo — bilty, hisaab aur pura fleet
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-2xl mx-auto">
              Zipkart Integrated Logistics aapke transport business ko digital banata hai — bilty banane se lekar
              party ka hisaab aur truck-wise profit tak, sab ek dashboard mein.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="bg-accent-500 hover:bg-accent-600 px-6 py-3 rounded-lg font-semibold">
                Free Account Banao
              </Link>
              <a href="#features" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold">
                Features Dekho
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-accent-600 font-semibold text-sm">Features</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">Jo roz kaam aata hai, sab yahan hai</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(([icon, title, desc]) => (
              <div key={title} className="rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-slate-500 mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-accent-600 font-semibold text-sm">Pricing</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">Apne business ke hisaab se plan choose karo</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 p-8">
                <h3 className="font-semibold text-lg">Starter</h3>
                <div className="mt-4 text-3xl font-extrabold">Free</div>
                <Link to="/register" className="mt-6 block text-center bg-slate-100 hover:bg-slate-200 rounded-lg py-2.5 font-semibold text-sm">Start Free</Link>
              </div>
              <div className="rounded-xl border-2 border-accent-500 p-8 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                <h3 className="font-semibold text-lg">Growth</h3>
                <div className="mt-4 text-3xl font-extrabold">Custom</div>
                <Link to="/register" className="mt-6 block text-center bg-accent-500 hover:bg-accent-600 text-white rounded-lg py-2.5 font-semibold text-sm">Get Started</Link>
              </div>
              <div className="rounded-xl border border-slate-200 p-8">
                <h3 className="font-semibold text-lg">Enterprise</h3>
                <div className="mt-4 text-3xl font-extrabold">Talk to us</div>
                <Link to="/register" className="mt-6 block text-center bg-slate-100 hover:bg-slate-200 rounded-lg py-2.5 font-semibold text-sm">Contact Sales</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Common sawal</h2>
          <div className="space-y-4">
            <details className="border border-slate-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">Kya mera data safe rehta hai?</summary>
              <p className="text-sm text-slate-500 mt-2">Haan, aapka data secure database mein store hota hai aur sirf aapki company ke users hi usse access kar sakte hain.</p>
            </details>
            <details className="border border-slate-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">Kya main staff ko limited access de sakta hoon?</summary>
              <p className="text-sm text-slate-500 mt-2">Bilkul — owner staff members add kar sakta hai aur unka access role ke hisaab se control kar sakta hai.</p>
            </details>
          </div>
        </section>

        <section className="bg-brand-900 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Apna transport business aaj hi digital karo</h2>
            <Link to="/register" className="mt-6 inline-block bg-accent-500 hover:bg-accent-600 px-6 py-3 rounded-lg font-semibold">
              Free Account Banao
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200">
        © {new Date().getFullYear()} Zipkart Integrated Logistics.
      </footer>
    </div>
  );
}
