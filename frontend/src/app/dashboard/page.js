"use client";

import React, { useEffect, useState, useOptimistic, useTransition } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, Wand2, ArrowRight, Trash2, Clock, ChevronRight,
  FileText, Layers, TerminalSquare, Box, Code,
  LayoutTemplate, Zap, Cpu, Activity, Calendar, FolderKanban,
  ShoppingBag, HelpCircle
} from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';
import HelpKeyboardOverlay from '@/components/HelpKeyboardOverlay';
import CreateModal from '@/components/CreateModal';

// ─── Inline Animation SVG Compiler Illustration ──────────────────
const CompilerIllustration = () => (
  <svg width="220" height="110" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="compiler-illus" style={S.compilerIllustration}>
    <defs>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--workflow-page)" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="compGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--workflow-component)" stopOpacity="0.7" />
        <stop offset="100%" stopColor="var(--workflow-enhance)" stopOpacity="0.3" />
      </linearGradient>
    </defs>

    {/* Grid Backdrop */}
    <rect x="0" y="0" width="220" height="110" rx="12" fill="var(--input)" opacity="0.3" />
    <path d="M 22 0 L 22 110 M 44 0 L 44 110 M 66 0 L 66 110 M 88 0 L 88 110 M 110 0 L 110 110 M 132 0 L 132 110 M 154 0 L 154 110 M 176 0 L 176 110 M 198 0 L 198 110" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
    <path d="M 0 22 L 220 22 M 0 44 L 220 44 M 0 66 L 220 66 M 0 88 L 220 88" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />

    {/* Glowing Data Flow Paths */}
    <path d="M 25 55 Q 80 10 135 55 T 195 55" fill="none" stroke="url(#glowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" className="flow-path-fast" />
    <path d="M 25 55 Q 80 100 135 55 T 195 55" fill="none" stroke="url(#compGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" className="flow-path-slow" />

    {/* Intent Nodes */}
    <circle cx="25" cy="55" r="4.5" fill="var(--accent)" className="illus-node-pulse" />
    <circle cx="80" cy="32" r="5" fill="var(--workflow-application)" className="illus-node-pulse-delayed" />
    <circle cx="135" cy="55" r="5" fill="var(--workflow-page)" className="illus-node-pulse" />
    <circle cx="165" cy="78" r="5" fill="var(--workflow-enhance)" className="illus-node-pulse-delayed" />
    <circle cx="195" cy="55" r="5.5" fill="var(--success)" className="illus-node-pulse" />
  </svg>
);

// ─── Inline Compiler Console Logger ──────────────────────────────
const TerminalConsole = () => {
  const [lineIdx, setLineIdx] = useState(0);
  const lines = [
    '✓ Analyzing semantic design intent...',
    '✓ Querying Vector DB for prompt layout patterns...',
    '✓ Injected custom HSL color-scheme tokens...',
    '✓ Integrated responsive Bento column rules...',
    '✓ Synthesizing spec configurations...',
    '✓ Blueprint status: IDLE (intent compiled)'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLineIdx(p => (p + 1) % (lines.length + 1));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={S.terminalContainer} className="card-glass noise-overlay">
      <div style={S.terminalHeader}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ ...S.terminalDot, background: '#ef4444' }} />
          <div style={{ ...S.terminalDot, background: '#f59e0b' }} />
          <div style={{ ...S.terminalDot, background: '#22c55e' }} />
        </div>
        <span style={S.terminalTitle}>Compiler Console v3.0</span>
      </div>
      <div style={S.terminalBody}>
        {lines.slice(0, lineIdx === 0 ? 1 : lineIdx).map((l, i) => (
          <div
            key={i}
            style={{
              ...S.terminalLine,
              color: i === lines.length - 1 ? 'var(--success)' : 'var(--foreground)',
              opacity: i === (lineIdx - 1) ? 1 : 0.65,
              fontWeight: i === (lineIdx - 1) ? 600 : 400
            }}
          >
            {l}
          </div>
        ))}
        {lineIdx < lines.length && (
          <span className="terminal-cursor" style={S.terminalCursor}>_</span>
        )}
      </div>
    </div>
  );
};

