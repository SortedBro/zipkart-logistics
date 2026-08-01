import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ZipkartLogo from '../components/ZipkartLogo.jsx';

/* ------------------------------------------------------------------ data */

const SERVICE_STRIP = [
  { title: 'Road Freight', desc: 'Reliable ground transportation for all your cargo needs.', icon: '🚛' },
  { title: 'CFA', desc: 'Comprehensive carrying & forwarding agent services.', icon: '📋' },
  { title: 'Warehousing', desc: 'Secure storage solutions with advanced WMS systems.', icon: '🏭' },
  { title: 'Part Truck Load', desc: 'Cost-effective solutions for smaller shipments.', icon: '📦' },
];

const ABOUT_POINTS = [
  { title: 'Professionalism', desc: 'Expert logistics solutions', icon: '🎯' },
  { title: 'Facilities & Flexibility', desc: 'Adaptable to your needs', icon: '🧰' },
  { title: 'Reverse Logistics', desc: 'Complete supply chain', icon: '🔄' },
  { title: '24/7 Support', desc: 'Always here to help', icon: '🎧' },
];

const STATS = [
  { target: 500, suffix: '+', label: 'Our Vehicles' },
  { target: 1200, suffix: '+', label: 'Vendor Vehicles' },
  { target: 200, suffix: '+', label: 'Operation Sites' },
  { target: 6, suffix: '+', label: 'Years Experience' },
];

const SERVICES = [
  { title: 'Procurement Logistics', desc: 'Demand forecasting across seasonal and festive spikes, with industry-based procurement scheduling for supply-side efficiency.', icon: '📈' },
  { title: 'Order Management', desc: 'Full WMS order processing with FIFO & FEFO discipline to protect against price and shelf-life sensitivity at optimum cost.', icon: '🗂️' },
  { title: 'Supply Chain Management', desc: 'End-to-end control of goods from origin to consumption — strengthening working capital and lowering total landed cost.', icon: '🔗' },
  { title: 'Road Freight Management', desc: 'FTL & PTL services across India with excellent tracking systems, timely delivery, and cost-effective routing.', icon: '🚚' },
  { title: 'Warehouse Management', desc: 'Careful handling of every asset, parcel, and pallet with a fast, damage-free product management procedure.', icon: '🏬' },
  { title: '24/7 Active Support', desc: 'An experienced round-the-clock team that keeps your logistics running without interruption.', icon: '🛎️' },
];

const WHY = [
  { title: 'Proven Experience', desc: 'Years of expertise in logistics and supply-chain complexity, delivering solutions that actually work.', icon: '🏆' },
  { title: 'Tech-Enabled Solutions', desc: 'Digital dispatch, real-time tracking, and complete visibility across your supply chain.', icon: '💻' },
  { title: 'Pan-India Network', desc: 'Coverage across all major cities and regions, reaching even remote destinations efficiently.', icon: '🗺️' },
  { title: '24/7 Customer Support', desc: 'A dedicated support team available round the clock for smooth operations at all times.', icon: '📞' },
  { title: 'Safety & Security', desc: 'GPS-enabled vehicles, insurance, and strict safety protocols protect your cargo throughout its journey.', icon: '🛡️' },
  { title: 'Cost-Effective Solutions', desc: 'Competitive pricing without compromising quality, reducing your costs while keeping efficiency high.', icon: '💰' },
];

const TESTIMONIALS = [
  { initials: 'RS', name: 'Rajesh Sharma', role: 'Manufacturing Industry', quote: 'A trusted logistics partner for years. Timely delivery, professional handling, and excellent service have made our supply chain seamless.' },
  { initials: 'PK', name: 'Priya Kumar', role: 'E-commerce Business', quote: 'Timely deliveries are crucial for us, and they consistently exceed expectations. The tracking system gives complete visibility of our inventory.' },
  { initials: 'AM', name: 'Amit Mehta', role: 'FMCG Distribution', quote: 'Their CFA services and warehousing solutions optimized our multi-state distribution network and reduced our costs significantly.' },
];

