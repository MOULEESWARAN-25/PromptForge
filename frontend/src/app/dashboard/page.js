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
import { cn } from '@/lib/cn';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import { CONTENT } from '@/config/contentRegistry';

// ─── Inline Animation SVG Compiler Illustration ──────────────────
const CompilerIllustration = () => (
  <svg width="220" height="110" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="compiler-illus shrink-0 rounded-[12px] shadow-(--shadow-sm) border border-border bg-card">
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
    <rect x="0" y="0" width="220" height="110" rx="12" fill="var(--input)" opacity="0.3" />
    <path d="M 22 0 L 22 110 M 44 0 L 44 110 M 66 0 L 66 110 M 88 0 L 88 110 M 110 0 L 110 110 M 132 0 L 132 110 M 154 0 L 154 110 M 176 0 L 176 110 M 198 0 L 198 110" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
    <path d="M 0 22 L 220 22 M 0 44 L 220 44 M 0 66 L 220 66 M 0 88 L 220 88" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
    <path d="M 25 55 Q 80 10 135 55 T 195 55" fill="none" stroke="url(#glowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" className="flow-path-fast" />
    <path d="M 25 55 Q 80 100 135 55 T 195 55" fill="none" stroke="url(#compGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" className="flow-path-slow" />
    <circle cx="25" cy="55" r="4.5" fill="var(--accent)" className="illus-node-pulse" />
    <circle cx="80" cy="32" r="5" fill="var(--workflow-application)" className="illus-node-pulse-delayed" />
    <circle cx="135" cy="55" r="5" fill="var(--workflow-page)" className="illus-node-pulse" />
    <circle cx="165" cy="78" r="5" fill="var(--workflow-enhance)" className="illus-node-pulse-delayed" />
    <circle cx="195" cy="55" r="5.5" fill="var(--success)" className="illus-node-pulse" />
  </svg>
);

const TERMINAL_LINES = [
  '✓ Analyzing user requirements...',
  '✓ Retrieving layout and style guidelines...',
  '✓ Applying dynamic configuration tokens...',
  '✓ Aligning components hierarchy...',
  '✓ Compiling blueprint specifications...',
  '✓ Workspace status: Ready for enhancement'
];

// ─── Terminal Console Logger ──────────────────────────────────────
const TerminalConsole = () => {
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLineIdx(p => (p + 1) % (TERMINAL_LINES.length + 1));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card-glass noise-overlay rounded-[14px] overflow-hidden font-(--font-mono) text-[0.72rem] p-4 bg-card border border-border flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex gap-1">
          <div className="w-[7px] h-[7px] rounded-full bg-[#ef4444]" />
          <div className="w-[7px] h-[7px] rounded-full bg-[#f59e0b]" />
          <div className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
        </div>
        <span className="text-muted-foreground text-[0.64rem] font-bold uppercase tracking-[0.04em]">
          Compiler Console v3.0
        </span>
      </div>
      {/* Body */}
      <div className="flex flex-col gap-[0.4rem] min-h-[110px]">
        {TERMINAL_LINES.slice(0, lineIdx === 0 ? 1 : lineIdx).map((l, i) => (
          <div
            key={i}
            className="leading-[1.4] transition-all duration-150"
            style={{
              color: i === TERMINAL_LINES.length - 1 ? 'var(--success)' : 'var(--foreground)',
              opacity: i === (lineIdx - 1) ? 1 : 0.65,
              fontWeight: i === (lineIdx - 1) ? 600 : 400
            }}
          >
            {l}
          </div>
        ))}
        {lineIdx < TERMINAL_LINES.length && (
          <span className="terminal-cursor text-accent font-extrabold">_</span>
        )}
      </div>
    </div>
  );
};

// ─── SVG Sparklines ───────────────────────────────────────────────
const LinesSparkline = () => (
  <svg width="65" height="26" viewBox="0 0 65 26" style={{ marginLeft: 'auto' }}>
    <path d="M0,22 Q10,4 22,16 T44,6 T65,2" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" className="sparkline-path" />
    <circle cx="65" cy="2" r="2.5" fill="var(--accent)" className="sparkline-dot" />
  </svg>
);