// ─── SVG Sparklines for Metrics ──────────────────────────────────
const LinesSparkline = () => (
  <svg width="65" height="26" viewBox="0 0 65 26" style={{ marginLeft: 'auto' }}>
    <path
      d="M0,22 Q10,4 22,16 T44,6 T65,2"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="sparkline-path"
    />
    <circle cx="65" cy="2" r="2.5" fill="var(--accent)" className="sparkline-dot" />
  </svg>
);

const PromptsBarGraph = () => (
  <svg width="60" height="24" viewBox="0 0 60 24" style={{ marginLeft: 'auto', display: 'flex', gap: '3px' }}>
    <rect x="2" y="14" width="6" height="10" rx="1.5" fill="var(--success)" opacity="0.3" className="sparkbar-1" />
    <rect x="12" y="10" width="6" height="14" rx="1.5" fill="var(--success)" opacity="0.5" className="sparkbar-2" />
    <rect x="22" y="16" width="6" height="8" rx="1.5" fill="var(--success)" opacity="0.4" className="sparkbar-3" />
    <rect x="32" y="6" width="6" height="18" rx="1.5" fill="var(--success)" opacity="0.7" className="sparkbar-4" />
    <rect x="42" y="12" width="6" height="12" rx="1.5" fill="var(--success)" opacity="0.6" className="sparkbar-5" />
    <rect x="52" y="2" width="6" height="22" rx="1.5" fill="var(--success)" className="sparkbar-6" />
  </svg>
);

// ─── Time Ago Helper ──────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return '';
  const d = Date.now() - new Date(ts).getTime();
  const m = Math.floor(d / 60000);
  const h = Math.floor(m / 60);
  const dy = Math.floor(h / 24);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dy === 1) return 'Yesterday';
  return `${dy}d ago`;
}

const READY_TEMPLATES = [
  { id: 'saas', icon: LayoutTemplate, title: 'SaaS Dashboard', desc: 'Pre-configured prompt for admin panels', mode: 'application', prompt: 'Create a comprehensive SaaS admin dashboard with a sidebar navigation, a top header with user profile and search, and a main content area containing data cards, a line chart for revenue, and a recent transactions table. Use a clean, modern aesthetic with a primary blue accent.' },
  { id: 'ai', icon: Sparkles, title: 'AI Chat Interface', desc: 'Ready-to-compile conversational UI', mode: 'application', prompt: 'Build an AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with distinct user and AI message bubbles, and a sticky input area at the bottom with a submit button and attachment icon.' },
  { id: 'portfolio', icon: Box, title: 'Developer Portfolio', desc: 'Personal site with project galleries', mode: 'page', prompt: 'Design a sleek, minimalist developer portfolio. Include a hero section with a brief introduction, a skills grid, a projects gallery with cards, and a contact form. Use a dark theme with neon accents.' },
  { id: 'docs', icon: FileText, title: 'Documentation Hub', desc: 'Markdown-ready docs with sidebar navigation', mode: 'page', prompt: 'Create a documentation hub layout. Include a persistent left sidebar for nested navigation, a top bar with global search, and a main content area with typography optimized for long-form reading and code blocks.' },
  { id: 'ecommerce', icon: ShoppingBag, title: 'E-commerce Storefront', desc: 'Product grid, cart, and filtering', mode: 'application', prompt: 'Develop an e-commerce storefront. The home page should feature a promotional hero banner, a category sidebar with filters, and a responsive product grid. Include a shopping cart slide-out panel.' },
  { id: 'admin', icon: TerminalSquare, title: 'Internal Tool', desc: 'Data management and CRUD UI', mode: 'application', prompt: 'Build an internal CRUD tool for employee management. The interface should have a large data table with sorting and filtering, and a slide-out modal for adding or editing employee records.' }
];

