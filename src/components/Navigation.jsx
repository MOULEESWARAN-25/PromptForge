"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogOut, Sun, Moon, Settings, Zap, Menu, X, LayoutDashboard, Palette, Command } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { track, EVENTS } from '../lib/analytics';

// Dynamic imports for bundle optimization
const SettingsDrawer = dynamic(() => import('./SettingsDrawer'), { ssr: false });
const CommandPalette = dynamic(() => import('./CommandPalette'), { ssr: false });

const PRIVATE_LINKS = [
  { href: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
  { href: '/vocabulary', label: 'Design Tokens', icon: Palette },
];

const PUBLIC_LINKS = [
  { href: '/features/prompt-builder', label: 'Features', icon: Zap },
  { href: '/pricing/pro', label: 'Pricing', icon: Zap },
];

export default function Navigation() {
  const { user, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive Screen Check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 860);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // Hide nav on auth page
  if (pathname === '/auth') return null;

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
    track(EVENTS.SETTINGS_OPENED);
  };

  const isDark = theme === 'dark';
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'PF';
  const isDemo = user?.username === 'demo_engineer';
  const isPrivatePage = user && pathname !== '/' && !pathname.startsWith('/features') && !pathname.startsWith('/pricing');

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={navContainer(isDark)}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Left Side: Brand Logo */}
        <Link href={user ? "/dashboard" : "/"} style={brandStyle} aria-label="PromptForge home">
          <div style={logoMark}>
            <Sparkles size={15} style={{ color: '#fbbf24' }} />
          </div>
          <span style={brandText(isDark)}>PromptForge</span>
          {isDemo && <span className="demo-banner">DEMO</span>}
        </Link>

        {/* Center Navigation Links (Hidden on Mobile) */}
        {!isMobile && (
          <div style={linksContainer} role="menubar">
            {(isPrivatePage ? PRIVATE_LINKS : PUBLIC_LINKS).map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={navLink(isActive, isDark)} role="menuitem"
                  aria-current={isActive ? 'page' : undefined}>
                  <Icon size={14} />
                  {label}
                  {isActive && (
                    <motion.div layoutId="nav-indicator" style={activeIndicator}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side Actions */}
        <div style={actionsContainer}>
          {/* Command Palette trigger (Desktop) */}
          {!isMobile && (
            <motion.button
              style={cmdPaletteBtn(isDark)}
              onClick={() => {
                track(EVENTS.COMMAND_PALETTE_OPENED);
                // Trigger via keyboard event simulation
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              title="Command Palette (Ctrl+K)"
              aria-label="Open command palette"
            >
              <Command size={12} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>⌘K</span>
            </motion.button>
          )}

          {/* Theme Toggle (Desktop Only) */}
          {!isMobile && (
            <motion.button
              style={iconBtn(isDark)}
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="touch-target"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun size={16} style={{ color: '#fbbf24' }} /> : <Moon size={16} style={{ color: '#19398d' }} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          )}

          {user ? (
            (pathname === '/' || pathname.startsWith('/features') || pathname.startsWith('/pricing')) ? (
              !isMobile && (
                <Link href="/dashboard" style={loginBtnStyle(isDark)} className="active-scale-95">
                  Go to Dashboard
                </Link>
              )
            ) : (
              <>
                {/* Settings (Desktop Only) */}
                {!isMobile && (
                  <motion.button style={iconBtn(isDark)} onClick={handleSettingsOpen}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    title="Workspace Settings" aria-label="Open settings" className="touch-target">
                    <Settings size={16} />
                  </motion.button>
                )}

                {/* User Avatar */}
                <div style={userPill(isDark)} title={user.username}>
                  <div style={avatarCircle(isDark)} aria-hidden="true">{initials}</div>
                  {!isMobile && <span style={usernameText(isDark)}>{user.username}</span>}
                </div>

                {/* Logout (Desktop Only) */}
                {!isMobile && (
                  <motion.button style={{ ...iconBtn(isDark), color: '#ef4444' }} onClick={handleLogout}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    title="Sign out" aria-label="Sign out" className="touch-target">
                    <LogOut size={15} />
                  </motion.button>
                )}
              </>
            )
          ) : (
            !isMobile && (
              <Link href="/auth" style={loginBtnStyle(isDark)}>Sign In</Link>
            )
          )}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <motion.button style={iconBtn(isDark)} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="touch-target">
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          )}
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay Drawer */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={mobileMenuDrawer(isDark)}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <div style={mobileLinksList}>
              {(isPrivatePage ? PRIVATE_LINKS : PUBLIC_LINKS).map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} style={mobileLinkStyle(isActive, isDark)} aria-current={isActive ? 'page' : undefined}>
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}

              <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', margin: '0.5rem 0' }} />

              {/* Theme Selector inside mobile menu — always visible */}
              <button onClick={toggleTheme} style={mobileActionBtn(isDark)} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                {isDark ? <Sun size={16} style={{ color: '#fbbf24' }} /> : <Moon size={16} />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              {user ? (
                (pathname === '/' || pathname.startsWith('/features') || pathname.startsWith('/pricing')) ? (
                  <Link href="/dashboard" style={mobileLoginBtn(isDark)}>Go to Dashboard</Link>
                ) : (
                  <>
                    <button onClick={() => { handleSettingsOpen(); setMobileMenuOpen(false); }} style={mobileActionBtn(isDark)}>
                      <Settings size={16} />
                      <span>Workspace Settings</span>
                    </button>
                    <button onClick={handleLogout} style={{ ...mobileActionBtn(isDark), color: '#ef4444' }}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )
              ) : (
                <Link href="/auth" style={mobileLoginBtn(isDark)}>Sign In / Register</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Drawer */}
      {user && (
        <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}

      {/* Command Palette — globally mounted */}
      <CommandPalette onSettingsOpen={handleSettingsOpen} />
    </>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const navContainer = (isDark) => ({
  position: 'sticky',
  top: '16px',
  margin: '16px auto 32px auto',
  width: 'calc(100% - 2rem)',
  maxWidth: '1280px',
  height: '56px',
  padding: '0 1.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 1000,
  background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
  borderRadius: '16px',
  boxShadow: isDark
    ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
});

const brandStyle = { display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 };

const logoMark = {
  width: '28px', height: '28px', borderRadius: '7px',
  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

const brandText = (isDark) => ({
  fontSize: '1.05rem', fontWeight: '800', fontFamily: 'var(--font-display)',
  color: isDark ? '#ffffff' : '#0a0a0a', letterSpacing: '-0.04em',
});

const linksContainer = { display: 'flex', alignItems: 'center', gap: '0.5rem' };

const navLink = (isActive, isDark) => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  textDecoration: 'none', fontSize: '0.83rem', fontWeight: '600',
  padding: '0.45rem 0.9rem', borderRadius: '10px', position: 'relative',
  transition: 'all 0.2s ease',
  color: isActive ? '#fbbf24' : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'),
  background: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
  border: isActive ? '1px solid rgba(251,191,36,0.15)' : '1px solid transparent',
});

const activeIndicator = {
  position: 'absolute', bottom: '-2px', left: '50%',
  transform: 'translateX(-50%)', width: '16px', height: '2px',
  borderRadius: '2px', background: '#fbbf24', zIndex: 2,
};

const actionsContainer = { display: 'flex', alignItems: 'center', gap: '0.5rem' };

const cmdPaletteBtn = (isDark) => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.35rem 0.7rem', borderRadius: '8px', cursor: 'pointer',
  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
  fontSize: '0.72rem', fontFamily: 'var(--font-sans)',
});

const iconBtn = (isDark) => ({
  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '8px', cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
  transition: 'all 0.2s ease',
});

const userPill = (isDark) => ({
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.25rem 0.625rem 0.25rem 0.25rem',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '999px',
  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
});

const avatarCircle = (isDark) => ({
  width: '26px', height: '26px', borderRadius: '50%',
  background: isDark ? '#fbbf24' : '#19398d', color: isDark ? '#000' : '#fff',
  fontSize: '0.62rem', fontWeight: '700', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const usernameText = (isDark) => ({
  fontSize: '0.78rem', fontWeight: '600',
  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
  maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '2px',
});

const loginBtnStyle = (isDark) => ({
  fontSize: '0.85rem', fontWeight: '700', padding: '0.5rem 1.1rem',
  background: isDark ? '#fbbf24' : '#19398d', color: isDark ? '#000' : '#fff',
  border: 'none', borderRadius: '8px', textDecoration: 'none', cursor: 'pointer', minHeight: '36px',
  display: 'inline-flex', alignItems: 'center',
});

const mobileMenuDrawer = (isDark) => ({
  position: 'absolute', top: '76px', left: '16px', right: '16px',
  background: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.98)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '16px', padding: '1.25rem',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 999,
  backdropFilter: 'blur(20px)',
});

const mobileLinksList = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };

const mobileLinkStyle = (isActive, isDark) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.75rem 1rem', borderRadius: '10px', textDecoration: 'none',
  fontSize: '0.9rem', fontWeight: '600',
  color: isActive ? '#fbbf24' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
  background: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
  border: `1px solid ${isActive ? 'rgba(251,191,36,0.15)' : 'transparent'}`,
  minHeight: '44px',
});

const mobileActionBtn = (isDark) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.75rem 1rem', borderRadius: '10px',
  background: 'transparent', border: 'none', fontSize: '0.9rem', fontWeight: '600',
  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
  cursor: 'pointer', textAlign: 'left', width: '100%', minHeight: '44px',
  fontFamily: 'var(--font-sans)',
});

const mobileLoginBtn = (isDark) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '0.75rem', borderRadius: '10px', minHeight: '44px',
  background: isDark ? '#fbbf24' : '#19398d', color: isDark ? '#000' : '#fff',
  fontSize: '0.9rem', fontWeight: '700', textDecoration: 'none', textAlign: 'center', marginTop: '0.5rem',
});
