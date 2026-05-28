"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { toast } from 'sonner';
import {
  Lock, User, LogIn, UserPlus, Sparkles, KeyRound,
  ArrowRight, Eye, EyeOff, Zap, Shield, Globe, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }
  }),
};

// ─── Feature stat strip ───────────────────────────────────────
const STATS = [
  { label: 'Prompts Generated', value: '12K+' },
  { label: 'Design Patterns', value: '200+' },
  { label: 'AI Tools Supported', value: '4' },
];

// ─── Feature bullet list ──────────────────────────────────────
const FEATURES = [
  { icon: Zap, text: 'Generate precision AI prompts in seconds' },
  { icon: Shield, text: 'RAG-powered design vocabulary retrieval' },
  { icon: Globe, text: 'Supports Cursor, Lovable, v0, and Bolt' },
  { icon: Star, text: 'Component catalog with 50+ premium patterns' },
];

export default function AuthPage() {
  const { user, login, register } = useApp();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const result = isLogin
        ? await login(username, password)
        : await register(username, password);

      if (result.success) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created!');
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Authentication failed. Check your configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      await login('demo_engineer', 'promptforge2026');
      toast.success('Demo mode activated!');
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      {/* ── Left Panel — Cinematic Brand ──────────────────────── */}
      <div style={leftPanel}>
        {/* Grid lines */}
        <div style={gridOverlay} />

        {/* Ambient orbs */}
        <div style={orb1} />
        <div style={orb2} />
        <div style={orb3} />

        {/* Content */}
        <div style={leftContent}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={leftLogo}
          >
            <div style={leftLogoIcon}>
              <Sparkles size={16} style={{ color: '#fbbf24' }} />
            </div>
            <span style={leftLogoText}>PromptForge</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ marginTop: 'auto' }}
          >
            <div style={leftHeadlineBadge}>
              <span>✦</span>
              <span>AI Prompt Engineering Platform</span>
            </div>
            <h1 style={leftHeadline}>
              The precision layer between
              <br />
              <span style={leftHeadlineAccent}>your idea</span>
              {' '}and perfect code.
            </h1>
            <p style={leftSubtitle}>
              Stop writing vague prompts. Start building with surgical precision.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={featureList}
          >
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} style={featureItem}>
                <div style={featureIconWrap}>
                  <Icon size={13} style={{ color: '#fbbf24' }} />
                </div>
                <span style={featureText}>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={statsRow}
          >
            {STATS.map(({ label, value }, i) => (
              <div key={i} style={statItem}>
                <span style={statValue}>{value}</span>
                <span style={statLabel}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel — Auth Form ────────────────────────────── */}
      <div style={rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={formCard}
        >
          {/* Header */}
          <div style={formHeader}>
            <h2 style={formTitle}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={formSubtitle}>
              {isLogin
                ? 'Sign in to your workspace'
                : 'Start building precision prompts today'}
            </p>
          </div>

          {/* Tab toggle */}
          <div style={tabBar}>
            {[
              { key: true, icon: LogIn, label: 'Sign In' },
              { key: false, icon: UserPlus, label: 'Register' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={String(key)}
                style={tabBtn(isLogin === key)}
                onClick={() => { setIsLogin(key); setError(''); }}
              >
                {isLogin === key && (
                  <motion.div
                    layoutId="tab-bg"
                    style={tabBgSlider}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={14} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={errorBox}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={formBody}>
            {/* Username */}
            <div style={fieldGroup}>
              <label style={fieldLabel}>Username</label>
              <div style={fieldWrap(usernameFocus)}>
                <User size={15} style={fieldIcon} />
                <input
                  type="text"
                  placeholder="e.g. dev_architect"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocus(true)}
                  onBlur={() => setUsernameFocus(false)}
                  style={fieldInput}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={fieldGroup}>
              <label style={fieldLabel}>Password</label>
              <div style={fieldWrap(passwordFocus)}>
                <Lock size={15} style={fieldIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  style={fieldInput}
                  disabled={loading}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeBtn}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              style={submitBtn}
              disabled={loading}
              whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={spinnerInline}
                />
              ) : (
                <>
                  {isLogin ? 'Access Workspace' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={divider}>
            <div style={dividerLine} />
            <span style={dividerText}>or</span>
            <div style={dividerLine} />
          </div>

          {/* Demo */}
          <motion.button
            onClick={handleDemoAccess}
            style={demoBtn}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <KeyRound size={15} style={{ opacity: 0.7 }} />
            Continue with Demo Account
          </motion.button>

          <p style={footerNote}>
            100% client-side. Your credentials are stored locally.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const pageWrapper = {
  flex: 1,
  display: 'flex',
  minHeight: 'calc(100dvh - 60px)',
  margin: '-1.5rem -1.5rem -4rem -1.5rem', // Break out of main padding
};

const leftPanel = {
  flex: '0 0 48%',
  background: 'linear-gradient(145deg, #030712 0%, #0a0a1a 50%, #000814 100%)',
  padding: '3rem',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '@media (max-width: 768px)': { display: 'none' },
};

const gridOverlay = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
  pointerEvents: 'none',
};

const orb1 = {
  position: 'absolute',
  top: '-10%',
  left: '-10%',
  width: '500px',
  height: '500px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 65%)',
  pointerEvents: 'none',
  animation: 'glow-pulse 6s ease-in-out infinite',
};

const orb2 = {
  position: 'absolute',
  bottom: '10%',
  right: '-15%',
  width: '400px',
  height: '400px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 65%)',
  pointerEvents: 'none',
  animation: 'glow-pulse 8s ease-in-out infinite 2s',
};

const orb3 = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  height: '300px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 65%)',
  pointerEvents: 'none',
};

const leftContent = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: '2rem',
};

const leftLogo = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
};

const leftLogoIcon = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: 'rgba(251,191,36,0.12)',
  border: '1px solid rgba(251,191,36,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const leftLogoText = {
  fontSize: '1.1rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: '#ffffff',
  letterSpacing: '-0.04em',
};

const leftHeadlineBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#fbbf24',
  opacity: 0.9,
  marginBottom: '1rem',
};

const leftHeadline = {
  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: '#ffffff',
  lineHeight: '1.2',
  letterSpacing: '-0.03em',
  marginBottom: '1rem',
};

const leftHeadlineAccent = {
  background: 'linear-gradient(135deg, #fbbf24, #f97316)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const leftSubtitle = {
  fontSize: '0.95rem',
  color: 'rgba(255,255,255,0.5)',
  lineHeight: '1.6',
};

const featureList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const featureItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const featureIconWrap = {
  width: '26px',
  height: '26px',
  borderRadius: '7px',
  background: 'rgba(251,191,36,0.1)',
  border: '1px solid rgba(251,191,36,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const featureText = {
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.65)',
  fontWeight: '500',
};

const statsRow = {
  display: 'flex',
  gap: '2rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid rgba(255,255,255,0.08)',
};

const statItem = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const statValue = {
  fontSize: '1.35rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: '#fbbf24',
  letterSpacing: '-0.03em',
};

const statLabel = {
  fontSize: '0.72rem',
  color: 'rgba(255,255,255,0.4)',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const rightPanel = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: 'var(--background)',
};

const formCard = {
  width: '100%',
  maxWidth: '420px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const formHeader = {
  marginBottom: '0.25rem',
};

const formTitle = {
  fontSize: '1.65rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
  marginBottom: '0.35rem',
};

const formSubtitle = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
};

