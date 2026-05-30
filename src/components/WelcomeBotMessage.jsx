"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Layout, Wand2, X, Sparkles } from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

const ACTIONS = [
  {
    icon: Monitor,
    label: 'Build a SaaS App Spec',
    desc: 'Multi-page routing, state, sidebars — fully described.',
    href: '/forge?mode=application',
    accent: '#7c3aed',
  },
  {
    icon: Layout,
    label: 'Design a Landing Page',
    desc: 'Select layout, components, theme — generate instantly.',
    href: '/forge?mode=page',
    accent: '#0891b2',
  },
  {
    icon: Wand2,
    label: 'Enhance a Draft Idea',
    desc: 'Paste any rough idea and inject pro terminology.',
    href: '/forge?mode=enhance',
    accent: '#059669',
  },
];

export default function WelcomeBotMessage() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(true); // start hidden, check storage
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pf_welcome_dismissed') === 'true';
    setDismissed(isDismissed);
    if (!isDismissed) {
      // Typing dots → resolve to message after 900ms
      const t = setTimeout(() => setTypingDone(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pf_welcome_dismissed', 'true');
    setDismissed(true);
  };

  const handleAction = (href, label) => {
    track(EVENTS.EMPTY_STATE_CTA_CLICKED, { label });
    router.push(href);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={container}
        className="glass-panel"
      >
        {/* Dismiss */}
        <button onClick={handleDismiss} style={dismissBtn} title="Dismiss">
          <X size={14} />
        </button>

        {/* Bot header */}
        <div style={botHeader}>
          <div style={avatarRing}>
            <div style={avatar}>
              <Sparkles size={16} style={{ color: '#fff' }} />
            </div>
            <div style={onlineDot} />
          </div>
          <div>
            <div style={botName}>Forge Assistant</div>
            <div style={botStatus}>Online — ready to help</div>
          </div>
        </div>

        {/* Message bubble */}
        <div style={bubbleWrap}>
          <AnimatePresence mode="wait">
            {!typingDone ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={typingBubble}
              >
                <span style={dot(0)} />
                <span style={dot(0.18)} />
                <span style={dot(0.36)} />
              </motion.div>
            ) : (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={messageBubble}
              >
                <p style={messageText}>
                  Hi! I'm your <strong style={{ color: 'var(--accent)' }}>Forge Assistant</strong>.
                  You have no blueprints yet — let's fix that.
                  Pick what you want to build below and I'll guide you through it. ✨
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {typingDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            style={actionsGrid}
          >
            {ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label}
                  style={actionCard(a.accent)}
                  onClick={() => handleAction(a.href, a.label)}
                  whileHover={{ y: -3, boxShadow: `0 8px 24px ${a.accent}25` }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div style={actionIconWrap(a.accent)}>
                    <Icon size={16} style={{ color: a.accent }} />
                  </div>
                  <div style={actionText}>
                    <div style={actionLabel}>{a.label}</div>
                    <div style={actionDesc}>{a.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const container = {
  position: 'relative',
  padding: '1.5rem',
  borderRadius: '20px',
  marginBottom: '2rem',
  background: 'rgba(124,58,237,0.03)',
  border: '1px solid rgba(124,58,237,0.12)',
};

const dismissBtn = {
  position: 'absolute', top: '1rem', right: '1rem',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted-foreground)', padding: '4px',
  borderRadius: '6px', display: 'flex', alignItems: 'center',
};

const botHeader = {
  display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem',
};

const avatarRing = {
  position: 'relative', flexShrink: 0,
};

const avatar = {
  width: 40, height: 40, borderRadius: '50%',
  background: 'linear-gradient(135deg, #7c3aed, #db2777)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 0 16px rgba(124,58,237,0.4)',
};

const onlineDot = {
  position: 'absolute', bottom: 2, right: 2,
  width: 10, height: 10, borderRadius: '50%',
  background: '#22c55e', border: '2px solid var(--background)',
};

const botName = {
  fontSize: '0.88rem', fontWeight: '700', color: '#fff',
  fontFamily: 'var(--font-display)',
};

const botStatus = {
  fontSize: '0.72rem', color: '#22c55e',
};

const bubbleWrap = {
  marginBottom: '1rem', minHeight: 40,
};

const typingBubble = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '0.6rem 0.9rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px 12px 12px 4px',
};

const dot = (delay) => ({
  display: 'inline-block',
  width: 7, height: 7, borderRadius: '50%',
  background: 'var(--muted-foreground)',
  animation: `bounce 1.2s ${delay}s infinite ease-in-out`,
});

const messageBubble = {
  padding: '0.85rem 1rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px 12px 12px 4px',
  maxWidth: '480px',
};

const messageText = {
  fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)',
  lineHeight: '1.6', margin: 0,
};

const actionsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '0.75rem',
};

const actionCard = (accent) => ({
  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
  padding: '0.9rem 1rem',
  background: `${accent}06`,
  border: `1px solid ${accent}18`,
  borderRadius: '12px',
  cursor: 'pointer', textAlign: 'left',
  transition: 'all 0.2s ease',
});

const actionIconWrap = (accent) => ({
  width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
  background: `${accent}12`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

const actionText = { flex: 1, minWidth: 0 };

const actionLabel = {
  fontSize: '0.82rem', fontWeight: '700', color: '#fff',
  marginBottom: '0.2rem',
};

const actionDesc = {
  fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: '1.4',
};
