"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Layout, Code2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { track } from '../lib/analytics';

const CREATION_TYPES = [
  {
    mode: 'application',
    icon: Monitor,
    title: 'Full-Stack Application',
    desc: 'Map out full-stack multi-page applications complete with folder setups, state routing, and mock configurations.',
    color: 'var(--accent)',
  },
  {
    mode: 'page',
    icon: Layout,
    title: 'Web Page',
    desc: 'Design individual layouts, bento dashboard grids, and visual typography spacing systems.',
    color: '#0284c7',
  },
  {
    mode: 'component',
    icon: Code2,
    title: 'Component',
    desc: 'Configure modular buttons, sheets, accordions, and dropdown select matrices optimized for modern compilers.',
    color: '#db2777',
  }
];

export default function CreateModal({ isOpen, onClose }) {
  const router = useRouter();
  const { theme } = useApp();
  
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const handleSelect = (mode) => {
    localStorage.setItem('promptforge_wmode', mode);
    localStorage.removeItem('promptforge_quickquery');
    track('creation_type_selected', { mode });
    onClose();
    router.push(`/forge?mode=${mode}`);
  };

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
    maxWidth: '520px',
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

  const titleStyle = {
    fontSize: '1.1rem',
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

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.5rem',
  };

  const optionCard = (isDark) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '12px',
    background: 'transparent',
    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const iconWrap = (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: `color-mix(in srgb, ${color} 12%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  const textWrap = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  };

  const optionTitle = {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--foreground)',
  };

  const optionDesc = {
    fontSize: '0.8rem',
    color: 'var(--muted-foreground)',
    lineHeight: '1.4',
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
          aria-labelledby="create-modal-title"
        >
          <div style={headerStyle}>
            <h3 id="create-modal-title" style={titleStyle}>What would you like to build?</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>

          <div style={contentStyle}>
            {CREATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div 
                  key={type.mode}
                  onClick={() => handleSelect(type.mode)}
                  style={optionCard(isDark)}
                  className="card-hover active-scale-95"
                >
                  <div style={iconWrap(type.color)}>
                    <Icon size={18} style={{ color: type.color }} />
                  </div>
                  <div style={textWrap}>
                    <span style={optionTitle}>{type.title}</span>
                    <span style={optionDesc}>{type.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
