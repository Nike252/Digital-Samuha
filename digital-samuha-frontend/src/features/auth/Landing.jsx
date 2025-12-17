import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Photos/ds_logo.png';
import heroImage from '../../assets/hero-image.jpg';

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    if (isNaN(end)) { setCount(target); return; }
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += Math.ceil(end / 60);
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target]);
  return <>{typeof count === 'number' ? count.toLocaleString() : count}{suffix}</>;
};

/* ─── Floating Particles ─── */
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute rounded-full opacity-20" style={{
        width: `${Math.random() * 6 + 2}px`, height: `${Math.random() * 6 + 2}px`,
        background: '#d4a017',
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
        animation: `float ${6 + Math.random() * 8}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 4}s`,
      }}/>
    ))}
  </div>
);

/* ─── Mini SVG Charts ─── */
const MiniLineChart = ({ color = '#d4a017', data = [20,45,28,60,42,70,55,80] }) => {
  const h = 40, w = 120;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / 100) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#lg-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const MiniBarChart = ({ color = '#10b981' }) => {
  const bars = [35,55,40,70,50,80,60];
  return (
    <svg width="100" height="40" className="overflow-visible">
      {bars.map((v, i) => (
        <rect key={i} x={i * 14 + 1} y={40 - (v/100)*40} width="10" height={(v/100)*40} rx="2" fill={color} opacity={0.3 + (v/100)*0.7}/>
      ))}
    </svg>
  );
};

const DonutChart = ({ percentage = 78, color = '#d4a017' }) => {
  const r = 18, circ = 2 * Math.PI * r, offset = circ - (percentage / 100) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 24 24)"/>
      <text x="24" y="26" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{percentage}%</text>
    </svg>
  );
};

