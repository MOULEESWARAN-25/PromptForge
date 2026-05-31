"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          style={banner}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          role="status"
          aria-live="polite"
        >
          <WifiOff size={14} style={{ color: '#6843EC' }} />
          <span style={text}>
            You are currently offline. Your active drafts and configurations are safely stored locally.
          </span>
          <div style={badge}>
            <AlertCircle size={10} />
            Offline Mode
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const banner = {
  position: 'fixed',
  top: '1rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 1.25rem',
  borderRadius: '999px',
  background: 'rgba(245,158,11,0.06)',
  border: '1px solid rgba(245,158,11,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  backdropFilter: 'blur(16px)',
  width: 'max-content',
  maxWidth: '90vw',
};

const text = {
  fontSize: '0.78rem',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.9)',
};

const badge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '2px 8px',
  borderRadius: '999px',
  background: 'rgba(245,158,11,0.12)',
  color: '#6843EC',
  fontSize: '0.65rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
