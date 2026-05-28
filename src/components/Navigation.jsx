"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogOut, BookOpen, Compass, Sun, Moon, Zap, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Workspace', icon: Compass },
  { href: '/vocabulary', label: 'Vocabulary', icon: BookOpen },
];

export default function Navigation() {
  const { user, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const initials = user.username?.slice(0, 2).toUpperCase() || 'PF';
  const isDark = theme === 'dark';

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={navContainer(isDark)}
      >
        {/* Brand */}
        <Link href="/" style={brandStyle}>
          <div style={logoMark(isDark)}>
            <Sparkles size={15} style={{ color: isDark ? '#fbbf24' : '#19398d' }} />
          </div>
          <span style={brandText(isDark)}>PromptForge</span>
        </Link>

        {/* Center Links — desktop */}
        <div style={linksContainer}>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} style={navLink(isActive, isDark)}>
                <Icon size={14} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={activeIndicator(isDark)}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div style={actionsContainer}>
          {/* Theme Toggle */}
          <motion.button
            style={iconBtn(isDark)}
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark
                  ? <Sun size={16} style={{ color: '#fbbf24' }} />
                  : <Moon size={16} style={{ color: '#19398d' }} />
                }
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* User Avatar */}
          <div style={userPill(isDark)}>
            <div style={avatarCircle(isDark)}>{initials}</div>
            <span style={usernameText(isDark)}>{user.username}</span>
          </div>

          {/* Logout */}
          <motion.button
            style={{ ...iconBtn(isDark), color: '#ef4444' }}
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Sign out"
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const navContainer = (isDark) => ({
  position: 'sticky',
  top: '16px',
  margin: '16px auto 32px auto',
  width: 'calc(100% - 3rem)',
  maxWidth: '1280px',
  height: '56px',
  padding: '0 1.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 1000,
  background: isDark
    ? 'rgba(0,0,0,0.7)'
    : 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
  borderRadius: '16px',
  boxShadow: isDark
    ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
});

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  textDecoration: 'none',
  flexShrink: 0,
};

const logoMark = (isDark) => ({
  width: '28px',
  height: '28px',
  borderRadius: '7px',
  background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(25,57,141,0.08)',
  border: `1px solid ${isDark ? 'rgba(251,191,36,0.2)' : 'rgba(25,57,141,0.15)'}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const brandText = (isDark) => ({
  fontSize: '1.05rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: isDark ? '#ffffff' : '#0a0a0a',
  letterSpacing: '-0.04em',
});

const linksContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
};

const navLink = (isActive, isDark) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  textDecoration: 'none',
  fontSize: '0.83rem',
  fontWeight: '600',
  padding: '0.45rem 0.9rem',
  borderRadius: '10px',
  position: 'relative',
  transition: 'all 0.2s ease',
  color: isActive
    ? (isDark ? '#fbbf24' : '#19398d')
    : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'),
  background: isActive
    ? (isDark ? 'rgba(251,191,36,0.08)' : 'rgba(25,57,141,0.06)')
    : 'transparent',
  border: isActive
    ? `1px solid ${isDark ? 'rgba(251,191,36,0.15)' : 'rgba(25,57,141,0.1)'}`
    : '1px solid transparent',
});

const activeIndicator = (isDark) => ({
  position: 'absolute',
  bottom: '-2px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '16px',
  height: '2px',
  borderRadius: '2px',
  background: isDark ? '#fbbf24' : '#19398d',
});

const actionsContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const iconBtn = (isDark) => ({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '8px',
  cursor: 'pointer',
  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
  transition: 'all 0.2s ease',
});

const userPill = (isDark) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.25rem 0.625rem 0.25rem 0.25rem',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '999px',
  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
});

const avatarCircle = (isDark) => ({
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  background: isDark ? '#fbbf24' : '#19398d',
  color: isDark ? '#000' : '#fff',
  fontSize: '0.6rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const usernameText = (isDark) => ({
  fontSize: '0.78rem',
  fontWeight: '600',
  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
  maxWidth: '100px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
