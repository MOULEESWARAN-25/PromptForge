"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, User, LogIn, UserPlus, Sparkles, KeyRound, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';

const SLIDES = [
  {
    badge: 'Prompt Engineering',
    headline: ['Turn vague ideas', 'into surgical', 'AI prompts.'],
    accentLine: 1,
    sub: 'Stop writing weak descriptions. PromptForge translates your intent into precision-grade prompts that AI tools actually understand.',
    tag: '12K+ Prompts Generated',
    accent: 'var(--accent)',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&h=420&fit=crop&q=85',
    imgAlt: 'Code editor with colorful syntax highlighting',
    floats: [
      { label: 'RAG Retrieved', side: 'left', offset: '0' },
      { label: 'Intent Mapped', side: 'right', offset: '0' },
      { label: 'Prompt Forged', side: 'left', offset: '1' },
      { label: 'Cursor Ready', side: 'right', offset: '1' },
    ],
  },
  {
    badge: 'Design Intelligence',
    headline: ['RAG-powered', 'design vocab', 'at your fingertips.'],
    accentLine: 1,
    sub: '200+ curated CSS patterns, layout grids, and motion physics — semantically retrieved and injected into every prompt you forge.',
    tag: '200+ Design Patterns',
    accent: 'var(--workflow-application)',
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&h=420&fit=crop&q=85',
    imgAlt: 'AI neural network circuit brain visualization',
    floats: [
      { label: 'Glassmorphism', side: 'left', offset: '0' },
      { label: 'Motion Physics', side: 'right', offset: '0' },
      { label: 'Color Tokens', side: 'left', offset: '1' },
      { label: 'Grid System', side: 'right', offset: '1' },
    ],
  },
  {
    badge: 'Multi-Tool Support',
    headline: ['Works with Cursor,', 'Lovable, v0', 'and Bolt.'],
    accentLine: 1,
    sub: 'Each prompt is tailored for your target AI coding tool. Switch environments and get perfectly context-aware output every single time.',
    tag: '4 AI Tools Supported',
    accent: 'var(--workflow-enhance)',
    img: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=700&h=420&fit=crop&q=85',
    imgAlt: 'Designer sketching UI wireframes on paper',
    floats: [
      { label: 'Cursor', side: 'left', offset: '0' },
      { label: 'Lovable', side: 'right', offset: '0' },
      { label: 'v0.dev', side: 'left', offset: '1' },
      { label: 'Bolt.new', side: 'right', offset: '1' },
    ],
  },
];

