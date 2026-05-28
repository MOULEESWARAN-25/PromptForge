"use client";

import React, { useEffect, useState, useOptimistic, useTransition } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, Monitor, Layout, Code2, Wand2, ArrowRight, 
  CornerDownLeft, Trash, Copy, Check, ExternalLink, Clock, Trash2
} from 'lucide-react';
import Link from 'next/link';

// ─── Animation Variants ────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Workflow Cards Config ─────────────────────────────────────
const WORKFLOWS = [
  {
    href: '/forge',
    wmode: 'application',
    icon: Monitor,
    label: 'SaaS Application',
    desc: 'Multi-page routing, state management, sidebars, and premium data architecture — fully described.',
    accent: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.08)',
    badge: 'Full-Stack',
  },
  {
    href: '/forge',
    wmode: 'page',
    icon: Layout,
    label: 'Web Page Design',
    desc: '1. Select type of page, 2. Select components, 3. Select theme, 4. Generate prompt.',
    accent: '#0891b2',
    accentBg: 'rgba(8,145,178,0.08)',
    badge: 'v0 Ready',
  },
  {
    href: '/component-forge',
    wmode: null,
    icon: Code2,
    label: 'Component Catalog',
    desc: 'Browse and customize 50+ premium UI components. Describe → AI refines → copy perfect prompt.',
    accent: '#db2777',
    accentBg: 'rgba(219,39,119,0.08)',
    badge: 'Interactive',
  },
  {
    href: '/forge',
    wmode: 'enhance',
    icon: Wand2,
    label: 'Prompt Enhancer',
    desc: 'Paste any rough idea and inject Framer motions, HSL tokens, and professional terminology instantly.',
    accent: '#059669',
    accentBg: 'rgba(5,150,105,0.08)',
    badge: 'Quick',
  },
];

const MODE_ICONS = { application: Monitor, page: Layout, component: Code2, enhance: Wand2 };
const MODE_COLORS = {
  application: '#7c3aed', page: '#0891b2', component: '#db2777', enhance: '#059669',
};

