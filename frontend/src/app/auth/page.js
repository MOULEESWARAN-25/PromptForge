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
    theme 
  } = useApp();
  const router = useRouter();

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
    color: 'var(--accent-foreground)'
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

  // ══ VERIFICATION SCREEN RENDER ═════════════════════════════
  if (mounted && user && !user.emailVerified) {
    return (
      <div style={dynamicRoot}>
        <div style={dynamicPanelGrid} />
        
        <div style={rightPanel}>
          <div style={{ margin: 'auto' }} />
          <div style={dynamicFormCard}>
            <div style={{ ...cardTopShine, background: `linear-gradient(90deg, transparent 0%, ${cur.accent}77 50%, transparent 100%)` }} />
            
            <div style={brandRow}>
              <div style={{ ...brandIcon, background: `${cur.accent}12`, borderColor: `${cur.accent}28` }}>
                <Sparkles size={18} color={cur.accent} />
              </div>
              <span style={brandName}>{BRAND.name.toUpperCase()}</span>
            </div>

            <div style={formHeading}>
              <h2 style={formTitle}>VERIFY EMAIL</h2>
              <p style={dynamicFormSub}>Verification email sent to:</p>
              <p style={{ fontWeight: 800, color: cur.accent, fontSize: '0.9rem', marginTop: 4, wordBreak: 'break-all' }}>{user.email}</p>
            </div>

            {error && (
              <div style={errMsg} role="alert">
                <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
              <motion.button
                onClick={handleRefreshStatus}
                style={{ ...dynamicSubmitBtn, background: cur.accent, marginTop: 0 }}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? 'Checking status...' : 'I Have Verified - Access Workspace'}
              </motion.button>

              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Didn't receive it?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleResend}
                    style={{ ...dynamicDemoBtn, height: 40, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    disabled={loading}
                  >
                    <Mail size={14} style={{ marginRight: 6 }} />
                    Resend Verification Email
                  </button>

                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...dynamicDemoBtn, height: 40, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <ArrowRight size={14} style={{ marginRight: 6 }} />
                    Open Gmail
                  </a>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <label style={dynamicFieldLabel}>Change Email Address</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem' }}>
                  <div style={{ ...dynamicInputWrap(newEmailFocus, cur.accent), flex: 1 }}>
                    <Mail size={15} style={dynamicInputIcon} />
                    <input
                      type="email"
                      placeholder="new-email@example.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      onFocus={() => setNewEmailFocus(true)}
                      onBlur={() => setNewEmailFocus(false)}
                      style={inputEl}
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    style={{ ...dynamicSubmitBtn, width: 'auto', padding: '0 1rem', background: 'var(--foreground)', color: 'var(--background)', marginTop: 0, borderRadius: 12, height: 46 }}
                    disabled={loading}
                  >
                    Update
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                style={{ ...dynamicDemoBtn, borderColor: 'transparent', background: 'transparent', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}
              >
                Sign Out / Use Another Account
              </button>
            </div>
          </div>
          <div style={{ margin: 'auto' }} />
        </div>
      </div>
    );
  }

  // ══ MAIN LOGIN / ONBOARDING SIGNUP RENDER ═════════════════
  return (
    <div style={dynamicRoot}>
      <div style={dynamicPanelGrid} />

      {/* LEFT PANEL — Carousel */}
      <div className="hidden lg:flex" style={leftPanel}>
        <motion.div
          key={`orb-${slide}`}
          style={{ ...panelOrb, background: `radial-gradient(circle, ${cur.accent}16 0%, transparent 65%)` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        />

        <svg style={arcSvg} viewBox="0 0 520 700" fill="none" preserveAspectRatio="none">
          <path d="M500 80 Q 60 350 500 620" stroke={dynamicArcStroke1} strokeWidth="1.5" strokeDasharray="10 8" />
          <path d="M20 100 Q 460 350 20 600" stroke={dynamicArcStroke2} strokeWidth="1" strokeDasharray="7 10" />
        </svg>

        <div style={logoRow}>
          <div style={logoIcon}><Sparkles size={15} color="#6843EC" /></div>
          <span style={logoName}>{BRAND.name}</span>
          <motion.span
            key={`badge-${slide}`}
            style={{ ...logoBadge, color: cur.accent, borderColor: `${cur.accent}35`, background: `${cur.accent}12` }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          >v2.0</motion.span>
        </div>

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
              <div style={{ ...slidePill, color: cur.accent, borderColor: `${cur.accent}30`, background: `${cur.accent}0e` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cur.accent }} />
                {cur.badge}
              </div>

              <h1 style={slideHeadline}>
                {cur.headline.map((line, i) =>
                  i === cur.accentLine
                    ? <span key={i} style={{ background: `linear-gradient(120deg, ${cur.accent} 0%, ${cur.accent}bb 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>{line}</span>
                    : <span key={i} style={{ display: 'block' }}>{line}</span>
                )}
              </h1>

              <div style={imgCardOuter}>
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
                    <div style={dynamicImgCardUrl}><span>{BRAND.domain}</span></div>
                    <div style={{ width: 36 }} />
                  </div>
                  <img src={cur.img} alt={cur.imgAlt} style={imgEl} loading="eager" />
                  <div style={dynamicImgOverlay} />
                </motion.div>

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

              <p style={dynamicSlideSub}>{cur.sub}</p>

              <div style={{ ...statTag, color: cur.accent, borderColor: `${cur.accent}25`, background: `${cur.accent}0a` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cur.accent }} />
                {cur.tag}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={bottomBar}>
          <p style={dynamicBottomLabel}>Sign in to compile specifications built for you</p>
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

      {/* RIGHT PANEL — Form Card */}
      <div style={rightPanel}>
        <motion.div
          key={`right-orb-${slide}`}
          style={{ ...rightOrb, background: `radial-gradient(circle, ${cur.accent}0f 0%, transparent 60%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <div style={{ margin: 'auto' }} />

        <motion.div
          style={dynamicFormCard}
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            key={`shine-${slide}`}
            style={{ ...cardTopShine, background: `linear-gradient(90deg, transparent 0%, ${cur.accent}77 50%, transparent 100%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          <div style={brandRow}>
            <motion.div
              style={{ ...brandIcon, background: `${cur.accent}12`, borderColor: `${cur.accent}28` }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Sparkles size={18} color={cur.accent} />
            </motion.div>
            <span style={brandName}>{BRAND.name.toUpperCase()}</span>
          </div>

          <div style={formHeading}>
            <h2 style={formTitle}>{isLogin ? 'SIGN IN' : 'SIGN UP'}</h2>
            <p style={dynamicFormSub}>{isLogin ? 'Access your Veyntra Studio.' : 'Create your secure AI profile.'}</p>
          </div>

          <div style={dynamicTabTrack}>
            {[{ v: true, Icon: LogIn, l: 'Sign In' }, { v: false, Icon: UserPlus, l: 'Register' }].map(({ v, Icon, l }) => (
              <button key={String(v)} style={dynamicTabBtn(isLogin === v, cur.accent)} onClick={() => { setIsLogin(v); setError(''); }}>
                {isLogin === v && <motion.div layoutId="auth-tab" style={dynamicTabHighlight} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <Icon size={13} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1, fontSize: '0.83rem', fontWeight: 700 }}>{l}</span>
              </button>
            ))}
          </div>

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

          <form onSubmit={handleSubmit} style={fieldStack}>
            {/* Additional Register Fields */}
            {!isLogin && (
              <>
                <div style={fieldGroup}>
                  <label style={dynamicFieldLabel}>Full Name</label>
                  <div style={dynamicInputWrap(nameFocus, cur.accent)}>
                    <User size={15} style={dynamicInputIcon} />
                    <input 
                      type="text" 
                      placeholder="Jane Doe" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      onFocus={() => setNameFocus(true)} 
                      onBlur={() => setNameFocus(false)}
                      style={inputEl} 
                      disabled={loading} 
                      autoComplete="name" 
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label style={dynamicFieldLabel}>Role</label>
                  <div style={{ ...dynamicInputWrap(false, cur.accent), padding: '0 0.4rem' }}>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      disabled={loading}
                      style={{
                        ...inputEl,
                        background: 'transparent',
                        color: 'var(--foreground)',
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        height: 46,
                        cursor: 'pointer'
                      }}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label style={dynamicFieldLabel}>Primary Tool</label>
                  <div style={{ ...dynamicInputWrap(false, cur.accent), padding: '0 0.4rem' }}>
                    <select
                      value={primaryTool}
                      onChange={e => setPrimaryTool(e.target.value)}
                      disabled={loading}
                      style={{
                        ...inputEl,
                        background: 'transparent',
                        color: 'var(--foreground)',
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        height: 46,
                        cursor: 'pointer'
                      }}
                    >
                      {PRIMARY_TOOLS.map(t => (
                        <option key={t} value={t} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div style={fieldGroup}>
              <label style={dynamicFieldLabel}>Email Address</label>
              <div style={dynamicInputWrap(emailFocus, cur.accent)}>
                <Mail size={15} style={dynamicInputIcon} />
                <input 
                  type="email" 
                  placeholder="name@email.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)} 
                  onBlur={() => setEmailFocus(false)}
                  style={inputEl} 
                  disabled={loading} 
                  autoComplete="email" 
                />
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={dynamicFieldLabel}>Password</label>
              <div style={dynamicInputWrap(passwordFocus, cur.accent)}>
                <Lock size={15} style={dynamicInputIcon} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)} 
                  onBlur={() => setPasswordFocus(false)}
                  style={inputEl} 
                  disabled={loading} 
                  autoComplete={isLogin ? 'current-password' : 'new-password'} 
                />
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
            type="button"
            onClick={handleGoogleSignIn}
            style={dynamicDemoBtn}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            title="Authenticate instantly using your Google Account"
            aria-label="Continue with Google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 6 }}>
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
            style={{ ...dynamicDemoBtn, marginTop: '0.5rem' }}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            title={`Explore ${BRAND.name} instantly in Demo Mode`}
            aria-label="Use Demo Account"
          >
            <Sparkles size={16} style={{ marginRight: 6, color: cur.accent }} />
            Use Demo Account
          </motion.button>

          <p style={{ ...dynamicFooterNote, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Lock size={12} /> Secure OAuth & Google Auth Protocol Integration
          </p>
        </motion.div>
        <div style={{ margin: 'auto' }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   STYLES
   (Consistent baseline variables maintained)
══════════════════════════════════ */
const root = { position: 'fixed', inset: 0, display: 'flex', overflowY: 'auto', background: 'var(--background)' };
const leftPanel = { display: 'flex', flex: '0 0 54%', flexDirection: 'column', position: 'relative', overflow: 'clip', padding: '2.5rem 3rem', height: '100%' };
const panelGrid = { position: 'absolute', inset: 0, backgroundSize: '44px 44px', pointerEvents: 'none' };
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

const rightPanel = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', position: 'relative', overflowY: 'auto', height: '100%' };
const formCard = { width: '100%', maxWidth: '425px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2.25rem 2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden', flexShrink: 0 };
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
