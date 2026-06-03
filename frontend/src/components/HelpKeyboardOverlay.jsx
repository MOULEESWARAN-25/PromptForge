"use client";

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl + K', action: 'Open Global Command Search Palette' },
  { key: '?', action: 'Toggle Help Keyboard Cheat-Sheet Modal' },
  { key: 'Ctrl + Enter', action: 'Submit/Refine active prompt compiler input' },
  { key: 'Ctrl + S', action: 'Force draft local synchronization' },
  { key: 'Esc', action: 'Close active drawer / palette / modal' },
];

export default function HelpKeyboardOverlay({ isOpen, onClose }) {
  const { theme } = useApp();
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  };

  const modalStyle = {
    width: '100%',
    maxWidth: '440px',
    background: isDark ? 'rgba(26, 23, 64, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border)',
    boxShadow: isDark 
      ? '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.05)' 
      : '0 24px 60px rgba(0,0,0,0.1), 0 0 40px rgba(104,67,236,0.05)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border)',
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
  };

  const actionTextStyle = {
    fontSize: '0.8rem',
    color: isDark ? 'rgba(255,255,255,0.85)' : 'var(--foreground)',
  };

  const kbdKeyStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    fontWeight: '700',
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border)',
    borderRadius: '6px',
    padding: '3px 7px',
    color: 'var(--foreground)',
    boxShadow: isDark ? '0 2px 0 rgba(0,0,0,0.4)' : '0 2px 0 rgba(0,0,0,0.1)',
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '1rem',
    background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
    borderTop: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid var(--border)',
    fontSize: '0.7rem',
    color: 'var(--muted-foreground)',
    fontWeight: '500',
  };

  return (
    <AnimatePresence>
      <div style={overlayStyle} onClick={onClose}>
        <motion.div
          style={modalStyle}
          className="glass-panel"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-labelledby="kbd-title"
        >
          <div style={headerStyle}>
            <div style={titleRow}>
              <Keyboard size={18} style={{ color: 'var(--accent)' }} />
              <h3 id="kbd-title" style={title}>Keyboard Shortcuts</h3>
            </div>
            <button onClick={onClose} style={closeBtn} aria-label="Close modal">
              <X size={15} />
            </button>
          </div>

          <div style={list}>
            {KEYBOARD_SHORTCUTS.map((item, idx) => (
              <div key={idx} style={rowStyle}>
                <span style={actionTextStyle}>{item.action}</span>
                <span style={kbdWrap}>
                  <kbd style={kbdKeyStyle}>{item.key}</kbd>
                </span>
              </div>
            ))}
          </div>

          <div style={footerStyle}>
            <Command size={11} />
            <span>Power developer command center ready.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const titleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const title = {
  fontSize: '0.98rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  margin: 0,
  fontFamily: 'var(--font-display)',
};

const closeBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  padding: '2px',
};

const list = {
  display: 'flex',
  flexDirection: 'column',
  padding: '1rem 1.5rem',
};

const kbdWrap = {
  display: 'flex',
  gap: '0.2rem',
};

