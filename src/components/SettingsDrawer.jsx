"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Award, Settings, ArrowRight, Sun, Moon, Key, LogOut, Keyboard, CheckCircle, AlertCircle, Wifi, WifiOff, TrendingUp, Shield, Mail } from 'lucide-react';
import Link from 'next/link';
import { track, EVENTS } from '../lib/analytics';

const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['⌘', 'Enter'], label: 'Submit refinement in chat' },
  { keys: ['Esc'], label: 'Close modals / palette' },
];

export default function SettingsDrawer({ isOpen, onClose }) {
  const { user, theme, toggleTheme, apiKey, updateApiKey, dbConnected, logout, history, getUsageStats } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || '');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Email notifications preferences states
  const [emailWelcome, setEmailWelcome] = useState(true);
  const [emailDraftRecovery, setEmailDraftRecovery] = useState(true);
  const [emailAnalytics, setEmailAnalytics] = useState(false);


  if (!user) return null;

  const initials = user.username?.slice(0, 2).toUpperCase() || 'PF';
  const isDark = theme === 'dark';
  const usage = getUsageStats();
  const isDemo = user.username === 'demo_engineer';

  const handleSaveApiKey = () => {
    updateApiKey(apiKeyInput);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleUpgradeClick = () => {
    track(EVENTS.UPGRADE_CLICKED, { source: 'settings_drawer' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={overlayStyle}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Account Settings"
        >
          <motion.div
            style={drawerStyle(isDark)}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Drawer Header */}
            <div style={headerStyle(isDark)}>
              <div style={titleContainer}>
                <Settings size={18} style={{ color: 'var(--accent)' }} />
                <h2 style={drawerTitle}>Settings</h2>
              </div>
              <motion.button style={closeBtn} onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                aria-label="Close settings">
                <X size={20} />
              </motion.button>
            </div>

            {/* Scrollable Body */}
            <div style={bodyStyle}>

              {/* ── Profile Card ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <User size={15} style={{ color: 'var(--accent)' }} />
                  <span style={sectionTitle}>Profile</span>
                  {isDemo && <span className="demo-banner" style={{ marginLeft: 'auto' }}>DEMO</span>}
                </div>
                <div style={profileDetailBox}>
                  <div style={avatarCircle(isDark)}>{initials}</div>
                  <div style={profileInfo}>
                    <span style={profileName}>{user.username}</span>
                    <span style={profileEmail}>{user.username.toLowerCase()}@promptforge.ai</span>
                  </div>
                </div>
              </div>

              {/* ── Usage Limits ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <TrendingUp size={15} style={{ color: 'var(--accent)' }} />
                  <span style={sectionTitle}>Usage</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: usage.isAtLimit ? '#ef4444' : 'var(--muted-foreground)', fontWeight: 600 }}>
                    {usage.used} / {usage.max} workspaces
                  </span>
                </div>
                <div className="usage-bar" style={{ margin: '0.25rem 0' }}>
                  <div
                    className={`usage-bar-fill ${usage.isAtLimit ? 'danger' : ''}`}
                    style={{ width: `${usage.percent}%` }}
                  />
                </div>
                {usage.isNearLimit && (
                  <p style={{ fontSize: '0.75rem', color: usage.isAtLimit ? '#ef4444' : 'var(--warning)', marginTop: '0.25rem' }}>
                    {usage.isAtLimit
                      ? "You've reached your free workspace limit."
                      : "Almost at your limit — upgrade for unlimited workspaces."}
                  </p>
                )}
              </div>

              {/* ── Plan / Subscription ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <Award size={15} style={{ color: '#a855f7' }} />
                  <span style={sectionTitle}>Subscription</span>
                </div>
                <div style={planDetailBox}>
                  <div style={planHeader}>
                    <span style={planBadge}>Hobby Tier</span>
                    <span style={planPrice}>Free forever</span>
                  </div>
                  <p style={planDesc}>
                    Core workspace compiler, design token search, and {usage.max} saved workspaces.
                  </p>
                  <Link href="/pricing/pro" style={upgradeBtn} onClick={handleUpgradeClick}>
                    <span>Upgrade to Pro — $15/mo</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* ── Theme ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  {isDark ? <Moon size={15} style={{ color: 'var(--accent)' }} /> : <Sun size={15} style={{ color: 'var(--accent)' }} />}
                  <span style={sectionTitle}>Appearance</span>
                </div>
                <button style={themeToggleBtn(isDark)} onClick={toggleTheme} aria-label="Toggle theme">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {isDark ? <Moon size={16} style={{ color: '#fbbf24' }} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <div style={toggleSwitch(isDark)}>
                    <div style={toggleKnob(isDark)} />
                  </div>
                </button>
              </div>

              {/* ── Email Notification Settings (SaaS Retention Loops) ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <Mail size={15} style={{ color: 'var(--accent)' }} />
                  <span style={sectionTitle}>Email Notifications</span>
                </div>
                <p style={planDesc}>Customize lifecycle emails, recovery prompts and tips.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button style={toggleBtnStyle(isDark)} onClick={() => { setEmailWelcome(!emailWelcome); toast.success('Preference updated!'); }}>
                    <span style={notificationLabelStyle}>Welcome tips & guides</span>
                    <div style={toggleSwitch(emailWelcome)}>
                      <div style={toggleKnob(emailWelcome)} />
                    </div>
                  </button>
                  <button style={toggleBtnStyle(isDark)} onClick={() => { setEmailDraftRecovery(!emailDraftRecovery); toast.success('Preference updated!'); }}>
                    <span style={notificationLabelStyle}>Draft recovery reminders</span>
                    <div style={toggleSwitch(emailDraftRecovery)}>
                      <div style={toggleKnob(emailDraftRecovery)} />
                    </div>
                  </button>
                  <button style={toggleBtnStyle(isDark)} onClick={() => { setEmailAnalytics(!emailAnalytics); toast.success('Preference updated!'); }}>
                    <span style={notificationLabelStyle}>Weekly prompt summaries</span>
                    <div style={toggleSwitch(emailAnalytics)}>
                      <div style={toggleKnob(emailAnalytics)} />
                    </div>
                  </button>
                </div>
              </div>

              {/* ── API Key ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <Key size={15} style={{ color: 'var(--accent)' }} />
                  <span style={sectionTitle}>Gemini API Key</span>
                </div>
                <p style={planDesc}>Use your own API key for live generation (optional).</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="AIza..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    style={apiKeyInput_style(isDark)}
                    aria-label="Gemini API Key"
                  />
                  <button style={showBtn(isDark)} onClick={() => setShowApiKey(!showApiKey)} aria-label={showApiKey ? 'Hide key' : 'Show key'}>
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button style={saveKeyBtn(apiKeySaved)} onClick={handleSaveApiKey}>
                  {apiKeySaved ? <><CheckCircle size={13} /> Saved!</> : 'Save Key'}
                </button>
              </div>

              {/* ── DB Status ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  {dbConnected
                    ? <Wifi size={15} style={{ color: 'var(--success)' }} />
                    : <WifiOff size={15} style={{ color: 'var(--muted-foreground)' }} />}
                  <span style={sectionTitle}>Sync Status</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600, color: dbConnected ? 'var(--success)' : 'var(--muted-foreground)' }}>
                    {dbConnected ? '● Cloud Sync Active' : '○ Local Only'}
                  </span>
                </div>
                <p style={planDesc}>
                  {dbConnected
                    ? 'Your prompts are synced to the cloud and accessible across devices.'
                    : 'Cloud unavailable. Prompts are saved locally on this device only.'}
                </p>
              </div>

              {/* ── Keyboard Shortcuts ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <Keyboard size={15} style={{ color: 'var(--accent)' }} />
                  <span style={sectionTitle}>Keyboard Shortcuts</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {KEYBOARD_SHORTCUTS.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{s.label}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {s.keys.map((k, j) => (
                          <kbd key={j} style={kbdStyle(isDark)}>{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Security / Device Trust ── */}
              <div style={sectionCard(isDark)}>
                <div style={cardHeaderRow}>
                  <Shield size={15} style={{ color: 'var(--accent)' }} />
                  <span style={sectionTitle}>Security & Sessions</span>
                </div>
                <p style={planDesc}>Manage active browser sessions and device authorizations.</p>
                <div style={sessionBox(isDark)}>
                  <div style={sessionRowItem}>
                    <div style={sessionDeviceDot} />
                    <div style={sessionDeviceInfo}>
                      <span style={sessionDeviceText}>Chrome on Windows (Current)</span>
                      <span style={sessionIpText}>IP: 192.168.1.45 — Active now</span>
                    </div>
                  </div>
                  <div style={sessionRowItem}>
                    <div style={{ ...sessionDeviceDot, background: 'rgba(255,255,255,0.2)' }} />
                    <div style={sessionDeviceInfo}>
                      <span style={sessionDeviceText}>Safari on iPhone 16 Pro</span>
                      <span style={sessionIpText}>IP: 172.56.21.90 — 3 hours ago</span>
                    </div>
                  </div>
                </div>
                <button style={terminateSessionsBtn(isDark)} onClick={() => {
                  toast.success("Successfully signed out all other devices!");
                  track('other_sessions_terminated');
                }}>
                  Sign out all other devices
                </button>
              </div>

              {/* ── Sign Out ── */}
              <button style={signOutBtn} onClick={handleLogout}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Styles ── */
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
  zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
};

const drawerStyle = (isDark) => ({
  width: '100%', maxWidth: '400px', height: '100vh',
  backgroundColor: isDark ? 'rgba(10,10,12,0.92)' : 'rgba(255,255,255,0.96)',
  backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
  borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  boxShadow: '-8px 0 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
});

const headerStyle = (isDark) => ({
  padding: '1.25rem 1.5rem',
  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
});

const titleContainer = { display: 'flex', alignItems: 'center', gap: '0.65rem' };

const drawerTitle = {
  fontSize: '1.05rem', fontWeight: '700', fontFamily: 'var(--font-display)',
  color: 'var(--foreground)', letterSpacing: '-0.01em',
};

const closeBtn = {
  background: 'transparent', border: 'none', color: 'var(--muted-foreground)',
  cursor: 'pointer', padding: '4px', borderRadius: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px',
};

const bodyStyle = {
  flex: 1, overflowY: 'auto', padding: '1.25rem',
  display: 'flex', flexDirection: 'column', gap: '1rem',
};

const sectionCard = (isDark) => ({
  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  borderRadius: '12px', padding: '1rem 1.1rem',
  display: 'flex', flexDirection: 'column', gap: '0.65rem',
});

const cardHeaderRow = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
const sectionTitle = { fontSize: '0.84rem', fontWeight: '700', color: 'var(--foreground)', fontFamily: 'var(--font-display)' };
const profileDetailBox = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.1rem 0' };

const avatarCircle = (isDark) => ({
  width: '40px', height: '40px', borderRadius: '50%',
  background: isDark ? '#fbbf24' : '#19398d', color: isDark ? '#000' : '#fff',
  fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
});

const profileInfo = { display: 'flex', flexDirection: 'column', gap: '0.15rem' };
const profileName = { fontSize: '0.92rem', fontWeight: '700', color: 'var(--foreground)' };
const profileEmail = { fontSize: '0.76rem', color: 'var(--muted-foreground)' };
const planDetailBox = { display: 'flex', flexDirection: 'column', gap: '0.6rem' };
const planHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const planBadge = {
  fontSize: '0.7rem', fontWeight: '700', color: '#a855f7',
  background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
  padding: '2px 8px', borderRadius: '999px',
};

const planPrice = { fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted-foreground)' };
const planDesc = { fontSize: '0.8rem', color: 'var(--muted-foreground)', lineHeight: '1.5' };

const upgradeBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#000', borderRadius: '8px', padding: '0.55rem 1rem',
  fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', marginTop: '0.25rem',
  transition: 'opacity 0.2s ease',
};

const themeToggleBtn = (isDark) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.6rem 0.8rem', borderRadius: '10px', cursor: 'pointer',
  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  width: '100%', fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
});

