"use client";

import React, { useEffect, useState, useOptimistic, useTransition, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, Monitor, Layout, Code2, Wand2, ArrowRight,
  CornerDownLeft, Trash, Copy, Check, ExternalLink, Clock, Trash2, AlertTriangle,
  Search, Star, Calendar, ChevronDown, HelpCircle, Compass, Folder, FolderPlus, TrendingUp,
  Zap, FileText, Brain, X
} from 'lucide-react';
import Link from 'next/link';
import { track, EVENTS } from '@/lib/analytics';
import HelpKeyboardOverlay from '@/components/HelpKeyboardOverlay';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import ShadcnDropdown from '@/components/ShadcnDropdown';
import WelcomeBotMessage from '@/components/WelcomeBotMessage';
import ActivityTracker from '@/components/ActivityTracker';
import MasteryScore from '@/components/MasteryScore';
import BlueprintGallery from '@/components/BlueprintGallery';
import FirstBlueprintSuccessScreen from '@/components/FirstBlueprintSuccessScreen';

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
    href: '/forge?mode=application',
    wmode: 'application',
    icon: Monitor,
    label: 'SaaS Application',
    desc: 'Multi-page routing, state management, sidebars, and premium data architecture — fully described.',
    accent: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.08)',
    badge: 'Full-Stack',
  },
  {
    href: '/forge?mode=page',
    wmode: 'page',
    icon: Layout,
    label: 'Web Page Design',
    desc: '1. Select type of page, 2. Select components, 3. Select theme, 4. Generate prompt.',
    accent: '#0891b2',
    accentBg: 'rgba(8,145,178,0.08)',
    badge: 'v0 Ready',
  },
  {
    href: '/forge?mode=component',
    wmode: 'component',
    icon: Code2,
    label: 'Single Component',
    desc: 'Describe modular UI elements. Inject full codebase context, custom design tokens, and framework APIs.',
    accent: '#db2777',
    accentBg: 'rgba(219,39,119,0.08)',
    badge: 'Custom Stack',
  },
  {
    href: '/forge?mode=enhance',
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
const MODE_LABELS = {
  application: 'Full-Stack App',
  page: 'Web Page',
  component: 'Component',
  enhance: 'Quick Enhance',
};

const ROTATING_PLACEHOLDERS = [
  'A glassmorphic SaaS dashboard with dark mode and metric cards...',
  'A premium pricing page with animated tier cards...',
  'A real-time chat interface with presence indicators...',
  'An e-commerce product grid with filter sidebar...',
  'A beautiful auth screen with glassmorphic card...',
];

export default function DashboardPage() {
  const { user, history, deletePromptRecord, clearHistory, loading, updatePromptCollection, getUsageStats, activityStats, recordActivity } = useApp();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(null);
  const [quickInput, setQuickInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); 
  const [sortBy, setSortBy] = useState('recent'); 
  const [favorites, setFavorites] = useState([]); 
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInterceptModal, setShowInterceptModal] = useState(false);
  // ── Re-engagement nudge
  const [reengagementNudge, setReengagementNudge] = useState(null); // { type, message, cta, href }
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const usage = getUsageStats ? getUsageStats() : { used: 0, max: 3, isAtLimit: false, isNearLimit: false, percent: 0 };

  const handleNewWorkspaceIntent = (action) => {
    if (usage.isAtLimit) {
      setShowInterceptModal(true);
      track('workspace_limit_intercepted', { source: 'dashboard' });
    } else {
      action();
    }
  };

  // ── Folder Collections state
  const [collections, setCollections] = useState(["SaaS Ideas", "Client Projects", "Landing Pages", "AI Tools"]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activeFolderPromptId, setActiveFolderPromptId] = useState(null);

  const clearTimerRef = useRef(null);
  const [, startTransition] = useTransition();

  // Load collections from local storage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pf_collections'));
      if (saved && Array.isArray(saved)) {
        setCollections(saved);
      }
    } catch {}
  }, []);

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    if (collections.includes(newCollectionName.trim())) {
      toast.error('Folder already exists!');
      return;
    }
    const updated = [...collections, newCollectionName.trim()];
    setCollections(updated);
    localStorage.setItem('pf_collections', JSON.stringify(updated));
    setNewCollectionName('');
    toast.success(`Created folder: ${newCollectionName.trim()}`);
    track('collection_created', { name: newCollectionName.trim() });
  };

  // Load favorites from local storage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pf_favorites') || '[]');
      setFavorites(saved);
    } catch {}
  }, []);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(fid => fid !== id);
      toast.success('Removed from favorites');
    } else {
      updated = [...favorites, id];
      toast.success('Added to favorites!');
    }
    setFavorites(updated);
    localStorage.setItem('pf_favorites', JSON.stringify(updated));
    track('favorite_toggled', { id, isFavorite: updated.includes(id) });
  };


  // Rotate placeholder text every 3.5s
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % ROTATING_PLACEHOLDERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Track dashboard view + record activity session
  useEffect(() => {
    if (user) {
      track(EVENTS.DASHBOARD_VIEWED);
      if (history.length === 0) track(EVENTS.FIRST_FORGE_STARTED);
      recordActivity();
    }
  }, [user]);

  // Intent-driven re-engagement nudge (highest priority wins)
  useEffect(() => {
    if (!user || loading) return;
    try {
      // Check if nudge was dismissed within 24h
      const dismissedAt = localStorage.getItem('pf_nudge_dismissed_at');
      if (dismissedAt && Date.now() - Number(dismissedAt) < 86400000) {
        setNudgeDismissed(true);
        return;
      }

      // Priority 1: Unfinished draft
      const draft = localStorage.getItem('promptforge_draft');
      if (draft) {
        setReengagementNudge({ type: 'draft', message: "You have an unfinished blueprint draft — pick up where you stopped.", cta: 'Continue Draft', href: '/forge' });
        track(EVENTS.REENGAGEMENT_NUDGE_SHOWN, { trigger_type: 'draft' });
        return;
      }

      // Priority 2: Collection near milestone (4 or 9 = one away from badge)
      const savedCollections = JSON.parse(localStorage.getItem('pf_collections') || '[]');
      for (const col of savedCollections) {
        const count = history.filter(h => h.collection === col).length;
        if (count === 4 || count === 9) {
          setReengagementNudge({ type: 'milestone', message: `Your '${col}' collection is 1 blueprint away from the next badge.`, cta: 'Add a Blueprint', href: '/forge' });
          track(EVENTS.REENGAGEMENT_NUDGE_SHOWN, { trigger_type: 'milestone', collection: col });
          return;
        }
      }

      // Priority 3: Time-based fallback (3+ days away)
      const lastActive = localStorage.getItem('pf_last_active_date');
      const today = new Date().toISOString().slice(0, 10);
      if (lastActive && lastActive !== today) {
        const daysDiff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
        if (daysDiff >= 3 && history.length > 0) {
          setReengagementNudge({ type: 'time', message: `Welcome back! Your last blueprint was ${daysDiff} days ago.`, cta: 'Open Last Blueprint', href: history[0] ? `/chat?id=${history[0].id}` : '/forge' });
          track(EVENTS.REENGAGEMENT_NUDGE_SHOWN, { trigger_type: 'time', daysDiff });
        }
      }
      // Always update last active date
      localStorage.setItem('pf_last_active_date', today);
    } catch {}
  }, [user, history, loading]);

  const handleDismissNudge = () => {
    setNudgeDismissed(true);
    localStorage.setItem('pf_nudge_dismissed_at', String(Date.now()));
    track(EVENTS.REENGAGEMENT_NUDGE_DISMISSED);
  };

  // Compute vault lifetime stats
  const vaultStats = {
    blueprints: history.length,
    collections: JSON.parse(localStorage.getItem('pf_collections') || '[]').length,
    refinements: history.reduce((acc, h) => acc + (h.chatMessages || []).filter(m => m.role === 'user').length, 0),
    hoursSaved: Math.round((history.length * 12) / 60 * 10) / 10, // 12min per blueprint
  };

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
    track(EVENTS.PROMPT_COPIED, { source: 'dashboard' });
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

  // 2-click safe clear all pattern
  const handleClearAll = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      clearTimerRef.current = setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    clearTimeout(clearTimerRef.current);
    setClearConfirm(false);
    startTransition(async () => {
      setOptimisticHistory({ action: 'clear' });
      try {
        await clearHistory();
        toast.success('All workspaces cleared', {
          description: 'Start fresh with a new forge anytime.',
        });
      } catch (err) {
        toast.error('Failed to clear history. Please try again.');
      }
    });
  };

  const handleQuickForge = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    handleNewWorkspaceIntent(() => {
      localStorage.setItem('promptforge_quickquery', quickInput);
      localStorage.setItem('promptforge_wmode', 'enhance');
      track('quick_forge_started', { query: quickInput });
      router.push('/forge');
    });
  };

  const handleSelectTemplate = (tpl) => {
    handleNewWorkspaceIntent(() => {
      const draft = {
        mode: tpl.mode,
        appCategory: tpl.category || null,
        selectedFeatures: tpl.features || [],
        selectedTheme: tpl.theme || null,
        pageType: tpl.pageType || null,
        selectedComponents: tpl.components || [],
        savedAt: Date.now(),
      };
      localStorage.setItem('promptforge_draft', JSON.stringify(draft));
      toast.success(`Loaded ${tpl.title} template!`, { description: 'Starting forge wizard...' });
      router.push(`/forge?mode=${tpl.mode}`);
    });
  };

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

  const SUGGESTIONS = ['glassmorphic dashboard', 'SaaS pricing page', 'OTP auth screen', 'data table component'];

  if (loading || !user) {
    return (
      <div style={loadingWrap}>
        <div style={{ width: '100%', maxWidth: '1200px', padding: '2rem' }}>
          {/* Hero skeleton */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={skeletonLine('160px', '24px')} />
            <div style={{ ...skeletonLine('75%', '56px'), marginTop: '1.25rem' }} />
            <div style={{ ...skeletonLine('50%', '20px'), marginTop: '1rem' }} />
            <div style={{ ...skeletonLine('100%', '58px'), marginTop: '1.5rem', borderRadius: '12px' }} />
          </div>

          {/* Workflow grids skeletons matching repeat(auto-fit, minmax(260px, 1fr)) */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ ...skeletonLine('200px', '24px'), marginBottom: '1.25rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={skeletonCard} className="animate-pulse" />
              ))}
            </div>
          </div>

          {/* Workspaces list skeletons matching actual banner + cards layout */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={skeletonLine('180px', '28px')} />
              <div style={skeletonLine('80px', '28px')} />
            </div>

            {/* History cards grid skeletons matching exact geometry */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '172px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }} className="animate-pulse">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={skeletonLine('80px', '18px')} />
                    <div style={skeletonLine('60px', '14px')} />
                  </div>
                  <div style={skeletonLine('160px', '18px')} />
                  <div style={skeletonLine('100%', '32px')} />
                  <div style={{ ...skeletonLine('100%', '1px'), marginTop: '0.5rem' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
      {/* P0: First Blueprint Success Screen (renders as overlay) */}
      <FirstBlueprintSuccessScreen />

      {/* ── Intent-Driven Re-engagement Nudge ── */}
      <AnimatePresence>
        {reengagementNudge && !nudgeDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={nudgeBanner(reengagementNudge.type)}
            className="glass-panel"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
              <Zap size={14} style={{ color: reengagementNudge.type === 'milestone' ? '#f59e0b' : 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>{reengagementNudge.message}</span>
            </div>
            <motion.button
              style={nudgeCta}
              onClick={() => { track(EVENTS.REENGAGEMENT_NUDGE_CLICKED, { type: reengagementNudge.type }); router.push(reengagementNudge.href); }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              {reengagementNudge.cta} <ArrowRight size={12} />
            </motion.button>
            <button onClick={handleDismissNudge} style={nudgeDismissBtn}><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Welcome Guided HUD ── */}
      <motion.section
        style={welcomeHUD}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <div className="premium-badge animate-pulse-slow" style={{ marginBottom: '1.25rem' }}>
            <Sparkles size={11} className="text-purple-400" />
            <span>Prompt Architect v2.0</span>
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} style={welcomeHeadline}>
          Welcome back, <span className="hero-gradient">{user.username}</span>.
        </motion.h1>

        <motion.p variants={fadeUp} style={welcomeSub}>
          Select a blueprint pipeline below to start compiling structural grids, theme tokens, and dynamic interactions for your project.
        </motion.p>

        {/* Activity tracker (sessions + blueprints this month) */}
        <motion.div variants={fadeUp}>
          <ActivityTracker />
        </motion.div>
      </motion.section>

      {/* ── Your Vault — Lifetime Stats Strip ── */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={vaultStrip}
          className="glass-panel"
        >
          {[
            { icon: FileText, label: 'Blueprints Compiled', value: vaultStats.blueprints, color: '#7c3aed' },
            { icon: Folder, label: 'Collections Organized', value: vaultStats.collections, color: '#0891b2' },
            { icon: Brain, label: 'AI Refinements Applied', value: vaultStats.refinements, color: '#db2777' },
            { icon: Zap, label: 'Est. Hours Saved', value: `~${vaultStats.hoursSaved}h`, color: '#f59e0b', isText: true },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={vaultStat}>
                <div style={vaultStatIcon(stat.color)}><Icon size={14} style={{ color: stat.color }} /></div>
                <div>
                  <div style={vaultStatValue}>{stat.value}</div>
                  <div style={vaultStatLabel}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── Builder Mastery Score ── */}
      <MasteryScore collections={collections} />

      {/* ── Primary Workflows Bento Grid ── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ marginBottom: '4.5rem', marginTop: '1rem' }}
      >
        <div style={bentoGrid} className="workflow-bento-grid">
          {WORKFLOWS.map((w, i) => (
            <BentoCard key={i} workflow={w} onIntercept={(action) => handleNewWorkspaceIntent(action)} />
          ))}
        </div>
      </motion.section>

      {/* Welcome Bot — empty state only */}
      {history.length === 0 && <WelcomeBotMessage />}

      {/* Blueprint Gallery — starter templates */}
      <BlueprintGallery />

      {/* Onboarding Checklist Widget */}
      <OnboardingChecklist history={history} favorites={favorites} />

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AnimatePresence mode="wait">
                <motion.button
                  key={clearConfirm ? 'confirm' : 'normal'}
                  style={clearBtn(clearConfirm)}
                  onClick={handleClearAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  aria-label={clearConfirm ? 'Click again to confirm clearing all workspaces' : 'Clear all workspaces'}
                >
                  {clearConfirm
                    ? <><AlertTriangle size={13} /> Click again to confirm</>  
                    : <><Trash size={13} /> Clear all</>}
                </motion.button>
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Progress-Based Conversion Upgrade Banner — Sunk Cost Reframing */}
        {optimisticHistory.length > 0 && (usage.isNearLimit || usage.isAtLimit) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={usageBannerStyle(usage.isAtLimit)}
            className="glass-panel"
          >
            <div style={usageBannerHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} style={{ color: usage.isAtLimit ? '#f43f5e' : '#fbbf24' }} />
                <span style={usageBannerTitle}>
                  {usage.isAtLimit
                    ? `${usage.used} of ${usage.max} workspace slots used (Limit Reached)`
                    : `${usage.used} of ${usage.max} workspace slots used`}
                </span>
              </div>
              <Link href="/pricing/pro" style={usageBannerUpgradeLink(usage.isAtLimit)}>
                Upgrade to Pro <ArrowRight size={12} />
              </Link>
            </div>

            <div style={usageBannerProgressBg}>
              <div style={usageBannerProgressFill(usage.percent, usage.isAtLimit)} />
            </div>

            <p style={usageBannerDesc}>
              {usage.isAtLimit
                ? `You've built ${usage.used} blueprints here. Upgrade to keep your entire library — unlimited workspaces, never lose your work.`
                : `You've invested ${usage.used} blueprints into PromptForge. Upgrade now to grow your library without limits.`}
            </p>
          </motion.div>
        )}

        {optimisticHistory.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Folder Collections Filter Row */}
            <div style={foldersTabRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                <button
                  style={folderTabBtn(selectedCollection === 'all')}
                  onClick={() => setSelectedCollection('all')}
                >
                  <Compass size={13} />
                  <span>All Spaces</span>
                </button>
                {collections.map(col => {
                  const count = optimisticHistory.filter(h => h.collection === col).length;
                  return (
                    <button
                      key={col}
                      style={folderTabBtn(selectedCollection === col)}
                      onClick={() => setSelectedCollection(col)}
                    >
                      <Folder size={13} fill={selectedCollection === col ? 'var(--accent)' : 'none'} style={{ color: selectedCollection === col ? 'var(--accent)' : 'inherit' }} />
                      <span>{col}</span>
                      {count > 0 && <span style={folderCountBadge}>{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Folder Creator */}
              <form onSubmit={handleCreateCollection} style={folderCreateForm}>
                <input
                  type="text"
                  placeholder="New Folder..."
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  style={folderCreateInput}
                />
                <button type="submit" style={folderCreateBtn} title="Create Folder">
                  <FolderPlus size={13} />
                </button>
              </form>
            </div>

            <div style={filterBar}>
              {/* Search Input */}
              <div style={searchWrap} className="glass-panel">
                <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search prompt blueprints..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={searchInput}
                />
              </div>

              {/* Mode Filters */}
              <div style={filterGroup}>
                {['all', 'application', 'page', 'enhance'].map(mode => (
                  <button
                    key={mode}
                    style={filterChipBtn(filterMode === mode)}
                    onClick={() => setFilterMode(mode)}
                  >
                    {mode === 'all' ? 'All' : mode === 'application' ? 'Apps' : mode === 'page' ? 'Pages' : 'Enhance'}
                  </button>
                ))}
              </div>

              {/* Favorites Toggle */}
              <button
                style={filterChipBtn(showFavoritesOnly, true)}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star size={12} fill={showFavoritesOnly ? '#fbbf24' : 'none'} style={{ color: showFavoritesOnly ? '#fbbf24' : 'inherit' }} />
                <span>Favorites</span>
              </button>

              {/* Sort Toggle */}
              <div style={sortWrap}>
                <Calendar size={12} />
                <ShadcnDropdown
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  options={[
                    { label: 'Recent', value: 'recent' },
                    { label: 'Alphabetical', value: 'title' }
                  ]}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.78rem',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    minWidth: '100px'
                  }}
                />
              </div>
            </div>
          </div>
        )}


        {(() => {
          // Perform filtering and sorting
          const filtered = optimisticHistory.filter(item => {
            const matchesSearch =
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.query && item.query.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesMode = filterMode === 'all' || item.mode === filterMode;
            const matchesFavorite = !showFavoritesOnly || favorites.includes(item.id);
            const matchesCollection = selectedCollection === 'all' || item.collection === selectedCollection;
            return matchesSearch && matchesMode && matchesFavorite && matchesCollection;
          });

          // Sort
          if (sortBy === 'title') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
          } else {
            filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          }

          if (filtered.length === 0) {
            return (
              <motion.div variants={fadeUp} style={emptyState} className="glass-panel">
                <div style={emptyIconWrap} className="glass-panel">
                  <Sparkles size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ textAlign: 'center', maxWidth: '420px' }}>
                  <p style={emptyTitle}>No workspaces match filters</p>
                  <p style={emptyDesc}>
                    Try clearing your search query or choosing a different category workflow.
                  </p>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div variants={stagger} style={historyGrid}>
              <AnimatePresence mode="popLayout">
                {filtered.map((log) => {
                  const ModeIcon = MODE_ICONS[log.mode] || Sparkles;
                  const modeColor = MODE_COLORS[log.mode] || '#19398d';
                  const modeLabel = MODE_LABELS[log.mode] || log.mode;
                  const isCopied = copiedId === log.id;
                  const isFav = favorites.includes(log.id);
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
                      role="article"
                      aria-label={`Open workspace: ${log.title}`}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && router.push(`/chat?id=${log.id}`)}
                    >
                      <div style={historyCardTop}>
                        <div style={{ ...historyModeBadge, background: `${modeColor}12`, color: modeColor, borderColor: `${modeColor}25` }}>
                          <ModeIcon size={12} />
                          <span>{modeLabel}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <motion.button
                            onClick={(e) => toggleFavorite(log.id, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: isFav ? '#fbbf24' : 'var(--muted-foreground)' }}
                            whileHover={{ scale: 1.15 }}
                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star size={13} fill={isFav ? '#fbbf24' : 'none'} />
                          </motion.button>
                          <span style={historyDate}>
                            <Clock size={11} />
                            {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
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
                        
                        <div onClick={e => e.stopPropagation()}>
                          <ShadcnDropdown
                            value={log.collection || ''}
                            onChange={(val) => updatePromptCollection(log.id, val)}
                            options={[
                              { label: '📁 Move to...', value: '' },
                              ...collections.map(c => ({ label: c, value: c }))
                            ]}
                            style={{
                              background: 'rgba(255,255,255,0.01)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.72rem',
                              color: 'var(--muted-foreground)',
                              borderRadius: '6px',
                              fontFamily: 'var(--font-sans)',
                              minWidth: '110px'
                            }}
                          />
                        </div>
                        
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
          );
        })()}
      </motion.section>

      {/* ── Secondary Sandbox Console (Manual Prompt Enhancer) ── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        style={sandboxConsoleContainer}
        className="glass-panel"
      >
        <div style={sandboxHeaderRow}>
          <div style={sandboxTitleBox}>
            <div style={sandboxIconWrap}>
              <Sparkles size={15} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 style={sandboxTitleText}>Quick Sandbox Enhancer</h3>
              <p style={sandboxSubtitleText}>Already have a draft idea? Paste it below to manually enhance layout and color configurations.</p>
            </div>
          </div>
        </div>

        <motion.form
          onSubmit={handleQuickForge}
          style={sandboxConsoleForm(inputFocused)}
          className="dashboard-console-form"
        >
          <input
            type="text"
            placeholder={ROTATING_PLACEHOLDERS[placeholderIdx]}
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={consoleInput}
            autoComplete="off"
            aria-label="Describe what you want to build"
          />
          <motion.button
            type="submit"
            className="btn-accent shine-effect"
            style={forgeBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={!quickInput.trim()}
          >
            Forge Specs
            <CornerDownLeft size={13} />
          </motion.button>
        </motion.form>

        {/* Suggestions */}
        <div style={sandboxSuggestRow}>
          <span style={suggestLabel}>Try sandbox examples:</span>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              type="button"
              style={suggestChip}
              onClick={() => setQuickInput(`A premium ${s} with modern dark glassmorphic aesthetics and responsive layout.`)}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.section>


      {/* Keyboard Shortcuts Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        style={floatingHelpBtn}
        title="Show Keyboard Shortcuts (?)"
      >
        <HelpCircle size={16} />
      </button>

      {/* Help Keyboard Overlay Modal */}
      <HelpKeyboardOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />

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
      <InterceptModal isOpen={showInterceptModal} onClose={() => setShowInterceptModal(false)} />
    </div>
  );
}

// ─── Bento Card Component ──────────────────────────────────────
function BentoCard({ workflow, onIntercept }) {
  const { href, wmode, icon: Icon, label, desc, accent, accentBg, badge } = workflow;
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    onIntercept(() => {
      if (wmode) localStorage.setItem('promptforge_wmode', wmode);
      router.push(href);
    });
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

// \u2500\u2500 Re-engagement nudge banner
const nudgeBanner = (type) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.75rem 1rem',
  marginBottom: '1.5rem',
  borderRadius: '12px',
  background: type === 'milestone' ? 'rgba(245,158,11,0.05)' : 'rgba(124,58,237,0.05)',
  border: `1px solid ${type === 'milestone' ? 'rgba(245,158,11,0.18)' : 'rgba(124,58,237,0.18)'}`,
});

const nudgeCta = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  fontSize: '0.78rem', fontWeight: '700',
  color: 'var(--accent)', background: 'rgba(124,58,237,0.1)',
  border: '1px solid rgba(124,58,237,0.2)',
  borderRadius: '8px', padding: '0.4rem 0.8rem',
  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)',
};

const nudgeDismissBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted-foreground)', padding: '4px',
  display: 'flex', alignItems: 'center', flexShrink: 0,
};

// \u2500\u2500 Your Vault stats strip
const vaultStrip = {
  display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
  padding: '0.85rem 1.1rem',
  borderRadius: '14px',
  marginBottom: '1.25rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.05)',
};

const vaultStat = {
  display: 'flex', alignItems: 'center', gap: '0.55rem',
  paddingRight: '1rem',
  borderRight: '1px solid rgba(255,255,255,0.04)',
};

const vaultStatIcon = (color) => ({
  width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
  background: `${color}12`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

const vaultStatValue = {
  fontSize: '1.05rem', fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: '#fff', lineHeight: 1,
};

const vaultStatLabel = {
  fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.15rem',
};

const welcomeHUD = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: '3.5rem',
  paddingBottom: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
};

const welcomeHeadline = {
  fontSize: '2.8rem',
  fontWeight: '800',
  letterSpacing: '-0.04em',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  marginBottom: '0.75rem',
};

const welcomeSub = {
  fontSize: '0.94rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.65',
  maxWidth: '540px',
  marginBottom: '1rem',
};

const sandboxConsoleContainer = {
  background: 'rgba(5, 5, 8, 0.25)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '16px',
  padding: '1.75rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  marginBottom: '3rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.02)',
};

const sandboxHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const sandboxTitleBox = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
};

const sandboxIconWrap = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(251, 191, 36, 0.08)',
  border: '1px solid rgba(251, 191, 36, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const sandboxTitleText = {
  fontSize: '0.96rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const sandboxSubtitleText = {
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  margin: '0.15rem 0 0 0',
  lineHeight: '1.4',
};

const sandboxConsoleForm = (focused) => ({
  width: '100%',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0 0.4rem 0 1rem',
  background: 'rgba(10, 10, 12, 0.6)',
  border: `1px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}`,
  borderRadius: '10px',
  boxShadow: focused
    ? '0 0 0 1px var(--accent), 0 4px 24px rgba(124,58,237,0.1), inset 0 1px 0 0 rgba(255,255,255,0.08)'
    : 'inset 0 1px 0 0 rgba(255,255,255,0.03)',
  transition: 'all 0.2s ease',
});

const sandboxSuggestRow = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

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
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem',
};

const bentoCard = (hovered, accent) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.75rem',
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

const clearBtn = (isConfirm) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.4rem 0.85rem',
  background: isConfirm ? 'rgba(239,68,68,0.08)' : 'transparent',
  border: `1px solid ${isConfirm ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: '600',
  color: isConfirm ? '#ef4444' : 'var(--muted-foreground)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
});

const emptyState = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.25rem',
  padding: '4rem 2rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px dashed rgba(255,255,255,0.07)',
  borderRadius: '20px',
  textAlign: 'center',
};

const emptyIconWrap = {
  width: '80px',
  height: '80px',
  borderRadius: '20px',
  background: 'rgba(251,191,36,0.06)',
  border: '1px solid rgba(251,191,36,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const emptyStartBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.7rem 1.5rem',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: '700',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
};

const skeletonLine = (width, height) => ({
  width,
  height,
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.04)',
  animation: 'pulse 1.5s ease-in-out infinite',
});

const skeletonCard = {
  height: '160px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.03)',
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
  padding: '1.35rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '16px',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 20px rgba(0,0,0,0.2)',
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

// ─── New History Filters & Keyboard Help Styles ───────────────

const filterBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '1.25rem',
  flexWrap: 'wrap',
};

const searchWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  padding: '0.4rem 0.75rem',
  flex: 1,
  minWidth: '220px',
};

const searchInput = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.8rem',
  color: '#fff',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  width: '100%',
};

const filterGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const filterChipBtn = (active, isStar = false) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.4rem 0.8rem',
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: active ? '700' : '500',
  cursor: 'pointer',
  background: active
    ? (isStar ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.08)')
    : 'rgba(255,255,255,0.02)',
  border: `1px solid ${active ? (isStar ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.05)'}`,
  color: active ? (isStar ? '#fbbf24' : '#ffffff') : 'var(--muted-foreground)',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
});

const sortWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
};

const sortSelect = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  padding: '0.4rem 0.65rem',
  fontSize: '0.78rem',
  color: '#fff',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  cursor: 'pointer',
};

const floatingHelpBtn = {
  position: 'fixed',
  bottom: '1.5rem',
  right: '1.5rem',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  zIndex: 99,
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

// ─── Folder Collections Styles ────────────────────────────────

const foldersTabRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  paddingBottom: '0.75rem',
  flexWrap: 'wrap',
};

const folderTabBtn = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.35rem 0.7rem',
  borderRadius: '6px',
  fontSize: '0.78rem',
  fontWeight: active ? '700' : '500',
  color: active ? '#ffffff' : 'var(--muted-foreground)',
  background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const folderCountBadge = {
  fontSize: '0.65rem',
  background: 'rgba(255,255,255,0.06)',
  padding: '1px 5px',
  borderRadius: '4px',
  marginLeft: '0.2rem',
  color: 'var(--muted-foreground)',
};

const folderCreateForm = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
  padding: '2px 4px',
};

const folderCreateInput = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.72rem',
  color: '#ffffff',
  outline: 'none',
  padding: '2px 6px',
  width: '90px',
  fontFamily: 'var(--font-sans)',
};

const folderCreateBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const folderSelectorCard = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
  padding: '0.25rem 0.5rem',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  cursor: 'pointer',
  maxWidth: '90px',
};