const ASSOCIATES = [
  '/img/associate-1.jpeg',
  '/img/associate-2.jpeg',
  '/img/associate-3.jpeg',
  '/img/associate-4.jpeg',
  '/img/associate-5.jpeg',
  '/img/associate-6.jpeg',
];

const FAQS = [
  { q: 'What types of transportation services do you offer?', a: 'A full range including Full Truck Load (FTL), Part Truck Load (PTL), warehousing, CFA (Carrying & Forwarding Agent) services, and complete supply-chain management across all major routes in India.' },
  { q: 'How can I track my shipment?', a: 'Every shipment gets a unique LR number. Track its live status from the Track Shipment page, or contact our support team any time for an update.' },
  { q: 'What are your warehousing capabilities?', a: 'State-of-the-art facilities with a full Warehouse Management System, FIFO/FEFO discipline, secure storage, and strategic locations for optimal distribution.' },
  { q: 'How do you ensure the safety of goods in transit?', a: 'GPS-enabled vehicles, regular maintenance, experienced drivers, comprehensive insurance, and strict loading/unloading protocols keep cargo safe end-to-end.' },
  { q: 'What areas do you service?', a: 'All major cities and regions across India — metros, tier-2 cities, and rural locations — through our extensive partner network.' },
  { q: 'How can I get a quote?', a: 'Use the contact form below, call us, or reach out on WhatsApp with your origin, destination, cargo type, and volume — we respond with a competitive quote within 24 hours.' },
];

const DOT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

/* ------------------------------------------------------------------ helpers */

