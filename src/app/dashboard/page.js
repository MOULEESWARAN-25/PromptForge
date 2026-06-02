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
import ShadcnDropdown from '@/components/ShadcnDropdown';
import WelcomeBotMessage from '@/components/WelcomeBotMessage';
import DashboardHUD from '@/components/DashboardHUD';

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
    accent: 'var(--accent)',
    badge: 'Full-Stack',
  },
  {
    href: '/forge?mode=page',
    wmode: 'page',
    icon: Layout,
    label: 'Web Page Design',
    desc: '1. Select type of page, 2. Select components, 3. Select theme, 4. Generate prompt.',
    accent: '#0284c7',
    badge: 'v0 Ready',
  },
  {
    href: '/forge?mode=component',
    wmode: 'component',
    icon: Code2,
    label: 'Single Component',
    desc: 'Describe modular UI elements. Inject full codebase context, custom design tokens, and framework APIs.',
    accent: '#db2777',
    badge: 'Custom Stack',
  },
  {
    href: '/forge?mode=enhance',
    wmode: 'enhance',
    icon: Wand2,
    label: 'Prompt Enhancer',
    desc: 'Paste any rough idea and inject Framer motions, HSL tokens, and professional terminology instantly.',
    accent: 'var(--success)',
    badge: 'Quick',
  },
];