const WORKSPACE_STATS = [
  { id: 'lines', label: 'Lines Generated', value: '42.8k', icon: Code, color: 'var(--accent)', change: '+12.4% this week', spark: <LinesSparkline /> },
  { id: 'prompts', label: 'Prompts Compiled', value: '128', icon: Wand2, color: 'var(--success)', change: '+18 today', spark: <PromptsBarGraph /> },
];

export default function DashboardPage() {
  const { user, history, deletePromptRecord, loading, recordActivity } = useApp();
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Load drafts from local storage
  useEffect(() => {
    try {
      const found = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key === 'promptforge_draft' || key.startsWith('promptforge_draft_'))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.mode) {
              found.push({
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
      found.sort((a, b) => b.savedAt - a.savedAt);
      setDrafts(found);
    } catch (e) {
      console.error("Failed to load drafts:", e);
    }
  }, []);

  // Track + activity
  useEffect(() => {
    if (user) {
      track(EVENTS.DASHBOARD_VIEWED);
      recordActivity();
    }
  }, [user]);

  // Help overlay keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setShowHelp(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Handle ?action=create query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('action') === 'create') {
        setIsCreateModalOpen(true);
        url.searchParams.delete('action');
        window.history.replaceState({}, '', url.toString());
      }
    }
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

  const handleEnhance = () => {
    localStorage.setItem('promptforge_wmode', 'enhance');
    localStorage.removeItem('promptforge_quickquery');
    router.push('/forge?mode=enhance');
  };

  const handleStarter = (template) => {
    toast(`Initializing template: ${template.title}`);
    localStorage.setItem('promptforge_wmode', template.mode);
    localStorage.setItem('promptforge_quickquery', template.prompt);
    localStorage.setItem('promptforge_template_title', template.title);
    router.push(`/forge?mode=${template.mode}`);
  }

  // Optimistic history
  const [optimisticHistory, setOptimisticHistory] = useOptimistic(
    history,
    (state, { action, id }) => action === 'delete' ? state.filter(i => i.id !== id) : state
  );

  const handleDelete = (id, e) => {
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticHistory({ action: 'delete', id });
      try {
        await deletePromptRecord(id);
        toast.success('Blueprint record deleted');
      } catch { toast.error('Failed to delete blueprint'); }
    });
  };

  const userName = user?.username || 'Developer';

  if (loading || !user) {
    return (
      <div style={S.loadingSkel}>
        <div style={S.skelLine('180px', '20px')} />
        <div style={S.skelLine('40%', '42px')} />
        <div style={S.skelLine('100%', '200px')} />
      </div>
    );
  }

  const sortedHistory = [...optimisticHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Merge drafts and history into one "Continue Working" stream
  const continueWorkingItems = [
    ...drafts.map(d => ({ ...d, isDraft: true, timestamp: d.savedAt, id: d.key })),
    ...sortedHistory.map(h => ({ ...h, isDraft: false, title: h.title || 'Untitled Blueprint' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5); // Top 5 items in clean rows

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'application': return <TerminalSquare size={16} />;
      case 'page': return <LayoutTemplate size={16} />;
      case 'component': return <Box size={16} />;
      case 'enhance': return <Wand2 size={16} />;
      default: return <FolderKanban size={16} />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'application': return 'var(--workflow-application)';
      case 'page': return 'var(--workflow-page)';
      case 'component': return 'var(--workflow-component)';
      case 'enhance': return 'var(--workflow-enhance)';
      default: return 'var(--accent)';
    }
  };

  return (
    <div style={S.pageContainer}>

      {/* ─── BREADCRUMBS & INNER PAGE HEADER ────────────────────── */}
      <div style={S.headerWrapper}>
        <div style={S.headerSplit}>
          <div style={S.greetingArea}>
            <div style={S.breadcrumbs}>
              <span>{userName}&apos;s Workspace</span>
              <ChevronRight size={12} style={{ opacity: 0.4 }} />
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Home</span>
            </div>

            <h1 style={S.pageTitle}>
              Welcome back, <span style={S.titleGradient}>{userName}</span>.
            </h1>
            <p style={S.pageSubtitle}>
              Translate visual intent into high-fidelity architectural specs and components.
            </p>
          </div>

          {/* Animated SVG compiler illustration */}
          <CompilerIllustration />
        </div>
      </div>

      {/* ─── BALANCED BENTO GRID ───────────────────────────────── */}
      <div style={S.dashboardGrid} className="dashboard-grid">

        {/* LEFT PANE: ACTIONS, RECENT WORK, STARTERS */}
        <div style={S.leftPane}>

          {/* Action Hubs */}
          <div style={S.heroCommandGrid}>
            <button style={S.heroBtnPrimary} onClick={() => setIsCreateModalOpen(true)} className="shine-effect">
              <div style={S.heroBtnIconWrap}>
                <Zap size={22} style={{ color: '#ffffff' }} />
              </div>
              <div style={S.heroBtnText}>
                <div style={S.heroBtnTitle}>Build Something New</div>
                <div style={S.heroBtnDesc}>Generate specs or modular interfaces from scratch</div>
              </div>
              <ArrowRight size={18} style={S.heroBtnArrow} />
            </button>

            <button style={S.heroBtnSecondary} onClick={handleEnhance} className="card-hover">
              <div style={S.heroBtnIconWrapSec}>
                <Wand2 size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={S.heroBtnText}>
                <div style={S.heroBtnTitleSec}>Enhance Existing Prompt</div>
                <div style={S.heroBtnDescSec}>Inject advanced layout tokens into instructions</div>
              </div>
              <ArrowRight size={18} style={S.heroBtnArrowSec} />
            </button>
          </div>

          {/* Continue Working Rows */}
          <section style={S.section}>
            <div style={S.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={15} style={{ color: 'var(--accent)' }} />
                <h2 style={S.sectionTitle}>Continue Working</h2>
              </div>
              <span style={S.sectionCount}>{continueWorkingItems.length} active</span>
            </div>

            {continueWorkingItems.length === 0 ? (
              <div style={S.emptyState}>
                <FolderKanban size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No recent activity found. Initialize a workspace to begin.</p>
              </div>
            ) : (
              <div style={S.continueList}>
                {continueWorkingItems.map((item) => {
                  const accentColor = getModeColor(item.mode);
                  return (
                    <div
                      key={item.id}
                      style={S.continueRow}
                      className="card-glass continue-row-item"
                      onClick={() => item.isDraft ? handleResumeDraft(item) : router.push(`/chat?id=${item.id}`)}
                    >
                      <div style={S.continueRowLeft}>
                        <div style={{ ...S.continueRowIcon, color: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}>
                          {getModeIcon(item.mode)}
                        </div>
                        <div style={S.continueRowTitleCol}>
                          <div style={S.continueRowTitle}>{item.title}</div>
                          <div style={S.continueRowMeta}>
                            <Clock size={11} style={{ opacity: 0.6 }} />
                            <span>Edited {timeAgo(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div style={S.continueRowRight}>
                        <span style={{ ...S.continueCardBadge, background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, color: accentColor }}>
                          {item.mode || 'blueprint'}
                        </span>
                        <span style={S.streamBadge(item.isDraft)}>
                          {item.isDraft ? 'Draft' : 'Saved'}
                        </span>

                        {/* Inline sliding delete button */}
                        <button
                          className="delete-row-btn"
                          onClick={(e) => item.isDraft ? handleDiscardDraft(item.id, e) : handleDelete(item.id, e)}
                          title={item.isDraft ? "Discard Draft" : "Delete Blueprint"}
                          aria-label={item.isDraft ? "Discard Draft" : "Delete Blueprint"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Ready Starters (2 columns) */}
          <section style={S.section}>
            <div style={S.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={15} style={{ color: 'var(--accent)' }} />
                <h2 style={S.sectionTitle}>Ready Starters</h2>
              </div>
            </div>

            <div style={S.startersGrid} className="starters-grid">
              {READY_TEMPLATES.map(template => {
                const Icon = template.icon;
                const accentColor = getModeColor(template.mode);
                return (
                  <button
                    key={template.id}
                    style={S.starterCard}
                    onClick={() => handleStarter(template)}
                    className="card-glass starter-item-card"
                  >
                    <div style={{ ...S.starterCardIcon, color: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}>
                      <Icon size={16} />
                    </div>
                    <div style={S.starterTextWrap}>
                      <div style={S.starterTitle}>{template.title}</div>
                      <div style={S.starterDesc}>{template.desc}</div>
                    </div>
                    <div style={S.starterHoverHint} className="starter-hint">
                      Compile <ArrowRight size={11} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* RIGHT PANE: METRICS, LIVE COMPILE CONSOLE, ACTIVITY HEATMAP */}
        <div style={S.rightPane}>
          <div style={S.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={15} style={{ color: 'var(--accent)' }} />
              <h2 style={S.sectionTitle}>Workspace Monitor</h2>
            </div>
          </div>

          <div style={S.statsWrapper}>
            {/* Metric Blocks with Sparklines */}
            <div style={S.metricsRow}>
              {WORKSPACE_STATS.map(stat => (
                <div key={stat.id} style={S.statCard} className="card-glass">
                  <div style={S.statCardHeader}>
                    <span style={S.statLabel}>{stat.label}</span>
                    <div style={{ ...S.statIconWrap, color: stat.color, background: `color-mix(in srgb, ${stat.color} 10%, transparent)` }}>
                      <stat.icon size={13} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={S.statValue}>{stat.value}</div>
                      <div style={S.statChange}>{stat.change}</div>
                    </div>
                    {stat.spark}
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Compiler Console widget */}
            <TerminalConsole />

            {/* Activity Heatmap */}
            <div style={S.heatmapCard} className="card-glass">
              <div style={S.heatmapHeader}>
                <Calendar size={13} style={{ color: 'var(--accent)' }} />
                <span>Compilation Volume (30 Days)</span>
              </div>
              <div style={S.heatmapContent}>
                <div style={S.heatmapHeaderMetric}>
                  <span style={S.heatmapMainValue}>128 intents</span>
                  <span style={S.heatmapSubText}>Compiled this month</span>
                </div>

                {/* Heatmap Grid */}
                <div style={S.heatmapGrid}>
                  {[...Array(30)].map((_, i) => {
                    const intensity = [0, 1, 0, 2, 4, 3, 0, 1, 1, 0, 0, 2, 3, 1, 4, 4, 2, 1, 0, 0, 1, 3, 4, 2, 1, 0, 2, 4, 3, 1][i];
                    const opacities = ['0.05', '0.22', '0.45', '0.75', '1'];
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i));
                    const count = intensity === 0 ? 'No' : (intensity * 3);
                    return (
                      <div
                        key={i}
                        title={`${count} intents compiled on ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                        style={{
                          aspectRatio: '1/1',
                          borderRadius: '3px',
                          background: intensity === 0
                            ? 'color-mix(in srgb, var(--foreground) 6%, transparent)'
                            : `color-mix(in srgb, var(--accent) ${Number(opacities[intensity]) * 100}%, transparent)`,
                          transition: 'transform 0.15s ease'
                        }}
                        className="heatmap-dot"
                      />
                    );
                  })}
                </div>
                <div style={S.heatmapFooter}>
                  <span>30d ago</span>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem' }}>Less</span>
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: 'color-mix(in srgb, var(--foreground) 6%, transparent)' }} />
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: 'color-mix(in srgb, var(--accent) 70%, transparent)' }} />
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.65rem' }}>More</span>
                  </div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <HelpKeyboardOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* ─── ANIMATED STYLING CONSOLE ──────────────────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2.2fr 1.2fr;
          gap: 2rem;
          width: 100%;
        }
        .starters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          width: 100%;
        }
        
        /* Compiler Vector SVG Animations */
        @keyframes dashFlow {
          to {
            stroke-dashoffset: -100;
          }
        }
        @keyframes nodePulsing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
            filter: drop-shadow(0 0 5px var(--accent));
          }
        }
        .flow-path-fast {
          animation: dashFlow 12s linear infinite;
        }
        .flow-path-slow {
          animation: dashFlow 20s linear infinite reverse;
        }
        .illus-node-pulse {
          animation: nodePulsing 2s infinite ease-in-out;
          transform-origin: center;
        }
        .illus-node-pulse-delayed {
          animation: nodePulsing 2.5s infinite ease-in-out 0.6s;
          transform-origin: center;
        }
        
        /* Sparkline and Sparkbar Keyframes */
        @keyframes pathReveal {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        .sparkline-path {
          animation: pathReveal 2s ease-out forwards;
        }
        @keyframes barGrow {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
        .sparkbar-1 { animation: barGrow 0.5s ease-out 0.1s both; }
        .sparkbar-2 { animation: barGrow 0.5s ease-out 0.2s both; }
        .sparkbar-3 { animation: barGrow 0.5s ease-out 0.3s both; }
        .sparkbar-4 { animation: barGrow 0.5s ease-out 0.4s both; }
        .sparkbar-5 { animation: barGrow 0.5s ease-out 0.5s both; }
        .sparkbar-6 { animation: barGrow 0.5s ease-out 0.6s both; }

        /* Typewriter Terminal Blink */
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .terminal-cursor {
          animation: blinkCursor 1s infinite;
        }
        
        /* Inline Sliding Delete Animations */
        .continue-row-item {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .continue-row-item:hover {
          transform: translateX(4px);
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 3%, var(--card)) !important;
        }
        .delete-row-btn {
          opacity: 0;
          width: 0;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          background: color-mix(in srgb, var(--destructive) 8%, transparent);
          color: var(--destructive);
          border: 1px solid color-mix(in srgb, var(--destructive) 15%, transparent);
          border-radius: 6px;
          cursor: pointer;
          flex-shrink: 0;
          overflow: hidden;
          padding: 0;
        }
        .continue-row-item:hover .delete-row-btn {
          opacity: 1;
          width: 26px;
          margin-left: 0.35rem;
        }
        .delete-row-btn:hover {
          background: var(--destructive) !important;
          color: white !important;
        }

        .starter-item-card {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }
        .starter-item-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          box-shadow: var(--shadow-md);
        }
        .starter-hint {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
        }
        .starter-item-card:hover .starter-hint {
          opacity: 1;
          transform: translateX(0);
        }
        
        .heatmap-dot:hover {
          transform: scale(1.3);
          box-shadow: 0 0 8px var(--accent);
          z-index: 5;
        }

        @media (max-width: 1140px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .compiler-illus {
            display: none;
          }
        }
        @media (max-width: 768px) {
          .starters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
}

// ─── PREMIUM STYLE SYSTEM ──────────────────────────────────────
const S = {
  pageContainer: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 2rem 4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    fontFamily: 'var(--font-sans)',
  },

  headerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.5rem',
  },

  headerSplit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    width: '100%',
  },

  compilerIllustration: {
    flexShrink: 0,
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
    background: 'var(--card)',
  },

  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontWeight: '600',
    marginBottom: '0.4rem',
  },

  greetingArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },

  pageTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },

  titleGradient: {
    background: 'linear-gradient(135deg, var(--foreground) 30%, var(--accent) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  pageSubtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
    color: 'var(--muted-foreground)',
    margin: 0,
    fontWeight: '400',
  },

  // Grid Panes
  leftPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    minWidth: 0,
  },

  rightPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    minWidth: 0,
  },

  // Action Grid
  heroCommandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    width: '100%',
  },

  heroBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'linear-gradient(135deg, var(--accent) 0%, #4c2eb5 100%)',
    color: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    boxShadow: '0 8px 24px color-mix(in srgb, var(--accent) 25%, transparent)',
    transition: 'all 0.25s ease',
  },

  heroBtnIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.16)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  heroBtnText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
    paddingRight: '1rem',
  },

  heroBtnTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
  },

  heroBtnDesc: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 1.4,
  },

  heroBtnArrow: {
    color: '#ffffff',
    opacity: 0.8,
    flexShrink: 0,
  },

  heroBtnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'var(--card)',
    color: 'var(--foreground)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.25s ease',
    position: 'relative',
  },

  heroBtnIconWrapSec: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
    border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  heroBtnTitleSec: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--foreground)',
  },

  heroBtnDescSec: {
    fontSize: '0.8rem',
    color: 'var(--muted-foreground)',
    lineHeight: 1.4,
  },

  heroBtnArrowSec: {
    color: 'var(--muted-foreground)',
    opacity: 0.6,
    flexShrink: 0,
  },

  // Sections
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.5rem',
  },

  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    margin: 0,
    color: 'var(--foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  sectionCount: {
    fontSize: '0.78rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
  },

  emptyState: {
    padding: '3rem 2rem',
    textAlign: 'center',
    background: 'var(--card)',
    border: '1px dashed var(--border)',
    borderRadius: '16px',
    color: 'var(--muted-foreground)',
    fontSize: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Continue Work List Rows
  continueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
  },

  continueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    width: '100%',
  },

  continueRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    minWidth: 0,
    flex: 1,
  },

  continueRowIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  continueRowTitleCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    minWidth: 0,
  },

  continueRowTitle: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--foreground)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  continueRowMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.72rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
  },

  continueRowRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
  },

  continueCardBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '2px 8px',
    borderRadius: '4px',
  },

  streamBadge: (isDraft) => ({
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '2px 8px',
    borderRadius: '4px',
    background: isDraft ? 'color-mix(in srgb, var(--warning) 12%, transparent)' : 'color-mix(in srgb, var(--success) 12%, transparent)',
    color: isDraft ? 'var(--warning)' : 'var(--success)',
  }),

  // Starter Cards
  starterCard: {
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },

  starterCardIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  starterTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    flex: 1,
    paddingRight: '1.5rem',
  },

  starterTitle: {
    fontSize: '0.86rem',
    fontWeight: '700',
    color: 'var(--foreground)',
  },

  starterDesc: {
    fontSize: '0.74rem',
    color: 'var(--muted-foreground)',
    lineHeight: 1.3,
  },

  starterHoverHint: {
    position: 'absolute',
    bottom: '0.75rem',
    right: '1rem',
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  },

  // Compiler Console Logger widget
  terminalContainer: {
    borderRadius: '14px',
    overflow: 'hidden',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    padding: '1rem',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },

  terminalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.5rem',
  },

  terminalDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
  },

  terminalTitle: {
    color: 'var(--muted-foreground)',
    fontSize: '0.64rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  terminalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    minHeight: '110px',
  },

  terminalLine: {
    lineHeight: '1.4',
    transition: 'all 0.15s ease',
  },

  terminalCursor: {
    color: 'var(--accent)',
    fontWeight: '800',
  },

  // Stats Column
  statsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
  },

  metricsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
  },

  statCard: {
    padding: '1.25rem',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },

  statCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  statLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    letterSpacing: '0.04em',
  },

  statIconWrap: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: 'var(--foreground)',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },

  statChange: {
    fontSize: '0.65rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    marginTop: '0.15rem',
  },

  // Heatmap widget
  heatmapCard: {
    borderRadius: '14px',
    overflow: 'hidden',
  },

  heatmapHeader: {
    background: 'color-mix(in srgb, var(--foreground) 3%, transparent)',
    borderBottom: '1px solid var(--border)',
    padding: '0.75rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  heatmapContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
  },

  heatmapHeaderMetric: {
    display: 'flex',
    flexDirection: 'column',
  },

  heatmapMainValue: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--foreground)',
  },

  heatmapSubText: {
    fontSize: '0.7rem',
    color: 'var(--muted-foreground)',
  },

  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '5px',
    width: '100%',
  },

  heatmapFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
  },

  // Loading skeletons
  loadingSkel: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
  },

  skelLine: (w, h) => ({
    width: w,
    height: h,
    borderRadius: '8px',
    background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
};