function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Counter({ target, suffix = '', decimals = 0, duration = 1600 }) {
  const [ref, inView] = useInView(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null, raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-IN');
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ------------------------------------------------------------------ page */

export default function Landing() {
  const [contactForm, setContactForm] = useState({ name: '', phone: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function handleContactSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  }

  const sectionLabel = 'text-brand-600 font-extrabold text-xs tracking-widest uppercase';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      {/* Top utility bar */}
      <div className="bg-brand-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-blue-100/80">
              <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              info@zipkartlogistics.com
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-blue-100/80">
              <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              +91 98765 43210
            </span>
          </div>
          <Link to="/login" className="text-accent-400 hover:text-accent-300 font-semibold">Staff &amp; Admin Portal Sign In →</Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3"><ZipkartLogo className="h-12" /></Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#about" className="hover:text-brand-600 transition">About</a>
            <a href="#services" className="hover:text-brand-600 transition">Services</a>
            <a href="#why" className="hover:text-brand-600 transition">Why Us</a>
            <a href="#associates" className="hover:text-brand-600 transition">Associates</a>
            <a href="#contact" className="hover:text-brand-600 transition">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold px-4 py-2 text-brand-900 hover:text-brand-600 transition">Sign In</Link>
            <Link to="/login" className="text-sm font-bold px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg transition">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero — full-bleed photo + overlay (B-TRANS style) */}
      <section className="relative min-h-[560px] lg:min-h-[720px] flex items-center text-white overflow-hidden">
        <img src="/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/80 to-brand-800/40"></div>
        <div className="absolute inset-0" style={{ backgroundImage: DOT_PATTERN }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 py-20 w-full">
          <div className="max-w-2xl space-y-6 reveal">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-400/20 border border-accent-400/40 text-accent-300 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping"></span>
              Modern &amp; Trusted Logistics Company
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.03] tracking-tight drop-shadow-lg">
              Transportation<br /><span className="text-accent-400">With Zipkart</span>
            </h1>
            <p className="text-lg text-blue-50/90 max-w-xl leading-relaxed">
              Your trusted partner for secure, technology-driven logistics and warehousing services across India.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a href="#services" className="px-8 py-4 rounded-xl bg-accent-400 hover:bg-accent-300 text-brand-900 font-extrabold text-sm shadow-xl transition transform hover:-translate-y-0.5">Our Services</a>
              <a href="#contact" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/30 transition">Contact Us</a>
              <Link to="/track" className="px-5 py-4 rounded-xl text-white/90 hover:text-white font-semibold text-sm inline-flex items-center gap-2">📍 Track Shipment</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service strip (4 cards, overlapping hero) */}
      <section id="services-strip" className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_STRIP.map((s, i) => (
            <div key={i} className="reveal bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              <a href="#services" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 uppercase tracking-wider">Learn More &rarr;</a>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative reveal">
          <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] ring-1 ring-slate-200">
            <img src="/hero-bg.png" alt="Zipkart logistics fleet" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="absolute -bottom-6 -right-4 sm:right-6 bg-accent-400 text-brand-900 rounded-2xl px-6 py-4 shadow-xl text-center">
            <div className="text-3xl font-extrabold leading-none">6+</div>
            <div className="text-[11px] font-bold uppercase tracking-wide mt-1">Years Experience</div>
          </div>
        </div>
        <div className="space-y-6 reveal">
          <span className={sectionLabel}>About Us</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">Modern &amp; Trusted<br />Logistics Company</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Zipkart Integrated Logistics delivers secure, convenient, and technology-first transportation across India. We combine the reliability of an established fleet operator with a modern digital operations platform — Bilty dispatch, party ledgers, truck-wise P&amp;L, and live trip tracking.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our goal is simple: meet the demands of clients and customers with adequate, efficient, and low-cost transportation and logistics services — every single time.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {ABOUT_POINTS.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl shrink-0">{p.icon}</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="#services" className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow transition">Learn More About Us →</a>
        </div>
      </section>

      {/* Company Statistics */}
      <section className="relative bg-gradient-to-r from-brand-600 to-brand-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: DOT_PATTERN }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2 reveal">
            <span className="text-accent-400 font-extrabold text-xs tracking-widest uppercase">Company Statistics</span>
            <h2 className="text-3xl font-extrabold">We Are Professional Logistics, Transportation &amp; Warehousing</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((st, i) => (
              <div key={i} className="reveal space-y-1">
                <div className="text-4xl sm:text-5xl font-extrabold text-accent-400"><Counter target={st.target} suffix={st.suffix} /></div>
                <div className="text-xs text-blue-100/70 font-medium tracking-wide uppercase">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 reveal">
          <span className={sectionLabel}>Our Services</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">We Are Very Trusted For Our Services</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <div key={i} className="reveal group bg-white rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg hover:border-brand-200 transition space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-600 group-hover:text-white text-3xl flex items-center justify-center transition">{s.icon}</div>
              <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              <a href="#contact" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 uppercase tracking-wider">Learn More &rarr;</a>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="py-20 bg-gradient-to-br from-slate-50 to-brand-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 reveal">
            <span className={sectionLabel}>Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Why Zipkart Is Your Best Choice</h2>
            <p className="text-slate-600 text-sm">Excellence through our commitment to quality, reliability, and customer satisfaction.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY.map((w, i) => (
              <div key={i} className="reveal bg-white rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg transition flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-2xl shrink-0">{w.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{w.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 reveal">
          <span className={sectionLabel}>Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What Our Clients Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="reveal bg-white rounded-2xl border border-slate-200 p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">{t.initials}</div>
                <div>
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
              <div className="text-accent-400 text-lg">★★★★★</div>
              <p className="text-sm text-slate-600 leading-relaxed italic">“{t.quote}”</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Our Associates */}
      <section id="associates" className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 reveal">
            <span className={sectionLabel}>Our Associates</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Trusted by Leading Brands</h2>
            <p className="text-slate-600 text-sm">Proud to partner with industry leaders and deliver exceptional logistics solutions.</p>
          </div>
          <div className="marquee-viewport overflow-hidden reveal">
            <div className="marquee-track items-center gap-12 sm:gap-16 py-4">
              {[...ASSOCIATES, ...ASSOCIATES].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Associate logo"
                  loading="lazy"
                  aria-hidden={i >= ASSOCIATES.length}
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain shrink-0 grayscale hover:grayscale-0 transition duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3 reveal">
          <span className={sectionLabel}>FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="reveal bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="font-bold text-slate-800 text-sm">{f.q}</span>
                <span className={`text-brand-600 text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA band — yellow (B-TRANS style) */}
      <section className="relative bg-gradient-to-r from-accent-400 to-accent-500 text-brand-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Need Reliable Transportation Solutions?</h2>
            <p className="text-brand-900/80 text-sm mt-2 max-w-2xl font-medium">Contact our experienced 24×7 team for logistics services tailored to your requirements.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a href="#contact" className="px-7 py-3.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-sm shadow-lg transition">Contact Us Now</a>
            <a href="tel:+919876543210" className="font-extrabold text-brand-900 hover:text-brand-700">+91 98765 43210</a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6 space-y-6 reveal">
          <span className={sectionLabel}>Contact Operations</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Get in touch with our team</h2>
          <p className="text-sm text-slate-600 leading-relaxed">For fleet inquiries, staff access support, or internal operations assistance, reach our corporate team.</p>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-100 text-brand-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
              <div><span className="font-bold block text-slate-900">Corporate Address</span><span>Logistics Park, Raipur - 492001, Chhattisgarh, India.</span></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-100 text-brand-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
              <div><span className="font-bold block text-slate-900">Call / WhatsApp</span><span>+91 98765 43210</span></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-100 text-brand-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
              <div><span className="font-bold block text-slate-900">Email Us</span><span>info@zipkartlogistics.com</span></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-lg p-8 reveal">
          <h3 className="font-bold text-xl text-slate-900 mb-4">Send us an inquiry</h3>
          {submitted ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-semibold border border-emerald-200">Thank you! Your message has been received. Our team will contact you shortly.</div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                <input required type="text" placeholder="e.g. Rahul Sharma" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input required type="text" placeholder="e.g. +91 98765 43210" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                  <input type="text" placeholder="e.g. Zipkart Express" value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inquiry Details</label>
                <textarea rows={3} placeholder="Tell us about your requirements..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg py-3 text-sm shadow transition">Submit Inquiry</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-brand-900 text-white py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: DOT_PATTERN }}></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-blue-100/70">
            <div className="space-y-3">
              <ZipkartLogo className="h-10" variant="dark" />
              <p className="leading-relaxed">Your trusted partner for secure and convenient logistics services — integrated 3PL, CFA, fleet tracking, and digital Bilty operations.</p>
            </div>
            <div>
              <span className="font-bold text-white block text-sm mb-3 uppercase tracking-wider">Company</span>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-accent-400">About Us</a></li>
                <li><a href="#services" className="hover:text-accent-400">Our Services</a></li>
                <li><a href="#why" className="hover:text-accent-400">Why Us</a></li>
                <li><a href="#associates" className="hover:text-accent-400">Our Associates</a></li>
                <li><Link to="/login" className="hover:text-accent-400">Staff Sign In</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-white block text-sm mb-3 uppercase tracking-wider">Services</span>
              <ul className="space-y-2">
                <li>Road Freight (FTL / PTL)</li>
                <li>CFA &amp; Warehousing</li>
                <li>Supply Chain Management</li>
                <li>Digital Bilty Generation</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-white block text-sm mb-3 uppercase tracking-wider">Contact</span>
              <p>Logistics Park, Raipur, India</p>
              <p className="mt-1">Phone: +91 98765 43210</p>
              <p className="mt-1">Email: info@zipkartlogistics.com</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-white/10 text-center text-xs text-blue-100/50">
            © {new Date().getFullYear()} Zipkart Integrated Logistics. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl transition transform hover:scale-105">
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </div>
  );
}