// ─── Intercept Modal Component ─────────────────────────────
function InterceptModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={modalOverlayStyle}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={modalContentStyle}
          className="glass-panel"
          onClick={e => e.stopPropagation()}
        >
          <div style={modalHeaderRow}>
            <div style={modalWarningIconWrap}>
              <AlertTriangle size={20} style={{ color: '#f43f5e' }} />
            </div>
            <h3 style={modalTitle}>Workspace Limit Reached</h3>
          </div>
          
          <p style={modalDesc}>
            You already have <strong>3 active workspaces</strong> on the Hobby Plan. Upgrade to Professional to continue building:
          </p>

          <div style={modalFeaturesList}>
            <div style={modalFeatureItem}>
              <Check size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Unlimited Workspaces</strong> — build as many projects as you want</span>
            </div>
            <div style={modalFeatureItem}>
              <Check size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Supabase Cloud Sync</strong> — secure backups & cross-device access</span>
            </div>
            <div style={modalFeatureItem}>
              <Check size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Priority LLM Orchestrator</strong> — instant, zero-delay compilations</span>
            </div>
            <div style={modalFeatureItem}>
              <Check size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Premium Visual Blueprints</strong> — full bento & animation library access</span>
            </div>
          </div>

          <div style={modalActions}>
            <button
              onClick={() => {
                track('upgrade_modal_click', { source: 'intercept_modal' });
                window.location.href = '/pricing/pro';
              }}
              style={modalUpgradeBtn}
              className="shine-effect"
            >
              Upgrade to Pro — $15/mo
            </button>
            <button
              onClick={onClose}
              style={modalCloseBtn}
            >
              Manage Existing Workspaces
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// ─── Usage Progress Banner Styles ────────────────────────────
const usageBannerStyle = (isAtLimit) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: '1.25rem 1.5rem',
  borderRadius: '16px',
  background: isAtLimit ? 'rgba(239,68,68,0.03)' : 'rgba(251,191,36,0.02)',
  border: `1px solid ${isAtLimit ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.15)'}`,
  boxShadow: isAtLimit 
    ? '0 0 24px rgba(239,68,68,0.05), inset 0 1px 0 0 rgba(255,255,255,0.05)'
    : '0 0 24px rgba(251,191,36,0.05), inset 0 1px 0 0 rgba(255,255,255,0.05)',
  marginBottom: '1.5rem',
});

