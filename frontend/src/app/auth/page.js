"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, User, LogIn, UserPlus, Sparkles, ArrowRight, Eye, EyeOff, Info, Mail } from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';
import blocklist from '@/config/disposableDomains.json';
import { BRAND } from '@/config/brand';

const SLIDES = [
  {
    badge: 'Intent Compilation',
    headline: ['Compile vision', 'into precise', 'architecture plans.'],
    accentLine: 1,
    sub: 'Stop writing weak descriptions. Veyntra compiles your intent into precision-grade specifications that AI code compilers actually understand.',
    tag: '12K+ Specifications Compiled',
    accent: 'var(--accent)',
    img: '/pages/dashboard.webp',
    imgAlt: 'Code editor with colorful syntax highlighting',
    floats: [
      { label: 'RAG Retrieved', side: 'left', offset: '0' },
      { label: 'Intent Mapped', side: 'right', offset: '0' },
      { label: 'Blueprint Synthesized', side: 'left', offset: '1' },
      { label: 'Cursor Ready', side: 'right', offset: '1' },
    ],
  },
  {
    badge: 'Design Intelligence',
    headline: ['RAG-powered', 'design vocab', 'at your fingertips.'],
    accentLine: 1,
    sub: '200+ curated CSS patterns, layout grids, and motion physics — semantically retrieved and injected into every specification you compile.',
    tag: '200+ Design Patterns',
    accent: 'var(--workflow-application)',
    img: '/pages/profile.webp',
    imgAlt: 'Design vocabulary search table',
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
    sub: 'Each specification is tailored for your target AI coding tool. Switch environments and get perfectly context-aware output every single time.',
    tag: '4 AI Tools Supported',
    accent: 'var(--workflow-enhance)',
    img: '/pages/settings.webp',
    imgAlt: 'Forge prompt builder workspace',
    floats: [
      { label: 'Cursor', side: 'left', offset: '0' },
      { label: 'Lovable', side: 'right', offset: '0' },
      { label: 'v0.dev', side: 'left', offset: '1' },
      { label: 'Bolt.new', side: 'right', offset: '1' },
    ],
  },
];

const ROLES = [
  'Student',
  'Founder',
  'Product Manager',
  'Designer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI Engineer',
  'Other'
];

const PRIMARY_TOOLS = [
  'Cursor',
  'Claude Code',
  'Windsurf',
  'VS Code',
  'Lovable',
  'v0',
  'Replit',
  'Bolt',
  'Other'
];