/* ─── LANDING PAGE ─── */
const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeRight { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse-gold { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0.3)} 50%{box-shadow:0 0 20px 5px rgba(212,160,23,0.15)} }
        .anim-up { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
        .anim-right { animation: fadeRight 0.8s ease-out forwards; opacity: 0; }
        .anim-scale { animation: scaleIn 0.6s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
        .delay-7 { animation-delay: 0.7s; }
        .gold-shimmer { background: linear-gradient(90deg, #d4a017, #f0d060, #d4a017); background-size: 200% auto; animation: shimmer 3s linear infinite; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .card-hover { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(212,160,23,0.15); }
      `}</style>

      {/* ──────────── HEADER ──────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-amber-100/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <img src={logo} alt="Digital Samuha" className="w-14 h-14 sm:w-20 sm:h-20 object-contain cursor-pointer hover:scale-105 transition-transform" style={{ mixBlendMode: 'multiply' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}/>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Meeting', id: 'features' },
              { label: 'Community', id: 'trust' },
            ].map(item => (
              <button 
                key={item.label} 
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-semibold text-gray-600 hover:text-amber-700 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"/>
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold text-gray-600 hover:text-amber-700 transition-colors">Log in</button>
            <button onClick={() => navigate('/register')} className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-bold rounded-xl hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-200/50 active:scale-95 transition-all">
              Register Samuha
            </button>
          </div>
        </div>
      </header>

      {/* ──────────── HERO ──────────── */}
      <section id="hero" className="relative pt-28 pb-20 lg:pt-36 lg:pb-20 px-6 lg:px-12">
        <Particles />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl"/>
          <div className="absolute top-40 right-40 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl"/>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-7">
            <div className="anim-up delay-1 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/60 rounded-full text-xs font-bold text-amber-700 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"/>
              Made for Nepal's Communities
            </div>

            <h1 className="anim-up delay-2 text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-gray-900 leading-[1.08] tracking-tight">
              Transform your<br/>
              <span className="gold-shimmer">Samuha Digitally</span>
            </h1>

            <p className="anim-up delay-3 text-lg text-gray-500 leading-relaxed max-w-lg">
              Manage contributions, track expenses, record meeting minutes, and ensure government compliance — all in one beautifully simple platform.
            </p>

            <div className="anim-up delay-4 flex flex-col sm:flex-row gap-4 pt-2">
              <button onClick={() => navigate('/register')} className="group px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-2xl hover:from-amber-700 hover:to-amber-800 shadow-xl shadow-amber-200/60 active:scale-95 transition-all flex items-center gap-2 text-sm" style={{ animation: 'pulse-gold 3s ease-in-out infinite' }}>
                Register Samuha
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M7.5 15L12.5 10L7.5 5"/></svg>
              </button>
              <button onClick={() => navigate('/login')} className="px-8 py-3.5 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-200 hover:border-amber-300 hover:text-amber-700 hover:shadow-lg transition-all text-sm">Login</button>
              <button onClick={() => navigate('/signup')} className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200/50 active:scale-95 transition-all text-sm">Sign Up</button>
            </div>

            {/* Social Proof */}
            <div className="anim-up delay-5 flex items-center gap-4 pt-4">
              <div className="flex -space-x-2.5">
                {['bg-amber-500','bg-emerald-500','bg-rose-400','bg-violet-500'].map((bg, i) => (
                  <div key={i} className={`w-9 h-9 ${bg} rounded-full border-[3px] border-[#faf9f6] flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                    {['N','S','R','A'][i]}
                  </div>
                ))}
                <div className="w-9 h-9 bg-gray-200 rounded-full border-[3px] border-[#faf9f6] flex items-center justify-center text-gray-500 text-[9px] font-bold">+50</div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Recently, trusted</p>
                <p className="text-xs text-gray-400">Digital Nepal</p>
              </div>
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative anim-scale delay-3">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/10 border border-amber-100/50 aspect-[4/3]">
              <img src={heroImage} alt="Nepal Samuha Record - Traditional vs Digital" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"/>
            </div>

            {/* Floating Card — Bottom Left */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-100/50 p-4 hidden lg:flex items-center gap-3 anim-scale delay-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Fund Growth</p>
                <p className="text-xl font-black text-gray-900">+24.5%</p>
              </div>
            </div>

            {/* Floating Card — Top Right */}
            <div className="absolute -top-5 -right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-100/50 p-4 hidden lg:flex items-center gap-3 anim-scale delay-7">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-black text-lg">42</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Active Members</p>
                <p className="text-sm font-bold text-gray-700">Across 3 Samuha</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── STATS BAND ──────────── */}
      <section className="relative bg-gradient-to-r from-[#2d0a4e] via-[#4c1d95] to-[#2d0a4e] py-10 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent"/>
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent"/>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent"/>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: '💰', num: '2400000', suffix: '+', prefix: 'NPR ', label: 'Manage contributions' },
            { icon: '👥', num: '198', suffix: ' +', prefix: '', label: 'Espa expenses' },
            { icon: '📈', num: '48', suffix: '%', prefix: '', label: 'Sharper Tots' },
            { icon: '📋', num: '500', suffix: '+', prefix: '', label: 'Plain meeting platforms' },
          ].map((s, i) => (
            <div key={i} className="text-center space-y-1 group">
              <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {s.prefix}<AnimatedNumber target={s.num} suffix={s.suffix}/>
              </p>
              <p className="text-xs text-gray-500 font-medium group-hover:text-amber-400 transition-colors">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"/>
      </section>

      {/* ──────────── FEATURES ──────────── */}
      <section id="features" className="pt-10 pb-0 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-[0.2em] mb-3">Powerful Features</p>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight">Everything your Samuha needs</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Built specifically for Nepali cooperative communities with AI-powered insights and real-time financial tracking.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Ledger */}
            <div className="card-hover bg-white rounded-2xl p-6 border border-amber-100/50 shadow-sm hover:border-amber-200">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Ledger Automation</h3>
              <p className="text-sm text-gray-500 mb-4">Auto-calculate debits, credits, and monthly balances.</p>
              <div className="pt-3 border-t border-amber-100/60">
                <MiniLineChart color="#b45309" data={[30,50,35,65,45,75,55,85]}/>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">Monthly Fund Trend</p>
              </div>
            </div>

            {/* Group Chat */}
            <div className="card-hover bg-white rounded-2xl p-6 border border-emerald-100/50 shadow-sm hover:border-emerald-200">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Group Chat</h3>
              <p className="text-sm text-gray-500 mb-4">Secure communication channel for all members.</p>
              <div className="pt-3 border-t border-emerald-100/60">
                <MiniBarChart color="#059669"/>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">Weekly Activity</p>
              </div>
            </div>

            {/* AI Bot */}
            <div className="card-hover bg-white rounded-2xl p-6 border border-violet-100/50 shadow-sm hover:border-violet-200">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="14" rx="2"/><circle cx="10" cy="13" r="1.5"/><circle cx="14" cy="13" r="1.5"/><path d="M8 19h8"/><path d="M9 7V5"/><path d="M15 7V5"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">AI Samuha Bot</h3>
              <p className="text-sm text-gray-500 mb-4">Ask about finances and regulations naturally.</p>
              <div className="pt-3 border-t border-violet-100/60 flex items-center gap-3">
                <DonutChart percentage={92} color="#7c3aed"/>
                <div>
                  <p className="text-sm font-bold text-gray-900">92%</p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Meetings */}
            <div className="card-hover bg-white rounded-2xl p-6 border border-rose-100/50 shadow-sm hover:border-rose-200">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Meeting Records</h3>
              <p className="text-sm text-gray-500 mb-4">Digitize minutes and attendance automatically.</p>
              <div className="pt-3 border-t border-rose-100/60">
                <MiniLineChart color="#e11d48" data={[40,60,50,70,65,80,75,90]}/>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── CONSOLIDATED MID-SECTION (Features -> Security -> Preview) ──────────── */}
      <section id="trust" className="bg-white px-6 lg:px-12 py-0">
        <div className="max-w-7xl mx-auto">
          {/* Security & Trust Card (Integrated) */}
          <div className="bg-gradient-to-br from-[#2D0A4E] to-[#4C1D95] rounded-[2.5rem] p-6 lg:p-14 relative overflow-hidden shadow-2xl shadow-purple-900/20 my-10">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/5 rounded-full blur-[80px] -ml-30 -mb-30" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  🛡️ Bank-Grade Security
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                  Your community's data is <br/>
                  <span className="text-amber-400">Safe and Encrypted.</span>
                </h2>
                <p className="text-purple-100/70 text-sm leading-relaxed max-w-md">
                  We use state-of-the-art encryption and blockchain-inspired ledger verification to ensure every rupee in your Samuha is accounted for and tamper-proof.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { label: 'Data Privacy', desc: 'GDPR Compliant' },
                    { label: 'Cloud Backups', desc: 'Real-time sync' },
                    { label: 'Access Control', desc: 'Role-based' },
                    { label: 'Audit Logs', desc: 'Full transparency' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      <div>
                        <p className="text-white text-xs font-bold">{item.label}</p>
                        <p className="text-purple-200/50 text-[10px]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl scale-105 lg:scale-110 rotate-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center text-gray-900 shadow-lg shadow-amber-400/30">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Security Status</p>
                      <p className="text-emerald-400 font-black text-sm uppercase">Active & Protected</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 w-[96%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                    <p className="text-[10px] text-white/60 font-medium italic">"Every transaction is end-to-end encrypted using SHA-256 protocols."</p>
                    <div className="pt-2 flex justify-between">
                      <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5 flex-1 mx-1">
                        <p className="text-amber-400 font-black text-lg leading-tight">SSL</p>
                        <p className="text-[9px] text-white/30 font-bold">CERTIFIED</p>
                      </div>
                      <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5 flex-1 mx-1">
                        <p className="text-amber-400 font-black text-lg leading-tight">2FA</p>
                        <p className="text-[9px] text-white/30 font-bold">READY</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview Section (Integrated) */}
          <div className="pt-10 pb-12 lg:pb-16">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-amber-600 uppercase tracking-[0.2em] mb-2">Dashboard Preview</p>
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight">Your finances at a glance</h2>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-10 border border-amber-100/60 shadow-lg shadow-amber-100/20">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {[
                  { label: 'Total Fund', value: 'NPR 1,50,000', change: '+12.4%', color: 'text-emerald-600', borderColor: 'border-emerald-100' },
                  { label: 'My Savings', value: 'NPR 24,500', change: '+8.2%', color: 'text-amber-600', borderColor: 'border-amber-100' },
                  { label: 'Active Loans', value: 'NPR 45,000', change: '3 active', color: 'text-rose-500', borderColor: 'border-rose-100' },
                  { label: 'Members', value: '42', change: '+5 this month', color: 'text-violet-600', borderColor: 'border-violet-100' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-5 border ${s.borderColor} hover:shadow-md transition-shadow`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{s.label}</p>
                    <p className="text-xl lg:text-2xl font-black text-gray-900">{s.value}</p>
                    <p className={`text-xs font-bold ${s.color} mt-1`}>{s.change}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-sm">Fund Overview</h4>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full">Last 12 months</span>
                  </div>
                  <svg width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4a017" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#d4a017" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {[40,80,120].map(y => <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f3f4f6" strokeWidth="1"/>)}
                    <polygon points="0,160 0,120 42,100 84,110 126,80 168,90 210,60 252,70 294,40 336,50 378,25 420,30 462,10 500,15 500,160" fill="url(#gf)"/>
                    <polyline points="0,120 42,100 84,110 126,80 168,90 210,60 252,70 294,40 336,50 378,25 420,30 462,10 500,15" fill="none" stroke="#b45309" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="flex justify-between mt-3 text-[10px] text-gray-400 font-medium">
                    {['Bai','Jes','Ash','Shr','Bhd','Asw','Kar','Man','Pou','Mag','Fal','Cha'].map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm mb-4">Fund Allocation</h4>
                  <div className="flex justify-center mb-5">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#b45309" strokeWidth="12" strokeDasharray={`${0.55*283} ${283}`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#059669" strokeWidth="12" strokeDasharray={`${0.25*283} ${283}`} strokeDashoffset={`-${0.55*283}`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#e11d48" strokeWidth="12" strokeDasharray={`${0.20*283} ${283}`} strokeDashoffset={`-${0.80*283}`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
                      <text x="60" y="58" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="800">NPR</text>
                      <text x="60" y="74" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="500">1.5 Lakh</text>
                    </svg>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Savings', pct: '55%', color: 'bg-amber-600' },
                      { label: 'Loans', pct: '25%', color: 'bg-emerald-600' },
                      { label: 'Reserve', pct: '20%', color: 'bg-rose-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}/>
                          <span className="text-gray-600 font-medium">{item.label}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── CTA ──────────── */}
      <section className="py-12 lg:py-20 px-6 lg:px-12 bg-gradient-to-br from-[#2d0a4e] via-[#4c1d95] to-[#1e1b4b] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-20 w-40 h-40 border border-fuchsia-400/30 rounded-full animate-pulse"/>
          <div className="absolute bottom-10 right-20 w-60 h-60 border border-amber-400/20 rounded-full animate-pulse"/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-fuchsia-400/10 rounded-full"/>
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-6">Ready to digitize your Samuha?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">Join communities across Nepal who trust Digital Samuha to manage finances transparently and securely.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/register')} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-2xl hover:from-amber-600 hover:to-amber-700 shadow-2xl shadow-amber-500/20 active:scale-95 transition-all text-sm">
              Get Started Free →
            </button>
            <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm backdrop-blur-sm">
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="py-10 px-6 bg-[#1a0631] text-center border-t border-purple-900/50">
        <p className="text-gray-400 text-xs">© 2083 BS. Made with ❤️ for Nepal's Communities.</p>
      </footer>
    </div>
  );
};

export default Landing;
