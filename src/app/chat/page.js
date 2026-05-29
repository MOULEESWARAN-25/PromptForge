"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import {
  Send, Copy, Check, ArrowLeft, RefreshCw, Sparkles,
  Download, Share2, RotateCcw, ChevronDown, ChevronUp,
  Loader2, AlertCircle, CheckCircle2, Cloud, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { track, EVENTS } from '@/lib/analytics';
import FeedbackWidget from '@/components/FeedbackWidget';
import ShadcnDropdown from '@/components/ShadcnDropdown';

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) return <h3 key={idx} style={mdH3}>{parseInlineMarkdown(line.slice(4))}</h3>;
    if (line.startsWith('## ')) return <h2 key={idx} style={mdH2}>{parseInlineMarkdown(line.slice(3))}</h2>;
    if (line.startsWith('# ')) return <h1 key={idx} style={mdH1}>{parseInlineMarkdown(line.slice(2))}</h1>;
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={idx} style={mdLi}>
          <span style={{ color: 'var(--accent)' }}>•</span>
          <span>{parseInlineMarkdown(line.trim().slice(2))}</span>
        </div>
      );
    }
    if (line.trim() === '---' || line.trim() === '***') return <hr key={idx} style={mdHr} />;
    if (line.trim() === '') return <div key={idx} style={{ height: '0.4rem' }} />;
    return <p key={idx} style={mdP}>{parseInlineMarkdown(line)}</p>;
  });
}

function parseInlineMarkdown(text) {
  const parts = [];
  let currentIdx = 0;
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIdx = match.index;
    if (matchIdx > currentIdx) parts.push(text.slice(currentIdx, matchIdx));
    if (matchStr.startsWith('**')) {
      parts.push(<strong key={matchIdx} style={{ fontWeight: '700', color: '#ffffff' }}>{matchStr.slice(2, -2)}</strong>);
    } else if (matchStr.startsWith('`')) {
      parts.push(<code key={matchIdx} style={mdCode}>{matchStr.slice(1, -1)}</code>);
    }
    currentIdx = regex.lastIndex;
  }
  if (currentIdx < text.length) parts.push(text.slice(currentIdx));
  return parts.length > 0 ? parts : text;
}

// ─── Save Status Indicator ────────────────────────────────────
function SaveStatusBadge({ status }) {
  if (status === 'idle') return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`save-status-${status}`}
      >
        {status === 'saving' && <><Loader2 size={11} className="animate-spin" /> Saving…</>}
        {status === 'saved' && <><CheckCircle2 size={11} /> Saved</>}
        {status === 'error' && <><AlertCircle size={11} /> Save failed</>}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── AI Transparency Panel ────────────────────────────────────
