"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, RefreshCw, ArrowRight } from 'lucide-react';
import MicroDelight from './MicroDelight';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { track, EVENTS } from '@/lib/analytics';

export default function FirstBlueprintSuccessScreen() {
  const { showFirstBlueprintSuccess, dismissFirstBlueprintSuccess, history } = useApp();
  const router = useRouter();

  const latestWorkspace = history[0];

  useEffect(() => {
    if (showFirstBlueprintSuccess) {
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showFirstBlueprintSuccess]);

  const handleOpenWorkspace = () => {
    track('first_success_open_workspace');
    dismissFirstBlueprintSuccess();
    if (latestWorkspace) router.push(`/chat?id=${latestWorkspace.id}`);
  };

  const handleGenerateAnother = () => {
    track('first_success_generate_another');
    dismissFirstBlueprintSuccess();
    router.push('/forge');
  };

  const handleDismiss = () => {
    track('first_success_dismissed');
    dismissFirstBlueprintSuccess();
  };

  return (
    <AnimatePresence>
      {showFirstBlueprintSuccess && (
        <>
          {/* Confetti */}
          <MicroDelight trigger={showFirstBlueprintSuccess} duration={2400} />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={backdrop}
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={modal}
            className="glass-panel"
          >
            {/* Glow orb */}
            <div style={glowOrb} />

            {/* Icon */}
            <motion.div
              style={iconRing}
              animate={{ boxShadow: ['0 0 0 0 rgba(124,58,237,0.4)', '0 0 0 20px rgba(124,58,237,0)', '0 0 0 0 rgba(124,58,237,0)'] }}
              transition={{ duration: 1.8, repeat: 3 }}
            >
              <Sparkles size={28} style={{ color: '#fff' }} />
            </motion.div>

            {/* Copy */}
            <h2 style={headline}>Your first blueprint is ready!</h2>
            <p style={subtext}>
              You just transformed a rough idea into a professional engineering specification.
              This is what PromptForge is built for.
            </p>

            {latestWorkspace && (
              <div style={workspacePreview}>
                <span style={workspaceBadge}>{latestWorkspace.mode}</span>
                <span style={workspaceTitle}>{latestWorkspace.title}</span>
              </div>
            )}

            {/* CTAs */}
            <div style={ctaRow}>
              <motion.button
                style={primaryCta}
                onClick={handleOpenWorkspace}
                className="btn-accent shine-effect"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles size={15} />
                Open & Refine Blueprint
              </motion.button>

              <motion.button
                style={secondaryCta}
                onClick={handleGenerateAnother}
                whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw size={14} />
                Generate Another
              </motion.button>
            </div>

            <button onClick={handleDismiss} style={skipBtn}>
              Go to Dashboard <ArrowRight size={12} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const backdrop = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
};

const modal = {
  position: 'fixed',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1001,
  width: '100%', maxWidth: '440px',
  padding: '2.5rem',
  borderRadius: '24px',
  textAlign: 'center',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
  background: 'rgba(8,8,14,0.95)',
  border: '1px solid rgba(124,58,237,0.25)',
  boxShadow: '0 0 80px rgba(124,58,237,0.2), 0 32px 64px rgba(0,0,0,0.6)',
  overflow: 'hidden',
};

const glowOrb = {
  position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
  width: '280px', height: '280px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
  filter: 'blur(30px)', pointerEvents: 'none',
};

const iconRing = {
  width: 64, height: 64, borderRadius: '50%',
  background: 'linear-gradient(135deg, #7c3aed, #db2777)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 0 32px rgba(124,58,237,0.5)',
  position: 'relative', zIndex: 1,
};

const headline = {
  fontSize: '1.5rem', fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: '#fff', letterSpacing: '-0.02em',
  margin: 0, position: 'relative', zIndex: 1,
};

const subtext = {
  fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)',
  lineHeight: '1.65', margin: 0, maxWidth: '340px',
};

const workspacePreview = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.6rem 1rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  width: '100%',
};

const workspaceBadge = {
  fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
  color: 'var(--accent)', background: 'rgba(124,58,237,0.12)',
  border: '1px solid rgba(124,58,237,0.2)',
  borderRadius: '5px', padding: '2px 8px', flexShrink: 0,
};

const workspaceTitle = {
  fontSize: '0.82rem', fontWeight: '600', color: '#fff',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};

const ctaRow = {
  display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%',
};

const primaryCta = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  width: '100%', padding: '0.9rem',
  fontSize: '0.9rem', fontWeight: '700',
  borderRadius: '12px', border: 'none', cursor: 'pointer',
};

const secondaryCta = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  width: '100%', padding: '0.75rem',
  fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.75)',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
};

const skipBtn = {
  display: 'flex', alignItems: 'center', gap: '0.3rem',
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.75rem', color: 'var(--muted-foreground)',
  fontFamily: 'var(--font-sans)',
};