const PromptsBarGraph = () => (
  <svg width="60" height="24" viewBox="0 0 60 24" style={{ marginLeft: 'auto', display: 'flex', gap: '3px' }}>
    <rect x="2"  y="14" width="6" height="10" rx="1.5" fill="var(--success)" opacity="0.3" className="sparkbar-1" />
    <rect x="12" y="10" width="6" height="14" rx="1.5" fill="var(--success)" opacity="0.5" className="sparkbar-2" />
    <rect x="22" y="16" width="6" height="8"  rx="1.5" fill="var(--success)" opacity="0.4" className="sparkbar-3" />
    <rect x="32" y="6"  width="6" height="18" rx="1.5" fill="var(--success)" opacity="0.7" className="sparkbar-4" />
    <rect x="42" y="12" width="6" height="12" rx="1.5" fill="var(--success)" opacity="0.6" className="sparkbar-5" />
    <rect x="52" y="2"  width="6" height="22" rx="1.5" fill="var(--success)"               className="sparkbar-6" />
  </svg>
);

// ─── Continue Working Row Component ───────────────────────────────
const ContinueWorkingRow = ({
  item,
  handleResumeDraft,
  handleDiscardDraft,
  handleDelete,
  getModeColor,
  getModeIcon,
  router
}) => {
  const relativeTime = useRelativeTime(item.timestamp);
  const accentColor = getModeColor(item.mode);

  return (
    <div
      className="card-glass continue-row-item flex items-center justify-between px-4 py-3 rounded-[12px] w-full cursor-pointer"
      onClick={() => item.isDraft ? handleResumeDraft(item) : router.push(`/chat?id=${item.id}`)}
    >
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ color: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
        >
          {getModeIcon(item.mode)}
        </div>
        <div className="flex flex-col gap-[0.15rem] min-w-0">
          <div className="text-[0.92rem] font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {item.title}
          </div>
          <div className="flex items-center gap-[0.3rem] text-[0.72rem] text-muted-foreground font-medium">
            <Clock size={11} strokeWidth={1.75} className="opacity-60" />
            <span>Edited {relativeTime}</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-[0.35rem] shrink-0">
        <span
          className="text-[0.65rem] font-bold uppercase tracking-[0.04em] px-2 py-[2px] rounded-[4px]"
          style={{ background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, color: accentColor }}
        >
          {item.mode || 'blueprint'}
        </span>
        <span
          className="text-[0.65rem] font-bold uppercase tracking-[0.04em] px-2 py-[2px] rounded-[4px]"
          style={{
            background: item.isDraft ? 'color-mix(in srgb, var(--warning) 12%, transparent)' : 'color-mix(in srgb, var(--success) 12%, transparent)',
            color: item.isDraft ? 'var(--warning)' : 'var(--success)',
          }}
        >
          {item.isDraft ? 'Draft' : 'Saved'}
        </span>
        <button
          className="delete-row-btn"
          onClick={(e) => item.isDraft ? handleDiscardDraft(item.id, e) : handleDelete(item.id, e)}
          title={item.isDraft ? "Discard Draft" : "Delete Blueprint"}
          aria-label={item.isDraft ? "Discard Draft" : "Delete Blueprint"}
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
export default function DashboardPage() {
  const {
    user,
    history,
    deletePromptRecord,
    loading,
    recordActivity,
    drafts,
    discardDraft,
    starterTemplates,
    workspaceMetrics
  } = useApp();
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // ── Dynamic statistics derived from context ────────────────────
  const workspaceStats = [
    {
      id: 'lines',
      label: CONTENT.dashboard.totalLines,
      value: workspaceMetrics.formattedLines,
      icon: Code,
      color: 'var(--accent)',
      change: workspaceMetrics.linesChangeText,
      spark: <LinesSparkline />
    },
    {
      id: 'prompts',
      label: CONTENT.dashboard.promptsCompiled,
      value: workspaceMetrics.promptsCount.toString(),
      icon: Wand2,
      color: 'var(--success)',
      change: workspaceMetrics.promptsChangeTodayText,
      spark: <PromptsBarGraph />
    },
  ];

  // ── Auth redirect ─────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  // ── Analytics & activity ──────────────────────────────────────
  useEffect(() => {
    if (user) {
      track(EVENTS.DASHBOARD_VIEWED);
      recordActivity();
    }
  }, [user, recordActivity]);

  // ── Help overlay shortcut ─────────────────────────────────────
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

  // ── ?action=create query param ────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────
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
    discardDraft(key);
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
  };

  // ── Optimistic history ────────────────────────────────────────
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
      } catch {
        toast.error('Failed to delete blueprint');
      }
    });
  };

  const userName = user?.username || 'Developer';

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="page-container py-16 flex flex-col gap-6">
        <div className="h-5 w-44 rounded-md bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] animate-pulse" />
        <div className="h-10 w-[40%] rounded-md bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1.2fr] gap-8 w-full">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-48" />
        </div>
      </div>
    );
  }

  const sortedHistory = [...optimisticHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const continueWorkingItems = [
    ...drafts.map(d => ({ ...d, isDraft: true, timestamp: d.savedAt, id: d.key })),
    ...sortedHistory.map(h => ({ ...h, isDraft: false, title: h.title || 'Untitled Blueprint' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'application': return <TerminalSquare size={16} strokeWidth={1.75} />;
      case 'page':        return <LayoutTemplate size={16} strokeWidth={1.75} />;
      case 'component':   return <Box size={16} strokeWidth={1.75} />;
      case 'enhance':     return <Wand2 size={16} strokeWidth={1.75} />;
      default:            return <FolderKanban size={16} strokeWidth={1.75} />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'application': return 'var(--workflow-application)';
      case 'page':        return 'var(--workflow-page)';
      case 'component':   return 'var(--workflow-component)';
      case 'enhance':     return 'var(--workflow-enhance)';
      default:            return 'var(--accent)';
    }
  };

  return (
    <div className="page-container pb-16 flex flex-col gap-10">

      {/* ─── PAGE HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between gap-8 w-full">
          {/* Greeting */}
          <div className="flex flex-col gap-1 flex-1">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground uppercase tracking-[0.04em] font-semibold mb-1">
              <span>{userName}&apos;s Workspace</span>
              <ChevronRight size={12} strokeWidth={1.75} className="opacity-40" />
              <span className="text-accent font-semibold">Home</span>
            </div>

            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0 tracking-[-0.03em] leading-[1.15]">
              Welcome back, <span style={{ background: 'linear-gradient(135deg, var(--foreground) 30%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{userName}</span>.
            </h1>
            <p className="text-[clamp(0.9rem,2vw,1.05rem)] text-muted-foreground m-0 font-normal">
              {CONTENT.dashboard.subtitle}
            </p>
          </div>

          {/* Compiler SVG — hidden on narrow viewports via CSS */}
          <CompilerIllustration />
        </div>
      </div>

      {/* ─── BENTO GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1.2fr] gap-8 w-full">

        {/* LEFT PANE */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* Action Hubs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            {/* Primary CTA */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={cn(
                "flex items-center gap-5 text-left relative overflow-hidden",
                "p-6 rounded-[16px] border-none cursor-pointer",
                "bg-linear-to-br from-accent to-[#4c2eb5] text-white",
                "shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_25%,transparent)]",
                "transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:-translate-y-1 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_35%,transparent)]",
                "focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2",
                "shine-effect",
              )}
            >
              <div className="w-11 h-11 rounded-[10px] bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Zap size={22} strokeWidth={1.75} className="text-white" />
              </div>
              <div className="flex flex-col gap-1 flex-1 pr-4">
                <div className="text-[1.05rem] font-bold text-white">Build Something New</div>
                <div className="text-[0.8rem] text-white/80 leading-[1.4]">Generate specs or modular interfaces from scratch</div>
              </div>
              <ArrowRight size={18} strokeWidth={1.75} className="text-white/80 shrink-0" />
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleEnhance}
              className={cn(
                "flex items-center gap-5 text-left relative overflow-hidden",
                "p-6 rounded-[16px] cursor-pointer",
                "bg-card text-foreground",
                "border border-border",
                "transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:-translate-y-1 hover:border-accent hover:shadow-(--shadow-md)",
                "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                "card-hover",
              )}
            >
              <div className="w-11 h-11 rounded-[10px] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] flex items-center justify-center shrink-0">
                <Wand2 size={20} strokeWidth={1.75} className="text-accent" />
              </div>
              <div className="flex flex-col gap-1 flex-1 pr-4">
                <div className="text-[1.05rem] font-bold text-foreground">Enhance Existing Prompt</div>
                <div className="text-[0.8rem] text-muted-foreground leading-[1.4]">Inject advanced layout tokens into instructions</div>
              </div>
              <ArrowRight size={18} strokeWidth={1.75} className="text-muted-foreground opacity-60 shrink-0" />
            </button>
          </div>

          {/* Continue Working */}
          <section className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Activity size={15} strokeWidth={1.75} className="text-accent" />
                <h2 className="text-[0.95rem] font-bold m-0 text-foreground uppercase tracking-wider font-display">Continue Working</h2>
              </div>
              <span className="text-[0.78rem] text-muted-foreground font-medium">{continueWorkingItems.length} active</span>
            </div>

            {continueWorkingItems.length === 0 ? (
              <EmptyState
                icon={<FolderKanban size={28} strokeWidth={1.75} />}
                title="No recent activity"
                description="Initialize a workspace to begin compiling."
              />
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {continueWorkingItems.map((item) => (
                  <ContinueWorkingRow
                    key={item.id}
                    item={item}
                    handleResumeDraft={handleResumeDraft}
                    handleDiscardDraft={handleDiscardDraft}
                    handleDelete={handleDelete}
                    getModeColor={getModeColor}
                    getModeIcon={getModeIcon}
                    router={router}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Ready Starters */}
          <section className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={15} strokeWidth={1.75} className="text-accent" />
                <h2 className="text-[0.95rem] font-bold m-0 text-foreground uppercase tracking-wider font-display">Ready Starters</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {starterTemplates.map(template => {
                const Icon = template.icon || Sparkles;
                const accentColor = getModeColor(template.mode);
                return (
                  <button
                    key={template.id}
                    onClick={() => handleStarter(template)}
                    className="card-glass starter-item-card flex items-start gap-4 p-4 rounded-[14px] relative overflow-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ color: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-col gap-[0.15rem] flex-1 pr-6">
                      <div className="text-[0.86rem] font-bold text-foreground">{template.title}</div>
                      <div className="text-[0.74rem] text-muted-foreground leading-[1.3]">{template.desc || template.description}</div>
                    </div>
                    <div className="starter-hint absolute bottom-3 right-4 text-[0.65rem] font-bold uppercase text-accent flex items-center gap-[0.2rem]">
                      Compile <ArrowRight size={11} strokeWidth={1.75} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT PANE */}
        <div className="flex flex-col gap-6 min-w-0">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Cpu size={15} strokeWidth={1.75} className="text-accent" />
              <h2 className="text-[0.95rem] font-bold m-0 text-foreground uppercase tracking-wider font-display">Workspace Monitor</h2>
            </div>
          </div>

          <div className="flex flex-col gap-5 w-full">
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {workspaceStats.map(stat => (
                <div key={stat.id} className="card-glass p-5 rounded-[14px] flex flex-col gap-1">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-[0.04em] font-display">
                      {stat.label}
                    </span>
                    <div
                      className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center"
                      style={{ color: stat.color, background: `color-mix(in srgb, ${stat.color} 10%, transparent)` }}
                    >
                      <stat.icon size={13} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="flex items-end mt-2">
                    <div className="flex flex-col">
                      <div className="text-[1.45rem] font-extrabold text-foreground tracking-[-0.02em] leading-[1.1]">
                        {stat.value}
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground font-medium mt-[0.15rem]">
                        {stat.change}
                      </div>
                    </div>
                    {stat.spark}
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal Console */}
            <TerminalConsole />

            {/* Activity Heatmap */}
            <div className="card-glass rounded-[14px] overflow-hidden">
              <div className="bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] border-b border-border px-5 py-3 flex items-center gap-2 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wider font-display">
                <Calendar size={13} strokeWidth={1.75} className="text-accent" />
                <span>Compilation Volume (30 Days)</span>
              </div>
              <div className="p-5 flex flex-col gap-5 w-full">
                <div className="flex flex-col">
                  <span className="text-[1.2rem] font-extrabold text-foreground">{workspaceMetrics.totalIntentsThisMonth} intents</span>
                  <span className="text-[0.7rem] text-muted-foreground">Compiled past 30 days</span>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-10 gap-[5px] w-full">
                  {workspaceMetrics.heatmapData.map((dayData, i) => {
                    const opacities = ['0.05', '0.22', '0.45', '0.75', '1'];
                    const countText = dayData.count === 0 ? 'No' : dayData.count;
                    return (
                      <div
                        key={i}
                        title={`${countText} intents compiled on ${dayData.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                        className="heatmap-dot aspect-square rounded-[3px] transition-transform duration-150"
                        style={{
                          background: dayData.intensity === 0
                            ? 'color-mix(in srgb, var(--foreground) 6%, transparent)'
                            : `color-mix(in srgb, var(--accent) ${Number(opacities[dayData.intensity]) * 100}%, transparent)`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Heatmap Footer */}
                <div className="flex justify-between text-[0.65rem] text-muted-foreground font-medium">
                  <span>30d ago</span>
                  <div className="flex gap-[3px] items-center">
                    <span className="text-[0.65rem]">Less</span>
                    <div className="w-[6px] h-[6px] rounded-[1px] bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]" />
                    <div className="w-[6px] h-[6px] rounded-[1px] bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]" />
                    <div className="w-[6px] h-[6px] rounded-[1px] bg-[color-mix(in_srgb,var(--accent)_70%,transparent)]" />
                    <div className="w-[6px] h-[6px] rounded-[1px] bg-accent" />
                    <span className="text-[0.65rem]">More</span>
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
    </div>
  );
}
