"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MicroDelight from './MicroDelight';
import { track } from '@/lib/analytics';

const STEPS = (history, favorites, copiedOnce) => [
  {
    id: 'first_forge',
    label: 'Forge your first prompt blueprint',
    completed: history.length > 0,
    cta: 'Start Forging',
    href: '/forge',
  },
  {
    id: 'favorite_prompt',
    label: 'Save a workspace to Favorites',
    completed: favorites.length > 0,
    cta: 'Go to Dashboard',
    href: '/dashboard',
  },
  {
    id: 'copy_prompt',
    label: 'Copy a compiled prompt to clipboard',
    completed: copiedOnce,
    cta: 'Open a Blueprint',
    href: history.length > 0 ? `/chat?id=${history[0]?.id}` : '/forge',
  },
  {
    id: 'quick_enhance',
    label: 'Try the Starter Blueprints gallery',
    completed: history.some(h => h.mode === 'enhance') || history.length > 1,
    cta: 'Browse Templates',
    href: '/dashboard#gallery',
  },
];

export default function OnboardingChecklist({ history = [], favorites = [] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [copiedOnce, setCopiedOnce] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const prevCompleted = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCopied = localStorage.getItem('pf_has_copied_prompt') === 'true';
    setCopiedOnce(isCopied);
    // Persist collapse state
    const collapsed = localStorage.getItem('pf_checklist_collapsed') === 'true';
    setIsOpen(!collapsed);

    const handleStorageChange = () => {
      const copied = localStorage.getItem('pf_has_copied_prompt') === 'true';
      setCopiedOnce(copied);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const steps = STEPS(history, favorites, copiedOnce);
  const completedCount = steps.filter(s => s.completed).length;
  const total = steps.length;
  const progressPercent = completedCount / total;

  // Detect completion
  useEffect(() => {
    if (completedCount === total && prevCompleted.current < total) {
      setCelebration(true);
      track('onboarding_checklist_completed');
      // Collapse after 3.5s
      setTimeout(() => {
        localStorage.setItem('pf_checklist_collapsed', 'true');
        setIsOpen(false);
      }, 3500);
    }
    prevCompleted.current = completedCount;
  }, [completedCount, total]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem('pf_checklist_collapsed', String(!next));
  };

  if (progressPercent === 1 && !isOpen) return null;

  // SVG ring constants
  const SIZE = 52;
  const STROKE = 4;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - progressPercent);
  const isComplete = progressPercent === 1;

  return (
    <>
      <MicroDelight trigger={celebration} duration={2000} />
      <div style={container} className="glass-panel">
        {/* Header row */}
        <div style={header} onClick={handleToggle} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleToggle()}>
          <div style={titleRow}>
            {/* Zeigarnik SVG Progress Ring */}
            <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
              <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                  cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE}
                />
                {/* Progress arc */}
                <motion.circle
                  cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                  fill="none"
                  stroke={isComplete ? '#f59e0b' : 'url(#ringGrad)'}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center label */}
              <div style={ringCenter}>
                {isComplete
                  ? <span style={{ fontSize: '0.9rem' }}>✓</span>
                  : <span style={ringLabel}>{completedCount}/{total}</span>}
              </div>
            </div>

            <div>
              <div style={titleText}>
                {isComplete ? '🎉 You\'re all set!' : 'Get Started Checklist'}
              </div>
              <div style={subtitleText}>
                {isComplete
                  ? 'You\'ve mastered the basics of PromptForge'
                  : `${total - completedCount} step${total - completedCount !== 1 ? 's' : ''} remaining`}
              </div>
            </div>
          </div>

          <button style={toggleBtn} aria-label={isOpen ? 'Collapse' : 'Expand'}>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={body}>
                {steps.map((step) => (
                  <div key={step.id} style={stepRow(step.completed)}>
                    <div style={stepLeft}>
                      {step.completed
                        ? <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                        : <Circle size={16} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
                      <span style={stepLabel(step.completed)}>{step.label}</span>
                    </div>
                    {!step.completed && (
                      <motion.button
                        style={stepCta}
                        onClick={(e) => { e.stopPropagation(); track('onboarding_step_cta', { step: step.id }); router.push(step.href); }}
                        whileHover={{ scale: 1.04, color: '#fff' }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {step.cta} <ArrowRight size={11} />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const container = {
  marginBottom: '2rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '18px',
};

const header = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '1rem 1.25rem', cursor: 'pointer',
};

const titleRow = {
  display: 'flex', alignItems: 'center', gap: '0.9rem',
};

const ringCenter = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const ringLabel = {
  fontSize: '0.7rem', fontWeight: '700', color: '#fff',
};

const titleText = {
  fontSize: '0.88rem', fontWeight: '700', color: '#fff',
  fontFamily: 'var(--font-display)',
};

const subtitleText = {
  fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.15rem',
};

const toggleBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted-foreground)', padding: 0,
  display: 'flex', alignItems: 'center',
};

const body = {
  padding: '0.25rem 1.25rem 1.25rem',
  display: 'flex', flexDirection: 'column', gap: '0.5rem',
};

const stepRow = (completed) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.55rem 0.75rem',
  borderRadius: '10px',
  background: completed ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.01)',
  border: completed ? '1px solid rgba(34,197,94,0.1)' : '1px solid rgba(255,255,255,0.03)',
  transition: 'all 0.25s ease',
});

const stepLeft = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
};

const stepLabel = (completed) => ({
  fontSize: '0.8rem',
  color: completed ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
  textDecoration: completed ? 'line-through' : 'none',
  fontWeight: completed ? '400' : '500',
});

const stepCta = {
  display: 'flex', alignItems: 'center', gap: '0.3rem',
  fontSize: '0.72rem', fontWeight: '600',
  color: 'var(--accent)',
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-sans)',
  transition: 'color 0.15s',
};
