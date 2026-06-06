"use client";

import React, { useEffect, useState, useOptimistic, useTransition } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, Monitor, Layout, Code2, Wand2, ArrowRight,
  Trash2, Clock, Check, Copy, FileText, ChevronRight
} from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';
import HelpKeyboardOverlay from '@/components/HelpKeyboardOverlay';

// ─── Animation Variants ────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Time Ago Helper ───────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function DashboardPage() {
  const { user, history, deletePromptRecord, loading, recordActivity } = useApp();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [, startTransition] = useTransition();

  // Load and scan drafts array from local storage on mount
  useEffect(() => {
    try {
      const parsedDrafts = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key === 'promptforge_draft' || key.startsWith('promptforge_draft_'))) {
          const draftVal = localStorage.getItem(key);
          if (draftVal) {
            const parsed = JSON.parse(draftVal);
            if (parsed && parsed.mode) {
              parsedDrafts.push({
                key,
                title: parsed.projectName || (
                  parsed.mode === 'application' ? 'SaaS Application Blueprint' :
                  parsed.mode === 'page' ? 'Web Page Design Blueprint' :
                  parsed.mode === 'component' ? 'Single Component Blueprint' :
                  'Prompt Enhancement'
                ),
                mode: parsed.mode,
                savedAt: parsed.savedAt || Date.now(),
                details: parsed,
              });
            }
          }
        }
      }
      parsedDrafts.sort((a, b) => b.savedAt - a.savedAt);
      setDrafts(parsedDrafts);
    } catch (e) {
      console.error("Failed to load drafts:", e);
    }
  }, []);

  // Track dashboard view + record activity session
  useEffect(() => {
    if (user) {
      track(EVENTS.DASHBOARD_VIEWED);
      recordActivity();
    }
  }, [user]);

  // Listen to keyboard shortcut for Help overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?') {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        setShowHelp(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResumeDraft = (draft) => {
    localStorage.setItem('promptforge_wmode', draft.mode);
    if (draft.key !== 'promptforge_draft') {
      localStorage.setItem('promptforge_draft', JSON.stringify(draft.details));
    }
    track('draft_resumed', { mode: draft.mode });
    router.push(`/forge?mode=${draft.mode}`);
  };

  const handleDiscardDraft = (key, e) => {
    e.stopPropagation();
    localStorage.removeItem(key);
    setDrafts(prev => prev.filter(d => d.key !== key));
    toast.success('Draft discarded successfully');
    track('draft_discarded', { key });
  };

  const handleEnhancePromptClick = () => {
    localStorage.setItem('promptforge_wmode', 'enhance');
    localStorage.removeItem('promptforge_quickquery');
    router.push('/forge?mode=enhance');
  };

  // Optimistic UI updates for prompt history using React 19 useOptimistic
  const [optimisticHistory, setOptimisticHistory] = useOptimistic(
    history,
    (state, { action, id }) => {
      if (action === 'delete') {
        return state.filter(item => item.id !== id);
      }
      return state;
    }
  );

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

  const userName = user?.username || 'Creator';

  if (loading || !user) {
    return (
      <div style={loadingWrap}>
        <div style={{ width: '100%', maxWidth: '1200px', padding: '2rem' }}>
          {/* Skeleton loading */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={skeletonLine('160px', '24px')} />
            <div style={{ ...skeletonLine('50%', '42px'), marginTop: '1.25rem' }} />
            <div style={{ ...skeletonLine('100%', '160px'), marginTop: '1.5rem', borderRadius: '14px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Sort workspaces history, most recent first
  const sortedHistory = [...optimisticHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div style={{ position: 'relative', zIndex: 2, width: '95%', maxWidth: '1600px', margin: '0 auto', padding: '1rem 1.5rem 3rem 1.5rem' }}>
      
      {/* ── 1. Drafts Section (Top) ── */}
      {drafts.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}
        >
          <div style={draftHeader}>
            <Clock size={14} style={{ color: 'var(--accent)' }} />
            <h2 style={sectionTitle}>Resume Drafts</h2>
            <span style={draftCountBadge}>{drafts.length}</span>
          </div>

          <div style={draftsContainer}>
            {drafts.map((draft) => (
              <div 
                key={draft.key} 
                onClick={() => handleResumeDraft(draft)}
                style={draftCard} 
                className="glass-panel card-hover"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleResumeDraft(draft)}
              >
                <div style={draftCardLeft}>
                  <h3 style={draftTitle}>{draft.title}</h3>
                  <span style={draftDate}>Last modified {timeAgo(draft.savedAt)}</span>
                </div>
                <div style={draftActions}>
                  <button 
                    onClick={(e) => handleDiscardDraft(draft.key, e)} 
                    style={discardBtn}
                    title="Discard Draft"
                  >
                    Discard
                  </button>
                  <button style={resumeBtn}>
                    <span>Resume</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── 2. Welcome Section ── */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={welcomeWrap}
      >
        <p style={welcomeGreeting}>Welcome back, {userName}</p>
        <h1 style={welcomePrompt}>What do you want to build today?</h1>
      </motion.section>

      {/* ── 3. Primary Action Selection (70/30 Layout) ── */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div style={actionGrid} className="action-grid-cols">
          {/* Build Something (Visually Dominant CTA) */}
          <div 
            onClick={() => router.push('/create')}
            style={buildSomethingCard} 
            className="glass-panel card-hover primary-cta-glow"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && router.push('/create')}
          >
            <div style={glowBg} />
            <div style={ctaContent}>
              <div style={iconBadge('var(--accent)')} className="glass-panel">
                <Sparkles size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={ctaTitle}>Build Something</h2>
              <p style={ctaDesc}>Launch our premium compilation wizard to create custom SaaS applications, landing pages, or modular components.</p>
              <div style={ctaActionLink('var(--accent)')}>
                <span>Get started</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Enhance Prompt (Secondary CTA) */}
          <div 
            onClick={handleEnhancePromptClick}
            style={enhancePromptCard} 
            className="glass-panel card-hover"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleEnhancePromptClick()}
          >
            <div style={ctaContent}>
              <div style={iconBadge('#0284c7')} className="glass-panel">
                <Wand2 size={20} style={{ color: '#0284c7' }} />
              </div>
              <h2 style={ctaTitleSecondary}>Enhance Prompt</h2>
              <p style={ctaDescSecondary}>Semantically optimize a rough design or requirement description using structured layout tokens.</p>
              <div style={ctaActionLink('#0284c7')}>
                <span>Optimize Spec</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 4. Recent Activity Section ── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div style={activityHeader}>
          <h2 style={sectionTitle}>Recent Activity</h2>
        </div>

        {sortedHistory.length === 0 ? (
          <motion.div 
            variants={fadeUp}
            style={emptyStateWrap} 
            className="glass-panel"
          >
            <div style={emptyIconWrap} className="glass-panel">
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <p style={emptyStateText}>No recent activity yet. Start building your first project.</p>
            <button 
              onClick={() => router.push('/create')} 
              style={emptyStateCta}
              className="primary-cta-glow"
            >
              <span>Build Something</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ) : (
          <div style={activityGrid}>
            <AnimatePresence mode="popLayout">
              {sortedHistory.map((item) => {
                const isEnhanced = item.mode === 'enhance';
                
                return (
                  <motion.div
                    key={item.id}
                    variants={cardVariant}
                    layout
                    onClick={() => router.push(`/chat?id=${item.id}`)}
                    style={activityCard}
                    className="glass-panel card-hover pf-activity-item"
                    role="article"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && router.push(`/chat?id=${item.id}`)}
                  >
                    <div style={activityCardHeader}>
                      {isEnhanced ? (
                        <span style={badgeStyle('#0284c7')}>Enhanced</span>
                      ) : (
                        <span style={badgeStyle('var(--success)')}>Built</span>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={activityDateText}>
                          <Clock size={11} />
                          {timeAgo(item.timestamp)}
                        </span>
                        
                        <button 
                          onClick={(e) => handleDelete(item.id, e)} 
                          style={deleteBtn}
                          title="Delete Workspace"
                          aria-label="Delete workspace"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 style={activityCardTitle}>{item.title}</h3>
                    <p style={activityCardQuery} className="truncate-2">
                      {item.query || 'No description provided.'}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* Keyboard Shortcuts Overlay Modal */}
      <HelpKeyboardOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Responsive layout style override */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .action-grid-cols {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const welcomeWrap = {
  marginTop: '0.75rem',
  marginBottom: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const welcomeGreeting = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: 0,
};

const welcomePrompt = {
  fontSize: '1.8rem',
  fontWeight: '800',
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const actionGrid = {
  display: 'grid',
  gridTemplateColumns: '2.3fr 1fr',
  gap: '1.5rem',
  width: '100%',
};

const buildSomethingCard = {
  position: 'relative',
  padding: '1.75rem',
  borderRadius: '18px',
  background: 'var(--card)',
  border: '1px solid color-mix(in srgb, var(--accent) 30%, var(--border))',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const glowBg = {
  position: 'absolute',
  top: '-40%',
  right: '-20%',
  width: '320px',
  height: '320px',
  background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const enhancePromptCard = {
  padding: '1.75rem',
  borderRadius: '18px',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const ctaContent = {
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
};

const iconBadge = (color) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: `color-mix(in srgb, ${color} 8%, transparent)`,
  border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.25rem',
});

const ctaTitle = {
  fontSize: '1.4rem',
  fontWeight: '800',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: '0 0 0.6rem 0',
  letterSpacing: '-0.02em',
};

const ctaTitleSecondary = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: '0 0 0.6rem 0',
  letterSpacing: '-0.01em',
};

const ctaDesc = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.6',
  margin: '0 0 1.5rem 0',
  maxWidth: '480px',
};

const ctaDescSecondary = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  margin: '0 0 1.5rem 0',
};

const ctaActionLink = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  fontSize: '0.82rem',
  fontWeight: '700',
  color: color,
  fontFamily: 'var(--font-sans)',
  transition: 'gap 0.2s ease',
});

const sectionTitle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const draftHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginBottom: '1rem',
};

const draftCountBadge = {
  fontSize: '0.75rem',
  fontWeight: '700',
  background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
  color: 'var(--accent)',
  borderRadius: '999px',
  padding: '1px 7px',
};

const draftsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '100%',
};

const draftCard = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.5rem',
  borderRadius: '12px',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const draftCardLeft = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const draftTitle = {
  fontSize: '0.88rem',
  fontWeight: '600',
  color: 'var(--foreground)',
  margin: 0,
};

const draftDate = {
  fontSize: '0.76rem',
  color: 'var(--muted-foreground)',
};

const draftActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
  onClick: (e) => e.stopPropagation()
};

const discardBtn = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
  fontWeight: '500',
  ':hover': {
    color: 'var(--destructive)',
    background: 'color-mix(in srgb, var(--destructive) 8%, transparent)'
  }
};

const resumeBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
  color: 'var(--accent)',
  fontSize: '0.78rem',
  fontWeight: '600',
  padding: '0.35rem 0.75rem',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
};

const activityHeader = {
  marginBottom: '1.25rem',
};

const activityGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.25rem',
};

const activityCard = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.55rem',
  padding: '1.25rem',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const activityCardHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const badgeStyle = (color) => ({
  fontSize: '0.64rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: color,
  background: `color-mix(in srgb, ${color} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${color} 18%, transparent)`,
  padding: '2px 7px',
  borderRadius: '999px',
});

const activityDateText = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
};

const deleteBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  opacity: 0.5,
  transition: 'all 0.2s ease',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  ':hover': {
    opacity: 1,
    color: 'var(--destructive)',
  }
};

const activityCardTitle = {
  fontSize: '0.88rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const activityCardQuery = {
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  margin: 0,
};

const emptyStateWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.25rem',
  padding: '4rem 2rem',
  background: 'var(--card)',
  border: '1px dashed var(--border)',
  borderRadius: '18px',
  textAlign: 'center',
};

const emptyIconWrap = {
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 12%, transparent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const emptyStateText = {
  fontSize: '0.88rem',
  color: 'var(--muted-foreground)',
  maxWidth: '320px',
  margin: 0,
};

const emptyStateCta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.55rem 1.1rem',
  borderRadius: '10px',
  fontSize: '0.82rem',
  fontWeight: '700',
  color: '#ffffff',
  background: 'var(--accent)',
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  fontFamily: 'var(--font-sans)',
};

const loadingWrap = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 2,
};

const skeletonLine = (width, height) => ({
  width,
  height,
  borderRadius: '8px',
  background: 'var(--card)',
  animation: 'pulse 1.5s ease-in-out infinite',
});