export default function AuthPage() {
  const { user, login, register, theme } = useApp();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (user) router.push('/dashboard'); }, [user, router]);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields to continue.');
      return;
    }
    setLoading(true);
    try {
      const result = isLogin ? await login(username, password) : await register(username, password);
      if (result.success) {
        toast.success(isLogin ? 'Welcome back! 🎉' : 'Account created — let\'s forge some prompts!');
        router.push('/dashboard');
      } else {
        setError(result.message);
        track(EVENTS.AUTH_ERROR, { reason: result.message, mode: isLogin ? 'login' : 'register' });
      }
    } catch {
      setError("We couldn't connect right now. Check your connection and try again — your details are safe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await login('demo_engineer', 'promptforge2026');
      toast.success('Demo mode activated — explore freely!');
      track(EVENTS.DEMO_ACTIVATED);
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cur = SLIDES[slide];
  const isDark = theme === 'dark';

  // Dynamic overrides to respect the application's light/dark mode theme selection
  const dynamicRoot = {
    ...root,
    background: 'var(--auth-bg-gradient)'
  };

  const dynamicPanelGrid = {
    ...panelGrid,
    backgroundImage: 'linear-gradient(var(--auth-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--auth-grid-line) 1px,transparent 1px)'
  };

  const dynamicArcStroke1 = 'color-mix(in srgb, var(--foreground) 4.5%, transparent)';
  const dynamicArcStroke2 = 'color-mix(in srgb, var(--foreground) 3%, transparent)';

  const dynamicImgCard = {
    ...imgCard,
    background: 'var(--card)',
    borderColor: `color-mix(in srgb, ${cur.accent} 12.5%, transparent)`,
    boxShadow: isDark
      ? `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in srgb, ${cur.accent} 9.4%, transparent)`
      : `0 24px 60px rgba(0,0,0,0.06), 0 0 0 1px var(--border)`
  };

  const dynamicImgCardBar = {
    ...imgCardBar,
    background: 'var(--card)',
    borderBottom: '1px solid var(--border)'
  };

  const dynamicImgCardUrl = {
    ...imgCardUrl,
    color: 'var(--muted-foreground)'
  };

  const dynamicImgOverlay = {
    ...imgOverlay,
    background: 'linear-gradient(to top, color-mix(in srgb, var(--background) 70%, transparent) 0%, transparent 100%)'
  };

  const dynamicSlideSub = {
    ...slideSub,
    color: 'var(--muted-foreground)'
  };

  const dynamicBottomLabel = {
    ...bottomLabel,
    color: 'var(--muted-foreground)'
  };

  const dynamicDotBtn = (i) => ({
    ...dotBtn,
    background: i === slide ? cur.accent : 'color-mix(in srgb, var(--foreground) 15%, transparent)'
  });

  const dynamicFormCard = {
    ...formCard,
    background: 'color-mix(in srgb, var(--card) 60%, transparent)',
    border: '1px solid var(--border)',
    boxShadow: isDark
      ? `0 32px 80px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.05), 0 0 0 1px color-mix(in srgb, ${cur.accent} 7%, transparent)`
      : `0 32px 80px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px var(--border)`
  };

  const dynamicFormSub = {
    ...formSub,
    color: 'var(--muted-foreground)'
  };

  const dynamicTabTrack = {
    ...tabTrack,
    background: 'var(--card)',
    border: '1px solid var(--border)'
  };

  const dynamicTabBtn = (active, accent) => ({
    ...tabBtn(active, accent),
    color: active ? accent : 'var(--muted-foreground)'
  });

  const dynamicTabHighlight = {
    ...tabHighlight,
    background: 'var(--card)',
    border: '1px solid var(--border)'
  };

  const dynamicFieldLabel = {
    ...fieldLabel,
    color: 'var(--foreground)'
  };

  const dynamicInputWrap = (focus, accent) => ({
    ...inputWrap(focus, accent),
    background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
    border: `1.5px solid ${focus ? accent : (isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)')}`
  });

  const dynamicInputIcon = {
    ...inputIcon,
    color: 'var(--muted-foreground)'
  };

  const dynamicEyeBtn = {
    ...eyeBtn,
    color: 'var(--muted-foreground)'
  };

  const dynamicSubmitBtn = {
    ...submitBtn,
    color: 'var(--accent-foreground)' // Ensures readable text contrast on active colored button
  };

  const dynamicDivLine = {
    ...divLine,
    background: 'var(--border)'
  };

  const dynamicDivTxt = {
    ...divTxt,
    color: 'var(--muted-foreground)'
  };

  const dynamicDemoBtn = {
    ...demoBtn,
    background: 'var(--card)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)'
  };

  const dynamicFooterNote = {
    ...footerNote,
    color: 'var(--muted-foreground)'
  };

  return (
    <div style={dynamicRoot}>
      {/* Seamless layout grid across the entire viewport */}
      <div style={dynamicPanelGrid} />

      {/* ══ LEFT — Immersive carousel panel ══════════════════════ */}
      <div className="hidden lg:flex" style={leftPanel}>


        {/* Animated accent orb that follows slide color */}
        <motion.div
          key={`orb-${slide}`}
          style={{ ...panelOrb, background: `radial-gradient(circle, ${cur.accent}16 0%, transparent 65%)` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        />

        {/* SVG decorative arcs */}
        <svg style={arcSvg} viewBox="0 0 520 700" fill="none" preserveAspectRatio="none">
          <path d="M500 80 Q 60 350 500 620" stroke={dynamicArcStroke1} strokeWidth="1.5" strokeDasharray="10 8" />
          <path d="M20 100 Q 460 350 20 600" stroke={dynamicArcStroke2} strokeWidth="1" strokeDasharray="7 10" />
        </svg>

        {/* ── Logo ── */}
        <div style={logoRow}>
          <div style={logoIcon}><Sparkles size={15} color="#6843EC" /></div>
          <span style={logoName}>PromptForge</span>
          <motion.span
            key={`badge-${slide}`}
            style={{ ...logoBadge, color: cur.accent, borderColor: `${cur.accent}35`, background: `${cur.accent}12` }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          >v2.0</motion.span>
        </div>

        {/* ── Slide content ── */}
        <div style={slideArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide}`}
              style={slideInner}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge pill */}
              <div style={{ ...slidePill, color: cur.accent, borderColor: `${cur.accent}30`, background: `${cur.accent}0e` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cur.accent }} />
                {cur.badge}
              </div>

              {/* Headline */}
              <h1 style={slideHeadline}>
                {cur.headline.map((line, i) =>
                  i === cur.accentLine
                    ? <span key={i} style={{ background: `linear-gradient(120deg, ${cur.accent} 0%, ${cur.accent}bb 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>{line}</span>
                    : <span key={i} style={{ display: 'block' }}>{line}</span>
                )}
              </h1>

              {/* ── Image card with side pill columns ── */}
              <div style={imgCardOuter}>
                {/* Left pills */}
                <div style={pillCol}>
                  {cur.floats.filter(f => f.side === 'left').map((f, i) => (
                    <motion.div
                      key={`float-left-${slide}-${i}`}
                      style={{ ...floatPill, borderColor: `${cur.accent}28`, background: `${cur.accent}0c` }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.12, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cur.accent, flexShrink: 0 }} />
                      <span style={{ color: cur.accent, fontSize: '0.7rem', fontWeight: 700 }}>{f.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Main image card */}
                <motion.div
                  style={{ ...dynamicImgCard, flex: 1 }}
                  initial={{ opacity: 0, scale: 0.93, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={dynamicImgCardBar}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                        <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.8 }} />
                      ))}
                    </div>
                    <div style={dynamicImgCardUrl}><span>promptforge.ai</span></div>
                    <div style={{ width: 36 }} />
                  </div>
                  <img src={cur.img} alt={cur.imgAlt} style={imgEl} loading="eager" />
                  <div style={dynamicImgOverlay} />
                </motion.div>

                {/* Right pills */}
                <div style={pillCol}>
                  {cur.floats.filter(f => f.side === 'right').map((f, i) => (
                    <motion.div
                      key={`float-right-${slide}-${i}`}
                      style={{ ...floatPill, borderColor: `${cur.accent}28`, background: `${cur.accent}0c` }}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cur.accent, flexShrink: 0 }} />
                      <span style={{ color: cur.accent, fontSize: '0.7rem', fontWeight: 700 }}>{f.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sub text */}
              <p style={dynamicSlideSub}>{cur.sub}</p>

              {/* Stat tag */}
              <div style={{ ...statTag, color: cur.accent, borderColor: `${cur.accent}25`, background: `${cur.accent}0a` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cur.accent }} />
                {cur.tag}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom: label + dots ── */}
        <div style={bottomBar}>
          <p style={dynamicBottomLabel}>Sign in to forge precision prompts built for you</p>
          <div style={dotTrack}>
            {SLIDES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setSlide(i)}
                style={dynamicDotBtn(i)}
                animate={{ width: i === slide ? 24 : 7 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT — Immersive & glassmorphic form panel ═════════ */}
      <div style={rightPanel}>


        {/* Dynamic bottom-right orb matching active slide color */}
        <motion.div
          key={`right-orb-${slide}`}
          style={{ ...rightOrb, background: `radial-gradient(circle, ${cur.accent}0f 0%, transparent 60%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.div
          style={dynamicFormCard}
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Top colored shine element matching active accent */}
          <motion.div
            key={`shine-${slide}`}
            style={{ ...cardTopShine, background: `linear-gradient(90deg, transparent 0%, ${cur.accent}77 50%, transparent 100%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Brand mark */}
          <div style={brandRow}>
            <motion.div
              style={{
                ...brandIcon,
                background: `${cur.accent}12`,
                borderColor: `${cur.accent}28`
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Sparkles size={18} color={cur.accent} />
            </motion.div>
            <span style={brandName}>PROMPTFORGE</span>
          </div>

          {/* Title */}
          <div style={formHeading}>
            <h2 style={formTitle}>{isLogin ? 'SIGN IN' : 'SIGN UP'}</h2>
            <p style={dynamicFormSub}>{isLogin ? 'Access your forge workspace.' : 'Create your forge account.'}</p>
          </div>

          {/* Tab toggle */}
          <div style={dynamicTabTrack}>
            {[{ v: true, Icon: LogIn, l: 'Sign In' }, { v: false, Icon: UserPlus, l: 'Register' }].map(({ v, Icon, l }) => (
              <button key={String(v)} style={dynamicTabBtn(isLogin === v, cur.accent)} onClick={() => { setIsLogin(v); setError(''); }}>
                {isLogin === v && <motion.div layoutId="auth-tab" style={dynamicTabHighlight} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <Icon size={13} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1, fontSize: '0.83rem', fontWeight: 700 }}>{l}</span>
              </button>
            ))}
          </div>

          {/* Error — accessible alert region */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={errMsg}
                role="alert"
                aria-live="polite"
              >
                <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form fields */}
          <form onSubmit={handleSubmit} style={fieldStack}>
            <div style={fieldGroup}>
              <label style={dynamicFieldLabel}>Username</label>
              <div style={dynamicInputWrap(usernameFocus, cur.accent)}>
                <User size={15} style={dynamicInputIcon} />
                <input type="text" placeholder="e.g. dev_architect" value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocus(true)} onBlur={() => setUsernameFocus(false)}
                  style={inputEl} disabled={loading} autoComplete="username" />
              </div>
            </div>
            <div style={fieldGroup}>
              <label style={dynamicFieldLabel}>Password</label>
              <div style={dynamicInputWrap(passwordFocus, cur.accent)}>
                <Lock size={15} style={dynamicInputIcon} />
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)} onBlur={() => setPasswordFocus(false)}
                  style={inputEl} disabled={loading} autoComplete={isLogin ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={dynamicEyeBtn}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <motion.button
              type="submit"
              style={{
                ...dynamicSubmitBtn,
                background: cur.accent,
                boxShadow: `0 8px 30px ${cur.accent}25`
              }}
              disabled={loading}
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading ? { scale: 0.985 } : {}}
            >
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={spinner} />
                : <>{isLogin ? 'Access Workspace' : 'Create Account'}<ArrowRight size={15} /></>}
            </motion.button>
          </form>

          <div style={divRow}><div style={dynamicDivLine} /><span style={dynamicDivTxt}>or</span><div style={dynamicDivLine} /></div>

          <motion.button
            onClick={handleDemo}
            style={dynamicDemoBtn}
            disabled={loading}
            whileHover={{ scale: 1.01, background: 'var(--card)', borderColor: 'var(--border)' }}
            whileTap={{ scale: 0.99 }}
            title="Explore the app with a pre-filled demo account — no sign-up needed"
            aria-label="Continue with demo account (no registration required)"
          >
            <KeyRound size={15} style={{ opacity: 0.6 }} />
            Try Demo Account
            <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 500 }}>No sign-up needed</span>
          </motion.button>

          <p style={dynamicFooterNote}>🔒 Credentials stored locally · No personal data collected</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   STYLES
══════════════════════════════════ */
const root = { position: 'fixed', inset: 0, display: 'flex', overflowY: 'auto', background: 'var(--background)' };

// ── Left panel
const leftPanel = { display: 'flex', flex: '0 0 54%', flexDirection: 'column', position: 'relative', overflow: 'clip', padding: '2.5rem 3rem', height: '100%' };
const panelBg = { position: 'absolute', inset: 0, background: 'var(--background)', pointerEvents: 'none' };
const panelGrid = { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' };
const panelOrb = { position: 'absolute', top: '5%', left: '15%', width: '550px', height: '550px', borderRadius: '50%', pointerEvents: 'none' };
const rightOrb = { position: 'absolute', bottom: '-10%', right: '-10%', width: '450px', height: '450px', borderRadius: '50%', pointerEvents: 'none' };
const arcSvg = { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' };

const logoRow = { position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' };
const logoIcon = { width: 30, height: 30, borderRadius: 8, background: 'var(--input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const logoName = { fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--foreground)', letterSpacing: '-0.04em' };
const logoBadge = { fontSize: '0.62rem', fontWeight: 700, border: '1px solid', borderRadius: 999, padding: '1px 8px', letterSpacing: '0.05em', transition: 'all 0.5s ease' };

const slideArea = { position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center' };
const slideInner = { width: '100%' };
const slidePill = { display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid', borderRadius: 999, padding: '4px 12px', marginBottom: '1rem' };
const slideHeadline = { fontSize: 'clamp(2rem,3.2vw,2.8rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--foreground)', lineHeight: 1.14, letterSpacing: '-0.04em', marginBottom: '1.5rem' };

// Image card
const imgCardOuter = { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' };
const pillCol = { display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 };
const floatPill = { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: '1px solid', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', whiteSpace: 'nowrap' };
const imgCard = { borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', position: 'relative', background: 'var(--card)', minWidth: 0 };
const imgCardBar = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--card)', borderBottom: '1px solid var(--border)' };
const imgCardUrl = { flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono,monospace)' };
const imgEl = { width: '100%', height: '185px', objectFit: 'cover', display: 'block', filter: 'brightness(0.85) contrast(1.05) saturate(1.1)' };
const imgOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'transparent', pointerEvents: 'none' };

const slideSub = { fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1rem' };
const statTag = { display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontWeight: 700, border: '1px solid', borderRadius: 8, padding: '5px 12px' };

const bottomBar = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const bottomLabel = { fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 500 };
const dotTrack = { display: 'flex', alignItems: 'center', gap: 6 };
const dotBtn = { height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0 };

// ── Right panel
const rightPanel = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', position: 'relative', overflowY: 'auto', height: '100%' };
const formCard = { width: '100%', maxWidth: '425px', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2.75rem 2.25rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden' };
const cardTopShine = { position: 'absolute', top: 0, left: 0, right: 0, height: 2, pointerEvents: 'none' };

const brandRow = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.1rem', position: 'relative', zIndex: 1 };
const brandIcon = { width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const brandName = { fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.16em', color: 'var(--foreground)', fontFamily: 'var(--font-display)' };

const formHeading = { textAlign: 'center', position: 'relative', zIndex: 1 };
const formTitle = { fontSize: '1.65rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--foreground)', letterSpacing: '-0.03em', marginBottom: '0.3rem' };
const formSub = { fontSize: '0.82rem', color: 'var(--muted-foreground)', fontWeight: 500 };

const tabTrack = { display: 'flex', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 12, padding: 3, gap: 2, position: 'relative', zIndex: 1 };
const tabBtn = (a, accent) => ({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', background: 'transparent', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: a ? accent : 'var(--muted-foreground)', position: 'relative', transition: 'color 0.3s ease' });
const tabHighlight = { position: 'absolute', inset: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 };

const errMsg = { background: 'rgba(239,68,68,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.83rem', color: 'var(--destructive)', lineHeight: 1.5, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' };

const fieldStack = { display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 };
const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '0.45rem' };
const fieldLabel = { fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '0.02em' };
const inputWrap = (f, accent) => ({ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.95rem', background: 'var(--input)', border: `1.5px solid ${f ? accent : 'var(--border)'}`, borderRadius: 12, boxShadow: f ? `0 0 0 4px ${accent}15` : 'none', transition: 'all 0.25s ease' });
const inputIcon = { color: 'var(--muted-foreground)', flexShrink: 0 };
const inputEl = { flex: 1, height: 46, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.88rem', color: 'var(--foreground)', fontFamily: 'var(--font-sans)' };
const eyeBtn = { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4, display: 'flex', alignItems: 'center' };

const submitBtn = { width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-foreground)', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em', marginTop: '0.2rem' };
const spinner = { width: 18, height: 18, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--foreground)' };

const divRow = { display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 };
const divLine = { flex: 1, height: 1, background: 'var(--border)' };
const divTxt = { fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' };

const demoBtn = { width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: 12, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', position: 'relative', zIndex: 1, transition: 'all 0.2s ease' };
const footerNote = { fontSize: '0.7rem', color: 'var(--muted-foreground)', textAlign: 'center', lineHeight: 1.5, position: 'relative', zIndex: 1 };