const MODE_ICONS = { application: Monitor, page: Layout, component: Code2, enhance: Wand2 };
const MODE_COLORS = {
  application: 'var(--accent)', page: '#0284c7', component: '#db2777', enhance: 'var(--success)',
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
  const { user, history, deletePromptRecord, clearHistory, loading, updatePromptCollection, getUsageStats, activityStats, recordActivity, theme } = useApp();
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
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  // ── Re-engagement nudge
  const [reengagementNudge, setReengagementNudge] = useState(null); // { type, message, cta, href }
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const usage = getUsageStats ? getUsageStats() : { used: 0, max: 3, isAtLimit: false, isNearLimit: false, percent: 0 };

  const handleNewWorkspaceIntent = (action) => {
    action();
  };

  // ── Folder Collections state
  const [collections, setCollections] = useState(["SaaS Ideas", "Client Projects", "Landing Pages", "AI Tools"]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activeFolderPromptId, setActiveFolderPromptId] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);

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

  const handleDeleteCollection = () => {
    if (!folderToDelete) return;
    const updated = collections.filter(c => c !== folderToDelete);
    setCollections(updated);
    localStorage.setItem('pf_collections', JSON.stringify(updated));

    // Clean up collection assignment for workspaces
    history.forEach(item => {
      if (item.collection === folderToDelete) {
        updatePromptCollection(item.id, '');
      }
    });

    if (selectedCollection === folderToDelete) {
      setSelectedCollection('all');
    }

    toast.success(`Deleted folder: ${folderToDelete}`);
    track('collection_deleted', { name: folderToDelete });
    setFolderToDelete(null);
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
    collections: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('pf_collections') || '[]').length : 0,
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
      clearTimerRef.current = setTimeout(() => setClearConfirm(false), 7000);
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
                <div key={i} style={{ height: '172px', borderRadius: '14px', background: 'var(--card)', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }} className="animate-pulse">
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
              <span style={{ fontSize: '0.82rem', color: 'var(--foreground)', fontWeight: '600' }}>{reengagementNudge.message}</span>
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

      {/* ── Dynamic Widescreen Dashboard HUD ── */}
      <DashboardHUD />


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



        {optimisticHistory.length > 0 && (
          <div style={explorerToolbar} className="glass-panel">
            {/* Left: Search input */}
            <div style={toolbarSearchWrap}>
              <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search prompt blueprints..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={toolbarSearchInput}
              />
            </div>

            {/* Middle: Collection Folder Selector */}
            <div style={toolbarDropdownWrap}>
              <Folder size={13} style={{ color: 'var(--accent)' }} />
              <ShadcnDropdown
                value={selectedCollection}
                onChange={(val) => {
                  setSelectedCollection(val);
                  if (val === 'all') {
                    setSearchQuery('');
                    setFilterMode('all');
                    setShowFavoritesOnly(false);
                  }
                }}
                options={[
                  { label: '📁 All Collections', value: 'all' },
                  ...collections.map(c => ({ label: `📁 ${c}`, value: c }))
                ]}
                style={toolbarDropdownSelect}
              />
              {selectedCollection !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFolderToDelete(selectedCollection)}
                  style={toolbarDeleteFolderBtn}
                  title={`Delete active folder "${selectedCollection}"`}
                >
                  <X size={12} />
                  <span>Delete Folder</span>
                </button>
              )}
            </div>

            {/* Middle-Right: Inline Folder Creator */}
            <form onSubmit={handleCreateCollection} style={toolbarFolderForm}>
              <input
                type="text"
                placeholder="New Folder..."
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                style={toolbarFolderInput}
              />
              <button type="submit" style={toolbarFolderBtn} title="Create Folder">
                <FolderPlus size={13} />
              </button>
            </form>

            {/* Right: Mode Filter Chips */}
            <div style={toolbarChipGroup}>
              {['all', 'application', 'page', 'enhance'].map(mode => (
                <button
                  key={mode}
                  style={toolbarChip(filterMode === mode)}
                  onClick={() => setFilterMode(mode)}
                >
                  {mode === 'all' ? 'All' : mode === 'application' ? 'Apps' : mode === 'page' ? 'Pages' : 'Enhance'}
                </button>
              ))}
            </div>

            {/* Right: Favorites & Sort Group */}
            <div style={toolbarActionGroup}>
              <button
                style={toolbarChip(showFavoritesOnly, true)}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star size={12} fill={showFavoritesOnly ? 'var(--accent)' : 'none'} style={{ color: showFavoritesOnly ? 'var(--accent)' : 'inherit' }} />
                <span>Starred</span>
              </button>

              <div style={toolbarSortWrap}>
                <Calendar size={12} style={{ color: 'var(--muted-foreground)' }} />
                <ShadcnDropdown
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  options={[
                    { label: 'Recent First', value: 'recent' },
                    { label: 'Alphabetical', value: 'title' }
                  ]}
                  style={toolbarSortSelect}
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
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={emptyState}
                className="glass-panel"
              >
                <div style={emptyIconWrap} className="glass-panel">
                  <Sparkles size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ textAlign: 'center', maxWidth: '420px' }}>
                  <p style={emptyTitle}>No workspaces match filters</p>
                  <p style={emptyDesc}>
                    Try clearing your search query or choosing a different category workflow.
                  </p>
                  <motion.button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterMode('all');
                      setShowFavoritesOnly(false);
                      setSelectedCollection('all');
                      toast.success('All filters reset');
                    }}
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      background: 'var(--accent)',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-sans)',
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Reset all filters
                  </motion.button>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={historyGrid}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((log) => {
                  const ModeIcon = MODE_ICONS[log.mode] || Sparkles;
                  const modeColor = MODE_COLORS[log.mode] || 'var(--accent)';
                  const modeLabel = MODE_LABELS[log.mode] || log.mode;
                  const isCopied = copiedId === log.id;
                  const isFav = favorites.includes(log.id);
                  return (
                    <motion.div
                      key={log.id}
                      variants={cardVariant}
                      layout
                      style={{
                        ...historyCard,
                        position: 'relative',
                        zIndex: activeDropdownId === log.id ? 50 : 1
                      }}
                      className="glass-panel card-hover pf-blueprint-card"
                      onClick={() => router.push(`/chat?id=${log.id}`)}
                      whileHover={{ y: -4 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      role="article"
                      aria-label={`Open workspace: ${log.title}`}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && router.push(`/chat?id=${log.id}`)}
                    >
                      <div style={historyCardTop}>
                        <div style={{ ...historyModeBadge, background: `color-mix(in srgb, ${modeColor} 12%, transparent)`, color: modeColor, borderColor: `color-mix(in srgb, ${modeColor} 25%, transparent)` }}>
                          <ModeIcon size={12} />
                          <span>{modeLabel}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={historyDate}>
                            <Clock size={11} />
                            {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <motion.button
                            onClick={(e) => toggleFavorite(log.id, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              color: isFav ? 'var(--accent)' : 'var(--muted-foreground)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: isFav ? 1 : 0.45,
                              transition: 'opacity 0.2s ease',
                            }}
                            whileHover={{ scale: 1.18, opacity: 1 }}
                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star size={13} fill={isFav ? 'var(--accent)' : 'none'} style={{ color: isFav ? 'var(--accent)' : 'inherit' }} />
                          </motion.button>
                        </div>
                      </div>

                      <h3 style={historyTitle}>{log.title}</h3>
                      <p style={historyQuery} className="truncate-2">{log.query || 'No query recorded.'}</p>

                      {/* Premium Hover Actions Overlay */}
                      <div 
                        style={{
                          ...cardHoverActions,
                          opacity: activeDropdownId === log.id ? 1 : undefined
                        }}
                        className="pf-hover-actions"
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Copy Trigger */}
                        <motion.button
                          style={{ ...cardActionIconBtn, color: isCopied ? 'var(--success)' : 'var(--muted-foreground)' }}
                          onClick={e => handleCopy(log.id, e, log.resolvedPrompt)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          title="Copy resolved prompt"
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        </motion.button>

                        {/* Move folder Dropdown */}
                        <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                          <ShadcnDropdown
                            value={log.collection || ''}
                            onChange={(val) => updatePromptCollection(log.id, val)}
                            onOpenChange={(open) => setActiveDropdownId(open ? log.id : null)}
                            options={[
                              { label: '📁 Move Folder...', value: '' },
                              ...collections.map(c => ({ label: `📁 ${c}`, value: c }))
                            ]}
                            style={cardFolderDropdown}
                          />
                        </div>

                        {/* Delete Trigger */}
                        <motion.button
                          style={{ ...cardActionIconBtn, color: 'var(--destructive)' }}
                          onClick={e => handleDelete(log.id, e)}
                          whileHover={{ scale: 1.08, background: 'color-mix(in srgb, var(--destructive) 6%, transparent)' }}
                          whileTap={{ scale: 0.92 }}
                          title="Delete workspace"
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
          );
        })()}
      </motion.section>

      {/* ── Secondary Sandbox Console (Manual Prompt Enhancer) ── */}



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

      {/* Delete Folder Confirmation Dialog */}
      <AnimatePresence>
        {folderToDelete && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setFolderToDelete(null)}
          >
            <motion.div
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-xl)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              className="glass-panel"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
              }}>
                <AlertTriangle size={18} style={{ color: 'var(--destructive)' }} />
                <h3 style={{
                  fontSize: '0.98rem',
                  fontWeight: '700',
                  color: 'var(--foreground)',
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                }}>Delete Folder?</h3>
              </div>
              
              <div style={{ padding: '1.25rem 1.5rem', fontSize: '0.82rem', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
                Are you sure you want to delete the folder <strong style={{ color: 'var(--foreground)' }}>"{folderToDelete}"</strong>?
                <p style={{ marginTop: '0.5rem', color: 'var(--muted-foreground)' }}>
                  All prompt blueprints inside this folder will remain safe in your workspaces, but will be uncategorised. This action cannot be undone.
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.6rem',
                padding: '1rem 1.5rem',
                background: 'color-mix(in srgb, var(--foreground) 2%, transparent)',
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  type="button"
                  onClick={() => setFolderToDelete(null)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover-bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCollection}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    background: 'var(--destructive)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="active-scale-95"
                >
                  Delete Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
  background: type === 'milestone' ? 'color-mix(in srgb, var(--warning) 5%, transparent)' : 'color-mix(in srgb, var(--accent) 5%, transparent)',
  border: `1px solid ${type === 'milestone' ? 'color-mix(in srgb, var(--warning) 18%, transparent)' : 'color-mix(in srgb, var(--accent) 18%, transparent)'}`,
});