function AITransparencyPanel({ ragDetails, theme, mode }) {
  const [open, setOpen] = useState(false);
  if (!ragDetails) return null;
  return (
    <div style={ragPanel}>
      <button style={ragToggleBtn} onClick={() => setOpen(!open)} aria-expanded={open}>
        <Sparkles size={12} style={{ color: 'var(--accent)' }} />
        <span>AI Generation Details</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={ragContent}>
              <div style={ragRow}>
                <span style={ragLabel}>Theme Applied</span>
                <span style={ragValue}>{theme}</span>
              </div>
              <div style={ragRow}>
                <span style={ragLabel}>Generation Mode</span>
                <span style={ragValue}>{mode}</span>
              </div>
              {ragDetails.tokensUsed && (
                <div style={ragRow}>
                  <span style={ragLabel}>Tokens Used</span>
                  <span style={ragValue}>{ragDetails.tokensUsed}</span>
                </div>
              )}
              {ragDetails.designTokens && (
                <div style={ragRow}>
                  <span style={ragLabel}>Design Tokens</span>
                  <span style={ragValue}>{ragDetails.designTokens} patterns retrieved</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Smart Suggestions Helper ─────────────────────────────────
function getSmartSuggestions(record) {
  if (!record) return [];
  const text = `${record.title} ${record.query}`.toLowerCase();
  
  if (text.includes('commerce') || text.includes('store') || text.includes('shop') || text.includes('checkout') || text.includes('cart') || text.includes('stripe')) {
    return [
      { label: 'Generate Stripe Integration Plan', prompt: 'Extend this blueprint by adding a comprehensive Stripe Checkout & Webhook Integration Plan with payment flow details.' },
      { label: 'Generate Checkout Flow Design', prompt: 'Extend this blueprint with a detailed UX and component layout specification for a secure, 3-step checkout flow.' },
      { label: 'Generate Product Catalog Schema', prompt: 'Extend this blueprint with a PostgreSQL database schema definition for products, categories, inventory, and price models.' },
      { label: 'Generate Admin Sales Dashboard', prompt: 'Extend this blueprint with a visual dashboard layout for managing order fulfillment and inventory tracking.' }
    ];
  }
  
  if (text.includes('dash') || text.includes('board') || text.includes('panel') || text.includes('analytic') || text.includes('metric') || text.includes('kpi') || text.includes('chart')) {
    return [
      { label: 'Generate KPI Metric Cards Spec', prompt: 'Extend this blueprint by detailing the exact grid layout, HSL alert colors, and spring hover animations for high-level KPI cards.' },
      { label: 'Generate API Layout', prompt: 'Extend this blueprint with a detailed REST and WebSockets API architecture proposal for real-time dashboard data feeds.' },
      { label: 'Generate Real-Time Activity Log', prompt: 'Extend this blueprint with a feed-style component spec for historical event auditing with collapsible trace logs.' },
      { label: 'Generate Collapsible Navigation', prompt: 'Extend this blueprint with a highly tactile, collapsible vertical sidebar navigation design system spec.' }
    ];
  }

  if (text.includes('login') || text.includes('auth') || text.includes('signup') || text.includes('security')) {
    return [
      { label: 'Generate OTP Auth Flow Spec', prompt: 'Extend this blueprint with a multi-step OTP authentication flow layout, auto-focus inputs, and spring validation checks.' },
      { label: 'Generate OAuth Social Credentials', prompt: 'Extend this blueprint by describing layout grids and HSL color designs for Google, GitHub, and Apple login buttons.' },
      { label: 'Generate Session Management rules', prompt: 'Extend this blueprint with precise security controls, cookie configurations, and auth middleware rules.' }
    ];
  }
  
  return [
    { label: 'Generate Database Schema', prompt: 'Extend this blueprint by compiling a production-grade relational SQL database schema for core entities.' },
    { label: 'Generate Component Tree', prompt: 'Extend this blueprint by cataloging a complete structural directory structure and component tree hierarchy.' },
    { label: 'Generate API Design', prompt: 'Extend this blueprint with a highly structured REST API schema outlining request/response payloads.' },
    { label: 'Generate Cursor Prompt rules', prompt: 'Transform this spec into a highly descriptive `.cursorrules` system instruction file for immediate IDE use.' }
  ];
}

// ─── Generation Status Messages ───────────────────────────────
const GEN_MESSAGES = [
  'Retrieving design vocabulary…',
  'Matching HSL color tokens…',
  'Injecting motion physics…',
  'Compiling architectural spec…',
  'Assembling prompt blueprint…',
];

function GeneratingLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % GEN_MESSAGES.length), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={skeletonContainer}>
      <div style={skeletonHeader}>
        <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <span style={refiningText}>{GEN_MESSAGES[msgIdx]}</span>
      </div>
      <div style={skeletonLinesGrid} className="animate-pulse">
        {['92%','85%','40%','78%','88%','60%','82%','30%'].map((w, i) => (
          <div key={i} style={skeletonLine(w)} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Chat Content ────────────────────────────────────────
function ChatContent() {
  const { user, history, updatePromptChat, apiKey, saveStatus } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const promptId = searchParams.get('id');

  const [promptRecord, setPromptRecord] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    if (promptId && history.length > 0) {
      const record = history.find(h => h.id === promptId);
      if (record) {
        setPromptRecord(record);
        setChatMessages(record.chatMessages);
        let rawPrompt = record.resolvedPrompt;
        let promptMatch = rawPrompt.match(/```prompt\n([\s\S]*?)\n```/);
        setCurrentPrompt(promptMatch ? promptMatch[1] : rawPrompt);
      } else {
        router.push('/dashboard');
      }
    }
  }, [promptId, history, user, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (chatInput.trim() && !isGenerating) {
          handleSendMessage(e);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chatInput, isGenerating]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isGenerating || !promptRecord) return;
    const userMessage = chatInput;
    setChatInput('');
    setIsGenerating(true);
    const updatedMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(updatedMessages);
    try {
      const apiHistory = updatedMessages.slice(0, -1);
      const response = await generateEnhancedPrompt({
        mode: promptRecord.mode, query: userMessage, theme: promptRecord.theme,
        category: promptRecord.category, pageType: promptRecord.pageType,
        components: promptRecord.components, componentName: promptRecord.componentName,
        history: apiHistory, apiKey,
      });
      const finalMessages = [...updatedMessages, { role: 'model', content: response.prompt }];
      setChatMessages(finalMessages);
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      setCurrentPrompt(promptMatch ? promptMatch[1] : response.prompt);
      updatePromptChat(promptRecord.id, finalMessages, response.prompt, response.ragDetails);
      track(EVENTS.PROMPT_REFINED, { mode: promptRecord.mode });
    } catch (err) {
      console.error(err);
      toast.error("Refinement failed", {
        description: "We couldn't process your refinement. Your current prompt is safe.",
        action: { label: "Try again", onClick: () => { setChatInput(userMessage); } }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!promptRecord || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await generateEnhancedPrompt({
        mode: promptRecord.mode, query: promptRecord.query,
        theme: promptRecord.theme, category: promptRecord.category,
        pageType: promptRecord.pageType, components: promptRecord.components, apiKey,
      });
      const regenMessages = [...chatMessages, { role: 'user', content: '[Regenerated]' }, { role: 'model', content: response.prompt }];
      setChatMessages(regenMessages);
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      setCurrentPrompt(promptMatch ? promptMatch[1] : response.prompt);
      updatePromptChat(promptRecord.id, regenMessages, response.prompt, response.ragDetails);
      toast.success('Prompt regenerated!');
      track(EVENTS.PROMPT_REGENERATED, { mode: promptRecord.mode });
    } catch (err) {
      toast.error("Regeneration failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    toast.success('Prompt copied to clipboard!');
    try {
      localStorage.setItem('pf_has_copied_prompt', 'true');
      window.dispatchEvent(new Event('storage'));
    } catch {}
    track(EVENTS.PROMPT_COPIED, { source: 'chat' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format) => {
    const content = format === 'md' ? `# ${promptRecord?.title}\n\n${currentPrompt}` : currentPrompt;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(promptRecord?.title || 'prompt').replace(/\s+/g, '-')}.${format === 'md' ? 'md' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as .${format === 'md' ? 'md' : 'txt'}`);
    track(format === 'md' ? EVENTS.PROMPT_EXPORTED_MD : EVENTS.PROMPT_EXPORTED_TXT);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied! Share it with anyone.');
    track(EVENTS.PROMPT_SHARED);
  };

  if (!promptRecord) {
    return (
      <div style={loadingContainer}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <span>Loading workspace…</span>
      </div>
    );
  }

  return (
    <div
      style={singleColumnLayout}
      className={
        promptRecord.theme === 'Wes Anderson' ? 'theme-wes-anderson' :
        promptRecord.theme === 'Cyberpunk Neon' ? 'theme-cyberpunk' :
        promptRecord.theme === 'Brutalist Bold' ? 'theme-brutalist' :
        promptRecord.theme === 'Minimalist Typography' ? 'theme-minimal' : ''
      }
    >
      <div style={workspacePanel} className="glass-panel">

        {/* HEADER */}
        <div style={workspaceHeader}>
          <div style={headerLeft}>
            <motion.button style={backBtn} onClick={() => router.push('/dashboard')}
              whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
              <ArrowLeft size={12} /> Dashboard
            </motion.button>
            <div style={titleBadgeRow}>
              <h2 style={workspaceTitle}>{promptRecord.title}</h2>
              <span style={themeBadge}>{promptRecord.theme}</span>
              <SaveStatusBadge status={saveStatus} />
            </div>
          </div>

          {/* Action buttons */}
          <div style={headerActions}>
            {/* Regenerate */}
            <motion.button onClick={handleRegenerate} style={actionBtn} disabled={isGenerating}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              title="Regenerate prompt with same parameters">
              <RotateCcw size={13} />
              <span style={actionBtnLabel}>Regenerate</span>
            </motion.button>

            {/* Export MD */}
            <motion.button onClick={() => handleExport('md')} style={actionBtn}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} title="Export as Markdown">
              <Download size={13} />
              <span style={actionBtnLabel}>.md</span>
            </motion.button>

            {/* Export TXT */}
            <motion.button onClick={() => handleExport('txt')} style={actionBtn}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} title="Export as plain text">
              <Download size={13} />
              <span style={actionBtnLabel}>.txt</span>
            </motion.button>

            {/* Share */}
            <motion.button onClick={handleShare} style={actionBtn}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} title="Copy share link">
              <Share2 size={13} />
              <span style={actionBtnLabel}>Share</span>
            </motion.button>

            {/* Copy */}
            <motion.button onClick={handleCopy} style={copyBtn} className="btn-accent shine-effect"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </motion.button>
          </div>
        </div>

        {/* PROMPT BODY */}
        <div style={workspaceBody}>
          {isGenerating ? <GeneratingLoader /> : (
            <div style={{ fontFamily: 'var(--font-sans)', whiteSpace: 'normal', width: '100%' }}>
              {/* Revision History Dropdown */}
              {promptRecord?.revisions && promptRecord.revisions.length > 0 && (
                <div style={revisionRow}>
                  <History size={12} style={{ color: 'var(--accent)' }} />
                  <span style={revisionLabel}>Revision History:</span>
                  <ShadcnDropdown
                    value={currentPrompt}
                    onChange={(val) => {
                      setCurrentPrompt(val);
                      toast.success("Restored prompt version!");
                      track('prompt_revision_restored', { id: promptRecord.id });
                    }}
                    options={[
                      { label: `Prompt v${promptRecord.revisions.length + 1} (Latest)`, value: promptRecord.resolvedPrompt },
                      ...promptRecord.revisions.map((rev, index) => ({
                        label: `Prompt v${index + 1} (${new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(rev.timestamp))})`,
                        value: rev.resolvedPrompt
                      }))
                    ]}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      fontWeight: '700',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-sans)',
                      minWidth: '150px'
                    }}
                  />
                </div>
              )}

              {renderMarkdown(currentPrompt)}
              
              {/* Smart Suggested Next Steps */}
              {!isGenerating && (
                <div style={smartSuggestionsBox} className="glass-panel animate-fade-up">
                  <div style={smartSuggestionsHead}>
                    <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                    <span style={smartSuggestionsTitle}>Suggested Next Steps</span>
                  </div>
                  <div style={smartSuggestionsGrid}>
                    {getSmartSuggestions(promptRecord).map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        style={smartSuggestionChip}
                        onClick={() => {
                          setChatInput(suggestion.prompt);
                          track('smart_suggestion_clicked', { label: suggestion.label });
                          setTimeout(() => {
                            const btn = document.querySelector('form button[type="submit"]');
                            if (btn) btn.click();
                          }, 100);
                        }}
                        whileHover={{ scale: 1.02, borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(255,255,255,0.03)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {suggestion.label} →
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Embedded User Feedback Loop */}
              {!isGenerating && <FeedbackWidget contextId={promptRecord.id} />}
            </div>
          )}
        </div>

        {/* AI TRANSPARENCY PANEL */}
        <AITransparencyPanel ragDetails={promptRecord.ragDetails} theme={promptRecord.theme} mode={promptRecord.mode} />

        {/* CHAT INPUT */}
        <form onSubmit={handleSendMessage} style={bottomInputRow(inputFocused)}>
          <div style={sparklesIconWrap}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <input
            type="text"
            placeholder="Refine your prompt… (Ctrl+Enter to send)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={chatField}
            className="glass-input"
            disabled={isGenerating}
            aria-label="Prompt refinement input"
          />
          <motion.button type="submit" style={sendBtn} className="btn-accent shine-effect"
            disabled={isGenerating || !chatInput.trim()}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Send size={16} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={loadingContainer}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <span>Loading workspace…</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const loadingContainer = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)',
  minHeight: '400px',
};

const singleColumnLayout = {
  display: 'flex', flexDirection: 'column',
  height: 'calc(100dvh - 140px)', minHeight: '600px',
  paddingTop: '0.25rem', paddingBottom: '0.75rem',
  width: '100%', position: 'relative', zIndex: 2,
};

const workspacePanel = {
  flex: 1, background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

const workspaceHeader = {
  padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  flexWrap: 'wrap', gap: '1rem', flexShrink: 0,
};

const headerLeft = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };

const backBtn = {
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '7px', color: 'var(--muted-foreground)', fontSize: '0.75rem',
  fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
  gap: '0.35rem', padding: '0.3rem 0.65rem', fontFamily: 'var(--font-sans)',
  width: 'fit-content', transition: 'all 0.25s ease',
};

const titleBadgeRow = {
  display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap',
};

const workspaceTitle = {
  fontSize: '1.05rem', fontWeight: '700', fontFamily: 'var(--font-display)',
  color: 'var(--foreground)', letterSpacing: '-0.02em', margin: 0,
};

const themeBadge = {
  fontSize: '0.68rem', fontWeight: '600', color: 'var(--muted-foreground)',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '999px', padding: '2px 8px',
};

const headerActions = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
};

const actionBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  color: 'var(--muted-foreground)', fontSize: '0.78rem', fontWeight: '600',
  fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease', minHeight: '34px',
};

const actionBtnLabel = { fontSize: '0.78rem' };

const copyBtn = {
  padding: '0.45rem 1rem', fontSize: '0.8rem', height: '36px', borderRadius: '8px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '0.4rem', fontWeight: '600',
};

const workspaceBody = {
  flex: 1, overflowY: 'auto', padding: '1.5rem',
  background: 'rgba(0,0,0,0.2)', position: 'relative',
};

const skeletonContainer = { display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' };
const skeletonHeader = { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' };
const skeletonLinesGrid = { display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 };
const skeletonLine = (w) => ({
  width: w, height: '12px', borderRadius: '6px',
  background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
});
const refiningText = { fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: '500' };

// RAG / AI Panel styles
const ragPanel = {
  borderTop: '1px solid rgba(255,255,255,0.05)',
  padding: '0.75rem 1.5rem', flexShrink: 0,
};
const ragToggleBtn = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: '600',
  fontFamily: 'var(--font-sans)', padding: 0,
};
const ragContent = {
  display: 'flex', flexDirection: 'column', gap: '0.5rem',
  marginTop: '0.75rem', padding: '0.75rem',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '8px',
};
const ragRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const ragLabel = { fontSize: '0.72rem', color: 'var(--muted-foreground)', fontWeight: '500' };
const ragValue = { fontSize: '0.72rem', color: 'var(--foreground)', fontWeight: '600' };

const bottomInputRow = (focused) => ({
  padding: '1.15rem 1.5rem',
  borderTop: `1px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  boxShadow: focused ? '0 -4px 24px rgba(124,58,237,0.06)' : 'none',
  display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0,
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', className: 'safe-bottom',
});

const sparklesIconWrap = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '32px', height: '32px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
};

const chatField = { flex: 1 };
const sendBtn = {
  height: '38px', width: '38px', borderRadius: '8px', padding: 0,
  flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

// Markdown styles
const mdH1 = { fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginTop: '1.25rem', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' };
const mdH2 = { fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginTop: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' };
const mdH3 = { fontSize: '0.98rem', fontWeight: '800', color: 'var(--accent)', marginTop: '0.85rem', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' };
const mdP = { margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.88)', lineHeight: '1.55' };
const mdLi = { display: 'flex', gap: '0.5rem', paddingLeft: '0.5rem', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' };
const mdHr = { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.75rem 0' };
const mdCode = { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '4px', color: '#c084fc' };

// ─── Revision Styles ──────────────────────────────────────────
const revisionRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '8px',
  padding: '0.35rem 0.75rem',
  marginBottom: '1rem',
  width: 'fit-content',
};

const revisionLabel = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--muted-foreground)',
};

const revisionSelect = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#ffffff',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
};


// ─── Smart Suggestions Styles ──────────────────────────────
const smartSuggestionsBox = {
  marginTop: '1.5rem',
  marginBottom: '1rem',
  padding: '1.25rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
};

const smartSuggestionsHead = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  marginBottom: '0.85rem',
};

const smartSuggestionsTitle = {
  fontSize: '0.82rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  letterSpacing: '0.01em',
};

const smartSuggestionsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '0.65rem',
};

const smartSuggestionChip = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.55rem 0.85rem',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  fontSize: '0.76rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  textAlign: 'left',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};


