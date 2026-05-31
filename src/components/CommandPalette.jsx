"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Palette, Settings, LogOut,
  Monitor, Layout, Code2, Wand2, Sparkles, ArrowRight,
  Moon, Sun, Clock, Command, X
} from 'lucide-react';
import { track, EVENTS } from '../lib/analytics';

// ─── Static navigation items ──────────────────────────────────
const NAV_ACTIONS = [
  { id: 'nav-dashboard', label: 'Go to Workspace', icon: LayoutDashboard, href: '/dashboard', group: 'Navigation' },
  { id: 'nav-vocabulary', label: 'Design Token Library', icon: Palette, href: '/vocabulary', group: 'Navigation' },
  { id: 'nav-forge-app', label: 'New Full-Stack Forge', icon: Monitor, href: '/forge?mode=application', group: 'Quick Action' },
  { id: 'nav-forge-page', label: 'New Web Page Design', icon: Layout, href: '/forge?mode=page', group: 'Quick Action' },
  { id: 'nav-forge-enhance', label: 'Quick Prompt Enhance', icon: Wand2, href: '/forge?mode=enhance', group: 'Quick Action' },
  { id: 'nav-components', label: 'Component Catalog', icon: Code2, href: '/component-forge', group: 'Quick Action' },
  { id: 'nav-settings', label: 'Open Settings', icon: Settings, action: 'settings', group: 'Settings' },
  { id: 'nav-theme', label: 'Toggle Theme', icon: Moon, action: 'theme', group: 'Settings' },
];

export default function CommandPalette({ onSettingsOpen }) {
  const { user, history, theme, toggleTheme, logout } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  // ─── Open/Close via Ctrl+K ────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => {
          if (!prev) track(EVENTS.COMMAND_PALETTE_OPENED);
          return !prev;
        });
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIdx(0);
    }
  }, [open]);

  // ─── Build filtered results ───────────────────────────────
  const results = useCallback(() => {
    const q = query.toLowerCase().trim();

    // Recent workspaces from history
    const historyItems = (history || []).slice(0, 5).map(h => ({
      id: `history-${h.id}`,
      label: h.title,
      icon: Clock,
      href: `/chat?id=${h.id}`,
      group: 'Recent Workspaces',
      meta: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));

    const allItems = [...NAV_ACTIONS, ...historyItems];

    if (!q) return allItems;
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
    );
  }, [query, history]);

  const items = results();

  // ─── Keyboard navigation ──────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && items[activeIdx]) { handleSelect(items[activeIdx]); }
  };

  const handleSelect = (item) => {
    track(EVENTS.COMMAND_PALETTE_NAVIGATED, { item: item.id });
    setOpen(false);

    if (item.action === 'settings') { onSettingsOpen?.(); return; }
    if (item.action === 'theme') { toggleTheme(); return; }
    if (item.href) { router.push(item.href); }
  };

  // ─── Group items ──────────────────────────────────────────
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const isDark = theme === 'dark';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              style={paletteContainer(isDark)}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Search input */}
              <div style={searchRow(isDark)}>
                <Search size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search actions, pages, workspaces…"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
                  onKeyDown={handleKeyDown}
                  style={searchInput}
                  autoComplete="off"
                />
                <button onClick={() => setOpen(false)} style={closeBtn(isDark)} aria-label="Close">
                  <X size={14} />
                </button>
              </div>

              {/* Results */}
              <div style={resultsArea}>
                {items.length === 0 ? (
                  <div style={emptyResult}>
                    <Sparkles size={18} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                    <span>No results for "{query}"</span>
                  </div>
                ) : (
                  Object.entries(grouped).map(([group, groupItems]) => (
                    <div key={group}>
                      <div style={groupLabel}>{group}</div>
                      {groupItems.map((item, idx) => {
                        const Icon = item.icon;
                        const globalIdx = items.indexOf(item);
                        const isActive = globalIdx === activeIdx;
                        return (
                          <motion.button
                            key={item.id}
                            style={resultItem(isActive, isDark)}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIdx(globalIdx)}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div style={resultIconWrap(isActive)}>
                              <Icon size={14} />
                            </div>
                            <span style={resultLabel}>{item.label}</span>
                            {item.meta && <span style={resultMeta}>{item.meta}</span>}
                            {isActive && (
                              <span style={resultHint}>
                                <ArrowRight size={12} />
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div style={footerHint(isDark)}>
                <span style={kbdHint}><kbd style={kbdStyle}>↑↓</kbd> Navigate</span>
                <span style={kbdHint}><kbd style={kbdStyle}>↵</kbd> Select</span>
                <span style={kbdHint}><kbd style={kbdStyle}>Esc</kbd> Close</span>
                <span style={{ ...kbdHint, marginLeft: 'auto' }}>
                  <Command size={11} /> K to open anywhere
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '12vh',
};

const paletteContainer = (isDark) => ({
  width: '100%',
  maxWidth: '580px',
  margin: '0 1rem',
  background: isDark ? 'rgba(10,10,18,0.95)' : 'rgba(255,255,255,0.97)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  borderRadius: '16px',
  boxShadow: isDark
    ? '0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)'
    : '0 32px 80px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const searchRow = (isDark) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 1.25rem',
  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
});

const searchInput = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '0.95rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const closeBtn = (isDark) => ({
  background: 'transparent',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '6px',
  padding: '4px 6px',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

const resultsArea = {
  maxHeight: '360px',
  overflowY: 'auto',
  padding: '0.5rem',
};

const groupLabel = {
  fontSize: '0.68rem',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  padding: '0.5rem 0.75rem 0.25rem',
};

const resultItem = (isActive, isDark) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.75rem',
  borderRadius: '10px',
  background: isActive
    ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')
    : 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'var(--font-sans)',
  transition: 'background 0.1s ease',
});

const resultIconWrap = (isActive) => ({
  width: '28px',
  height: '28px',
  borderRadius: '7px',
  background: isActive ? 'rgba(104,67,236,0.12)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${isActive ? 'rgba(104,67,236,0.2)' : 'rgba(255,255,255,0.06)'}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: isActive ? '#6843EC' : 'var(--muted-foreground)',
  flexShrink: 0,
  transition: 'all 0.15s ease',
});

const resultLabel = {
  flex: 1,
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--foreground)',
};

const resultMeta = {
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  fontWeight: '500',
};

const resultHint = {
  color: 'var(--muted-foreground)',
  display: 'flex',
  alignItems: 'center',
};

const emptyResult = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '2rem',
  color: 'var(--muted-foreground)',
  fontSize: '0.85rem',
};

const footerHint = (isDark) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.65rem 1.25rem',
  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  flexWrap: 'wrap',
});

const kbdHint = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.7rem',
  color: 'var(--muted-foreground)',
};

const kbdStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.65rem',
  padding: '2px 5px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '4px',
  fontStyle: 'normal',
};