const nudgeCta = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  fontSize: '0.78rem', fontWeight: '700',
  color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
  borderRadius: '8px', padding: '0.4rem 0.8rem',
  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)',
};

const nudgeDismissBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted-foreground)', padding: '4px',
  display: 'flex', alignItems: 'center', flexShrink: 0,
};

// \u2500\u2500 Your Vault stats strip
const vaultStrip = {};

// Legacy styles removed

const sandboxConsoleContainer = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '1.75rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  marginBottom: '3rem',
  boxShadow: 'var(--shadow-md)',
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
  background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
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
  background: 'var(--muted)',
  border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: '10px',
  boxShadow: focused
    ? '0 0 0 1px var(--accent), 0 4px 24px color-mix(in srgb, var(--accent) 8%, transparent)'
    : 'none',
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
  background: 'var(--card)',
  border: '1px solid var(--border)',
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
  background: 'var(--card)',
  border: `1px solid ${hovered ? `color-mix(in srgb, ${accent} 40%, transparent)` : 'var(--border)'}`,
  transition: 'all var(--duration-base) var(--ease-spring)',
  transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
  boxShadow: hovered
    ? `0 20px 40px color-mix(in srgb, ${accent} 12%, transparent), var(--shadow-sm)`
    : 'var(--shadow-sm)',
});

