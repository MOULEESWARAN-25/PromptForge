"use client";

import React, { useEffect, useState, useOptimistic, useTransition } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, Wand2, ArrowRight, Trash2, Clock, ChevronRight,
  Search, Command, Home, FileText, Layers, Palette, Settings,
  TerminalSquare, Box, Code, Play, LayoutTemplate, Zap,
  Cloud, Database, GitBranch, ShieldCheck, Cpu, Activity,
  ShoppingBag, Smartphone, PieChart, Calendar
} from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';
import HelpKeyboardOverlay from '@/components/HelpKeyboardOverlay';
import CreateModal from '@/components/CreateModal';

// ─── Animation ─────────────────────────────────────────────────
const enter = {
  hidden: { opacity: 0, y: 8 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── Time Ago ──────────────────────────────────────────────────
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

// ─── Mock Data for Templates & Stats ───────────────────────────
const READY_TEMPLATES = [
  { id: 'saas', icon: LayoutTemplate, title: 'SaaS Dashboard', desc: 'Pre-configured prompt for admin panels', mode: 'application', prompt: 'Create a comprehensive SaaS admin dashboard with a sidebar navigation, a top header with user profile and search, and a main content area containing data cards, a line chart for revenue, and a recent transactions table. Use a clean, modern aesthetic with a primary blue accent.' },
  { id: 'ai', icon: Sparkles, title: 'AI Chat Interface', desc: 'Ready-to-compile conversational UI', mode: 'application', prompt: 'Build an AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with distinct user and AI message bubbles, and a sticky input area at the bottom with a submit button and attachment icon.' },
  { id: 'portfolio', icon: Box, title: 'Developer Portfolio', desc: 'Personal site with project galleries', mode: 'page', prompt: 'Design a sleek, minimalist developer portfolio. Include a hero section with a brief introduction, a skills grid, a projects gallery with cards, and a contact form. Use a dark theme with neon accents.' },
  { id: 'docs', icon: FileText, title: 'Documentation Hub', desc: 'Markdown-ready docs with sidebar navigation', mode: 'page', prompt: 'Create a documentation hub layout. Include a persistent left sidebar for nested navigation, a top bar with global search, and a main content area with typography optimized for long-form reading and code blocks.' },
  { id: 'ecommerce', icon: ShoppingBag, title: 'E-commerce Storefront', desc: 'Product grid, cart, and filtering', mode: 'application', prompt: 'Develop an e-commerce storefront. The home page should feature a promotional hero banner, a category sidebar with filters, and a responsive product grid. Include a shopping cart slide-out panel.' },
  { id: 'admin', icon: TerminalSquare, title: 'Internal Tool', desc: 'Data management and CRUD UI', mode: 'application', prompt: 'Build an internal CRUD tool for employee management. The interface should have a large data table with sorting and filtering, and a slide-out modal for adding or editing employee records.' },
  { id: 'mobile', icon: Smartphone, title: 'App Landing Page', desc: 'High-converting mobile app showcase', mode: 'page', prompt: 'Design a high-converting landing page for a mobile app. Include a split hero section with a phone mockup on the right and a call-to-action on the left. Follow with a features grid and a pricing section.' },
  { id: 'auth', icon: ShieldCheck, title: 'Authentication Flow', desc: 'Login, register, and reset password', mode: 'component', prompt: 'Create a complete authentication flow component. Include a centered card with tabs for Login and Sign Up. The form should have inputs for email and password, a "Forgot Password" link, and social login buttons.' },
  { id: 'analytics', icon: Activity, title: 'Data Analytics', desc: 'Complex charts and metric cards', mode: 'component', prompt: 'Build a data analytics dashboard component. Include a top row of summary metric cards showing positive/negative trends, followed by a large bar chart and a pie chart for demographic breakdown.' },
];

const WORKSPACE_STATS = [
  { id: 'lines', label: 'Lines Generated', value: '42.8k', icon: Code, color: 'var(--foreground)' },
  { id: 'prompts', label: 'Prompts Compiled', value: '128', icon: Wand2, color: 'var(--accent)' },
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
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Open search/command palette (for now just toast)
        toast('Command palette coming soon');
      }
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
    toast.success('Draft discarded');
    track('draft_discarded', { key });
  };

  const handleEnhance = () => {
    localStorage.setItem('promptforge_wmode', 'enhance');
    localStorage.removeItem('promptforge_quickquery');
    router.push('/forge?mode=enhance');
  };

  const handleStarter = (template) => {
    toast(`Initializing ${template.title}...`);
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
        toast.success('Workspace deleted');
      } catch { toast.error('Failed to delete'); }
    });
  };

  const userName = user?.username || 'Developer';

  if (loading || !user) {
    return (
      <div style={S.pageContainer}>
        <div style={S.loadingSkel}>
          <div style={S.skelLine('200px', '16px')} />
          <div style={S.skelLine('55%', '36px')} />
        </div>
      </div>
    );
  }

  const sortedHistory = [...optimisticHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Merge drafts and history into one "Continue Working" stream
  const continueWorkingItems = [
    ...drafts.map(d => ({ ...d, isDraft: true, timestamp: d.savedAt, id: d.key })),
    ...sortedHistory.map(h => ({ ...h, isDraft: false, title: h.title || 'Untitled Blueprint' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8); // Top 8 items

  return (
    <div style={S.pageContainer}>
      
      {/* ─── MAIN CONTENT AREA ──────────────────────────────────── */}
      <main style={S.mainContent}>
        
        {/* TOP BAR */}
        <header style={S.topBar}>
          <div style={S.breadcrumbs}>
            <span style={{ color: 'var(--muted-foreground)' }}>{userName}&apos;s Workspace</span>
            <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            <span style={{ fontWeight: 500 }}>Home</span>
          </div>
          
          <div style={S.searchBar} onClick={() => toast('Command palette triggered')}>
            <Search size={14} style={{ opacity: 0.5 }} />
            <span style={S.searchPlaceholder}>Search commands, drafts, templates...</span>
            <div style={S.shortcutBadge}>
              <Command size={12} /> K
            </div>
          </div>

          <div style={S.userProfile}>
            <div style={S.avatar}>{userName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div style={S.contentScroll}>
          <div style={S.contentInner}>
            
            <motion.div custom={0} variants={enter} initial="hidden" animate="show">
              <h1 style={S.pageTitle}>Welcome back, {userName}.</h1>
              <p style={S.pageSubtitle}>Ready to compile intent?</p>
            </motion.div>

            {/* HERO COMMAND AREA */}
            <motion.div custom={1} variants={enter} initial="hidden" animate="show" style={S.heroCommandGrid}>
              <button style={S.heroBtnPrimary} onClick={() => setIsCreateModalOpen(true)} className="card-hover">
                <div style={S.heroBtnIconWrap}><Zap size={20} style={{ color: 'var(--background)' }} /></div>
                <div style={S.heroBtnText}>
                  <div style={S.heroBtnTitle}>Build Something New</div>
                  <div style={S.heroBtnDesc}>Generate applications, pages, or components from scratch</div>
                </div>
              </button>

              <button style={S.heroBtnSecondary} onClick={handleEnhance} className="card-hover">
                <div style={{...S.heroBtnIconWrap, background: 'color-mix(in srgb, var(--accent) 15%, transparent)'}}>
                  <Wand2 size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={S.heroBtnText}>
                  <div style={{...S.heroBtnTitle, color: 'var(--foreground)'}}>Enhance Existing Prompt</div>
                  <div style={S.heroBtnDesc}>Optimize your description with intelligent design tokens</div>
                </div>
              </button>
            </motion.div>

            {/* CONTINUE WORKING */}
            <motion.div custom={2} variants={enter} initial="hidden" animate="show" style={S.section}>
              <div style={S.sectionHeader}>
                <h2 style={S.sectionTitle}>Continue Working</h2>
                {continueWorkingItems.length > 0 && <button style={S.viewAllBtn}>View All</button>}
              </div>

              {continueWorkingItems.length === 0 ? (
                <div style={S.emptyState}>No recent activity found. Start building to see your history here.</div>
              ) : (
                <div style={S.continueGrid} className="continue-grid">
                  {continueWorkingItems.map((item) => (
                    <div 
                      key={item.id} 
                      style={S.continueCard} 
                      className="card-hover"
                      onClick={() => item.isDraft ? handleResumeDraft(item) : router.push(`/chat?id=${item.id}`)}
                    >
                      <div style={S.continueCardTop}>
                        <div style={S.continueCardIcon}>
                          {item.isDraft ? <FileText size={16} /> : <Layers size={16} />}
                        </div>
                        <span style={S.continueCardBadge(item.isDraft)}>
                          {item.isDraft ? 'Draft' : 'Blueprint'}
                        </span>
                      </div>
                      <div style={S.continueCardContent}>
                        <div style={S.continueCardTitle}>{item.title}</div>
                        <div style={S.continueCardMeta}>
                          <Clock size={12} />
                          Edited {timeAgo(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* LOWER GRID: TEMPLATES & STATS */}
            <div style={S.lowerGrid} className="lower-grid">
              
              {/* READY TEMPLATES */}
              <motion.div custom={3} variants={enter} initial="hidden" animate="show" style={S.section}>
                <div style={S.sectionHeader}>
                  <h2 style={S.sectionTitle}>Ready Templates</h2>
                </div>
                <div style={S.startersGrid}>
                  {READY_TEMPLATES.map(template => (
                    <button key={template.id} style={S.starterCard} onClick={() => handleStarter(template)} className="card-hover">
                      <template.icon size={20} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
                      <div style={S.starterTitle}>{template.title}</div>
                      <div style={S.starterDesc}>{template.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* WORKSPACE STATS & TOKEN USAGE */}
              <motion.div custom={4} variants={enter} initial="hidden" animate="show" style={S.section}>
                <div style={S.sectionHeader}>
                  <h2 style={S.sectionTitle}>Workspace Stats</h2>
                </div>
                <div style={S.tokensGrid}>
                  {WORKSPACE_STATS.map(stat => (
                    <div key={stat.id} style={S.tokenCard} className="card-hover">
                      <div style={{ ...S.integrationIconWrap, color: stat.color }}>
                        <stat.icon size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                        <div style={S.tokenName}>{stat.label}</div>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>{stat.value}</div>
                    </div>
                  ))}
                  
                  {/* Monthly Activity Heatmap Card */}
                  <div style={S.exampleOutputCard} className="card-hover" onClick={() => toast("Detailed Heatmap")}>
                    <div style={S.exampleOutputHeader}>
                      <Calendar size={14} style={{ color: 'var(--accent)' }} />
                      <span>Activity Heatmap (30 Days)</span>
                    </div>
                    <div style={{ padding: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>128 <span style={{fontSize: '0.8rem', opacity: 0.5}}>intents</span></span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Compiled this month</span>
                        </div>
                      </div>
                      
                      {/* Heatmap Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', width: '100%' }}>
                        {[...Array(30)].map((_, i) => {
                          const intensity = [0, 1, 0, 2, 4, 3, 0, 1, 1, 0, 0, 2, 3, 1, 4, 4, 2, 1, 0, 0, 1, 3, 4, 2, 1, 0, 2, 4, 3, 1][i];
                          const opacities = ['0.05', '0.2', '0.4', '0.7', '1'];
                          const d = new Date();
                          d.setDate(d.getDate() - (29 - i));
                          const count = intensity === 0 ? 'No' : (intensity * 3);
                          return (
                            <div 
                              key={i} 
                              title={`${count} intents on ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                              style={{ 
                                aspectRatio: '1/1', 
                                borderRadius: '3px', 
                                background: intensity === 0 ? 'color-mix(in srgb, var(--foreground) 5%, transparent)' : `color-mix(in srgb, var(--accent) ${Number(opacities[intensity])*100}%, transparent)`,
                                border: 'none'
                              }} 
                            />
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                        <span>30 days ago</span>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </main>

      <HelpKeyboardOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <style dangerouslySetInnerHTML={{ __html: `
        .continue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .lower-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 1024px) {
          .lower-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .continue-grid {
            display: flex;
            overflow-x: auto;
            padding-bottom: 1rem;
            scroll-snap-type: x mandatory;
          }
          .continue-grid > div {
            min-width: 280px;
            scroll-snap-align: start;
          }
        }
      `}} />
    </div>
  );
}


// ─── Style System ──────────────────────────────────────────────
const S = {
  // Application Shell
  pageContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    overflow: 'hidden',
    fontFamily: 'var(--font-sans)',
  },

  // Sidebar
  sidebar: {
    width: '240px',
    height: '100%',
    borderRight: '1px solid var(--border)',
    backgroundColor: 'var(--card)',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    flexShrink: 0,
    zIndex: 10,
  },
  
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 0.5rem',
  },

  logoMark: {
    width: '24px',
    height: '24px',
    backgroundColor: 'var(--accent)',
    color: 'var(--background)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.85rem',
  },

  brandName: {
    fontSize: '1rem',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
  },

  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },

  navLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '0 0.5rem',
    marginBottom: '0.5rem',
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--muted-foreground)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },

  navItemActive: {
    background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
    color: 'var(--foreground)',
    fontWeight: '600',
  },

  // Main Content
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    position: 'relative',
  },

  topBar: {
    height: '56px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    backgroundColor: 'var(--background)',
    zIndex: 5,
  },

  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  },

  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    width: '320px',
    cursor: 'text',
    color: 'var(--muted-foreground)',
    transition: 'border-color 0.2s',
  },

  searchPlaceholder: {
    fontSize: '0.8rem',
    flex: 1,
  },

  shortcutBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    padding: '0.1rem 0.3rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: 'var(--foreground)',
    fontWeight: 500,
  },

  userProfile: {
    display: 'flex',
    alignItems: 'center',
  },

  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
    border: '1px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--accent)',
  },

  contentScroll: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  contentInner: {
    padding: '3rem',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },

  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.02em',
  },

  pageSubtitle: {
    fontSize: '1rem',
    color: 'var(--muted-foreground)',
    marginTop: '0.25rem',
  },

  // Hero Command Area
  heroCommandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },

  heroBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'var(--accent)',
    color: 'var(--background)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 30%, transparent)',
  },

  heroBtnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'var(--card)',
    color: 'var(--foreground)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
  },

  heroBtnIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'color-mix(in srgb, var(--background) 20%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  heroBtnText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },

  heroBtnTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--background)',
  },

  heroBtnDesc: {
    fontSize: '0.85rem',
    opacity: 0.85,
    lineHeight: 1.4,
  },

  // Sections Common
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.75rem',
  },

  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: 0,
    color: 'var(--foreground)',
  },

  viewAllBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
  },

  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    background: 'color-mix(in srgb, var(--card) 50%, transparent)',
    border: '1px dashed var(--border)',
    borderRadius: '12px',
    color: 'var(--muted-foreground)',
    fontSize: '0.9rem',
  },

  // Continue Working
  continueCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    padding: '1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  continueCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueCardIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueCardBadge: (isDraft) => ({
    fontSize: '0.65rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '2px 6px',
    borderRadius: '4px',
    background: isDraft ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'color-mix(in srgb, var(--success) 15%, transparent)',
    color: isDraft ? 'var(--accent)' : 'var(--success)',
  }),

  continueCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },

  continueCardTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--foreground)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  continueCardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  },

  // Starters Grid
  startersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },

  starterCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    padding: '1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  starterTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--foreground)',
    marginBottom: '0.25rem',
  },

  starterDesc: {
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    lineHeight: 1.4,
  },

  // Tokens
  tokensGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },

  tokenCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
  },

  integrationIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
  },

  tokenName: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--foreground)',
  },

  // Example Output
  exampleOutputCard: {
    marginTop: '0.5rem',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--card) 40%, transparent), var(--card))',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
  },

  exampleOutputHeader: {
    background: 'color-mix(in srgb, var(--foreground) 3%, transparent)',
    borderBottom: '1px solid var(--border)',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  exampleOutputContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  mockGraph: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '40px',
    width: '100%',
    justifyContent: 'center',
  },

  mockBar: {
    width: '12px',
    background: 'var(--accent)',
    borderRadius: '2px 2px 0 0',
    opacity: 0.8,
  },

  // Skel Loading
  loadingSkel: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  skelLine: (w, h) => ({
    width: w,
    height: h,
    borderRadius: '8px',
    background: 'var(--card)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
};
