import { useNavigate } from 'react-router-dom'
import { Coffee, Star, Users, ChefHat, BarChart3, Shield, Zap, ArrowRight, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

// 3D Floating Coffee Cup SVG
function FloatingCup({ className = '', style = {} }) {
  return (
    <div className={`animate-float ${className}`} style={style}>
      <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Steam wisps */}
        <path d="M45 20 Q42 12 45 4 Q48 12 45 20" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M60 18 Q57 8 60 0 Q63 8 60 18" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M75 20 Q72 12 75 4 Q78 12 75 20" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Cup body */}
        <path d="M25 35 L35 120 H85 L95 35 Z" fill="url(#cupGrad)" rx="4"/>
        <path d="M25 35 H95" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        {/* Cup highlight */}
        <path d="M30 45 L38 110" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round"/>
        {/* Saucer */}
        <ellipse cx="60" cy="122" rx="45" ry="8" fill="url(#saucerGrad)"/>
        <ellipse cx="60" cy="120" rx="43" ry="7" fill="url(#saucerTopGrad)"/>
        {/* Handle */}
        <path d="M95 55 Q118 55 118 75 Q118 95 95 95" stroke="url(#handleGrad)" strokeWidth="8" strokeLinecap="round" fill="none"/>
        {/* Coffee surface */}
        <ellipse cx="60" cy="38" rx="32" ry="6" fill="url(#coffeeGrad)"/>
        <defs>
          <linearGradient id="cupGrad" x1="25" y1="35" x2="95" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c0392b"/>
            <stop offset="100%" stopColor="#8B1A1A"/>
          </linearGradient>
          <linearGradient id="saucerGrad" x1="15" y1="122" x2="105" y2="122" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7b241c"/>
            <stop offset="50%" stopColor="#c0392b"/>
            <stop offset="100%" stopColor="#7b241c"/>
          </linearGradient>
          <linearGradient id="saucerTopGrad" x1="17" y1="120" x2="103" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#922b21"/>
            <stop offset="50%" stopColor="#e05555"/>
            <stop offset="100%" stopColor="#922b21"/>
          </linearGradient>
          <linearGradient id="handleGrad" x1="95" y1="55" x2="118" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c0392b"/>
            <stop offset="100%" stopColor="#8B1A1A"/>
          </linearGradient>
          <radialGradient id="coffeeGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#5c3317"/>
            <stop offset="100%" stopColor="#3b1f0a"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

// 3D Orb background element
function Orb({ size, color, x, y, duration, opacity = 0.25 }) {
  return (
    <div
      className="orb absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 40% 40%, ${color}, transparent 70%)`,
        left: x,
        top: y,
        opacity,
        '--duration': duration,
        filter: 'blur(40px)',
      }}
    />
  )
}