const toggleSwitch = (isDark) => ({
  width: '36px', height: '20px', borderRadius: '999px',
  background: isDark ? 'var(--accent)' : 'rgba(0,0,0,0.15)',
  position: 'relative', transition: 'background 0.25s ease', flexShrink: 0,
});

const toggleKnob = (isDark) => ({
  position: 'absolute', top: '2px',
  left: isDark ? 'calc(100% - 18px)' : '2px',
  width: '16px', height: '16px', borderRadius: '50%',
  background: '#fff', transition: 'left 0.25s var(--ease-spring)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
});

const apiKeyInput_style = (isDark) => ({
  flex: 1, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem',
  color: 'var(--foreground)', fontFamily: 'var(--font-mono)', outline: 'none',
});

const showBtn = (isDark) => ({
  padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)',
  fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
});

const saveKeyBtn = (saved) => ({
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer',
  background: saved ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
  border: `1px solid ${saved ? 'rgba(34,197,94,0.25)' : 'rgba(251,191,36,0.25)'}`,
  color: saved ? 'var(--success)' : 'var(--accent)',
  fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease', marginTop: '0.25rem',
});

const kbdStyle = (isDark) => ({
  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '2px 6px',
  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
  borderRadius: '4px', color: 'var(--foreground)',
});

