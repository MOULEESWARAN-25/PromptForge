"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SettingsDrawer from './SettingsDrawer';
import { Sparkles, Settings, LogOut, BookOpen, Compass, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navigation() {
  const { user, logout, apiKey } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // If user is not logged in, do not render navigation
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <>
      <nav style={navContainer} className="glass-panel">
        {/* Brand Logo */}
        <Link href="/" style={brandStyle}>
          <div style={logoWrapper}>
            <Sparkles size={18} style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <span style={brandText}>PromptForge</span>
        </Link>

        {/* Links */}
        <div style={linksRow}>
          <Link
            href="/"
            style={{
              ...navLink,
              ...(pathname === '/' ? activeNavLink : {})
            }}
          >
            <Compass size={16} />
            Workspace
          </Link>

          <Link
            href="/learn"
            style={{
              ...navLink,
              ...(pathname === '/learn' ? activeNavLink : {})
            }}
          >
            <BookOpen size={16} />
            Learning Lab
          </Link>
        </div>

        {/* User Actions */}
        <div style={actionsRow}>
          {/* API Key Status Indicator */}
          <div
            style={{
              ...apiStatusBadge,
              backgroundColor: apiKey ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              borderColor: apiKey ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: apiKey ? '#10b981' : '#ef4444'
            }}
            onClick={() => setSettingsOpen(true)}
            title={apiKey ? "Gemini Live API Active" : "Running in Offline Mode"}
          >
            {apiKey ? <Cpu size={14} /> : <ShieldAlert size={14} />}
            <span style={apiStatusText}>
              {apiKey ? "Gemini Live" : "Offline Mock"}
            </span>
          </div>

          <span style={userLabel}>
            Hi, <strong>{user.username}</strong>
          </span>

          <button
            style={actionBtn}
            onClick={() => setSettingsOpen(true)}
            title="AI Config Settings"
          >
            <Settings size={18} />
          </button>

          <button
            style={{ ...actionBtn, color: '#ef4444' }}
            onClick={handleLogout}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

// Inline Styles for navigation
const navContainer = {
  position: 'sticky',
  top: '1rem',
  left: 0,
  right: 0,
  margin: '1rem auto 2rem auto',
  width: 'calc(100% - 2rem)',
  maxWidth: '1200px',
  height: '64px',
  padding: '0 1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 100,
  background: 'rgba(5, 5, 8, 0.65)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  textDecoration: 'none',
};

const logoWrapper = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(168, 85, 247, 0.1)',
  border: '1px solid rgba(168, 85, 247, 0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const brandText = {
  fontSize: '1.2rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  background: 'linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const linksRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const navLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--fg-muted)',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '500',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'all 0.2s',
};

const activeNavLink = {
  color: '#ffffff',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
};

const actionsRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const apiStatusBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  padding: '4px 10px',
  borderRadius: '99px',
  border: '1px solid',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const apiStatusText = {
  fontFamily: 'Outfit, sans-serif',
};

const userLabel = {
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
};

const actionBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  cursor: 'pointer',
  padding: '6px',
  borderRadius: '6px',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
