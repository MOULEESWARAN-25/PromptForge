"use client";

import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingChecklist({ history = [], favorites = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedOnce, setCopiedOnce] = useState(false);

  // Check if user copied a prompt at least once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCopied = localStorage.getItem('pf_has_copied_prompt') === 'true';
    setCopiedOnce(isCopied);

    // Setup an observer for copies
    const handleStorageChange = () => {
      const copied = localStorage.getItem('pf_has_copied_prompt') === 'true';
      setCopiedOnce(copied);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const steps = [
    { id: 'first_forge', label: 'Forge your first prompt blueprint', completed: history.length > 0 },
    { id: 'favorite_prompt', label: 'Save a workspace to Favorites', completed: favorites.length > 0 },
    { id: 'copy_prompt', label: 'Copy a compiled prompt to clipboard', completed: copiedOnce },
    { id: 'quick_enhance', label: 'Explore the Starter Blueprints library', completed: history.some(h => h.mode === 'enhance') || history.length > 1 }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (progressPercent === 100) return null; // Hide onboarding checklist once they finish

  return (
    <div style={container} className="glass-panel">
      <div style={header} onClick={() => setIsOpen(!isOpen)}>
        <div style={titleRow}>
          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          <span style={title}>Get Started Checklist ({completedCount}/{steps.length})</span>
        </div>
        <button style={toggleBtn}>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={body}>
              <div style={progressBarBg}>
                <motion.div
                  style={progressBar}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              <div style={stepsList}>
                {steps.map(step => (
                  <div key={step.id} style={stepRow}>
                    {step.completed ? (
                      <CheckSquare size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                    ) : (
                      <Square size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    )}
                    <span style={stepLabel(step.completed)}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const container = {
  marginBottom: '2rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
};

const header = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.25rem',
  cursor: 'pointer',
};

const titleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const title = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: '#ffffff',
  fontFamily: 'var(--font-display)',
};

const toggleBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  padding: 0,
};

const body = {
  padding: '0 1.25rem 1.25rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const progressBarBg = {
  width: '100%',
  height: '5px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.04)',
  overflow: 'hidden',
};

const progressBar = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--accent) 0%, #db2777 100%)',
  borderRadius: '999px',
};

const stepsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
};

const stepRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
};

const stepLabel = (completed) => ({
  fontSize: '0.78rem',
  color: completed ? 'var(--muted-foreground)' : '#ffffff',
  textDecoration: completed ? 'line-line-through' : 'none',
  fontWeight: completed ? '500' : '600',
});