const usageBannerHead = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const usageBannerTitle = {
  fontSize: '0.88rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
};

const usageBannerUpgradeLink = (isAtLimit) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: isAtLimit ? '#ef4444' : 'var(--accent)',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
});

const usageBannerProgressBg = {
  width: '100%',
  height: '8px',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: '999px',
  overflow: 'hidden',
};

const usageBannerProgressFill = (percent, isAtLimit) => ({
  width: `${percent}%`,
  height: '100%',
  background: isAtLimit 
    ? 'linear-gradient(90deg, #ef4444, #db2777)'
    : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
  borderRadius: '999px',
  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
});

const usageBannerDesc = {
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
};

// ─── Intercept Modal Styles ─────────────────────────────────
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(5,5,8,0.75)',
  backdropFilter: 'blur(8px)',
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '480px',
  background: 'rgba(10,10,14,0.94)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const modalHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const modalWarningIconWrap = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: 'rgba(244,63,94,0.08)',
  border: '1px solid rgba(244,63,94,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const modalTitle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: '#fff',
  letterSpacing: '-0.02em',
};

const modalDesc = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.6',
};

const modalFeaturesList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '12px',
  padding: '1rem',
};

const modalFeatureItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.6rem',
  fontSize: '0.8rem',
  color: 'var(--foreground)',
  lineHeight: '1.4',
};

const modalActions = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  marginTop: '0.5rem',
};

const modalUpgradeBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.8rem 1.5rem',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#000',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.88rem',
  fontWeight: '700',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'opacity 0.2s ease',
};

const modalCloseBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.8rem 1.5rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  fontSize: '0.88rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
};



