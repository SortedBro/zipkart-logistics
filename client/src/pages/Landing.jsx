import { useState } from 'react';
import { Link } from 'react-router-dom';

const CLIENTS = [
  {
    name: 'Flipkart',
    category: 'E-Commerce Marketplace',
    tagline: 'Full FTL & Regional Transport Partner',
    bgColor: 'bg-blue-50 border-blue-200',
    logo: (
      <div className="flex items-center gap-1 font-black text-2xl tracking-tighter text-[#2874F0]">
        <span>Flipkart</span>
        <div className="w-6 h-6 rounded bg-[#FFE500] flex items-center justify-center text-[#2874F0] font-black text-xs shadow-sm transform rotate-3">
          f
        </div>
      </div>
    ),
  },
  {
    name: 'Flipkart Minutes',
    category: 'Quick Commerce Logistics',
    tagline: '10-Minute Express Darkstore Transit',
    bgColor: 'bg-pink-50 border-pink-200',
    logo: (
      <div className="bg-[#9E0B49] text-white px-3.5 py-1.5 rounded-lg flex flex-col items-center shadow-md">
        <span className="text-[10px] font-bold tracking-widest text-slate-200 uppercase">Flipkart</span>
        <span className="text-[#FFEA00] font-black text-sm tracking-wider italic uppercase">MINUTES</span>
      </div>
    ),
  },
  {
    name: 'Meesho',
    category: 'Social E-Commerce Leader',
    tagline: 'Pan-India Last Mile & PTL Dispatch',
    bgColor: 'bg-purple-50 border-purple-200',
    logo: (
      <div className="flex items-center gap-1 font-black text-2xl tracking-tight text-[#812450]">
        <span>meesho</span>
      </div>
    ),
  },
  {
    name: 'Myntra',
    category: 'Fashion & Lifestyle Retail',
    tagline: 'Dedicated Hub-to-Hub Express Transit',
    bgColor: 'bg-orange-50 border-orange-200',
    logo: (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-orange-500 to-pink-600 bg-clip-text text-transparent">
          Myntra
        </span>
      </div>
    ),
  },
  {
    name: 'Blinkit',
    category: 'Quick Commerce & Hyperlocal',
    tagline: 'Rapid Grocery & Darkstore Replenishment',
    bgColor: 'bg-amber-50 border-amber-200',
    logo: (
      <div className="flex items-center gap-0.5 text-2xl font-black">
        <span className="text-slate-900">blink</span>
        <span className="text-[#148535]">it</span>
      </div>
    ),
  },
  {
    name: 'V-Xpress',
    category: 'Express Cargo & Door-to-Door',
    tagline: 'Heavy Freight & Nationwide Parcel Express',
    bgColor: 'bg-indigo-50 border-indigo-200',
    logo: (
      <div className="flex items-center gap-1 text-2xl font-black text-[#1B365D]">
        <span className="text-[#F58220] italic">V-</span>Xpress
      </div>
    ),
  },
];

const SERVICES = [
  {
    title: '3PL Warehousing & CFA Management',
    desc: 'State-of-the-art warehousing, inventory control, and complete CFA management tailored for high-volume enterprise operations.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Primary & Secondary Transportation',
    desc: 'End-to-end freight transit solutions with full-truckload (FTL) and part-truckload (PTL) coverage across all major routes.',
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Route & Fleet Management Services',
    desc: 'Digital vehicle tracking, automated Bilty (LR) generation, truck-wise P&L analytics, and document expiry reminders.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: 'Digital Bilty (LR) Generation',
    desc: 'Generate professional, print-ready Bilty invoices in seconds with auto LR numbering, freight calculation, and WhatsApp shareability.',
    icon: '📄',
  },
  {
    title: 'Truck-Wise P&L & Fuel Expense Tracking',
    desc: 'Monitor exact revenue vs expense (fuel, toll, driver salary, maintenance) for every vehicle in your fleet.',
    icon: '🚚',
  },
  {
    title: 'Party Ledger & Automated Billing',
    desc: 'Real-time party balance tracking, automated ledger statements, and instant payment receipt accounting.',
    icon: '💰',
  },
  {
    title: 'Document Archival & Compliance',
    desc: 'Upload and securely store RC, Insurance, Permit, Fitness, PUC, and Tax documents with automated expiry alert reminders.',
    icon: '📂',
  },
  {
    title: 'Trip Lifecycle Tracking',
    desc: 'Track trip status seamlessly from dispatch and loading to transit checkpoints and destination delivery.',
    icon: '🛣️',
  },
  {
    title: 'Staff Roles & Access Control',
    desc: 'Grant custom access permissions to drivers, managers, and accountants while owner retains full financial control.',
    icon: '👥',
  },
];