export default function DashboardPage() {
  const { user, history, deletePromptRecord, clearHistory, loading } = useApp();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(null);
  const [quickInput, setQuickInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic UI updates for prompt history using React 19 useOptimistic
  const [optimisticHistory, setOptimisticHistory] = useOptimistic(
    history,
    (state, { action, id }) => {
      if (action === 'delete') {
        return state.filter(item => item.id !== id);
      }
      if (action === 'clear') {
        return [];
      }
      return state;
    }
  );

  const handleCopy = (id, e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticHistory({ action: 'delete', id });
      try {
        await deletePromptRecord(id);
        toast.success('Workspace deleted');
      } catch (err) {
        toast.error('Failed to delete workspace');
      }
    });
  };

  const handleClearAll = () => {
    startTransition(async () => {
      setOptimisticHistory({ action: 'clear' });
      try {
        await clearHistory();
        toast.success('History cleared');
      } catch (err) {
        toast.error('Failed to clear history');
      }
    });
  };

  const handleQuickForge = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    localStorage.setItem('promptforge_quickquery', quickInput);
    localStorage.setItem('promptforge_wmode', 'enhance');
    router.push('/forge');
  };

  const SUGGESTIONS = ['glassmorphic dashboard', 'SaaS pricing page', 'OTP auth screen', 'data table component'];

  if (loading || !user) {
    return (
      <div style={loadingWrap}>
        <div style={loadingInner}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={loadingSpinner}
          />
          <p style={loadingText}>Verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.section
        style={heroSection}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <div className="premium-badge animate-pulse-slow" style={{ marginBottom: '1.5rem' }}>
            <Sparkles size={11} className="text-purple-400" />
            <span>Prompt Architect v2.0</span>
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} className="hero-headline" style={{ marginBottom: '1.25rem', maxWidth: '820px' }}>
          Build anything.{' '}
          <span className="hero-gradient">Refined for AI.</span>
        </motion.h1>

        <motion.p variants={fadeUp} style={heroParagraph}>
          Vague ideas yield generic code. Inject layout grids, color systems,
          motion physics, and component specs that AI tools actually understand.
        </motion.p>

        {/* Prompt Console */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleQuickForge}
          style={consoleForm(inputFocused)}
          className="glass-panel dashboard-console-form"
        >
          <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0, opacity: 0.8 }} />
          <input
            type="text"
            placeholder="Describe what you want to build..."
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={consoleInput}
            autoComplete="off"
          />
          <motion.button
            type="submit"
            className="btn-accent shine-effect"
            style={forgeBtn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            Forge
            <CornerDownLeft size={13} />
          </motion.button>
        </motion.form>

        {/* Suggestions */}
        <motion.div variants={fadeUp} style={suggestRow}>
          <span style={suggestLabel}>Try:</span>
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={i}
              style={suggestChip}
              onClick={() => setQuickInput(`A premium ${s} with modern dark glassmorphic aesthetics and responsive layout.`)}
              whileHover={{ scale: 1.04, y: -1, borderColor: 'rgba(255,255,255,0.15)', color: 'var(--foreground)' }}
              whileTap={{ scale: 0.96 }}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>
      </motion.section>

      {/* ── Bento Grid ────────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        style={{ marginBottom: '4rem' }}
      >
        <motion.div variants={fadeUp} style={sectionHeader}>
          <div>
            <p className="section-label" style={{ marginBottom: '0.4rem' }}>Architectural Pipelines</p>
            <h2 style={sectionTitle}>Choose your workflow</h2>
          </div>
        </motion.div>

        <div style={bentoGrid} className="workflow-bento-grid">
          {WORKFLOWS.map((w, i) => (
            <BentoCard key={i} workflow={w} />
          ))}
        </div>
      </motion.section>

      {/* ── History ───────────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        style={{ marginBottom: '3rem' }}
      >
        <motion.div variants={fadeUp} style={sectionHeader}>
          <div>
            <p className="section-label" style={{ marginBottom: '0.4rem' }}>Recent Activity</p>
            <h2 style={sectionTitle}>Your workspaces</h2>
          </div>
          {optimisticHistory.length > 0 && (
            <motion.button
              style={clearBtn}
              onClick={handleClearAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <Trash size={13} />
              Clear all
            </motion.button>
          )}
        </motion.div>

        {optimisticHistory.length === 0 ? (
          <motion.div variants={fadeUp} style={emptyState} className="glass-panel">
            <div style={emptyIcon} className="glass-panel"><Sparkles size={24} style={{ color: 'var(--accent)' }} /></div>
            <p style={emptyTitle}>No workspaces yet</p>
            <p style={emptyDesc}>Describe your idea above to generate your first precision prompt.</p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} style={historyGrid}>
            <AnimatePresence mode="popLayout">
              {optimisticHistory.slice(0, 6).map((log) => {
                const ModeIcon = MODE_ICONS[log.mode] || Sparkles;
                const modeColor = MODE_COLORS[log.mode] || '#19398d';
                const isCopied = copiedId === log.id;
                return (
                  <motion.div
                    key={log.id}
                    variants={cardVariant}
                    layout
                    style={historyCard}
                    className="glass-panel card-hover"
                    onClick={() => router.push(`/chat?id=${log.id}`)}
                    whileHover={{ y: -4 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <div style={historyCardTop}>
                      <div style={{ ...historyModeBadge, background: `${modeColor}12`, color: modeColor, borderColor: `${modeColor}25` }}>
                        <ModeIcon size={12} />
                        <span>{log.mode}</span>
                      </div>
                      <span style={historyDate}>
                        <Clock size={11} />
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 style={historyTitle}>{log.title}</h3>
                    <p style={historyQuery} className="truncate-2">{log.query || 'No query recorded.'}</p>

                    <div style={historyActions}>
                      <motion.button
                        style={{ ...historyActionBtn, color: isCopied ? '#16a34a' : 'var(--muted-foreground)' }}
                        onClick={e => handleCopy(log.id, e, log.resolvedPrompt)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </motion.button>
                      <motion.button
                        style={{ ...historyActionBtn, color: '#ef4444' }}
                        onClick={e => handleDelete(log.id, e)}
                        whileHover={{ scale: 1.04, background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)' }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Trash2 size={13} />
                      </motion.button>
                      <div style={{ flex: 1 }} />
                      <span style={historyOpen}>
                        Open <ExternalLink size={11} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.section>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .dashboard-console-form {
            height: auto !important;
            flex-direction: column;
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .dashboard-console-form input {
            width: 100% !important;
            height: 40px !important;
            padding: 0 0.5rem !important;
            text-align: center;
          }
          .dashboard-console-form button {
            width: 100% !important;
            justify-content: center;
          }
          .workflow-bento-grid {
            grid-template-columns: 1fr !important;
          }
          .workflow-bento-card {
            padding: 1.25rem !important;
            gap: 0.75rem !important;
          }
        }
      ` }} />
    </div>
  );
}

// ─── Bento Card Component ──────────────────────────────────────
function BentoCard({ workflow }) {
  const { href, wmode, icon: Icon, label, desc, accent, accentBg, badge } = workflow;
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (wmode) localStorage.setItem('promptforge_wmode', wmode);
  };

  return (
    <motion.div variants={cardVariant}>
      <Link
        href={href}
        onClick={handleClick}
        style={bentoCard(hovered, accent)}
        className="glass-panel workflow-bento-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Ambient glow */}
        <div style={bentoGlow(accent, hovered)} />

        {/* Header row */}
        <div style={bentoHead}>
          <div style={bentoIconWrap(accent, accentBg, hovered)}>
            <Icon size={18} style={{ color: accent }} />
          </div>
          <span style={bentoBadge(accent)}>{badge}</span>
        </div>

        <h3 style={bentoTitle}>{label}</h3>
        <p style={bentoDesc}>{desc}</p>

        <div style={bentoFooter(accent, hovered)}>
          <span>Get started</span>
          <motion.div animate={{ x: hovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowRight size={13} />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const heroSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: '4rem',
  paddingBottom: '5rem',
  maxWidth: '900px',
  margin: '0 auto',
};

const heroParagraph = {
  fontSize: '1.05rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.7',
  maxWidth: '580px',
  marginBottom: '2.5rem',
};

const consoleForm = (focused) => ({
  width: '100%',
  maxWidth: '560px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0 0.5rem 0 1.15rem',
  background: 'rgba(10, 10, 12, 0.4)',
  border: `1px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '12px',
  backdropFilter: 'blur(20px)',
  boxShadow: focused
    ? '0 0 0 1px var(--accent), 0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1)'
    : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.05)',
  transition: 'all var(--duration-fast) var(--ease-spring)',
  marginBottom: '1.5rem',
});

const consoleInput = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '0.95rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const forgeBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.55rem 1.1rem',
  color: 'var(--accent-foreground)',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: '700',
  cursor: 'pointer',
  flexShrink: 0,
  fontFamily: 'var(--font-sans)',
};

const suggestRow = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.5rem',
  justifyContent: 'center',
};

const suggestLabel = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  fontWeight: '600',
};

const suggestChip = {
  padding: '0.35rem 0.85rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '999px',
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  fontWeight: '500',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const sectionHeader = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  marginBottom: '1.5rem',
  gap: '1rem',
};

const sectionTitle = {
  fontSize: '1.4rem',
  fontWeight: '700',
  letterSpacing: '-0.025em',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
};

const bentoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1.25rem',
};

const bentoCard = (hovered, accent) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.5rem',
  borderRadius: '16px',
  textDecoration: 'none',
  position: 'relative',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.01)',
  border: `1px solid ${hovered ? `${accent}40` : 'rgba(255,255,255,0.04)'}`,
  transition: 'all var(--duration-base) var(--ease-spring)',
  transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
  boxShadow: hovered
    ? `0 1px 0 0 rgba(255,255,255,0.08) inset, 0 20px 40px ${accent}12, 0 8px 16px rgba(0,0,0,0.3)`
    : '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 4px 12px rgba(0,0,0,0.15)',
});

const bentoGlow = (accent, hovered) => ({
  position: 'absolute',
  top: '-30%',
  right: '-20%',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
  opacity: hovered ? 1 : 0,
  transition: 'opacity 0.4s ease',
  pointerEvents: 'none',
});

const bentoHead = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const bentoIconWrap = (accent, accentBg, hovered) => ({
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: hovered ? `${accent}18` : accentBg,
  border: `1px solid ${accent}25`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
});

const bentoBadge = (accent) => ({
  fontSize: '0.68rem',
  fontWeight: '700',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: accent,
  background: `${accent}10`,
  border: `1px solid ${accent}20`,
  padding: '2px 8px',
  borderRadius: '999px',
});

const bentoTitle = {
  fontSize: '0.98rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  letterSpacing: '-0.01em',
  fontFamily: 'var(--font-display)',
};

const bentoDesc = {
  fontSize: '0.82rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.6',
  flex: 1,
};

const bentoFooter = (accent, hovered) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: hovered ? accent : 'var(--muted-foreground)',
  paddingTop: '0.75rem',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  transition: 'color 0.2s ease',
});

const clearBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.4rem 0.85rem',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
};

const emptyState = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '3rem 2rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '16px',
  textAlign: 'center',
};

const emptyIcon = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.04)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted-foreground)',
};

const emptyTitle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const emptyDesc = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  maxWidth: '360px',
};

const historyGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.25rem',
};

const historyCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  padding: '1.25rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '14px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const historyCardTop = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const historyModeBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.7rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '3px 8px',
  borderRadius: '999px',
  border: '1px solid',
};

const historyDate = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
};

const historyTitle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  letterSpacing: '-0.01em',
  fontFamily: 'var(--font-display)',
};

const historyQuery = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  flex: 1,
};

const historyActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  paddingTop: '0.6rem',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  marginTop: '0.4rem',
};

const historyActionBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.3rem 0.65rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
};

const historyOpen = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--accent)',
};

const loadingWrap = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 2,
};

const loadingInner = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const loadingSpinner = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '2.5px solid rgba(255,255,255,0.06)',
  borderTopColor: 'var(--accent)',
};

const loadingText = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
  fontWeight: '500',
};