const tabBar = {
  display: 'flex',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '3px',
  gap: '2px',
};

const tabBtn = (active) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  padding: '0.55rem',
  background: 'transparent',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.83rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
  position: 'relative',
  transition: 'color 0.2s ease',
});

const tabBgSlider = {
  position: 'absolute',
  inset: 0,
  background: 'var(--card)',
  borderRadius: '7px',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border)',
};

const errorBox = {
  background: 'rgba(220,38,38,0.06)',
  border: '1px solid rgba(220,38,38,0.2)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
  color: '#ef4444',
  lineHeight: '1.4',
};

const formBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const fieldLabel = {
  fontSize: '0.82rem',
  fontWeight: '600',
  color: 'var(--foreground)',
};

const fieldWrap = (focused) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0 0.75rem',
  background: 'var(--input)',
  border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: '10px',
  boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
  transition: 'all 0.2s ease',
});

const fieldIcon = {
  color: 'var(--muted-foreground)',
  flexShrink: 0,
};

const fieldInput = {
  flex: 1,
  height: '44px',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const eyeBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
};

const submitBtn = {
  width: '100%',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  background: 'var(--accent)',
  color: 'var(--accent-foreground)',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.95rem',
  fontWeight: '700',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  marginTop: '0.25rem',
};

const spinnerInline = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#ffffff',
};

const divider = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const dividerLine = {
  flex: 1,
  height: '1px',
  background: 'var(--border)',
};

const dividerText = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  fontWeight: '600',
};

const demoBtn = {
  width: '100%',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  background: 'var(--muted)',
  color: 'var(--foreground)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
};

const footerNote = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  lineHeight: '1.5',
};