// Feature card with 3D tilt
function FeatureCard({ icon: Icon, title, desc, delay }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`
  }
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="card shine p-6 cursor-default transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, animation: `rise 0.6s ${delay}ms cubic-bezier(0.16,1,0.3,1) both`, transformStyle: 'preserve-3d' }}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4 shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-display text-lg font-bold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// Stat counter
function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-brand-200 text-sm font-medium">{label}</div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const features = [
    { icon: Zap, title: 'Real-time Orders', desc: 'Instant order sync between tables, kitchen, and waitstaff with live WebSocket updates.' },
    { icon: ChefHat, title: 'Kitchen Display', desc: 'Dedicated KDS with urgency indicators, order timers, and one-tap completion.' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'Revenue charts, waiter performance heatmaps, and trend analysis at a glance.' },
    { icon: Users, title: 'Multi-role Access', desc: 'Admin, waiter, and kitchen roles with secure, isolated dashboards.' },
    { icon: Shield, title: 'Coupon Engine', desc: 'Create and manage discount coupons with flexible value or percent reductions.' },
    { icon: Star, title: 'Table QR Ordering', desc: 'Customers scan a QR code to browse the menu and place orders independently.' },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: 'Nunito, sans-serif', background: '#fdf8f4' }}>

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-surface-200' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className={`font-display text-xl font-bold ${scrolled ? 'text-surface-900' : 'text-white'}`}>Velvet Brew</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Roles', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className={`text-sm font-semibold transition-colors ${scrolled ? 'text-surface-600 hover:text-brand-600' : 'text-white/80 hover:text-white'}`}>
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/staff/login')}
              className={`hidden md:block px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                scrolled
                  ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}>
              Staff Login
            </button>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden text-white p-1">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-surface-200 px-6 py-4 space-y-3">
            {['Features', 'Roles', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-surface-700">{item}</a>
            ))}
            <button onClick={() => navigate('/staff/login')} className="w-full btn-primary justify-center mt-2">
              Staff Login
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center velvet-bg">
        {/* Animated orbs */}
        <Orb size="600px" color="#ff6b6b" x="-100px" y="-100px" duration="10s" opacity={0.2} />
        <Orb size="500px" color="#ffd700" x="60%" y="30%" duration="14s" opacity={0.12} />
        <Orb size="400px" color="#8B1A1A" x="20%" y="60%" duration="12s" opacity={0.3} />
        <Orb size="300px" color="#f5e8d0" x="80%" y="10%" duration="9s" opacity={0.1} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-6xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div style={{ animation: 'rise 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Premium Cafe Management
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
              Elevate Your<br />
              <span className="italic" style={{ color: '#f5e8d0' }}>Cafe</span> Experience
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              A complete Point-of-Sale system crafted for modern cafes — beautiful design, real-time sync, and powerful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/staff/login')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-beige-100 transition-all duration-200 hover:-translate-y-0.5 shadow-xl">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all duration-200">
                Explore Features
              </a>
            </div>
          </div>

          {/* Right 3D visual */}
          <div className="relative hidden lg:flex items-center justify-center" style={{ animation: 'rise 1s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
            {/* Background glow rings */}
            <div className="absolute w-72 h-72 rounded-full border border-white/10 animate-[spin_30s_linear_infinite]" />
            <div className="absolute w-56 h-56 rounded-full border border-white/15 animate-[spin_20s_linear_infinite_reverse]" />

            {/* Main floating cup */}
            <FloatingCup />

            {/* Floating stats cards */}
            <div className="absolute -left-8 top-16 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/40"
              style={{ animation: 'float 5s 0.5s ease-in-out infinite' }}>
              <div className="text-xs text-surface-500 mb-0.5">Today's Revenue</div>
              <div className="font-display font-bold text-surface-900 text-lg">₹24,850</div>
              <div className="text-emerald-500 text-xs font-semibold">↑ 18% vs yesterday</div>
            </div>

            <div className="absolute -right-4 bottom-16 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/40"
              style={{ animation: 'float 7s 1s ease-in-out infinite' }}>
              <div className="text-xs text-surface-500 mb-0.5">Active Tables</div>
              <div className="font-display font-bold text-surface-900 text-lg">12 / 20</div>
              <div className="text-brand-500 text-xs font-semibold">4 awaiting payment</div>
            </div>

            <div className="absolute right-8 top-4 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-xl border border-white/40"
              style={{ animation: 'float 6s 2s ease-in-out infinite' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-surface-800">Kitchen</div>
                  <div className="text-xs text-emerald-600">6 in progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 80H1440V30C1200 70 960 10 720 40C480 70 240 10 0 30V80Z" fill="#fdf8f4"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────── */}
      <section className="velvet-bg py-14">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem value="20+" label="Table Types" />
            <StatItem value="∞" label="Menu Items" />
            <StatItem value="3" label="Staff Roles" />
            <StatItem value="Real-time" label="Order Sync" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-4 border border-brand-100">
            ✦ Everything you need
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-surface-900 mb-4">
            Powerful Features,<br/><span className="italic text-brand-600">Elegant Design</span>
          </h2>
          <p className="text-surface-500 max-w-lg mx-auto leading-relaxed">
            Built for busy cafes, Velvet Brew brings order management, analytics, and team coordination into one beautiful platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────── */}
      <section id="roles" className="py-24 bg-surface-900 relative overflow-hidden">
        <Orb size="500px" color="#c0392b" x="-50px" y="-50px" duration="12s" opacity={0.15} />
        <Orb size="400px" color="#f5e8d0" x="70%" y="50%" duration="16s" opacity={0.07} />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Designed for Every Role</h2>
            <p className="text-surface-400 max-w-md mx-auto">Three dedicated dashboards, each tailored for the way your team works.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Admin', color: 'from-brand-500 to-brand-700', desc: 'Full control — manage menus, staff, floors, analytics, and settings from a rich dashboard.' },
              { icon: Users, title: 'Waiter', color: 'from-amber-500 to-orange-600', desc: 'Floor map view, session management, order placement, and real-time kitchen notifications.' },
              { icon: ChefHat, title: 'Kitchen', color: 'from-emerald-500 to-green-700', desc: 'Urgent order queue with timers, item availability toggles, and instant completion.' },
            ].map(({ icon: Icon, title, color, desc }) => (
              <div key={title} className="relative rounded-2xl p-6 border border-surface-700 bg-surface-800/60 backdrop-blur-sm hover:border-surface-500 transition-all">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4">
            <FloatingCup className="mx-auto" style={{ width: 80, height: 90 }} />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-surface-900 mb-6">
            Ready to Brew<br/><span className="italic text-brand-600">Something Great?</span>
          </h2>
          <p className="text-surface-500 mb-10 leading-relaxed">
            Velvet Brew POS — built with love for cafe owners who care about craft.
          </p>
          <button
            onClick={() => navigate('/staff/login')}
            className="btn-primary text-base px-10 py-4 rounded-2xl shadow-velvet hover:shadow-velvet-lg">
            Launch Dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-surface-400 text-sm mt-4">Default: admin@cafe.com / admin123</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-surface-200 py-8 px-6 text-center text-surface-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
            <Coffee className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-surface-700">Velvet Brew POS</span>
        </div>
        Crafted with ☕ — Odoo Cafe POS System
      </footer>
    </div>
  )
}
