"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, History, Trash2, Plus, Monitor, 
  Layout, Code2, Wand2, Compass, Trash 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, history, deletePromptRecord, clearHistory, loading } = useApp();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(null);

  // 1. Session check: Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleCopyQuick = (id, e, promptText) => {
    e.stopPropagation(); // Stop parent redirect click
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDeleteLog = (id, e) => {
    e.stopPropagation(); // Stop parent redirect click
    if (confirm("Are you sure you want to delete this prompt log?")) {
      deletePromptRecord(id);
    }
  };

  if (loading || !user) {
    return (
      <div style={loadingContainer}>
        <div style={spinnerStyle} />
        <span>Authenticating Secure Workspace Session...</span>
      </div>
    );
  }

  return (
    <div style={dashboardGrid}>
      {/* 1. LEFT SIDEBAR PANEL (History Logs) */}
      <div style={historyPanel} className="glass-panel">
        <div style={historyHeader}>
          <div style={historyTitleContainer}>
            <History size={16} style={{ color: 'hsl(var(--primary))' }} />
            <h2 style={historyTitle}>Prompt Log History</h2>
          </div>
          {history.length > 0 && (
            <button style={clearAllBtn} onClick={clearHistory} title="Clear All History">
              <Trash size={14} />
            </button>
          )}
        </div>

        <div style={historyList}>
          {history.length === 0 ? (
            <div style={emptyHistory}>
              <History size={32} style={{ color: 'rgba(255, 255, 255, 0.05)', marginBottom: '0.5rem' }} />
              <p style={emptyHistoryText}>Your forged prompt logs will appear here. No sessions logged yet.</p>
              <Link href="/forge" style={startLinkBtn} className="btn-secondary">
                Forge a Prompt!
              </Link>
            </div>
          ) : (
            history.map((log) => {
              const isCopied = copiedId === log.id;
              
              // Map modes to specific icons
              let modeIcon = <Sparkles size={14} />;
              if (log.mode === 'application') modeIcon = <Monitor size={14} style={{ color: 'hsl(var(--primary))' }} />;
              else if (log.mode === 'page') modeIcon = <Layout size={14} style={{ color: 'hsl(var(--secondary))' }} />;
              else if (log.mode === 'component') modeIcon = <Code2 size={14} style={{ color: 'hsl(var(--accent))' }} />;
              else if (log.mode === 'enhance') modeIcon = <Wand2 size={14} style={{ color: '#10b981' }} />;

              return (
                <div
                  key={log.id}
                  style={historyCard}
                  className="glass-panel-hover"
                  onClick={() => router.push(`/chat?id=${log.id}`)}
                >
                  <div style={logTopRow}>
                    <div style={logBadge}>
                      {modeIcon}
                      <span style={logModeName}>{log.mode}</span>
                    </div>
                    <span style={logTime}>
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 style={logTitleText}>{log.title}</h3>
                  
                  {/* Card Controls */}
                  <div style={logControlsRow}>
                    <button
                      style={{
                        ...logCardBtn,
                        color: isCopied ? '#10b981' : 'var(--fg-muted)'
                      }}
                      onClick={(e) => handleCopyQuick(log.id, e, log.resolvedPrompt)}
                    >
                      {isCopied ? "Copied!" : "Quick Copy"}
                    </button>
                    <button
                      style={{ ...logCardBtn, color: '#ef4444' }}
                      onClick={(e) => handleDeleteLog(log.id, e)}
                      title="Delete log"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CENTER PANEL (Main Launcher) */}
      <div style={mainPanel}>
        {/* Core Jumbotron Banner */}
        <div style={jumbotronCard} className="glass-panel shine-effect">
          <div style={jumbotronContent}>
            <div style={jumbotronBadge}>
              <Sparkles size={14} />
              <span>Technical Design Translator</span>
            </div>
            <h1 style={jumbotronTitle}>Forge Technical Prompts for Lovable & Cursor</h1>
            <p style={jumbotronDesc}>
              Vague prompts produce generic, default UIs. Enhance your ideas with the exact layout grids, component classes, animation libraries, and visual design tokens that modern AI frontend tools understand best.
            </p>
            
            <Link href="/forge" style={coreLaunchBtn} className="btn-primary shine-effect">
              <Plus size={18} />
              Start Prompt Forge Wizard
            </Link>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div style={bentoTitleRow}>
          <Compass size={18} style={{ color: 'hsl(var(--secondary))' }} />
          <h2 style={bentoHeaderTitle}>Available Architectural Workflows</h2>
        </div>

        <div style={workflowsBento}>
          {/* 1. App Architect */}
          <Link href="/forge" onClick={() => localStorage.setItem('promptforge_wmode', 'application')} style={bentoItem} className="glass-panel glass-panel-hover">
            <div style={{ ...bentoIconWrap, backgroundColor: 'rgba(168, 85, 247, 0.08)' }}>
              <Monitor size={18} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <h3 style={bentoItemTitle}>Full Application Architect</h3>
            <p style={bentoItemDesc}>
              Lovable & Copilot style prompt blueprints. Maps complete app frames, responsive sidebars, mock data routing, and dynamic settings.
            </p>
          </Link>

          {/* 2. Page Architect */}
          <Link href="/forge" onClick={() => localStorage.setItem('promptforge_wmode', 'page')} style={bentoItem} className="glass-panel glass-panel-hover">
            <div style={{ ...bentoIconWrap, backgroundColor: 'rgba(6, 182, 212, 0.08)' }}>
              <Layout size={18} style={{ color: 'hsl(var(--secondary))' }} />
            </div>
            <h3 style={bentoItemTitle}>v0-Style Page layouts</h3>
            <p style={bentoItemDesc}>
              Structured page frames. Multi-select required components (steppers, grids, palletes) and specify target theme properties.
            </p>
          </Link>

          {/* 3. Component Architect */}
          <Link href="/component-forge" style={bentoItem} className="glass-panel glass-panel-hover">
            <div style={{ ...bentoIconWrap, backgroundColor: 'rgba(236, 72, 153, 0.08)' }}>
              <Code2 size={18} style={{ color: 'hsl(var(--accent))' }} />
            </div>
            <h3 style={bentoItemTitle}>Modular Component Catalog</h3>
            <p style={bentoItemDesc}>
              Twin-panel ChatGPT catalog search. Select shadcn/ui styles and refine components in real-time conversations.
            </p>
          </Link>

          {/* 4. Prompt Enhancer */}
          <Link href="/forge" onClick={() => localStorage.setItem('promptforge_wmode', 'enhance')} style={bentoItem} className="glass-panel glass-panel-hover">
            <div style={{ ...bentoIconWrap, backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
              <Wand2 size={18} style={{ color: '#10b981' }} />
            </div>
            <h3 style={bentoItemTitle}>Raw Prompt Enhancer</h3>
            <p style={bentoItemDesc}>
              Translates short sentences like "make a nice form" into detailed technical guidelines including focus states and error bounds.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline styles for Workspace Dashboard
const loadingContainer = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
  minHeight: '400px',
};

const spinnerStyle = {
  width: '32px',
  height: '32px',
  border: '3px solid rgba(255, 255, 255, 0.05)',
  borderTopColor: 'hsl(var(--primary))',
  borderRadius: '50%',
  animation: 'pulse-glow 1s infinite linear',
};

const dashboardGrid = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
  width: '100%',
};

const historyPanel = {
  width: '320px',
  backgroundColor: 'rgba(5, 5, 8, 0.45)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  maxHeight: 'calc(100vh - 160px)',
  minHeight: '450px',
};

const historyHeader = {
  padding: '1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const historyTitleContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const historyTitle = {
  fontSize: '1rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const clearAllBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const historyList = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const emptyHistory = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  padding: '2rem 1rem',
};

const emptyHistoryText = {
  fontSize: '0.8rem',
  color: 'var(--fg-muted)',
  lineHeight: '1.4',
  marginBottom: '1rem',
};

const startLinkBtn = {
  fontSize: '0.8rem',
  padding: '0.5rem 1rem',
  width: '100%',
};

const historyCard = {
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '10px',
  padding: '1rem',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  transition: 'all 0.2s',
};

const logTopRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.7rem',
  color: 'var(--fg-muted)',
  textTransform: 'uppercase',
  fontWeight: '600',
};

const logModeName = {
  letterSpacing: '0.5px',
};

const logTime = {
  fontSize: '0.7rem',
  color: 'var(--fg-muted)',
};

const logTitleText = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#ffffff',
  fontFamily: 'Outfit, sans-serif',
  lineHeight: '1.3',
};

const logControlsRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
  paddingTop: '0.5rem',
  marginTop: '0.25rem',
};

const logCardBtn = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  padding: '2px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
};

const mainPanel = {
  flex: 1,
  minWidth: '320px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};

const jumbotronCard = {
  backgroundColor: 'rgba(6, 6, 9, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '20px',
  padding: '3rem 2.5rem',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
};

const jumbotronContent = {
  maxWidth: '650px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '1.25rem',
  zIndex: 2,
  position: 'relative',
};

const jumbotronBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'hsl(var(--secondary))',
  backgroundColor: 'rgba(6, 182, 212, 0.08)',
  border: '1px solid rgba(6, 182, 212, 0.2)',
  padding: '4px 12px',
  borderRadius: '99px',
  fontFamily: 'Outfit, sans-serif',
};

const jumbotronTitle = {
  fontSize: '2rem',
  fontWeight: '800',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
  lineHeight: '1.2',
  letterSpacing: '-0.5px',
};

const jumbotronDesc = {
  fontSize: '0.95rem',
  color: 'var(--fg-muted)',
  lineHeight: '1.55',
};

const coreLaunchBtn = {
  fontSize: '0.95rem',
  fontWeight: '600',
  padding: '0.85rem 2rem',
};

const bentoTitleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: '0.75rem',
};

const bentoHeaderTitle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const workflowsBento = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.25rem',
};

const bentoItem = {
  backgroundColor: 'rgba(5, 5, 8, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '14px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'left',
};

const bentoIconWrap = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const bentoItemTitle = {
  fontSize: '1rem',
  fontWeight: '600',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const bentoItemDesc = {
  fontSize: '0.8rem',
  color: 'var(--fg-muted)',
  lineHeight: '1.45',
};