const bentoGlow = (accent, hovered) => ({
  position: 'absolute',
  top: '-30%',
  right: '-20%',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: `radial-gradient(circle, color-mix(in srgb, ${accent} 15%, transparent) 0%, transparent 70%)`,
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
  background: hovered ? `color-mix(in srgb, ${accent} 18%, transparent)` : `color-mix(in srgb, ${accent} 8%, transparent)`,
  border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
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
  background: `color-mix(in srgb, ${accent} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
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
  borderTop: '1px solid var(--border)',
  transition: 'color 0.2s ease',
});

const clearBtn = (isConfirm) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.4rem 0.85rem',
  background: isConfirm ? 'color-mix(in srgb, var(--destructive) 8%, transparent)' : 'transparent',
  border: `1px solid ${isConfirm ? 'color-mix(in srgb, var(--destructive) 25%, transparent)' : 'var(--border)'}`,
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: '600',
  color: isConfirm ? 'var(--destructive)' : 'var(--muted-foreground)',
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
  background: 'var(--card)',
  border: '1px dashed var(--border)',
  borderRadius: '20px',
  textAlign: 'center',
};

const emptyIconWrap = {
  width: '80px',
  height: '80px',
  borderRadius: '20px',
  background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
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
  background: 'var(--card)',
  animation: 'pulse 1.5s ease-in-out infinite',
});

const skeletonCard = {
  height: '160px',
  borderRadius: '16px',
  background: 'var(--card)',
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
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
  borderTop: '1px solid var(--border)',
  marginTop: '0.4rem',
};

const historyActionBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.3rem 0.65rem',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  color: 'var(--foreground)',
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

// ─── Unified Explorer Toolbar Premium Styling ───────────────────

const explorerToolbar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.85rem',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '0.65rem 1.1rem',
  marginBottom: '1.75rem',
  flexWrap: 'wrap',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

const toolbarSearchWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.55rem',
  background: 'var(--input)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.4rem 0.75rem',
  flex: '1 1 200px',
  minWidth: '180px',
};

const toolbarSearchInput = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.8rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  width: '100%',
};

const toolbarDropdownWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.15rem 0.5rem',
};

const toolbarDropdownSelect = {
  background: 'transparent',
  border: 'none',
  padding: '0.25rem 0.45rem',
  fontSize: '0.78rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  minWidth: '130px',
  cursor: 'pointer',
};

const toolbarDeleteFolderBtn = {
  background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
  border: '1px solid var(--border)',
  color: 'var(--destructive)',
  padding: '0.25rem 0.55rem',
  borderRadius: '6px',
  fontSize: '0.72rem',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const toolbarFolderForm = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'var(--input)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '2px 4px',
};

const toolbarFolderInput = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.75rem',
  color: 'var(--foreground)',
  outline: 'none',
  padding: '2px 6px',
  width: '95px',
  fontFamily: 'var(--font-sans)',
};

const toolbarFolderBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const toolbarChipGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  flexWrap: 'wrap',
};

const toolbarChip = (active, isStar = false) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.45rem 0.85rem',
  borderRadius: '8px',
  fontSize: '0.76rem',
  fontWeight: active ? '700' : '500',
  cursor: 'pointer',
  background: active
    ? (isStar ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--accent)')
    : 'var(--input)',
  border: `1px solid ${active ? (isStar ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--accent)') : 'var(--border)'}`,
  color: active ? (isStar ? 'var(--accent)' : 'var(--accent-foreground)') : 'var(--muted-foreground)',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
});

const toolbarActionGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const toolbarSortWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.15rem 0.55rem',
};

const toolbarSortSelect = {
  background: 'transparent',
  border: 'none',
  padding: '0.25rem 0.45rem',
  fontSize: '0.78rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  minWidth: '105px',
  cursor: 'pointer',
};

// ─── Blueprint Cards Premium Styling ───

const cardStarBtn = (isFav) => ({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  color: isFav ? 'var(--accent)' : 'var(--muted-foreground)',
  zIndex: 10,
});

const cardHoverActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '1.1rem',
  paddingTop: '0.9rem',
  borderTop: '1px solid var(--border)',
};

const cardActionIconBtn = {
  background: 'var(--input)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const cardFolderDropdown = {
  background: 'var(--input)',
  border: '1px solid var(--border)',
  padding: '0.25rem 0.45rem',
  fontSize: '0.7rem',
  color: 'var(--muted-foreground)',
  borderRadius: '6px',
  fontFamily: 'var(--font-sans)',
  minWidth: '105px',
  cursor: 'pointer',
};

const floatingHelpBtn = {
  position: 'fixed',
  bottom: '1.5rem',
  right: '1.5rem',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  zIndex: 99,
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};