const signOutBtn = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.7rem 1rem', borderRadius: '10px', cursor: 'pointer',
  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
  color: '#ef4444', fontSize: '0.85rem', fontWeight: 700,
  fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease', marginTop: '0.25rem',
};

// ─── Security / Session Styles ────────────────────────────────
const sessionBox = (isDark) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
  borderRadius: '8px',
  padding: '0.65rem 0.75rem',
  marginTop: '0.5rem',
});

const sessionRowItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const sessionDeviceDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#22c55e',
  flexShrink: 0,
};

const sessionDeviceInfo = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
};

const sessionDeviceText = {
  fontSize: '0.78rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const sessionIpText = {
  fontSize: '0.68rem',
  color: 'var(--muted-foreground)',
};

const terminateSessionsBtn = (isDark) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.45rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  background: 'transparent',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  color: 'var(--foreground)',
  fontSize: '0.76rem',
  fontWeight: '700',
  fontFamily: 'var(--font-sans)',
  marginTop: '0.5rem',
  width: '100%',
  transition: 'all 0.2s ease',
});

const toggleBtnStyle = (isDark) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem 0.65rem',
  borderRadius: '8px',
  cursor: 'pointer',
  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
  width: '100%',
  fontFamily: 'var(--font-sans)',
});

const notificationLabelStyle = {
  fontSize: '0.78rem',
  fontWeight: '600',
  color: 'var(--foreground)',
};