export default function AuthPage() {
  const { 
    user, 
    login, 
    register, 
    googleLogin, 
    logout, 
    checkVerificationStatus, 
    resendVerification, 
    changeEmailAddress,
    loginAsDemo,
    theme,
    globalStats
  } = useApp();
  const router = useRouter();

  const getSlideTag = (index) => {
    if (index === 0) {
      return globalStats?.total_specifications_compiled 
        ? `${globalStats.total_specifications_compiled.toLocaleString()}+ Specifications Compiled` 
        : 'Loading specifications stats...';
    }
    if (index === 1) {
      return globalStats?.total_design_patterns 
        ? `${globalStats.total_design_patterns}+ Design Patterns` 
        : 'Loading pattern stats...';
    }
    if (index === 2) {
      return globalStats?.ai_tools_supported 
        ? `${globalStats.ai_tools_supported} AI Tools Supported` 
        : 'AI Tools Supported';
    }
    return SLIDES[index]?.tag;
  };

  // Authentication Views State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Registration Profile States
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [primaryTool, setPrimaryTool] = useState('Cursor');

  // Input Focus States
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [newEmailFocus, setNewEmailFocus] = useState(false);

  // Verification states
  const [newEmail, setNewEmail] = useState('');

  // Carousel & Rendering mounting
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  const getRedirectDest = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('redirect') || '/dashboard';
    }
    return '/dashboard';
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { 
    if (user && user.emailVerified) {
      router.push(getRedirectDest()); 
    }
  }, [user, router]);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) {
      setError('Please fill in both fields to continue.');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setError('Please provide your full name for registration.');
      return;
    }

    // Email format Regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Disposable email domain check (client side blocklist)
    const domain = trimmedEmail.split('@')[1];
    if (!isLogin && blocklist.includes(domain)) {
      setError('Registration using disposable email addresses is not permitted.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await login(trimmedEmail, password);
        if (result.success) {
          toast.success('Welcome back!');
          router.push(getRedirectDest());
        } else {
          setError(result.message);
        }
      } else {
        const profileDetails = { name: fullName.trim(), role, primaryTool };
        const result = await register(trimmedEmail, password, profileDetails);
        if (result.success) {
          toast.success('Account created! Please verify your email to unlock access.');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("An unexpected authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const onboarding = !isLogin ? { name: fullName.trim() || 'Google User', role, primaryTool } : {};
      const result = await googleLogin(onboarding);
      if (result.success) {
        toast.success('Successfully authenticated via Google!');
        router.push(getRedirectDest());
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to authenticate with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginAsDemo();
      if (result.success) {
        toast.success(`Welcome to Demo Mode! Exploring ${BRAND.name}.`);
        router.push(getRedirectDest());
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to enter Demo Mode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await checkVerificationStatus();
      if (result.success) {
        toast.success(`Email verified successfully! Welcome to ${BRAND.name}.`);
        router.push(getRedirectDest());
      } else {
        setError(result.message);
      }
    } catch {
      setError('Verification status check failed. Try reloading the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const result = await resendVerification();
      if (result.success) {
        toast.success('Verification link resent. Check your inbox!');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to resend verification email.');
    }
  };

  const handleChangeEmail = async () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      setError('Please provide a new email address.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    const domain = trimmed.split('@')[1];
    if (blocklist.includes(domain)) {
      setError('Disposable email addresses are not permitted.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await changeEmailAddress(trimmed);
      if (result.success) {
        toast.success('Email updated and new verification link sent!');
        setNewEmail('');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to update email address.');
    } finally {
      setLoading(false);
    }
  };

  const cur = SLIDES[slide];
  const isDark = theme === 'dark';

  // ─── VERIFICATION SCREEN RENDER ─────────────────────────────
  if (mounted && user && !user.emailVerified) {
    return (
      <div className="fixed inset-0 flex overflow-y-auto bg-(--auth-bg-gradient)">
        <div className="auth-grid-bg" />
        
        <div className="flex-1 flex flex-col items-center px-6 py-10 relative overflow-y-auto h-full">
          <div className="margin-auto my-auto" />
          <div 
            className="w-full max-w-[425px] flex flex-col gap-4 p-8 rounded-[24px] backdrop-blur-xl relative overflow-hidden shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--card) 60%, transparent)',
              border: '1px solid var(--border)',
              boxShadow: isDark
                ? `0 32px 80px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.05), 0 0 0 1px color-mix(in srgb, ${cur.accent} 7%, transparent)`
                : `0 32px 80px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px var(--border)`
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${cur.accent} 47%, transparent) 50%, transparent 100%)` }} 
            />
            
            <div className="flex items-center justify-center gap-2.5 mb-0.5 relative z-10">
              <div 
                className="w-9 h-9 rounded-[9px] border flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${cur.accent} 7%, transparent)`, borderColor: `color-mix(in srgb, ${cur.accent} 16%, transparent)` }}
              >
                <Sparkles size={18} color={cur.accent} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-extrabold tracking-widest text-foreground font-display">{BRAND.name.toUpperCase()}</span>
            </div>

            <div className="text-center relative z-10">
              <h2 className="text-2xl md:text-[1.65rem] font-black font-display text-foreground tracking-tight mb-1">VERIFY EMAIL</h2>
              <p className="text-[13px] text-muted-foreground font-medium">Verification email sent to:</p>
              <p className="font-extrabold text-accent text-[0.9rem] mt-1 break-all" style={{ color: cur.accent }}>{user.email}</p>
            </div>

            {error && (
              <div className="bg-destructive/5 border border-border rounded-lg px-4 py-2.5 text-[13px] text-destructive leading-relaxed relative z-10 flex items-start gap-2" role="alert">
                <Info size={14} className="shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3.5 w-full z-10">
              <motion.button
                onClick={handleRefreshStatus}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-extrabold cursor-pointer font-sans tracking-tight mt-0 border-none rounded-xl text-accent-foreground"
                style={{ background: cur.accent }}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? 'Checking status...' : 'I Have Verified - Access Workspace'}
              </motion.button>

              <div className="mt-2">
                <p className="text-xs font-bold text-muted-foreground mb-1.5">Didn&apos;t receive it?</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="w-full h-[46px] flex items-center justify-center gap-2 bg-card text-foreground border border-border rounded-xl text-[13.5px] font-bold cursor-pointer font-sans relative z-10 transition-all duration-200"
                    disabled={loading}
                  >
                    <Mail size={14} className="mr-1.5" strokeWidth={1.75} />
                    Resend Verification Email
                  </button>

                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-[46px] flex items-center justify-center gap-2 bg-card text-foreground border border-border rounded-xl text-[13.5px] font-bold cursor-pointer font-sans relative z-10 transition-all duration-200 no-underline"
                    disabled={loading}
                  >
                    <ArrowRight size={14} className="mr-1.5" strokeWidth={1.75} />
                    Open Gmail
                  </a>
                </div>
              </div>

              <div className="border-t border-border pt-5 mt-2">
                <label className="text-xs font-bold text-foreground tracking-wide" htmlFor="change-email-input">Change Email Address</label>
                <div className="flex gap-2 mt-2">
                  <div 
                    className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all duration-200 flex-1"
                    style={{
                      background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
                      border: `1.5px solid ${newEmailFocus ? cur.accent : (isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)')}`
                    }}
                  >
                    <Mail size={15} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
                    <input
                      id="change-email-input"
                      name="change-email"
                      type="email"
                      placeholder="new-email@example.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      onFocus={() => setNewEmailFocus(true)}
                      onBlur={() => setNewEmailFocus(false)}
                      className="flex-1 h-[46px] bg-transparent border-none outline-none text-[13.5px] text-foreground font-sans"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="w-auto px-4 text-sm font-extrabold cursor-pointer font-sans tracking-tight border-none rounded-xl bg-foreground text-background h-[46px]"
                    disabled={loading}
                  >
                    Update
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full h-[46px] flex items-center justify-center gap-2 bg-transparent text-muted-foreground border border-transparent rounded-xl text-[13.5px] font-bold cursor-pointer font-sans relative z-10 transition-all duration-200 mt-2"
              >
                Sign Out / Use Another Account
              </button>
            </div>
          </div>
          <div className="margin-auto my-auto" />
        </div>
      </div>
    );
  }

  // ─── MAIN LOGIN / ONBOARDING SIGNUP RENDER ───────────────────
  return (
    <div className="fixed inset-0 flex overflow-y-auto bg-(--auth-bg-gradient)">
      <div className="auth-grid-bg" />

      {/* LEFT PANEL — Carousel */}
      <div className="hidden lg:flex lg:flex-[0_0_54%] flex-col relative overflow-clip px-12 py-10 h-full">
        <motion.div
          key={`orb-${slide}`}
          className="absolute top-[5%] left-[15%] w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, color-mix(in srgb, ${cur.accent} 9%, transparent) 0%, transparent 65%)` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 700" fill="none" preserveAspectRatio="none">
          <path d="M500 80 Q 60 350 500 620" stroke="color-mix(in srgb, var(--foreground) 4.5%, transparent)" strokeWidth="1.5" strokeDasharray="10 8" />
          <path d="M20 100 Q 460 350 20 600" stroke="color-mix(in srgb, var(--foreground) 3%, transparent)" strokeWidth="1" strokeDasharray="7 10" />
        </svg>

        <div className="relative z-10 flex items-center gap-2.5 mb-2">
          <div className="w-[30px] h-[30px] rounded-lg bg-input border border-border flex items-center justify-center">
            <Sparkles size={15} color="#6843EC" strokeWidth={1.75} />
          </div>
          <span className="text-base font-extrabold font-display text-foreground tracking-tight">{BRAND.name}</span>
          <motion.span
            key={`badge-${slide}`}
            className="text-[10px] font-bold border rounded-full px-2 py-0.5 tracking-wider transition-all duration-500"
            style={{ color: cur.accent, borderColor: `color-mix(in srgb, ${cur.accent} 21%, transparent)`, background: `color-mix(in srgb, ${cur.accent} 7%, transparent)` }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          >v2.0</motion.span>
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide}`}
              className="w-full"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div 
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase border rounded-full px-3 py-1 mb-4"
                style={{ color: cur.accent, borderColor: `color-mix(in srgb, ${cur.accent} 19%, transparent)`, background: `color-mix(in srgb, ${cur.accent} 6%, transparent)` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cur.accent }} />
                {cur.badge}
              </div>

              <h1 className="text-[clamp(2rem,3.2vw,2.8rem)] font-extrabold font-display text-foreground leading-[1.14] tracking-tight mb-6">
                {cur.headline.map((line, i) =>
                  i === cur.accentLine
                    ? <span key={i} style={{ background: `linear-gradient(120deg, ${cur.accent} 0%, color-mix(in srgb, ${cur.accent} 73%, transparent) 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>{line}</span>
                    : <span key={i} style={{ display: 'block' }}>{line}</span>
                )}
              </h1>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex flex-col gap-2 shrink-0">
                  {cur.floats.filter(f => f.side === 'left').map((f, i) => (
                    <motion.div
                      key={`float-left-${slide}-${i}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md whitespace-nowrap"
                      style={{ borderColor: `color-mix(in srgb, ${cur.accent} 16%, transparent)`, background: `color-mix(in srgb, ${cur.accent} 5%, transparent)` }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.12, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: cur.accent }} />
                      <span className="text-[0.7rem] font-bold" style={{ color: cur.accent }}>{f.label}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="rounded-xl border overflow-hidden relative min-w-0 flex-1"
                  style={{ 
                    borderColor: `color-mix(in srgb, ${cur.accent} 12.5%, transparent)`,
                    boxShadow: isDark
                      ? `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in srgb, ${cur.accent} 9.4%, transparent)`
                      : `0 24px 60px rgba(0,0,0,0.06), 0 0 0 1px var(--border)`
                  }}
                  initial={{ opacity: 0, scale: 0.93, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-card border-b border-border">
                    <div className="flex gap-1.5">
                      {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                        <div key={c} className="w-[9px] h-[9px] rounded-full opacity-80" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex-1 text-center text-[10.5px] text-muted-foreground font-mono"><span>{BRAND.domain}</span></div>
                    <div className="w-9" />
                  </div>
                  <img src={cur.img} alt={cur.imgAlt} className="w-full h-[185px] object-cover block brightness-[0.85] contrast-[1.05] saturate-[1.1]" loading="eager" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--background) 70%, transparent) 0%, transparent 100%)' }} />
                </motion.div>

                <div className="flex flex-col gap-2 shrink-0">
                  {cur.floats.filter(f => f.side === 'right').map((f, i) => (
                    <motion.div
                      key={`float-right-${slide}-${i}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md whitespace-nowrap"
                      style={{ borderColor: `color-mix(in srgb, ${cur.accent} 16%, transparent)`, background: `color-mix(in srgb, ${cur.accent} 5%, transparent)` }}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: cur.accent }} />
                      <span className="text-[0.7rem] font-bold" style={{ color: cur.accent }}>{f.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cur.sub}</p>

              <div 
                className="inline-flex items-center gap-2 text-xs font-bold border rounded-lg px-3 py-1.5"
                style={{ color: cur.accent, borderColor: `color-mix(in srgb, ${cur.accent} 15%, transparent)`, background: `color-mix(in srgb, ${cur.accent} 4%, transparent)` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cur.accent }} />
                {getSlideTag(slide)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <p className="text-[13px] text-muted-foreground font-medium">Sign in to compile specifications built for you</p>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setSlide(i)}
                className="h-1.5 rounded-full border-none cursor-pointer p-0"
                style={{ background: i === slide ? cur.accent : 'color-mix(in srgb, var(--foreground) 15%, transparent)' }}
                animate={{ width: i === slide ? 24 : 7 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form Card */}
      <div className="flex-1 flex flex-col items-center px-6 py-10 relative overflow-y-auto h-full">
        <motion.div
          key={`right-orb-${slide}`}
          className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, color-mix(in srgb, ${cur.accent} 6%, transparent) 0%, transparent 60%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <div className="margin-auto my-auto" />

        <motion.div
          className="w-full max-w-[425px] flex flex-col gap-4 p-8 rounded-[24px] backdrop-blur-xl relative overflow-hidden shrink-0"
          style={{
            background: 'color-mix(in srgb, var(--card) 60%, transparent)',
            border: '1px solid var(--border)',
            boxShadow: isDark
              ? `0 32px 80px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.05), 0 0 0 1px color-mix(in srgb, ${cur.accent} 7%, transparent)`
              : `0 32px 80px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px var(--border)`
          }}
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            key={`shine-${slide}`}
            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${cur.accent} 47%, transparent) 50%, transparent 100%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          <div className="flex items-center justify-center gap-2.5 mb-0.5 relative z-10">
            <motion.div
              className="w-9 h-9 rounded-[9px] border flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${cur.accent} 7%, transparent)`, borderColor: `color-mix(in srgb, ${cur.accent} 16%, transparent)` }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Sparkles size={18} color={cur.accent} strokeWidth={1.75} />
            </motion.div>
            <span className="text-xs font-extrabold tracking-widest text-foreground font-display">{BRAND.name.toUpperCase()}</span>
          </div>

          <div className="text-center relative z-10">
            <h2 className="text-2xl md:text-[1.65rem] font-black font-display text-foreground tracking-tight mb-1">{isLogin ? 'SIGN IN' : 'SIGN UP'}</h2>
            <p className="text-[13px] text-muted-foreground font-medium">{isLogin ? 'Access your Veyntra Studio.' : 'Create your secure AI profile.'}</p>
          </div>

          <div className="flex bg-input border border-border rounded-xl p-[3px] gap-2 relative z-10">
            {[{ v: true, Icon: LogIn, l: 'Sign In' }, { v: false, Icon: UserPlus, l: 'Register' }].map(({ v, Icon, l }) => (
              <button 
                key={String(v)} 
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-transparent border-none rounded-[9px] cursor-pointer font-sans relative transition-all duration-300"
                style={{ color: isLogin === v ? cur.accent : 'var(--muted-foreground)' }} 
                onClick={() => { setIsLogin(v); setError(''); }}
              >
                {isLogin === v && (
                  <motion.div 
                    layoutId="auth-tab" 
                    className="absolute inset-0 bg-card border border-border rounded-lg" 
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }} 
                  />
                )}
                <Icon size={13} className="relative z-10" strokeWidth={1.75} />
                <span className="relative z-10 text-[0.83rem] font-bold">{l}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-destructive/5 border border-border rounded-lg px-4 py-2.5 text-[13px] text-destructive leading-relaxed relative z-10 flex items-start gap-2"
                role="alert"
                aria-live="polite"
              >
                <Info size={14} className="shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            {/* Additional Register Fields */}
            {!isLogin && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground tracking-wide" htmlFor="register-fullname-input">Full Name</label>
                  <div 
                    className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
                      border: `1.5px solid ${nameFocus ? cur.accent : (isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)')}`
                    }}
                  >
                    <User size={15} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
                    <input 
                      id="register-fullname-input"
                      name="fullname"
                      type="text" 
                      placeholder="Jane Doe" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      onFocus={() => setNameFocus(true)} 
                      onBlur={() => setNameFocus(false)}
                      className="flex-1 h-[46px] bg-transparent border-none outline-none text-[13.5px] text-foreground font-sans"
                      disabled={loading} 
                      autoComplete="name" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground tracking-wide" htmlFor="register-role-select">Role</label>
                  <div 
                    className="flex items-center gap-2.5 px-2.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
                      border: `1.5px solid ${isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)'}`
                    }}
                  >
                    <select
                      id="register-role-select"
                      name="role"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      disabled={loading}
                      className="flex-1 h-[46px] bg-transparent border-none outline-none text-[13.5px] text-foreground font-sans cursor-pointer"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground tracking-wide" htmlFor="register-primarytool-select">Primary Tool</label>
                  <div 
                    className="flex items-center gap-2.5 px-2.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
                      border: `1.5px solid ${isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)'}`
                    }}
                  >
                    <select
                      id="register-primarytool-select"
                      name="primaryTool"
                      value={primaryTool}
                      onChange={e => setPrimaryTool(e.target.value)}
                      disabled={loading}
                      className="flex-1 h-[46px] bg-transparent border-none outline-none text-[13.5px] text-foreground font-sans cursor-pointer"
                    >
                      {PRIMARY_TOOLS.map(t => (
                        <option key={t} value={t} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground tracking-wide" htmlFor="auth-email-input">Email Address</label>
              <div 
                className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all duration-200"
                style={{
                  background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
                  border: `1.5px solid ${emailFocus ? cur.accent : (isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)')}`
                }}
              >
                <Mail size={15} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
                <input 
                  id="auth-email-input"
                  name="email"
                  type="email" 
                  placeholder="name@email.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)} 
                  onBlur={() => setEmailFocus(false)}
                  className="flex-1 h-[46px] bg-transparent border-none outline-none text-[13.5px] text-foreground font-sans"
                  disabled={loading} 
                  autoComplete="email" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground tracking-wide" htmlFor="auth-password-input">Password</label>
              <div 
                className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all duration-200"
                style={{
                  background: isDark ? 'color-mix(in srgb, var(--foreground) 1.5%, transparent)' : 'var(--input)',
                  border: `1.5px solid ${passwordFocus ? cur.accent : (isDark ? 'color-mix(in srgb, var(--foreground) 7%, transparent)' : 'var(--border)')}`
                }}
              >
                <Lock size={15} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
                <input 
                  id="auth-password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)} 
                  onBlur={() => setPasswordFocus(false)}
                  className="flex-1 h-[46px] bg-transparent border-none outline-none text-[13.5px] text-foreground font-sans"
                  disabled={loading} 
                  autoComplete={isLogin ? 'current-password' : 'new-password'} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="bg-transparent border-none cursor-pointer text-muted-foreground p-1 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="w-full h-12 flex items-center justify-center gap-2 text-sm font-extrabold cursor-pointer font-sans tracking-tight mt-1 border-none rounded-xl text-accent-foreground"
              style={{
                background: cur.accent,
                boxShadow: `0 8px 30px color-mix(in srgb, ${cur.accent} 15%, transparent)`
              }}
              disabled={loading}
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading ? { scale: 0.985 } : {}}
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} 
                  className="w-4.5 h-4.5 rounded-full border-[2.5px] border-border border-t-foreground animate-spin" 
                />
              ) : (
                <>{isLogin ? 'Access Workspace' : 'Create Account'}<ArrowRight size={15} strokeWidth={1.75} /></>
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 relative z-10">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-[46px] flex items-center justify-center gap-2 bg-card text-foreground border border-border rounded-xl text-[13.5px] font-bold cursor-pointer font-sans relative z-10 transition-all duration-200"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            title="Authenticate instantly using your Google Account"
            aria-label="Continue with Google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" className="mr-1.5">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.56 2.69-3.86 2.69-6.6z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.91-2.26a5.6 5.6 0 0 1-8.59-3H.48v2.33A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.46 10.54a5.4 5.4 0 0 1 0-3.08V5.13H.48a9 9 0 0 0 0 7.74l2.98-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.45A9 9 0 0 0 .48 5.13l2.98 2.33a5.6 5.6 0 0 1 5.54-3.88z"/>
            </svg>
            Continue with Google
          </motion.button>

          <motion.button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full h-[46px] flex items-center justify-center gap-2 bg-card text-foreground border border-border rounded-xl text-[13.5px] font-bold cursor-pointer font-sans relative z-10 transition-all duration-200 mt-2"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            title={`Explore ${BRAND.name} instantly in Demo Mode`}
            aria-label="Use Demo Account"
          >
            <Sparkles size={16} className="mr-1.5" style={{ color: cur.accent }} strokeWidth={1.75} />
            Use Demo Account
          </motion.button>

          <p className="text-[11px] text-muted-foreground text-center leading-normal relative z-10 inline-flex items-center justify-center gap-1.5 mt-2">
            <Lock size={12} strokeWidth={1.75} /> Secure OAuth & Google Auth Protocol Integration
          </p>
        </motion.div>
        <div className="margin-auto my-auto" />
      </div>
    </div>
  );
}