const INDUSTRIES = [
  { name: 'FMCG & Consumer Goods', icon: '🛒' },
  { name: 'E-Commerce & Quick Commerce', icon: '📦' },
  { name: 'Pharmaceuticals & Healthcare', icon: '💊' },
  { name: 'Industrial & Heavy Manufacturing', icon: '🏗️' },
  { name: 'Agro & Perishable Products', icon: '🌾' },
  { name: 'Automobile & Ancillaries', icon: '⚙️' },
];

const STATS = [
  { value: '500+', label: 'Active Fleet Vehicles' },
  { value: '50,000+', label: 'Digital Bilties Issued' },
  { value: '99.9%', label: 'On-Time Transit Safety' },
  { value: '100+', label: 'Enterprise Clients' },
];

export default function Landing() {
  const [contactForm, setContactForm] = useState({ name: '', phone: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleContactSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      {/* 1. Top Utility Header */}
      <div className="bg-[#152554] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@zipkartlogistics.com
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              0771-6614848 / +91 98765 43210
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Logistics Park, India</span>
            <span className="text-white/30">|</span>
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Portal Login</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              Z
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-blue-950">Zipkart</span>
              <span className="text-orange-500 font-extrabold text-xl ml-1">Logistics</span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">Integrated 3PL &amp; Fleet Solutions</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#services" className="hover:text-blue-700 transition">Services</a>
            <a href="#clients" className="hover:text-blue-700 transition">Clients</a>
            <a href="#solutions" className="hover:text-blue-700 transition">Features</a>
            <a href="#industries" className="hover:text-blue-700 transition">Industries</a>
            <a href="#contact" className="hover:text-blue-700 transition">Contact Us</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold px-4 py-2 text-blue-900 hover:text-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition flex items-center gap-1.5"
            >
              Start Free Trial
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0F1E42] via-[#1A2E63] to-[#0F1E42] text-white overflow-hidden py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
              Complete Integrated 3PL Logistics &amp; Fleet Management
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Trust us to elevate your logistics with <span className="text-orange-400">precision &amp; excellence</span> at every turn.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Our core competency lies in providing <strong>Complete Integrated 3PL Logistics Solutions</strong>: CFA Management, Customized Warehousing, Primary &amp; Secondary Transportation, Last Mile Delivery, Digital Bilty, and Fleet Profitability Analytics.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl hover:shadow-orange-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Get Started Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="#services"
                className="px-7 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition"
              >
                Explore Services
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl text-white space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-bold text-lg">Instant Transport Management</h3>
                <span className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded font-semibold">Live System</span>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">LR / Bilty Generator</span>
                    <span className="font-semibold text-white">Instant PDF &amp; Auto LR Numbering</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-xs">Ready</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Fleet &amp; Driver Control</span>
                    <span className="font-semibold text-white">Vehicle Expiry &amp; Maintenance</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-xs">Active</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Party Accounts &amp; Ledgers</span>
                    <span className="font-semibold text-white">Automated Ledger &amp; P&amp;L</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-xs">Tracked</span>
                </div>
              </div>

              <Link
                to="/register"
                className="block text-center w-full py-3 bg-white text-blue-950 font-bold rounded-xl text-sm shadow hover:bg-slate-100 transition"
              >
                Create Free Company Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 3 Core Service Banner Strip */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="p-3 rounded-xl bg-slate-100 w-fit mb-4">{s.icon}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 uppercase tracking-wider"
              >
                Inquire Now &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OUR TRUSTED CLIENTS SHOWCASE SECTION */}
      <section id="clients" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-orange-500 font-extrabold text-xs tracking-widest uppercase">
            Trusted By Industry Leaders
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Powering Logistics For India’s Top Enterprises &amp; E-Commerce Giants
          </h2>
          <p className="text-slate-600 text-sm">
            We deliver high-efficiency 3PL warehousing, Darkstore replenishment, and nationwide express transit for leading brands.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CLIENTS.map((c, i) => (
            <div
              key={i}
              className={`${c.bgColor} rounded-2xl border p-5 flex flex-col items-center justify-between text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1 group min-h-[160px]`}
            >
              <div className="h-16 flex items-center justify-center w-full">
                {c.logo}
              </div>
              <div className="mt-2 border-t border-slate-200/60 pt-2 w-full">
                <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{c.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Comprehensive Features Section */}
      <section id="solutions" className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-blue-700 font-extrabold text-xs tracking-widest uppercase">
              All-In-One Operations Platform
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Everything your transport &amp; 3PL enterprise needs
            </h2>
            <p className="text-slate-600 text-sm">
              Simplify daily dispatch, Party accounting, vehicle P&amp;L, and document compliance in one unified portal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="text-4xl">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-base">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Stats Section */}
      <section className="bg-[#152554] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-4xl font-extrabold text-orange-400">{st.value}</div>
                <div className="text-xs text-slate-300 font-medium tracking-wide uppercase">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Industries We Serve Section */}
      <section id="industries" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-blue-700 font-extrabold text-xs tracking-widest uppercase">
            Specialized Vertical Expertise
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Industries we serve across India
          </h2>
          <p className="text-slate-600 text-sm">
            Delivering tailored 3PL warehousing and transport operations across diverse commercial sectors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INDUSTRIES.map((ind, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-3xl">{ind.icon}</span>
              <span className="text-xs font-bold text-slate-800 leading-tight">{ind.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Contact & Inquiry Section */}
      <section id="contact" className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-orange-500 font-extrabold text-xs tracking-widest uppercase">Get In Touch</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Ready to transform your logistics operations?</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect with our logistics experts to discuss customized 3PL warehousing, fleet deployment, or digital Bilty management.
            </p>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Corporate Address</span>
                  <span>Logistics Park, Raipur - 492001, Chhattisgarh, India.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Email Us</span>
                  <span>info@zipkartlogistics.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
            <h3 className="font-bold text-xl text-slate-900 mb-4">Send Us a Message</h3>

            {submitted ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-semibold border border-emerald-200">
                Thank you! Your message has been received. Our team will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Zipkart Express"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Requirement Details</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your fleet or logistics requirements..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg py-3 text-sm shadow transition"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#0D1836] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-400">
          <div className="space-y-3">
            <div className="font-extrabold text-lg text-white">Zipkart Logistics</div>
            <p className="leading-relaxed">
              Complete Integrated 3PL Logistics, CFA Management, Fleet Tracking, and Bilty Operations platform.
            </p>
          </div>

          <div>
            <span className="font-bold text-white block text-sm mb-3 uppercase tracking-wider">Quick Links</span>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-white">Our Services</a></li>
              <li><a href="#clients" className="hover:text-white">Our Clients</a></li>
              <li><a href="#solutions" className="hover:text-white">Features &amp; Bilty</a></li>
              <li><a href="#industries" className="hover:text-white">Industries Served</a></li>
              <li><Link to="/login" className="hover:text-white">Portal Sign In</Link></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white block text-sm mb-3 uppercase tracking-wider">Solutions</span>
            <ul className="space-y-2">
              <li><span>3PL Warehousing</span></li>
              <li><span>Primary &amp; Secondary Transit</span></li>
              <li><span>Fleet P&amp;L Analytics</span></li>
              <li><span>Digital Bilty Generation</span></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white block text-sm mb-3 uppercase tracking-wider">Contact</span>
            <p>Logistics Park, India</p>
            <p className="mt-1">Phone: 0771-6614848</p>
            <p className="mt-1">Email: info@zipkartlogistics.com</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-white/10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Zipkart Integrated Logistics. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
